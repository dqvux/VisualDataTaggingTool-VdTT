import React from "react";
import { Layout } from "antd";
import DataTable from "./DataTable";
import Tags from "./Tags";
import { RepositoryService } from "../database/repositoryService";

const { Content, Footer } = Layout;

export default class NamedEntities extends React.Component {
  state = {
    tags: ["tag1", "tag2", "tag3"],
    tokenDelimiter: "space"
  };

  render() {
    const { tags, tokenDelimiter } = this.state;
    return (
      <React.Fragment>
        <Content style={{ padding: 20, height: "100%", overflow: "hidden scroll" }}>
          <DataTable tags={tags} tokenDelimiter={tokenDelimiter} />
        </Content>
        <Footer className="tags-footer">
          <Tags
            tags={tags}
            _updateTagsList={this._updateTagsList}
            _addTag={this._addTag}
          />
        </Footer>
      </React.Fragment>
    );
  }

  _addTag = tag => {
    const { tokenDelimiter } = this.state;
    var textarea = document.getElementById("text");
    if (textarea) {
      const len = textarea.value.length;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const sel = textarea.value
        .substring(start, end)
        .replace(/ +/g, " ")
        .trim(); // remove all unexpected space, use regex /\s+/g instead if wanna remove all white space such as: tab, newline, ...
      let replace = "";
      if (tokenDelimiter === "space") replace = ` <${tag}>${sel}</${tag}> `;
      else replace = `<${tag}>${sel}</${tag}>`;
      window.pattern = sel;
      window.tag = tag;
      // Here we are replacing the selected text with this one

      //textarea.focus()

      textarea.value = (
        textarea.value.substring(0, start) +
        replace +
        textarea.value.substring(end, len)
      )
        .replace(/ +/g, " ")
        .trim();
      textarea.selectionEnd = start + replace.length;
      // this.setState({ pattern: sel, tag: tag }, () => {
      //     textarea.value = (textarea.value.substring(0, start) + replace + textarea.value.substring(end, len)).replace(/ +/g, ' ').trim();
      // })
    }
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
      const tags =
        repositories[0].tags.length > 0
          ? repositories[0].tags
          : ["tag1", "tag2", "tag3"];
      this.setState({
        tags,
        tokenDelimiter: repositories[0].settings.tokenDelimiter
      });
    } catch (ex) {
      console.error(ex);
    }
  };

  componentDidMount = () => {
    this._getRepositoryData();
  };
}
