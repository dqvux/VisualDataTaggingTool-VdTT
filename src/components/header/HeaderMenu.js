import React, { Component } from "react";
import { Icon, Menu, Avatar } from "antd";
import logo from "../assets/images/logo.png";
import "./style.css";

class HeaderMenu extends Component {
  state = {
    isCollapsedSidebar: true,
    repository:
      "currentRepository" in localStorage
        ? JSON.parse(localStorage.getItem("currentRepository"))
        : null
  };

  render() {
    const { repository } = this.state;
    return (
      <Menu theme="dark" mode="horizontal" style={{ lineHeight: "62px" }}>
        <Menu.Item className="sidebar-menu-item">
          <Avatar shape="square" src={logo} />{" "}
          <span
            className="sidebar-repository-title"
            style={{ color: "#ffffff" }}
          >
            {repository.name}
          </span>
        </Menu.Item>

        <Menu.Item className="sidebar-menu-item">
          <Icon type="read" className="sidebar-icon" />
          <span style={{ color: "#ffffff" }}>Document</span>
        </Menu.Item>
        {this.props.children}

        <Menu.Item onClick={this._leaveRepository}>
          <Icon type="logout" className="sidebar-icon" />
          <span style={{ color: "#ffffff" }}>
            Logout of <b>{repository.name}</b>
          </span>
        </Menu.Item>
      </Menu>
    );
  }

  _leaveRepository = () => {
    localStorage.removeItem("currentRepository");
    window.location.reload();
  };
}

export default HeaderMenu;
