import React from 'react'
import { Layout } from 'antd'
import DataTable from './DataTable';
import Tags from './Tags';
import { RepositoryService } from '../database/repositoryService'

export default class TextClassification extends React.Component {
    state = {
        tags: ['tag1', 'tag2', 'tag3'],
    }

    render() {
        const { tags } = this.state
        return (
            <React.Fragment>
                <Layout.Content style={{ padding: 20 }}>
                    <DataTable tags={tags} />
                </Layout.Content>
                <Tags tags={tags} _updateTagsList={this._updateTagsList} _addTag={this._addTag} />
            </React.Fragment>
        )
    }

    _addTag = (tag) => {
        const textarea = document.getElementById('label_group_1') || document.getElementById('label_group_2')
        if (textarea) {
            const currentTags = textarea.value ? textarea.value.split(',') : []
            if (currentTags.indexOf(tag) === -1)
                currentTags.push(tag)
            textarea.value = currentTags.join(',')
        }
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
            const tags = repositories[0].tags.length > 0 ? repositories[0].tags : ['tag1', 'tag2', 'tag3']
            this.setState({ tags })
        } catch (ex) {
            console.error(ex)
        }
    }

    componentDidMount = () => {
        this._getRepositoryData()
    }
}