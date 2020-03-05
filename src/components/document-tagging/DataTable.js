import React from "react";
import {
  Row,
  Button,
  notification,
  Tree,
  Select,
  Layout,
  Divider,
  Breadcrumb,
  Skeleton,
  Icon,
  Affix
} from "antd";
import "./styles/DataTable.css";
import constants from "../common/constants";
import { exportData } from "../common/export";
import { RepositoryService } from "../database/repositoryService";
import { remote } from "electron";
import Tags from "./Tags";
import shortid from "shortid";

const { dialog } = remote;
const electronFs = remote.require("fs");
const chokidar = remote.require("chokidar");
const electronPath = remote.require("path");
let watcher = null;
const colors = constants.colors;
const { TreeNode, DirectoryTree } = Tree;
const { Sider, Content, Footer } = Layout;

export default class DataTable extends React.Component {
  state = {
    directoryTree: [],
    currentDoc: null,
    tags: [],
    selectedTags: [],
    openedDirectory:
      "workingDirectory" in localStorage
        ? localStorage.getItem("workingDirectory")
        : "",
    isLoading: false
  };

  render() {
    const {
      directoryTree,
      currentDoc,
      selectedTags,
      tags,
      openedDirectory,
      isLoading
    } = this.state;
    return (
      <>
        <Row style={{ padding: "0px 20px" }}>
          <Button.Group>
            <Button onClick={this._openDirectoryFinder} icon="folder-open">
              Input Directory
            </Button>
            <Button icon="save" onClick={this._saveData}>
              Save Data
            </Button>
            <Button icon="upload" onClick={this._importTags}>
              Import Tags
            </Button>
            <Button icon="download" onClick={() => exportData(tags, "json")}>
              Export Tags
            </Button>
          </Button.Group>
          <Breadcrumb
            style={{ marginTop: 10 }}
            separator={<Icon type="caret-right" />}
          >
            {openedDirectory.split("/").map((item, index) => (
              <>
                <Breadcrumb.Item
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    this._openDirectory(
                      openedDirectory
                        .split("/")
                        .slice(0, index + 1)
                        .join("/")
                    )
                  }
                >
                  <b>{item}</b>
                </Breadcrumb.Item>
              </>
            ))}
          </Breadcrumb>
        </Row>
        <Layout
          style={{
            margin: "10px 10px",
            borderRadius: 8,
            background: "#ffffff"
          }}
        >
          <Sider
            style={{
              overflow: "auto",
              border: "1px solid #e8e8e8"
            }}
            width="25%"
            theme="light"
          >
            {isLoading ? (
              <Skeleton active />
            ) : (
              <DirectoryTree
                multiple={false}
                expandedKeys={[]}
                onSelect={this._selectFile}
                onExpand={this._expandDirectory}
              >
                {openedDirectory === ""
                  ? "Choose a directory"
                  : directoryTree
                      .sort((a, b) => (a.name > b.name ? 1 : -1))
                      .map(tree => this._renderDirectoryTree(tree))}
              </DirectoryTree>
            )}
          </Sider>
          <Layout
            className="border-right border-top border-bottom"
            style={{ background: "#ffffff" }}
          >
            <Content className="border-right">
              {currentDoc && (
                <>
                  <p
                    className="content"
                    style={{
                      padding: 20,
                      heigth: "100%",
                      whiteSpace: "pre-wrap",
                      textAlign: "justify"
                    }}
                  >
                    {currentDoc.content}
                  </p>
                </>
              )}
              <Affix offsetBottom={10}>
                <div
                  style={{ backgroundColor: "#f2f4f5", padding: "10px 10px" }}
                >
                  <b>
                    {!currentDoc ? "No document selected" : currentDoc.name}
                  </b>
                </div>
              </Affix>
            </Content>
            <Sider
              width="30%"
              theme="light"
              style={{
                overflow: "auto",
                padding: "10px 10px"
              }}
            >
              <Select
                mode="multiple"
                allowClear={true}
                style={{ width: "100%" }}
                placeholder="Tag ..."
                mode="multiple"
                value={selectedTags}
                // labelInValue={true}
                onChange={this._selectTags}
                // onSearch={this._searchTag}
                // onInputKeyDown={this._checkEnter}
                filterOption={this._filterOption}
                // notFoundContent={
                //   <span>
                //     Not found. Press `Enter` (<Icon type="enter" />) to create
                //     this Tag.
                //   </span>
                // }
              >
                {tags.map(tag => {
                  return (
                    <Select.Option key={tag.key} value={tag.key}>
                      {tag.value}
                    </Select.Option>
                  );
                })}
              </Select>
              <Divider>
                <span>{tags.length} Tag(s)</span>
              </Divider>
              <Tags tags={tags} _updateTagsList={this._updateTagsList} />
            </Sider>
          </Layout>
        </Layout>
      </>
    );
  }

  _importTags = () => {
    const file = dialog.showOpenDialog({
      properties: ["openFile"]
    });
    if (file && file[0]) {
      electronFs.readFile(file[0], "utf-8", (err, data) => {
        if (err) {
          notification.error({ message: err });
        }
        const tags = JSON.parse(data);
        this._updateTagsList(tags);
      });
    }
  };

  _openDirectoryFinder = async () => {
    if (watcher) await watcher.close();
    const directory = dialog.showOpenDialog({
      properties: ["openDirectory"]
    });
    if (directory && directory[0]) {
      localStorage.setItem("workingDirectory", directory[0]);
      this._openDirectory(directory[0]);
    }
  };

  _readDir = path => {
    var fileArray = [];

    electronFs.readdirSync(path).forEach(file => {
      // var fileInfo = new FileTree(`${path}/${file}`, file);
      var fileInfo = {
        path: `${path}/${file}`,
        name: file
      };
      var stat = electronFs.statSync(fileInfo.path);

      if (stat.isDirectory()) {
        // fileInfo.items = FileTree.readDir(fileInfo.path);
        fileInfo.items = [];
        fileInfo.type = "directory";
      } else {
        fileInfo.items = undefined;
        fileInfo.type = "file";
      }

      fileArray.push(fileInfo);
    });

    return fileArray;
  };

  _openDirectory = async key => {
    this.setState({ isLoading: true });
    if (watcher) await watcher.close();

    localStorage.setItem("workingDirectory", key);

    const fileArray = this._readDir(key);
    this.setState({
      openedDirectory: key,
      directoryTree: fileArray,
      isLoading: false
    });

    watcher = chokidar.watch(key, {
      ignored: /^\./,
      persistent: true,
      awaitWriteFinish: true,
      ignoreInitial: true
    });

    watcher.on("all", (event, path) => {
      if (event === "unlink") {
        const { directoryTree } = this.state;
        const newDirectoryTree = directoryTree.filter(x => x.path !== path);
        this.setState({
          directoryTree: newDirectoryTree
        });
      }
      if (event === "add") {
        const { directoryTree } = this.state;
        const newDirectoryTree = directoryTree.concat({
          path,
          name: electronPath.basename(path),
          type: "file",
          items: undefined
        });
        this.setState({ directoryTree: newDirectoryTree });
      }
    });
  };

  _readFile = path => {
    // First I want to read the file
    electronFs.readFile(path, "utf8", (err, data) => {
      if (err) {
        notification.error({ message: err });
      }

      const firstLine = data.split("\n")[0];
      const selectedTags = firstLine.startsWith("###")
        ? JSON.parse(firstLine.replace(/#/g, ""))
        : [];
      const content = firstLine.startsWith("###")
        ? data.replace(firstLine + "\n", "")
        : data;
      const name = electronPath.basename(path);
      this.setState({
        currentDoc: { path, content, name },
        selectedTags
      });
    });
  };

  _renderDirectoryTree = tree => {
    if (tree.type === "directory") {
      return (
        <TreeNode title={tree.name} key={tree.path} selectable={false}>
          {tree.items.map(file => (
            <TreeNode
              title={file.name}
              isLeaf
              key={file.path}
              icon={<Icon type="file-text" />}
            >
              {this._renderDirectoryTree(file)}
            </TreeNode>
          ))}
        </TreeNode>
      );
    } else {
      return (
        <TreeNode
          key={tree.path}
          title={tree.name}
          isLeaf
          icon={<Icon type="file-text" />}
          onClick={() => this.setState({ currentDoc: tree })}
        />
      );
    }
  };

  _selectFile = keys => {
    this._readFile(keys[0]);
  };

  _expandDirectory = async keys => {
    await this._openDirectory(keys[0]);
  };

  _searchTag = value => {
    this.newValue = value.trim();
  };

  _checkEnter = e => {
    const { tags, selectedTags } = this.state;
    if (e.keyCode === 13 && this.newValue !== "") {
      // Enter
      e.preventDefault();
      if (
        tags.map(tag => tag.key).indexOf(this.newValue) === -1 &&
        tags.map(tag => tag.value).indexOf(this.newValue) === -1
      ) {
        const newTag = {
          key: shortid.generate(),
          value: this.newValue
        };
        tags.push(newTag);
        this._updateTagsList(tags);
        this.setState({ selectedTags: [...selectedTags, newTag.key] });
      }
    }
  };

  _filterOption = (inputValue, option) => {
    const bool = option.props.children
      .toLowerCase()
      .includes(inputValue.toLowerCase());
    return bool;
  };

  _selectTags = value => {
    this.setState({ selectedTags: value });
  };

  _checkTag = tagValue => {
    const { tags, selectedTags } = this.state;
    if (
      tags.map(tag => tag.key).indexOf(tagValue) === -1 &&
      tags.map(tag => tag.value).indexOf(tagValue) === -1
    ) {
      const newTag = {
        key: shortid.generate(),
        value: tagValue
      };
      tags.push(newTag);
      this._updateTagsList(tags);
      this.setState({ selectedTags: [...selectedTags, newTag.key] });
    } else {
      return;
    }
  };

  _saveData = () => {
    const { currentDoc, selectedTags } = this.state;
    if (currentDoc === null) return;
    const savedData =
      `###${JSON.stringify(selectedTags)}###` + "\n" + currentDoc.content;

    electronFs.writeFile(currentDoc.path, savedData, err => {
      if (err)
        notification.error({
          description: err
        });
      notification.success({
        message: "Data has been saved successfully"
      });
      if (!currentDoc.path.includes(".tagged"))
        electronFs.rename(
          currentDoc.path,
          currentDoc.path + ".tagged",
          function(err) {
            if (err) console.log(err);
            // console.log("File Renamed!");
          }
        );
    });
  };

  _saveTags = async () => {
    const { tags } = this.state;
    const service = new RepositoryService();

    if (!("currentRepository" in localStorage)) {
      return;
    }
    const currentRepository = JSON.parse(
      localStorage.getItem("currentRepository")
    );
    try {
      const updateds = await service.updateRepositoryById(
        currentRepository.id,
        {
          tags: tags
        }
      );
      if (updateds > 0) {
        notification.success({
          message: "Tags have been saved successfully"
        });
      } else {
        notification.error({ message: "Unable to save tags" });
      }
    } catch (ex) {
      notification.error({
        message: ex.type,
        description: ex.message
      });
    }
  };

  _updateTagsList = newTagsList => {
    this.setState({ tags: newTagsList }, () => {
      this._saveTags();
    });
  };

  _getRepositoryData = async () => {
    const service = new RepositoryService();
    if (!("currentRepository" in localStorage)) {
      return;
    }
    const currentRepository = JSON.parse(
      localStorage.getItem("currentRepository")
    );
    try {
      const repositories = await service.getRepositoryById(
        currentRepository.id
      );
      const tags = repositories[0].tags;
      this.setState({ dataSource: repositories[0].data, tags });
    } catch (ex) {
      console.error(ex);
    }
  };

  componentDidMount = () => {
    this._getRepositoryData();
    if ("workingDirectory" in localStorage) {
      this._openDirectory(localStorage.getItem("workingDirectory"));
    }
    document.addEventListener(
      "keydown",
      e => {
        if (
          (window.navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey) &&
          e.keyCode == 83
        ) {
          e.preventDefault();
          this._saveData();
        }
      },
      false
    );
  };
}
