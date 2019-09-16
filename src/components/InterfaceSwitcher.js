import React from 'react'
import NamedEntities from './named-entities'
import TextClassification from './text-classification'
import DependenciesHomepage from './dependencies'
import SidebarMenu from './sidebar/SidebarMenu'
import { Tabs, Icon, Layout } from 'antd';
import RepoSettings from './repo-settings';
import ProgressPieChart from './charts/ProgressPieChart';

export default class InterfaceSwitcher extends React.Component {
    render() {
        const { interfaceType } = this.props
        let component = null
        switch (interfaceType) {
            case 'Named Entities':
                component = <NamedEntities />
                break;
            case 'Text Classification':
                component = <TextClassification />
                break;
            case 'Dependencies':
                component = <DependenciesHomepage />
                break;
            default:
                break;
        }
        return (
            <React.Fragment>
                <SidebarMenu />
                <Layout.Content style={{ padding: '20px 20px 0px 20px', backgroundColor: '#ffffff' }}>
                    <Tabs defaultActiveKey='0'>
                        <Tabs.TabPane key='0' tab={<span><Icon type='codepen' />Tagging</span>}>
                            {
                                component
                            }
                            <div style={{ marginBottom: 200 }}></div>
                        </Tabs.TabPane>
                        <Tabs.TabPane key='1' tab={<span><Icon type='bar-chart' />Stats</span>}>
                            <center>
                                <ProgressPieChart interfaceType={interfaceType} />
                            </center>
                        </Tabs.TabPane>
                        <Tabs.TabPane key='2' tab={<span><Icon type='setting' />Settings</span>}>
                            <RepoSettings />
                        </Tabs.TabPane>
                    </Tabs>
                </Layout.Content>
            </React.Fragment>
        )
    }
}