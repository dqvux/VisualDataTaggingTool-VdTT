import React from 'react'
import { Table, Menu, Icon, Upload, Dropdown, Input, Button, Popconfirm, Form, notification, Modal, Tooltip, Row } from 'antd'
import './styles/DataTable.css'
import constants from '../common/constants'
import { exportToExcel, exportToCsv, exportToJson } from '../common/export'
import { getBase64 } from '../common/import'
import XLSX from 'xlsx'
import ProgressPieChart from '../charts/ProgressPieChart'
import { RepositoryService } from '../database/repositoryService'
import Denpendency from './Dependency';

const colors = constants.colors

function renderHtmlTag(str, tags) {
    let outputHtml = str
    const closeTags = str.match(/<\/.+?>/g)

    if (closeTags)
        for (let i = 0; i < closeTags.length; i++) {
            const tagName = closeTags[i].replace('</', '').replace('>', '')
            outputHtml = outputHtml.replace(closeTags[i], `[[[span class="ant-tag ant-tag-has-color tag-name" style="background-color: ${colors[tags.indexOf(tagName)]}"]]]${tagName}[[[/span]]][[[/div]]]`)
        }

    const openTags = outputHtml.match(/<.+?>/g)
    if (openTags)
        for (let i = 0; i < openTags.length; i++) {
            outputHtml = outputHtml.replace(openTags[i], `[[[div class="ant-tag visual-content"]]]`)
        }

    // console.log(outputHtml.replace(/\[\[\[/g, '<').replace(/\]\]\]/g, '>'))
    return outputHtml.replace(/\[\[\[/g, '<').replace(/\]\]\]/g, '>')
}

export default class DataTable extends React.Component {
    state = {
        searchText: '',
        dataSource: [],
        currentTextKey: 1
    }

    render() {
        const { dataSource } = this.state
        const components = {
            body: {
                row: EditableFormRow,
                cell: EditableCell,
            },
        };
        const initColumns = [
            {
                title: 'No.',
                dataIndex: 'key',
                width: '10%',
                editable: false,
            },
            {
                title: 'Text',
                dataIndex: 'text',
                editable: true,
                ...this.getColumnSearchProps('text')
            },
            {
                title: 'Status',
                dataIndex: 'status',
                width: '10%',
                ...this.getColumnSearchProps('status'),
                render: (text, record) => {
                    if (record.status === 'done') {
                        return <b style={{ color: 'green' }}>done</b>
                    }
                    else if (record.status === 'temporary')
                        return <b style={{ color: 'blue' }}>temporary</b>
                    else {
                        return <b style={{ color: '#656161' }}>unmarked</b>
                    }
                }
            },
            {
                title: 'Operation',
                dataIndex: 'operation',
                width: '15%',
                render: (text, record) =>
                    this.state.dataSource.length >= 1 ? (
                        <div className="icons-list">
                            <Popconfirm title="Sure to delete?" onConfirm={() => this._deleteRow(record.key)}>
                                <Icon type='delete' theme='twoTone' twoToneColor='red' />
                            </Popconfirm>
                            <Tooltip title='Mark as Done'>
                                <Icon type='check-circle' theme='twoTone' twoToneColor='#52c41a' onClick={() => this._markStatusAs(record, 'done')} />
                            </Tooltip>
                            <Tooltip title='Mark as Temporary'>
                                <Icon type="exclamation-circle" theme="twoTone" onClick={() => this._markStatusAs(record, 'temporary')} />
                            </Tooltip>
                            <Tooltip title='Mark as Unmarked'>
                                <Icon type="stop" theme="twoTone" twoToneColor='#656161' onClick={() => this._markStatusAs(record, 'unmarked')} />
                            </Tooltip>
                        </div>
                    ) : null,
            },
            {
                title: '',
                width: '5%',
                editable: false,
                render: (text, record) => {
                    return (
                        <Tooltip title='Tag dependencies'>
                            <Icon type='tag' style={{ fontSize: 18 }} onClick={() => this._selectRow(record.key)} />
                        </Tooltip>
                    )
                }
            }
        ]
        const columns = initColumns.map(col => {
            if (!col.editable) {
                return col;
            }
            return {
                ...col,
                onCell: record => ({
                    record,
                    editable: col.editable,
                    dataIndex: col.dataIndex,
                    title: col.title,
                    handleSave: this.handleSave,
                }),
            }
        })
        return (
            <React.Fragment>
                <Button.Group>
                    <Button icon='plus' onClick={this._addRow} type="primary" style={{ marginBottom: 16 }}>
                        Add a row
                    </Button>
                    <Button icon='folder-open' onClick={this._chooseDataSource}>Import Data</Button>
                    <Button icon='save' onClick={this._saveData}>Save Data</Button>
                    <Button icon='delete' onClick={this._clearData}>Clear Data</Button>
                    <Dropdown overlay={
                        <Menu onClick={this._exportData}>
                            <Menu.Item key="json"><Icon type="file" />JSON</Menu.Item>
                        </Menu>
                    }>
                        <Button icon='download'>Export <Icon type="down" /></Button>
                    </Dropdown>
                </Button.Group>
                <Table
                    components={components}
                    rowClassName={() => 'editable-row'}
                    bordered
                    dataSource={dataSource}
                    columns={columns}
                    pagination={{ pageSize: 10 }}
                />
            </React.Fragment>
        )
    }

    _chooseDataSource = () => {
        const savedDataKeys = Object.keys(localStorage) ? Object.keys(localStorage).filter(key => key.includes('_dataSource')) : []

        Modal.info({
            title: 'Choose a Data Source',
            content: (
                <React.Fragment>
                    <Row>
                        <b>Import data from Excel file</b><br />
                        <Upload onChange={this._importDataFromExcel} showUploadList={false} multiple={false}>
                            <Button style={{ marginBottom: 16 }}>
                                <Icon type="upload" /> Upload file
                            </Button>
                        </Upload>
                    </Row>
                </React.Fragment>
            ),
        })
    }

    _markStatusAs = (record, status) => {
        const newData = [...this.state.dataSource];
        const index = newData.findIndex(item => record.key === item.key);
        const item = newData[index]
        item.status = status
        newData.splice(index, 1, {
            ...item,
            ...record,
        });
        this.setState({ dataSource: newData })
    }

    handleSearch = (selectedKeys, confirm) => {
        confirm()
        this.setState({ searchText: selectedKeys[0] })
    }

    handleReset = clearFilters => {
        clearFilters()
        this.setState({ searchText: '' })
    }

    getColumnSearchProps = dataIndex => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }}>
                <Input
                    ref={node => {
                        this.searchInput = node;
                    }}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => this.handleSearch(selectedKeys, confirm)}
                    style={{ width: 188, marginBottom: 8, display: 'block' }}
                />
                <Button
                    type="primary"
                    onClick={() => this.handleSearch(selectedKeys, confirm)}
                    icon="search"
                    size="small"
                    style={{ width: 90, marginRight: 8 }}
                >
                    Search
                </Button>
                <Button onClick={() => this.handleReset(clearFilters)} size="small" style={{ width: 90 }}>
                    Reset
                </Button>
            </div>
        ),
        filterIcon: filtered => (
            <Icon type="search" style={{ color: filtered ? '#1890ff' : undefined }} />
        ),
        onFilter: (value, record) =>
            record[dataIndex]
                .toString()
                .toLowerCase()
                .includes(value.toLowerCase()),
        onFilterDropdownVisibleChange: visible => {
            if (visible) {
                setTimeout(() => this.searchInput.select());
            }
        },
        // render: text => (
        //     <Highlighter
        //         highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
        //         searchWords={[this.state.searchText]}
        //         autoEscape
        //         textToHighlight={text.toString()}
        //     />
        // ),
    })

    _importDataFromExcel = (info) => {
        if (info.file.status === 'error' || info.file.status === 'done') {
            getBase64(info.file.originFileObj, fileUrl => {
                const base64 = fileUrl.split(',')[1]
                const workbook = XLSX.read(base64, { type: 'base64' })
                let wb_data = []
                workbook.SheetNames.forEach(function (sheetName) {
                    var roa = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
                    if (roa.length > 0) {
                        wb_data = wb_data.concat(roa)
                    }
                });

                const dataSource = wb_data.map((row, index) => {
                    row.key = index + 1
                    if (!row.tokens) {
                        row.tokens = row.text.split(' ').map(token => {
                            return { text: token, tag: '' }
                        })
                    }
                    if (!row.dependencies) {
                        row.dependencies = []
                    }
                    if (!row.status)
                        row.status = 'unmarked'
                    return row
                })

                this.setState({ dataSource }, notification.success({ message: 'Data has been imported successfully' }))
            })
        }
    }

    _selectRow = (key) => {
        const { dataSource } = this.state
        const indexOfText = dataSource.findIndex(item => item.key === key)
        const currentText = dataSource[indexOfText]
        const { tags } = this.props

        this.modal = Modal.info({
            icon: null,
            width: '60%',
            title: '',
            content: (
                <Denpendency tags={tags} text={currentText} saveRow={this._saveRow} />
            ),
            okText: 'Close'
        })
    }

    _saveRow = (row) => {
        const newData = [...this.state.dataSource]
        const index = newData.findIndex(item => row.key === item.key)
        const item = newData[index]
        newData.splice(index, 1, {
            ...item,
            ...row,
        });
        this.setState({ dataSource: newData }, this.modal.update({
            title: <span style={{ color: 'green' }}>Saved successful!</span>
        }))
    }

    _deleteRow = key => {
        const dataSource = [...this.state.dataSource];
        this.setState({ dataSource: dataSource.filter(item => item.key !== key) });
    }

    _addRow = () => {
        const { dataSource } = this.state;
        let count = dataSource.length
        const newData = {
            key: count + 1,
            text: `This is text ${count + 1}`,
            status: '',
            tokens: `This is text ${count + 1}`.split(' ').map(token => {
                return { text: token, tag: '' }
            }),
            dependencies: []
        }
        this.setState({
            dataSource: [...dataSource, newData],
            // count: count + 1,
        });
    }

    _saveData = async () => {
        const { dataSource } = this.state
        if (!('currentRepository' in localStorage)) {
            return
        }
        const currentRepository = JSON.parse(localStorage.getItem('currentRepository'))
        const service = new RepositoryService()
        try {
            const updateds = await service.updateRepositoryById(currentRepository.id, {
                data: dataSource
            })
            if (updateds > 0) {
                notification.success({ message: 'Data has been saved successfully' })
            } else {
                notification.error({ message: 'Unable to save data' })
            }
        } catch (ex) {
            notification.error({ message: ex.type, description: ex.message })
        }

        // if ('tagging_dataSource' in localStorage)
        //     localStorage.removeItem('tagging_dataSource')
        // localStorage.setItem('tagging_dataSource', JSON.stringify(dataSource))
        // if ('tagging_dataSource' in localStorage)
        //     notification.success({ message: 'Data has been saved successfully' })
    }

    _clearData = () => {
        this.setState({ dataSource: [] }, notification.success({ message: 'Data has been cleared successfully!' }))
    }

    _exportData = (e) => {
        const exportType = e.key
        const { dataSource } = this.state
        const exportData = dataSource.map(obj => {
            delete obj.key
            return obj
        })
        switch (exportType) {
            case 'excel':
                exportToExcel(exportData)
                break
            case 'csv':
                exportToCsv(exportData)
                break;
            case 'json':
                exportToJson(exportData)
                break
            default:
                break
        }

    }

    handleSave = row => {
        const newData = [...this.state.dataSource]
        const index = newData.findIndex(item => row.key === item.key)
        const item = newData[index]
        row.tokens = row.text.split(' ').map(token => {
            return { text: token, tag: '' }
        })
        newData.splice(index, 1, {
            ...item,
            ...row,
        });
        this.setState({ dataSource: newData })
    }

    _getRepositoryData = async () => {
        const service = new RepositoryService()
        if (!('currentRepository' in localStorage)) {
            return
        }
        const currentRepository = JSON.parse(localStorage.getItem('currentRepository'))
        try {
            const repositories = await service.getRepositoryById(currentRepository.id)
            this.setState({ dataSource: repositories[0].data })
        } catch (ex) {
            console.error(ex)
        }
    }

    _addDependency = () => {
        const newData = [...this.state.dataSource]
        const { currentTextKey } = this.state
        const indexOfText = newData.findIndex(item => item.key === currentTextKey)
        const currentText = newData[indexOfText]
        const newText = newData[indexOfText]
        newText.dependencies.push({ key: Math.random().toString(36).substr(2, 9), start: 0, end: 0, label: null, dir: null })

        newData.splice(indexOfText, 1, {
            ...currentText,
            ...newText,
        })

        this.setState({ dataSource: newData })
    }

    _changeTextDeppendencies = (values) => {
        console.log(values)

    }

    componentDidMount = () => {
        this._getRepositoryData()
        document.addEventListener("keydown", (e) => {
            if ((window.navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey) && e.keyCode == 83) {
                e.preventDefault()
                this._saveData()
            }
        }, false);
    }
}

const EditableContext = React.createContext();

const EditableRow = ({ form, index, ...props }) => (
    <EditableContext.Provider value={form}>
        <tr {...props} />
    </EditableContext.Provider>
);

const EditableFormRow = Form.create()(EditableRow);

class EditableCell extends React.Component {
    state = {
        editing: false,
    }

    render() {
        const {
            editable,
            dataIndex,
            title,
            record,
            index,
            handleSave,
            children,
            ...restProps
        } = this.props;
        return (
            <td {...restProps}>
                {editable ? (
                    <EditableContext.Consumer>{this.renderCell}</EditableContext.Consumer>
                ) : (
                        children
                    )}
            </td>
        );
    }


    toggleEdit = () => {
        const editing = !this.state.editing;
        this.setState({ editing }, () => {
            if (editing) {
                this.input.focus()
            }
        })
    }

    _saveCell = e => {
        const { record, handleSave } = this.props
        this.form.validateFields((error, values) => {
            if (error && error[e.currentTarget.id]) {
                return
            }
            this.toggleEdit()
            const textarea = document.getElementById("text")
            if (textarea) {
                record.text = textarea.value
                //record.status = ''
                handleSave(record)
            }
            else {
                handleSave({ ...record, ...values })
            }
        });
    }

    discard = e => {
        this.toggleEdit()
    }

    renderCell = form => {
        this.form = form;
        const { children, dataIndex, record, title, tags } = this.props;
        // console.log(children[2].replace(/(^|>)\s+|\s+(?=<|$)/g, "$1__"))
        const { editing } = this.state;
        return editing ? (
            <Form.Item style={{ margin: 0 }}>
                {form.getFieldDecorator(dataIndex, {
                    rules: [
                        {
                            required: true,
                            message: `${title} is required.`,
                        },
                    ],
                    initialValue: record[dataIndex],
                })(
                    <Input.TextArea ref={node => (this.input = node)} onPressEnter={this._saveCell} />
                )}
                <div className='buttons-list'>
                    <Button type='primary' size='small' icon='save' onClick={this._saveCell}>Save</Button>
                    <Button type='primary' size='small' icon='stop' onClick={this.discard}>Discard</Button>
                </div>
            </Form.Item>
        ) : (
                <div
                    className="editable-cell-value-wrap"
                    style={{ paddingRight: 24 }}
                    onClick={this.toggleEdit}
                >
                    <div dangerouslySetInnerHTML={{ __html: renderHtmlTag(children[2], tags) }} />
                </div>
            );
    }

    componentDidMount = () => {
        
    }
}
