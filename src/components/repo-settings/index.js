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
            <UpdateRepoSettings repository={repository} />
          </React.Fragment>
        );
    }
}