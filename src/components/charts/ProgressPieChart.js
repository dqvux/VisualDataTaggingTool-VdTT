import React from 'react'
import { RepositoryService } from '../database/repositoryService'
import { Row, Col, Button } from 'antd'
import { _genLabelsChart, _genWorkingProgressChart, _genLabelGroup1Chart, _genLabelGroup2Chart } from './genchart'

export default class ProgressPieChart extends React.Component {

    state = {
        activeIndex: 0,
        dataSource: [],
        tags: []
    };

    onPieEnter = (data, index) => {
        this.setState({
            activeIndex: index,
        });
    };

    render() {
        const { interfaceType } = this.props
        return (
            <React.Fragment>
                <Button type='primary' onClick={this._refreshStats}>Refresh</Button>
                <Row>
                    {
                        interfaceType === 'Named Entities' && (
                            <React.Fragment>
                                <Col span={12}>
                                    <div id='working-progress-chart'></div>
                                </Col>
                                <Col span={12}>
                                    <div id='label-chart'></div>
                                </Col>
                            </React.Fragment>
                        )
                    }
                    {
                        interfaceType === 'Dependencies' && (
                            <React.Fragment>
                                <Col span={12}>
                                    <div id='working-progress-chart'></div>
                                </Col>
                                <Col span={12}>
                                    <div id='label-chart'></div>
                                </Col>
                            </React.Fragment>
                        )
                    }
                    {
                        interfaceType === 'Text Classification' && (
                            <React.Fragment>
                                <Col span={12}>
                                    <div id='working-progress-chart'></div>
                                </Col>
                                <Col span={12}>
                                    <div id='label-group-1-chart'></div>
                                </Col>
                                <Col span={12}>
                                    <div id='label-group-2-chart'></div>
                                </Col>
                            </React.Fragment>
                        )
                    }
                </Row>
            </React.Fragment>
        )
    }

    _getRepositoryData = async () => {
        const service = new RepositoryService()
        if (!('currentRepository' in localStorage)) {
            return
        }
        const currentRepository = JSON.parse(localStorage.getItem('currentRepository'))
        try {
            const repositories = await service.getRepositoryById(currentRepository.id)
            this.setState({ dataSource: repositories[0].data, tags: repositories[0].tags })
        } catch (ex) {
            console.error(ex)
        }
    }

    _refreshStats = () => {
        this._getRepositoryData()
    }

    componentDidMount = () => {
        this._getRepositoryData()
    }

    componentDidUpdate = () => {
        const { dataSource, tags } = this.state
        console.log(dataSource, tags)
        const { interfaceType } = this.props
        const workingProgressData = [
            { name: 'Done', y: dataSource.filter(obj => obj.status === 'done').length / dataSource.length * 100 },
            { name: 'Temporary', y: dataSource.filter(obj => obj.status === 'temporary').length / dataSource.length * 100 },
            { name: 'Unmarked', y: dataSource.filter(obj => !obj.status || obj.status === 'unmarked').length / dataSource.length * 100 }
        ]

        let labelsData = []
        let allLabels = []

        let labelGroup1 = []
        let labelGroup2 = []
        let dataForGenChartLabelGroup1 = []
        let dataForGenChartLabelGroup2 = []

        if (interfaceType === 'Named Entities') {
            dataSource.forEach(obj => {
                const closeTags = obj.text.match(/<\/.+?>/g) || []
                const labels = closeTags && closeTags.map(tag => tag.replace('</', '').replace('>', ''))
                allLabels = allLabels.concat(labels)
            })
            tags.forEach(tag => {
                labelsData.push({
                    name: tag,
                    y: allLabels.filter(label => label === tag).length
                })
            })
            _genLabelsChart(labelsData)
        }

        if (interfaceType === 'Dependencies') {
            dataSource.forEach(obj => {
                const labels = obj.dependencies ? obj.dependencies.map(item => item.label) : []
                allLabels = allLabels.concat(labels)
            })
            tags.forEach(tag => {
                labelsData.push({
                    name: tag,
                    y: allLabels.filter(label => label === tag).length
                })
            })
            _genLabelsChart(labelsData)
        }

        if (interfaceType === 'Text Classification') {
            dataSource.forEach(obj => {
                labelGroup1 = labelGroup1.concat(obj.label_group_1 ? obj.label_group_1.split(',') : [])
                labelGroup2 = labelGroup2.concat(obj.label_group_2 ? obj.label_group_2.split(',') : [])
            })
            tags.forEach(tag => {
                dataForGenChartLabelGroup1.push({
                    name: tag,
                    y: labelGroup1.filter(label => label === tag).length
                })
                dataForGenChartLabelGroup2.push({
                    name: tag,
                    y: labelGroup2.filter(label => label === tag).length
                })
            })
            _genLabelGroup1Chart(dataForGenChartLabelGroup1)
            _genLabelGroup2Chart(dataForGenChartLabelGroup2)
        }

        _genWorkingProgressChart(workingProgressData)
    }
}
