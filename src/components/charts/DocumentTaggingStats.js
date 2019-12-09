import React from "react";
import { RepositoryService } from "../database/repositoryService";
import { Row, Table, Button } from "antd";
import { remote } from "electron";
const { dialog } = remote;
const electronFs = remote.require("fs");

export default class DocumentTaggingStats extends React.Component {
  state = {
    activeIndex: 0,
    dataSource: [],
    fileArray: [],
    tags: [],
    isGetDocs: false,
    isGetStats: false,
    totalTags: []
  };

  render() {
    const { fileArray, tags, isGetDocs, isGetStats, totalTags } = this.state;
    const columns = [
      {
        title: "Tag",
        key: "tag",
        dataIndex: "value"
      },
      {
        title: "Count",
        key: "count",
        dataIndex: "count"
      }
    ];
    return (
      <React.Fragment>
        <Row>
          <Button
            style={{ marginRight: 10 }}
            type="primary"
            icon="folder-open"
            loading={isGetDocs}
            onClick={this._openDirectoryFinder}
          >
            Choose directory
          </Button>
          <Button
            type="primary"
            icon="pie-chart"
            loading={isGetStats}
            onClick={this._report}
          >
            Report
          </Button>
        </Row>
        <Row>
          Found {fileArray.length} document(s)
          <div id="working-progress-chart"></div>
        </Row>
        <Row>
          <Table
            bordered
            dataSource={Object.keys(totalTags).map(key => ({
              key: key,
              value: tags.filter(tag => tag.key === key)[0].value,
              count: totalTags[key]
            }))}
            columns={columns}
          />
        </Row>
      </React.Fragment>
    );
  }

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
      this.setState({
        dataSource: repositories[0].data,
        tags: repositories[0].tags
      });
    } catch (ex) {
      console.error(ex);
    }
  };

  _openDirectoryFinder = () => {
    this.setState({ isGetDocs: true }, () => {
      setTimeout(() => {
        const directory = dialog.showOpenDialog({
          properties: ["openDirectory"]
        });

        if (directory && directory[0]) {
          this._openDirectory(directory[0]);
        } else {
          this.setState({ isGetDocs: false });
        }
      }, 100);
    });
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
        const files = this._readDir(fileInfo.path);
        fileArray = fileArray.concat(files);
      } else {
        if (!fileInfo.name.startsWith(".")) fileArray.push(fileInfo);
      }
    });

    return fileArray;
  };

  _openDirectory = key => {
    const fileArray = this._readDir(key);
    this.setState({ fileArray, isGetDocs: false });
  };

  _readFile = path => {
    // First I want to read the file
    const data = electronFs.readFileSync(path, "utf8");
    const firstLine = data.split("\n")[0];
    const tags = firstLine.startsWith("###")
      ? JSON.parse(firstLine.replace(/#/g, ""))
      : [];
    return tags;
  };

  _report = () => {
    this.setState({ isGetStats: true }, () => {
      setTimeout(() => {
        const { fileArray } = this.state;
        let totalTags = [];
        fileArray.forEach((file, index) => {
          totalTags = totalTags.concat(this._readFile(file.path));
        });
        const counts = {};
        for (let i = 0; i < totalTags.length; i++) {
          const num = totalTags[i];
          counts[num] = counts[num] ? counts[num] + 1 : 1;
        }
        this.setState({ isGetStats: false, totalTags: counts });
      }, 100);
    });
  };

  componentDidMount = () => {
    this._getRepositoryData();
  };

  //   componentDidUpdate = () => {
  //     const { dataSource, tags } = this.state;
  //     console.log(dataSource, tags);
  //     const { interfaceType } = this.props;

  //     if (interfaceType === "Document Tagging") return;
  //     const workingProgressData = [
  //       {
  //         name: "Done",
  //         y:
  //           (dataSource.filter(obj => obj.status === "done").length /
  //             dataSource.length) *
  //           100
  //       },
  //       {
  //         name: "Temporary",
  //         y:
  //           (dataSource.filter(obj => obj.status === "temporary").length /
  //             dataSource.length) *
  //           100
  //       },
  //       {
  //         name: "Unmarked",
  //         y:
  //           (dataSource.filter(obj => !obj.status || obj.status === "unmarked")
  //             .length /
  //             dataSource.length) *
  //           100
  //       }
  //     ];

  //     let labelsData = [];
  //     let allLabels = [];

  //     let labelGroup1 = [];
  //     let labelGroup2 = [];
  //     let dataForGenChartLabelGroup1 = [];
  //     let dataForGenChartLabelGroup2 = [];

  //     if (interfaceType === "Named Entities") {
  //       dataSource.forEach(obj => {
  //         const closeTags = obj.text.match(/<\/.+?>/g) || [];
  //         const labels =
  //           closeTags &&
  //           closeTags.map(tag => tag.replace("</", "").replace(">", ""));
  //         allLabels = allLabels.concat(labels);
  //       });
  //       tags.forEach(tag => {
  //         labelsData.push({
  //           name: tag,
  //           y: allLabels.filter(label => label === tag).length
  //         });
  //       });
  //       _genLabelsChart(labelsData);
  //     }

  //     if (interfaceType === "Dependencies") {
  //       dataSource.forEach(obj => {
  //         const labels = obj.dependencies
  //           ? obj.dependencies.map(item => item.label)
  //           : [];
  //         allLabels = allLabels.concat(labels);
  //       });
  //       tags.forEach(tag => {
  //         labelsData.push({
  //           name: tag,
  //           y: allLabels.filter(label => label === tag).length
  //         });
  //       });
  //       _genLabelsChart(labelsData);
  //     }

  //     if (interfaceType === "Text Classification") {
  //       dataSource.forEach(obj => {
  //         labelGroup1 = labelGroup1.concat(
  //           obj.label_group_1 ? obj.label_group_1.split(",") : []
  //         );
  //         labelGroup2 = labelGroup2.concat(
  //           obj.label_group_2 ? obj.label_group_2.split(",") : []
  //         );
  //       });
  //       tags.forEach(tag => {
  //         dataForGenChartLabelGroup1.push({
  //           name: tag,
  //           y: labelGroup1.filter(label => label === tag).length
  //         });
  //         dataForGenChartLabelGroup2.push({
  //           name: tag,
  //           y: labelGroup2.filter(label => label === tag).length
  //         });
  //       });
  //       _genLabelGroup1Chart(dataForGenChartLabelGroup1);
  //       _genLabelGroup2Chart(dataForGenChartLabelGroup2);
  //     }

  //     _genWorkingProgressChart(workingProgressData);
  //   };
}
