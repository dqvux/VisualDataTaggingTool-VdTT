import React from "react";
import { Layout } from "antd";
import DataTable from "./DataTable";
import { RepositoryService } from "../database/repositoryService";

const { Content } = Layout;

export default class DocumentTagging extends React.Component {
  render() {
    return (
      <React.Fragment>
        <DataTable />
      </React.Fragment>
    );
  }
}
