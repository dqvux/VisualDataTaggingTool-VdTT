import React from "react";
import {
  Icon,
  notification,
  List,
  Divider,
  Button,
  Layout,
  Row,
  Col,
  Avatar
} from "antd";
import { RepositoryService } from "../database/repositoryService";
import CreateRepositoryForm from "./CreateRepositoryForm";
import { convert2LocalTime } from "../common/time";
import logo from "../assets/images/logo.png";
import "./styles/style.css";

export default class Homepage extends React.Component {
  state = {
    repositories: null
  };

  render() {
    const { repositories } = this.state;
    return (
      <React.Fragment>
        <Layout
          style={{ height: "100%", backgroundColor: "#fafafa", padding: 20 }}
        >
          <Row gutter={20}>
            <Col span={8}>
              <center style={{ marginTop: 100 }}>
                <img alt="logo" src={logo} />
                <h1 style={{ marginTop: 20, color: "#5f4e56" }}>
                  Visual Data Tagging Tool
                </h1>
                <h3 style={{ marginTop: 20, color: "#5f4e56" }}>
                  Version 2.1.2 - Developed by DQV @ 2019
                </h3>
                <div>
                  <Button
                    icon="mail"
                    type="link"
                    href="mailto:dqvu.it@gmail.com"
                  >
                    Contact
                  </Button>
                </div>
              </center>
            </Col>
            <Col span={5}>
              <h1 style={{ marginTop: 20, color: "#5f4e56" }}>
                Create Repository
              </h1>

              <CreateRepositoryForm _addRepository={this._addRepository} />
            </Col>
            <Col span={11}>
              <h1 style={{ marginTop: 20, color: "#5f4e56" }}>
                Your Repositories
              </h1>

              {repositories ? (
                <List
                  style={{ marginTop: 20 }}
                  bordered={true}
                  dataSource={repositories}
                  pagination={{ pageSize: 5 }}
                  renderItem={repository => (
                    <List.Item key={repository.id}>
                      <List.Item.Meta
                        avatar={<Avatar shape="square" src={logo} />}
                        title={
                          <a
                            href="#"
                            onClick={() => this._chooseRepository(repository)}
                          >
                            <b style={{ fontSize: "16px" }}>
                              {repository.name}
                            </b>
                          </a>
                        }
                        description={
                          <React.Fragment>
                            <b>Type:</b> <i>{repository.type}</i>
                            <Divider type="vertical" />
                            <b>Created At:</b>{" "}
                            {convert2LocalTime(
                              new Date(repository.createdAt).toISOString()
                            )}
                          </React.Fragment>
                        }
                      />
                    </List.Item>
                  )}
                ></List>
              ) : (
                "There are no repositories"
              )}
            </Col>
          </Row>
        </Layout>
      </React.Fragment>
    );
  }

  _addRepository = async repository => {
    const service = new RepositoryService();
    try {
      const insertedRepositorys = await service.addRepository(repository);
      if (insertedRepositorys > 0) {
        notification.success({
          message: (
            <span>
              Your repository <b>"{repository.name}"</b> was successfully
              created.
            </span>
          )
        });
        this._getRepositorys();
      } else {
        notification.error({ message: "Unable to create repository" });
      }
    } catch (ex) {
      notification.error({ message: ex.type, description: ex.message });
    }
  };

  _getRepositorys = async () => {
    const service = new RepositoryService();
    try {
      const repositories = await service.getRepositorys();
      this.setState({
        repositories: repositories
      });
    } catch (ex) {
      console.error(ex);
    }
  };

  _chooseRepository = repository => {
    this.props._chooseRepository(repository);
  };

  componentDidMount = () => {
    this._getRepositorys();
  };
}
