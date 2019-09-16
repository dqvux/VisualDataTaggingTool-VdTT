import React from 'react'
import { Layout } from 'antd';
import DataTable from './DataTable';
import Tags from './Tags';
import { RepositoryService } from '../database/repositoryService'


export default class DependenciesHomepage extends React.Component {
    state = {
        tags: ['nsubj', 'dobj', 'iobj'],
    }
    render() {
        const { tags } = this.state
        return (
            <React.Fragment>
                <Layout.Content style={{ padding: '20px 20px 0px 20px' }}>
                    <DataTable tags={tags} />
                </Layout.Content>
                <Tags tags={tags} _updateTagsList={this._updateTagsList} _addTag={this._addTag} />
            </React.Fragment>
        )
    }

    _updateTagsList = (newTagsList) => {
        this.setState({ tags: newTagsList })
    }

    _getRepositoryData = async () => {
        const service = new RepositoryService()
        if (!('currentRepository' in localStorage)) {
            return
        }
        const currentRepository = JSON.parse(localStorage.getItem('currentRepository'))
        try {
            const repositories = await service.getRepositoryById(currentRepository.id)
            const tags = repositories[0].tags.length > 0 ? repositories[0].tags : ['nsubj', 'dobj', 'iobj']
            this.setState({ tags })
        } catch (ex) {
            console.error(ex)
        }
    }

    componentDidMount = () => {
        this._getRepositoryData()
    }
}