import React from "react";
import {
  Table,
  Menu,
  Icon,
  Upload,
  Dropdown,
  Input,
  Button,
  Popconfirm,
  Form,
  notification,
  Modal,
  Tooltip,
  Row,
  Select,
  Tag
} from "antd";
import "./styles/DataTable.css";
import constants from "../common/constants";
import { exportData } from "../common/export";
import { getBase64 } from "../common/import";
import XLSX from "xlsx";
import { RepositoryService } from "../database/repositoryService";

const colors = constants.colors;

export default class DataTable extends React.Component {
  state = {
    searchText: "",
    dataSource: []
  };

  render() {
    const { dataSource } = this.state;
    const { tags } = this.props;
    const components = {
      body: {
        row: EditableFormRow,
        cell: EditableCell
      }
    };
    const initColumns = [
      {
        title: "No.",
        dataIndex: "key",
        width: "5%",
        editable: false
      },
      {
        title: "Text",
        dataIndex: "text",
        editable: true,
        ...this.getColumnSearchProps("text")
      },
      {
        title: "Label Group 1",
        dataIndex: "label_group_1",
        editable: true,
        width: "20%",
        ...this.getColumnSearchProps("label_group_1")
      },
      {
        title: "Label Group 2",
        dataIndex: "label_group_2",
        editable: true,
        width: "20%",
        ...this.getColumnSearchProps("label_group_2")
      },
      {
        title: "Status",
        dataIndex: "status",
        width: "10%",
        ...this.getColumnSearchProps("status"),
        render: (text, record) => {
          if (record.status === "done") {
            return <b style={{ color: "green" }}>done</b>;
          } else if (record.status === "temporary")
            return <b style={{ color: "blue" }}>temporary</b>;
          else {
            return <b style={{ color: "#656161" }}>unmarked</b>;
          }
        }
      },
      {
        title: "Operation",
        dataIndex: "operation",
        width: "15%",
        render: (text, record) =>
          this.state.dataSource.length >= 1 ? (
            <div className="icons-list">
              <Popconfirm
                title="Sure to delete?"
                onConfirm={() => this._deleteRow(record.key)}
              >
                <Icon type="delete" theme="twoTone" twoToneColor="red" />
              </Popconfirm>
              <Tooltip title="Mark as Done">
                <Icon
                  type="check-circle"
                  theme="twoTone"
                  twoToneColor="#52c41a"
                  onClick={() => this._markStatusAs(record, "done")}
                />
              </Tooltip>
              <Tooltip title="Mark as Temporary">
                <Icon
                  type="exclamation-circle"
                  theme="twoTone"
                  onClick={() => this._markStatusAs(record, "temporary")}
                />
              </Tooltip>
              <Tooltip title="Mark as Unmarked">
                <Icon
                  type="stop"
                  theme="twoTone"
                  twoToneColor="#656161"
                  onClick={() => this._markStatusAs(record, "unmarked")}
                />
              </Tooltip>
            </div>
          ) : null
      }
    ];
    const columns = initColumns.map(col => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: record => ({
          record,
          tags: tags,
          editable: col.editable,
          dataIndex: col.dataIndex,
          title: col.title,
          handleSave: this.handleSave
        })
      };
    });
    return (
      <React.Fragment>
        <Button.Group>
          <Button
            icon="plus"
            onClick={this._addRow}
            type="primary"
            style={{ marginBottom: 16 }}
          >
            Add a row
          </Button>
          <Button icon="folder-open" onClick={this._chooseDataSource}>
            Import Data
          </Button>
          <Button icon="save" onClick={this._saveData}>
            Save Data
          </Button>
          <Button icon="delete" onClick={this._clearData}>
            Clear Data
          </Button>
          <Dropdown
            overlay={
              <Menu onClick={this._exportData}>
                <Menu.Item key="excel">
                  <Icon type="file-excel" />
                  EXCEL
                </Menu.Item>
                <Menu.Item key="json">
                  <Icon type="file" />
                  JSON
                </Menu.Item>
                <Menu.Item key="csv">
                  <Icon type="file-text" />
                  CSV
                </Menu.Item>
              </Menu>
            }
          >
            <Button icon="download">
              Export <Icon type="down" />
            </Button>
          </Dropdown>
        </Button.Group>
        {this._showAutoTagHint()}
        <Table
          components={components}
          rowClassName={() => "editable-row"}
          bordered
          dataSource={dataSource}
          columns={columns}
        />
      </React.Fragment>
    );
  }

  _showAutoTagHint = () => {
    const { pattern, tag } = this.props;
    const { dataSource } = this.state;
    if (pattern) {
      let similarPatternCount = 0;
      var regExp = new RegExp(pattern, "g"); // non case-sensitive
      dataSource.forEach(obj => {
        if (obj.status === "unmarked")
          // find all similar patterns in unmarked text
          similarPatternCount += (obj.text.match(regExp) || []).length;
      });
      return (
        <React.Fragment>
          <Row>
            Found {similarPatternCount} pattern(s) similar to{" "}
            <b style={{ color: "red" }}>{pattern}</b>. Tags all with{" "}
            <Tag>{tag}</Tag>?{" "}
            <Button type="link" onClick={this._autoTagSimilarPattern}>
              OK
            </Button>
          </Row>
        </React.Fragment>
      );
    }
  };

  _chooseDataSource = () => {
    const savedDataKeys = Object.keys(localStorage)
      ? Object.keys(localStorage).filter(key => key.includes("_dataSource"))
      : [];

    Modal.info({
      title: "Choose a Data Source",
      content: (
        <React.Fragment>
          <Row>
            <b>Import data from Excel file</b>
            <br />
            <Upload
              onChange={this._importFromExcelFile}
              showUploadList={false}
              multiple={false}
            >
              <Button style={{ marginBottom: 16 }}>
                <Icon type="upload" /> Upload file
              </Button>
            </Upload>
          </Row>
        </React.Fragment>
      ),
      onOk() {}
    });
  };

  _markStatusAs = (record, status) => {
    const newData = [...this.state.dataSource];
    const index = newData.findIndex(item => record.key === item.key);
    const item = newData[index];
    item.status = status;
    newData.splice(index, 1, {
      ...item,
      ...record
    });
    this.setState({ dataSource: newData });
  };

  handleSearch = (selectedKeys, confirm) => {
    confirm();
    this.setState({ searchText: selectedKeys[0] });
  };

  handleReset = clearFilters => {
    clearFilters();
    this.setState({ searchText: "" });
  };

  getColumnSearchProps = dataIndex => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={node => {
            this.searchInput = node;
          }}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={e =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => this.handleSearch(selectedKeys, confirm)}
          style={{ width: 188, marginBottom: 8, display: "block" }}
        />
        <Button
          type="primary"
          onClick={() => this.handleSearch(selectedKeys, confirm)}
          icon="search"
          size="small"
          style={{ width: 90, marginRight: 8 }}
        >
          Search
        </Button>
        <Button
          onClick={() => this.handleReset(clearFilters)}
          size="small"
          style={{ width: 90 }}
        >
          Reset
        </Button>
      </div>
    ),
    filterIcon: filtered => (
      <Icon type="search" style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        .toString()
        .toLowerCase()
        .includes(value.toLowerCase()),
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => this.searchInput.select());
      }
    }
    // render: text => (
    //     <Highlighter
    //         highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
    //         searchWords={[this.state.searchText]}
    //         autoEscape
    //         textToHighlight={text.toString()}
    //     />
    // ),
  });

  _importFromExcelFile = info => {
    if (info.file.status === "error" || info.file.status === "done") {
      getBase64(info.file.originFileObj, fileUrl => {
        const base64 = fileUrl.split(",")[1];
        const workbook = XLSX.read(base64, { type: "base64" });
        let wb_data = [];
        workbook.SheetNames.forEach(function(sheetName) {
          var roa = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
          if (roa.length > 0) {
            wb_data = wb_data.concat(roa);
          }
        });

        const dataSource = wb_data.map((row, index) => {
          row.key = index + 1;
          if (!row.text) row.text = "";
          if (!row.status) row.status = "unmarked";
          if (!row.label_group_1) row.label_group_1 = "";
          if (!row.label_group_2) row.label_group_2 = "";
          return row;
        });

        // console.log(dataSource)
        this.setState(
          { dataSource },
          notification.success({
            message: "Data has been imported successfully"
          })
        );
      });
    }
  };

  _deleteRow = key => {
    const dataSource = [...this.state.dataSource];
    this.setState({ dataSource: dataSource.filter(item => item.key !== key) });
  };

  _addRow = () => {
    const { dataSource } = this.state;
    let count = dataSource.length;
    const newData = {
      key: count + 1,
      text: `Text ${count + 1}`,
      label_group_1: "",
      label_group_2: "",
      status: ""
    };
    this.setState({
      dataSource: [...dataSource, newData]
      // count: count + 1,
    });
  };

  _saveData = async () => {
    const { dataSource } = this.state;
    if (!("currentRepository" in localStorage)) {
      return;
    }
    const currentRepository = JSON.parse(
      localStorage.getItem("currentRepository")
    );
    const service = new RepositoryService();
    try {
      const updateds = await service.updateRepositoryById(
        currentRepository.id,
        {
          data: dataSource
        }
      );
      if (updateds > 0) {
        notification.success({ message: "Data has been saved successfully" });
      } else {
        notification.error({ message: "Unable to save data" });
      }
    } catch (ex) {
      notification.error({ message: ex.type, description: ex.message });
    }
  };

  _clearData = () => {
    this.setState(
      { dataSource: [] },
      notification.success({ message: "Data has been cleared successfully!" })
    );
  };

  _exportData = e => {
    const exportType = e.key;
    const { dataSource } = this.state;
    const { tokenDelimiter } = this.props;
    const dataToExport = dataSource.map(obj => {
      const newObj = { ...obj };
      delete newObj.key;
      return newObj;
    });
    switch (exportType) {
      case "excel":
        exportData(dataToExport, "excel");
        break;
      case "csv":
        exportData(dataToExport, "csv");
        break;
      case "json":
        exportData(dataToExport, "json");
        break;
      default:
        break;
    }
  };

  handleSave = row => {
    const newData = [...this.state.dataSource];
    const index = newData.findIndex(item => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row
    });
    this.setState({ dataSource: newData });
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
      this.setState({ dataSource: repositories[0].data });
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

const EditableContext = React.createContext();

const EditableRow = ({ form, index, ...props }) => (
  <EditableContext.Provider value={form}>
    <tr {...props} />
  </EditableContext.Provider>
);

const EditableFormRow = Form.create()(EditableRow);

class EditableCell extends React.Component {
  state = {
    editing: false
  };

  render() {
    const {
      editable,
      dataIndex,
      title,
      record,
      index,
      handleSave,
      children,
      ...restProps
    } = this.props;
    return (
      <td {...restProps}>
        {editable ? (
          <EditableContext.Consumer>{this.renderCell}</EditableContext.Consumer>
        ) : (
          children
        )}
      </td>
    );
  }

  toggleEdit = () => {
    const editing = !this.state.editing;
    this.setState({ editing }, () => {
      if (editing && this.input) {
        this.input.focus();
      }
    });
  };

  _saveCell = e => {
    const { record, handleSave } = this.props;
    this.form.validateFields((error, values) => {
      if (error && error[e.currentTarget.id]) {
        return;
      } else {
        handleSave({ ...record, ...values });
      }
      this.toggleEdit();
    });
  };

  _saveLabel = (value, labelGroup) => {
    //console.log(labelGroup)
    const { record, handleSave } = this.props;
    record[labelGroup] = value.join(",");
    handleSave(record);
    this.toggleEdit();
  };

  discard = e => {
    this.toggleEdit();
  };

  renderCell = form => {
    this.form = form;
    const { children, dataIndex, record, title, tags } = this.props;
    const { editing } = this.state;
    return editing ? (
      <React.Fragment>
        {dataIndex === "text" && (
          <Form.Item style={{ margin: 0 }}>
            {form.getFieldDecorator(dataIndex, {
              rules: [
                {
                  required: true,
                  message: `${title} is required.`
                }
              ],
              initialValue: record[dataIndex]
            })(
              <Input.TextArea
                ref={node => (this.input = node)}
                onPressEnter={this._saveCell}
              />
            )}
            <div className="buttons-list">
              <Button
                type="primary"
                size="small"
                icon="save"
                onClick={this._saveCell}
              >
                Save
              </Button>
              <Button
                type="primary"
                size="small"
                icon="stop"
                onClick={this.discard}
              >
                Discard
              </Button>
            </div>
          </Form.Item>
        )}
        {dataIndex !== "text" && (
          <Select
            mode="tags"
            allowClear={true}
            style={{ width: "100%" }}
            // onChange={(value) => this._saveLabel(value, dataIndex)}
            onBlur={value => this._saveLabel(value, dataIndex)}
            optionLabelProp="children"
            defaultValue={record[dataIndex] ? record[dataIndex].split(",") : []}
            dropdownRender={(menuNode, props) => {
              let tagChildren =
                props.children.props.children.props.children[0].props
                  .children[1].props.children;
              if (tagChildren.length > 0) {
                for (let i = 0; i < tagChildren.length - 1; i++) {
                  props.children.props.children.props.children[0].props.children[1].props.children[
                    i
                  ] = React.cloneElement(
                    props.children.props.children.props.children[0].props
                      .children[1].props.children[i],
                    {
                      ...props.children.props.children.props.children[0].props
                        .children[1].props.children[i].props,
                      style: {
                        ...props.children.props.children.props.children[0].props
                          .children[1].props.children[i].props.style,
                        backgroundColor:
                          colors[tags.indexOf(tagChildren[i].key)],
                        color: "white",
                        borderRadius: "4px"
                      },
                      children: [
                        ...props.children.props.children.props.children[0].props
                          .children[1].props.children[i].props.children
                      ]
                    }
                  );
                  props.children.props.children.props.children[0].props.children[1].props.children[
                    i
                  ].props.children[1] = React.cloneElement(
                    props.children.props.children.props.children[0].props
                      .children[1].props.children[i].props.children[1],
                    {
                      key: i,
                      style: {
                        color: "white"
                      }
                      // console.log(tagChild.props);
                    }
                  );
                }
              }
              return <div>{menuNode}</div>;
            }}
          >
            {tags.map((tag, index) => {
              const isLongTag = tag.length > 20;
              return (
                <Select.Option key={index} value={tag}>
                  {isLongTag ? `${tag.slice(0, 20)}...` : tag}
                </Select.Option>
              );
            })}
          </Select>
        )}
      </React.Fragment>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{ paddingRight: 24 }}
        onClick={this.toggleEdit}
      >
        {dataIndex === "text" && record[dataIndex]}
        {dataIndex === "label_group_1" &&
          record[dataIndex].split(",").map(tag => {
            const isLongTag = tag.length > 20;
            const tagElem = (
              <Tag
                key={tag}
                className="small-tag"
                color={colors[tags.indexOf(tag)]}
                closable={false}
              >
                {isLongTag ? `${tag.slice(0, 20)}...` : tag}
              </Tag>
            );
            return isLongTag ? (
              <Tooltip title={tag}>{tagElem}</Tooltip>
            ) : (
              tagElem
            );
          })}
        {dataIndex === "label_group_2" &&
          record[dataIndex].split(",").map(tag => {
            const isLongTag = tag.length > 20;
            const tagElem = (
              <Tag
                key={tag}
                className="small-tag"
                color={colors[tags.indexOf(tag)]}
                closable={false}
              >
                {isLongTag ? `${tag.slice(0, 20)}...` : tag}
              </Tag>
            );
            return isLongTag ? (
              <Tooltip title={tag}>{tagElem}</Tooltip>
            ) : (
              tagElem
            );
          })}
        {/* <div dangerouslySetInnerHTML={{ __html: renderHtmlTag(children[2], tags) }} /> */}
      </div>
    );
  };
}
