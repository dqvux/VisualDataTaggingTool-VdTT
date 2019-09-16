import React from 'react'
import { Table, Menu, Icon, Upload, Dropdown, Button, notification, Modal, Row, Select } from 'antd'
import './styles/DataTable.css'
import { exportToExcel, exportToCsv, exportToJson, exportToTrainTestData } from '../common/export'
import { getBase64 } from '../common/import'
import XLSX from 'xlsx'
import { convert2IOB2, shuffle } from '../common/convert'

export default class DataTable extends React.Component {
    state = {
        searchText: '',
        dataSource: 'tagging_dataSource' in localStorage
            ? JSON.parse(localStorage.getItem('tagging_dataSource')).map((obj, index) => {
                const newObj = {
                    key: obj.key ? obj.key : index + 1,
                    sentence: obj.sentence
                }
                return newObj
            })
            : [],
    }

    render() {
        const { dataSource } = this.state
        console.log(dataSource)
        const columns = [
            {
                title: 'No.',
                dataIndex: 'key',
                key: 'key',
                width: '10%',
            },
            {
                title: 'Sentence',
                dataIndex: 'sentence',
                key: 'sentence'
            }
        ]

        return (
            <React.Fragment>
                <Button.Group style={{ marginBottom: 16 }}>
                    <Button icon='folder-open' onClick={this._chooseDataSource}>Import Data</Button>
                    <Button icon='delete' onClick={this._clearData}>Clear Data</Button>
                    <Button icon='delete' onClick={() => this._convertData('lowercase')}>Lowercase</Button>
                    <Button icon='delete' onClick={() => this._convertData('shuffle')}>Shuffle</Button>
                    <Button icon='delete' onClick={() => this._convertData('iob2')}>IOB2</Button>

                    <Dropdown overlay={
                        <Menu onClick={this._exportData}>
                            <Menu.Item key="excel"><Icon type="file-excel" />EXCEL</Menu.Item>
                            <Menu.Item key="json"><Icon type="file" />JSON</Menu.Item>
                            <Menu.Item key="csv"><Icon type="file-text" />CSV</Menu.Item>
                            <Menu.Item key="train-test"><Icon type="file-text" />Train-Test</Menu.Item>
                        </Menu>
                    }>
                        <Button icon='download'>Export <Icon type="down" /></Button>
                    </Dropdown>
                </Button.Group>
                <Table
                    bordered
                    dataSource={dataSource}
                    columns={columns}
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
                        <Upload onChange={this._importFromExcelFile} showUploadList={false} multiple={false}>
                            <Button style={{ marginBottom: 16 }}>
                                <Icon type="upload" /> Upload file
                        </Button>
                        </Upload>
                    </Row>
                </React.Fragment>
            ),
            onOk() { },
        })
    }

    _importFromExcelFile = (info) => {
        if (info.file.status === 'error' || info.file.status === 'done') {
            getBase64(info.file.originFileObj, fileUrl => {
                const base64 = fileUrl.split(',')[1]
                const workbook = XLSX.read(base64, { type: 'base64' })
                let wb_data = []
                workbook.SheetNames.forEach(function (sheetName) {
                    var roa = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: ['sentence', 'label', 'status'] });
                    if (roa.length > 0) {
                        wb_data = wb_data.concat(roa);
                    }
                });

                const dataSource = wb_data.slice(1, wb_data.length).map((row, index) => {
                    row.key = index + 1
                    if (!row.status)
                        row.status = 'unmarked'
                    return row
                })

                this.setState({ dataSource }, notification.success({ message: 'Data has been imported successfully' }))
            })
        }
    }

    // _saveData = () => {
    //     const { dataSource } = this.state
    //     if ('tagging_dataSource' in localStorage)
    //         localStorage.removeItem('tagging_dataSource')
    //     localStorage.setItem('tagging_dataSource', JSON.stringify(dataSource))
    //     if ('tagging_dataSource' in localStorage)
    //         notification.success({ message: 'Data has been saved successfully' })
    // }

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
            case 'train-test':
                exportToTrainTestData(exportData)
                break
            default:
                break
        }

    }

    _convertData = (type_convert) => {
        const { dataSource } = this.state
        let convertedData = []
        switch (type_convert) {
            case 'iob2':
                for (let i = 0; i < dataSource.length; i++) {
                    const row = dataSource[i]
                    const convertedStr = convert2IOB2(row.sentence).join('\n')
                    convertedData.push({
                        key: row.key,
                        sentence: convertedStr
                    })
                }
                break;
            case 'shuffle':
                convertedData = shuffle(dataSource)
                break;
            case 'lowercase':
                for (let i = 0; i < dataSource.length; i++) {
                    const row = dataSource[i]
                    const convertedStr = row.sentence.toLowerCase()
                    convertedData.push({
                        key: row.key,
                        sentence: convertedStr
                    })
                }
                break;
            case 'split(4:1)':
                let point = parseInt(dataSource.length / 5 * 4);
                // console.log(point);
                for (let i = 0; i < dataSource.length; i++) {
                    if (i !== point) {
                        convertedData.push(dataSource[i]);
                    }
                    else {
                        convertedData.push(dataSource[i].sentence);
                        convertedData.push('#########################');
                    }

                }
                break;
            // case 'iob2+n-gram':
            //     let feature = new Array();

            //     for (let i = 0; i < dataSource.length; i++) {
            //         let convertedArr = convert2IOB2(dataSource[i]);
            //         let featureInSentence = new Array();
            //         for (let j = 0; j < convertedArr.length; j++) {
            //             let cps = new Array();
            //             for (let k = -2; k <= 2; k++) {
            //                 // 1-gram
            //                 if (j + k >= 0 && j + k < convertedArr.length) {
            //                     cps.push('w:' + (k) + ':' + convertedArr[j + k].split('\t')[0]);
            //                 }
            //             }
            //             // 2-gram
            //             for (let k = -2; k <= 1; k++) {
            //                 if (j + k >= 0 && j + k + 1 < convertedArr.length) {
            //                     cps.push('ww:' + (k) + ':' + (k + 1) + ':' + convertedArr[j + k].split('\t')[0] + ':' + convertedArr[j + k + 1].split('\t')[0]);
            //                 }
            //             }
            //             // 3-gram
            //             for (let k = -2; k <= 0; k++) {
            //                 if (j + k >= 0 && j + k + 2 < convertedArr.length) {
            //                     cps.push('www:' + (k) + ':' + (k + 1) + ':' + (k + 2) + ':' + convertedArr[j + k].split('\t')[0] + ':' + convertedArr[j + k + 1].split('\t')[0] + ':' + convertedArr[j + k + 2].split('\t')[0]);
            //                 }
            //             }

            //             cps.push(convertedArr[j].split('\t')[1]); //end token
            //             featureInSentence.push(cps.join(' '));

            //         } //end sentence

            //         feature.push(featureInSentence.join('\n'))
            //         renderData.push({ sentence: featureInSentence.join('\n') });
            //     }
            //     convertedData = feature;
            //     break;
            // case 'n-gram':
            //     let features = new Array();
            //     //console.log(dataSource.length);
            //     for (let i = 0; i < dataSource.length; i++) {
            //         let sentence = dataSource[i].split(/:::/)[0];
            //         let label = dataSource[i].split(/:::/)[1];
            //         feature = scanFeatures(sentence).join(' ') + '\t' + label;
            //         features.push(feature);
            //         renderData.push({ data: feature });
            //     }
            //     convertedData = features;
            //     break;
            // case 'n-gram-svm':
            //     features = new Array();
            //     //console.log(dataSource.length);
            //     for (let i = 0; i < dataSource.length; i++) {
            //         let sentence = dataSource[i].split(/:::/)[0];
            //         let label = dataSource[i].split(/:::/)[1];
            //         feature = scanFeatures(sentence).join(' ') + '\t' + label;
            //         features.push(feature);
            //         renderData.push({ data: feature });
            //     }
            //     var uniquefeatures =
            //         convertedData = features;

            //     break;
            default:
                break
        }

        this.setState({ dataSource: convertedData })
    }
}