import React from "react";
import { HashRouter, Switch } from "react-router-dom";
import { Layout } from "antd";
import "./App.css";
import Homepage from "./components/home";
import InterfaceSwitcher from "./components/InterfaceSwitcher";

class App extends React.Component {
  state = {
    currentRepository:
      "currentRepository" in localStorage
        ? JSON.parse(localStorage.getItem("currentRepository"))
        : null
  };

  render() {
    const { currentRepository } = this.state;
    if (!currentRepository)
      return <Homepage _chooseRepository={this._chooseRepository} />;
    return (
      <HashRouter>
        <div className="container">
          <Switch>
            <Layout>
              {/* <SidebarMenu repository={currentRepository} _leaveRepository={this._leaveRepository} /> */}
              <InterfaceSwitcher
                interfaceType={currentRepository.type}
                repository={currentRepository}
              />
              {/* <Route exact path="/" render={(props) => <TaggingHomepage {...props} />} />
              <Route path='/labeling' render={(props) => <LabelingHomepage {...props} />} />
              <Route path='/tagging' render={(props) => <TaggingHomepage {...props} />} />
              <Route path='/data-converter' component={ConverterHomepage} /> */}
            </Layout>
          </Switch>
        </div>
      </HashRouter>
    );
  }

  _chooseRepository = repository => {
    delete repository.data;
    this.setState(
      { currentRepository: repository },
      localStorage.setItem("currentRepository", JSON.stringify(repository))
    );
  };
}

export default App;
