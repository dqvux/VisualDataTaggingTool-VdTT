import React from "react";
import { Tag, Input, Tooltip, Icon, Modal, notification, Menu } from "antd";
import { colors } from "../common/constants";
import "./styles/Tags.css";
import { RepositoryService } from "../database/repositoryService";

export default class Tags extends React.Component {
  state = {
    inputVisible: false,
    inputValue: ""
  };

  handleClose = (e, removedTag) => {
    e.preventDefault();

    Modal.confirm({
      title: "Are you sure delete this label?",
      onOk: () => {
        const tags = this.props.tags.filter(tag => tag !== removedTag);
        this.props._updateTagsList(tags);
      }
    });
  };

  showInput = () => {
    this.setState({ inputVisible: true }, () => this.input.focus());
  };

  handleInputChange = e => {
    this.setState({ inputValue: e.target.value.split(",") });
  };

  handleInputConfirm = () => {
    const { inputValue } = this.state;
    let { tags } = this.props;
    if (inputValue && tags.indexOf(inputValue) === -1) {
      tags = tags.concat(inputValue);
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
    const { tags, _addTag } = this.props;
    const { inputVisible, inputValue } = this.state;
    return (
      <React.Fragment>
        {inputVisible && (
          <Input
            ref={this.saveInputRef}
            className="tag"
            type="text"
            size="small"
            style={{ width: 100 }}
            value={inputValue}
            onChange={this.handleInputChange}
            onBlur={this.handleInputConfirm}
            onPressEnter={this.handleInputConfirm}
          />
        )}
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
              <Icon type="plus" /> New Label
            </Tag>
            <Tag
              onClick={this._saveTags}
              style={{
                background: "#fff",
                borderStyle: "dashed",
                marginBottom: 5
              }}
            >
              <Icon type="save" /> Save
            </Tag>
          </div>
        )}
        <div className="list-tags">
          {tags.map(tag => {
            const isLongTag = tag.length > 50;
            const tagElem = (
              <Tag
                className="tag cursor-pointer"
                color={colors[tags.indexOf(tag)]}
                closable={true}
                onClose={e => this.handleClose(e, tag)}
                onClick={() => this.props._addTag(tag)}
              >
                {isLongTag ? `${tag.slice(0, 50)}...` : tag}
              </Tag>
            );
            return isLongTag ? (
              <span key={tag}>
                <Tooltip title={tag}>{tagElem}</Tooltip>
              </span>
            ) : (
              <span key={tag}>{tagElem}</span>
            );
          })}
        </div>
        <ShortKey tags={tags} _addTag={_addTag} />
      </React.Fragment>
    );
  }

  _saveTags = async () => {
    const { tags } = this.props;
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
          message: "Labels have been saved successfully"
        });
      } else {
        notification.error({ message: "Unable to save labels" });
      }
    } catch (ex) {
      notification.error({ message: ex.type, description: ex.message });
    }
  };

  componentDidUpdate = () => {
    const { tags, _addTag } = this.props;
    // document.removeEventListener('keypress', (e) => { })
  };
}

class ShortKey extends React.Component {
  render() {
    return null;
  }

  componentDidMount = () => {
    this.count = -1;
  };

  componentDidUpdate = () => {
    document.removeEventListener("keypress", this._handleShortKey);
    document.addEventListener("keypress", this._handleShortKey);
  };

  _handleShortKey = event => {
    const { tags, _addTag } = this.props;

    if (this._textIsSelected()) {
      // check text is selected or not
      event.preventDefault();
      const key = event.key;
      console.log(key);
      const candidateTags = tags.filter(tag =>
        tag.toLowerCase().startsWith(key)
      );
      if (candidateTags.length === 1) {
        _addTag(candidateTags[0]);
      } else {
        const tag = candidateTags[(this.count + 1) % candidateTags.length];
        if (!this.modal) {
          this.modal = Modal.success({
            title: window.getSelection().toString(),
            className: "ner-select-tag-modal",
            icon: null,
            content: (
              <React.Fragment>
                content: (
                <React.Fragment>
                  <Menu
                    selectedKeys={[tag]}
                    mode="inline"
                    style={{ border: "none" }}
                  >
                    {candidateTags.map(item => (
                      <Menu.Item
                        key={item}
                        style={{
                          // borderRight: item === tag ? `3px solid ${colors[tags.indexOf(tag)]}` : '',
                          backgroundColor:
                            item === tag ? `${colors[tags.indexOf(tag)]}` : "",
                          color: item === tag ? `white` : "black"
                        }}
                      >
                        {item}
                      </Menu.Item>
                    ))}
                  </Menu>
                </React.Fragment>
                ),
              </React.Fragment>
            )
          });
        }

        clearTimeout(this.timer);

        this.modal.update({
          content: (
            <React.Fragment>
              <Menu
                selectedKeys={[tag]}
                mode="inline"
                style={{ border: "none" }}
              >
                {candidateTags.map(item => (
                  <Menu.Item
                    key={item}
                    style={{
                      // borderRight: item === tag ? `3px solid ${colors[tags.indexOf(tag)]}` : '',
                      backgroundColor:
                        item === tag ? `${colors[tags.indexOf(tag)]}` : "",
                      color: item === tag ? `white` : "black"
                    }}
                  >
                    {item}
                  </Menu.Item>
                ))}
              </Menu>
            </React.Fragment>
          )
        });

        this.timer = setTimeout(() => {
          this.modal.destroy();
          this.modal = undefined;
          this.count = -1;
          _addTag(tag);
        }, 1000);

        this.count = this.count + 1;
      }
    }
  };

  _textIsSelected = () => {
    var txtarea = document.getElementById("text");

    if (!txtarea) return false;
    var start = txtarea.selectionStart;
    var finish = txtarea.selectionEnd;
    var sel = txtarea.value.substring(start, finish);
    if (sel.length > 0) {
      return true;
    }
    return false;
  };
}
