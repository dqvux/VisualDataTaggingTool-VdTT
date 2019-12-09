import React, { Component } from "react";
import { Layout, Menu, Icon, Modal, Avartar, notification } from "antd";
import "./style.css";
import { RepositoryService } from "../database/repositoryService";
import RepoSettings from "../repo-settings";

class SidebarMenu extends Component {
  state = {
    isCollapsedSidebar: true,
    repository:
      "currentRepository" in localStorage
        ? JSON.parse(localStorage.getItem("currentRepository"))
        : null
  };

  render() {
    const { isCollapsedSidebar, repository } = this.state;
    return (
      <Layout.Sider
        width={200}
        className="left-sidebar"
        theme="light"
        collapsible
        collapsed={isCollapsedSidebar}
        onCollapse={this._collapseSidebar}
        style={{
          overflow: "auto",
          height: "100vh",
          left: 0,
          top: 0,
          position: "sticky"
        }}
      >
        <Menu mode="inline" theme="light" style={{ height: "100vh" }}>
          <Menu.Item className="sidebar-menu-item">
            <Icon type="tag" theme="twoTone" className="sidebar-icon" />
            <span className="sidebar-repository-title">{repository.name}</span>
          </Menu.Item>

          <Menu.Item className="sidebar-menu-item">
            <Icon type="read" className="sidebar-icon" />
            <span>Document</span>
          </Menu.Item>
          {this.props.children}
          <Menu.Divider />
          <Menu.Item onClick={this._leaveRepository}>
            <Icon type="logout" className="sidebar-icon" />
            <span>
              Logout of <b>{repository.name}</b>
            </span>
          </Menu.Item>
          {/* <Menu.Item onClick={this._showDeleteConfirm}>
                        <Icon type="delete" theme="twoTone" twoToneColor='red' className='sidebar-icon' /><span>Delete this repository</span>
                    </Menu.Item> */}
        </Menu>
      </Layout.Sider>
    );
  }

  _collapseSidebar = () => {
    this.setState({ isCollapsedSidebar: !this.state.isCollapsedSidebar });
  };

  _openRepoSettings = () => {
    Modal.info({
      icon: <Icon type="setting" />,
      title: "Repository Settings",
      content: (
        <React.Fragment>
          <RepoSettings repository={this.state.repository} />
        </React.Fragment>
      )
    });
  };

  _leaveRepository = () => {
    localStorage.removeItem("currentRepository");
    window.location.reload();
  };
}

export default SidebarMenu;
