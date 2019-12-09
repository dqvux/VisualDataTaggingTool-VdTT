import React from "react";
import NamedEntities from "./named-entities";
import TextClassification from "./text-classification";
import DependenciesHomepage from "./dependencies";
import { Tooltip, Icon, Layout, PageHeader } from "antd";
import RepoSettings from "./repo-settings";
import ProgressPieChart from "./charts/ProgressPieChart";
import DocumentTagging from "./document-tagging";
import HeaderMenu from "./header/HeaderMenu";

const { Header, Content, Sider } = Layout;
export default class InterfaceSwitcher extends React.Component {
  state = {
    mode: null
  };
  render() {
    const { interfaceType } = this.props;
    const { mode } = this.state;
    let component = null;
    switch (interfaceType) {
      case "Named Entities":
        component = <NamedEntities />;
        break;
      case "Text Classification":
        component = <TextClassification />;
        break;
      case "Dependencies":
        component = <DependenciesHomepage />;
        break;
      case "Document Tagging":
        component = <DocumentTagging />;
      default:
        break;
    }
    return (
      <React.Fragment>
        <Layout>
          <Layout
            style={{
              // margin: "10px 10px",
              // borderRadius: 8,
              background: "#ffffff"
            }}
          >
            <Header style={{ padding: 0 }}>
              <HeaderMenu />
            </Header>
            <PageHeader
              title="Repository"
              subTitle={interfaceType}
              style={{
                borderRadius: "8px 8px 0px 0px",
                border: "none"
              }}
              extra={[
                <div className="icons-list">
                  <Tooltip title="Stats">
                    <Icon
                      type="bar-chart"
                      onClick={() => this.setState({ mode: "Stats" })}
                    />
                  </Tooltip>
                  <Tooltip title="Settings">
                    <Icon
                      type="setting"
                      onClick={() => this.setState({ mode: "Settings" })}
                    />
                  </Tooltip>
                </div>
                //   <Dropdown key="more" />
              ]}
            ></PageHeader>
            {component}
          </Layout>
          <Sider
            theme="light"
            collapsed={mode === null}
            collapsedWidth={0}
            width="30%"
            className="right-sider border-left"
          >
            <PageHeader
              title="Repository"
              subTitle={`${mode}`}
              extra={[
                <div className="icons-list">
                  <Tooltip title="Close">
                    <Icon
                      type="close"
                      onClick={() => this.setState({ mode: null })}
                    />
                  </Tooltip>
                </div>
              ]}
            ></PageHeader>
            <div style={{ padding: 10 }}>
              {mode === "Stats" ? (
                <ProgressPieChart interfaceType={interfaceType} />
              ) : (
                <RepoSettings />
              )}
            </div>
          </Sider>
        </Layout>
      </React.Fragment>
    );
  }
}
