import React from "react";
import {
  Tag,
  Input,
  Tooltip,
  Icon,
  Modal,
  Divider
} from "antd";
import { colors } from "../common/constants";
import "./styles/Tags.css";
import shortid from "shortid";

export default class Tags extends React.Component {
  state = {
    inputVisible: false,
    inputValue: ""
  };

  _removeTag = removedTag => {
    Modal.confirm({
      title: "Are you sure delete this tag?",
      onOk: () => {
        const tags = this.props.tags.filter(tag => tag.key !== removedTag.key);
        this.props._updateTagsList(tags);
      }
    });
  };

  _editTag = editedTag => {
    Modal.confirm({
      icon: "edit",
      title: "Edit Tag?",
      content: <Input id="edit-tag-input" defaultValue={editedTag.value} />,
      onOk: () => {
        const tags = this.props.tags;
        const indexOfEditedTag = tags
          .map(tag => tag.key)
          .indexOf(editedTag.key);
        tags[indexOfEditedTag].value = document.getElementById(
          "edit-tag-input"
        ).value;
        this.props._updateTagsList(tags);
      }
    });
  };

  showInput = () => {
    this.setState({ inputVisible: true }, () => this.input.focus());
  };

  handleInputChange = e => {
    this.setState({ inputValue: e.target.value });
  };

  _newTag = () => {
    const { inputValue } = this.state;
    let { tags } = this.props;
    if (inputValue && tags.map(tag => tag.value).indexOf(inputValue) === -1) {
      tags.push({
        key: shortid.generate(),
        value: inputValue
      });
    }

    this.setState(
      {
        inputVisible: false,
        inputValue: ""
      },
      this.props._updateTagsList(tags)
    );
  };

  saveInputRef = input => (this.input = input);

  render() {
    const { tags } = this.props;
    const { inputVisible, inputValue } = this.state;
    return (
      <React.Fragment>
        {/* <Divider>Tags</Divider> */}
        {inputVisible && (
          <Input
            ref={this.saveInputRef}
            className="tag"
            type="text"
            size="small"
            style={{ width: 100 }}
            value={inputValue}
            onChange={this.handleInputChange}
            onBlur={this._newTag}
            onPressEnter={this._newTag}
          />
        )}
        <br />
        {!inputVisible && (
          <div>
            <Tag
              onClick={this.showInput}
              style={{
                background: "#fff",
                borderStyle: "dashed",
                marginBottom: 5
              }}
            >
              <Icon type="plus" /> New Tag
            </Tag>
            <Tag
              onClick={this._saveTags}
              style={{
                background: "#fff",
                borderStyle: "dashed",
                marginBottom: 5
              }}
            >
              <Icon type="save" /> Save Tags
            </Tag>
          </div>
        )}
        {tags.map(tag => {
          const isLongTag = tag.value.length > 25;
          const tagElem = (
            <Tag
              className="tag cursor-pointer"
              // color={colors[tags.map(tag => tag.key).indexOf(tag.key)]}
              // closable={true}
              // onClose={e => this._removeTag(e, tag)}
            >
              {isLongTag ? `${tag.value.slice(0, 25)}...` : tag.value}
              <Divider type="vertical" />
              <Icon type="edit" onClick={() => this._editTag(tag)} />
              <Icon type="close" onClick={() => this._removeTag(tag)} />
            </Tag>
          );
          return isLongTag ? (
            <span key={tag.key}>
              <Tooltip title={tag.value}>{tagElem}</Tooltip>
            </span>
          ) : (
            <span key={tag.key}>{tagElem}</span>
          );
        })}
      </React.Fragment>
    );
  }
}
