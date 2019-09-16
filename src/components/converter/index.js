import React from 'react'
import { Layout } from 'antd'
import DataTable from './DataTable'

export default class ConverterHomepage extends React.Component {
    render() {
        return (
            <React.Fragment>
                <Layout.Content style={{ padding: 20 }}>
                    <DataTable />
                </Layout.Content>
            </React.Fragment>
        )
    }
}