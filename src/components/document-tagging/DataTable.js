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
  Skeleton
} from "antd";
import "./styles/DataTable.css";
import constants from "../common/constants";
import { exportData } from "../common/export";
import { RepositoryService } from "../database/repositoryService";
import { remote } from "electron";
import Tags from "./Tags";
const { dialog } = remote;
const electronFs = remote.require("fs");
const chokidar = remote.require("chokidar");
const electronPath = remote.require("path");
let watcher = null;
const colors = constants.colors;
const { TreeNode, DirectoryTree } = Tree;
const { Sider, Content } = Layout;

export default class DataTable extends React.Component {
  state = {
    directoryTree: [],
    currentDoc: null,
    tags: [],
    selectedTags: [],
    openedDirectory: "",
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
          <Breadcrumb separator="">
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
                <Breadcrumb.Separator />
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
            style={{ overflow: "auto", border: "1px solid #e8e8e8" }}
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
                {directoryTree
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
                  <b>{currentDoc.name}</b>
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
            </Content>
            <Sider width="30%" theme="light" style={{ padding: 20 }}>
              <Select
                mode="multiple"
                allowClear={true}
                style={{ width: "100%" }}
                // optionLabelProp="children"
                value={selectedTags}
                onChange={this._selectTags}
                filterOption={this._searchTag}
              >
                {tags.map(tag => {
                  return (
                    <Select.Option key={tag.key} value={tag.key}>
                      {tag.value}
                    </Select.Option>
                  );
                })}
              </Select>
              <Divider>Tags List</Divider>
              <Tags
                tags={tags}
                _updateTagsList={this._updateTagsList}
                _addTag={this._addTag}
              />
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
        this.setState({ tags });
      });
    }
  };

  _openDirectoryFinder = async () => {
    if (watcher) await watcher.close();
    const directory = dialog.showOpenDialog({
      properties: ["openDirectory"]
    });
    if (directory && directory[0]) {
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
            <TreeNode title={file.name} isLeaf key={file.path}>
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

  _searchTag = (inputValue, option) => {
    return option.props.children
      .toLowerCase()
      .includes(inputValue.toLowerCase());
  };

  _selectTags = value => {
    this.setState({ selectedTags: value });
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

  _updateTagsList = newTagsList => {
    this.setState({ tags: newTagsList });
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
