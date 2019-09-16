import React from 'react'
import UpdateRepoSettings from './UpdateRepoSettings'
import UpdateTags from './UpdateTags'
import { Row, Col } from 'antd'

export default class RepoSettings extends React.Component {
    state = {
        repository: 'currentRepository' in localStorage ? JSON.parse(localStorage.getItem('currentRepository')) : null,
    }

    render () {
        const { repository } = this.state
        return (
            <React.Fragment>
                <Row gutter={30}>
                    <Col span={12}>
                        <UpdateRepoSettings repository={repository} />
                    </Col>
                    <Col span={12}>
                        {/* <UpdateTags tags={repository.tags} _updateTagsList={this.props._updateTagsList} /> */}
                    </Col>
                </Row>
            </React.Fragment>
        )
    }
}