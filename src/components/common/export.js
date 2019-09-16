import XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import React from 'react'
import { notification, Icon } from 'antd'

export const exportData = async (dataSource, exportType) => {
    notification.info({
        key: 'export_data_notification',
        icon: <Icon type="loading" />,
        message: 'Preparing data to export, please wait...',
        duration: null
    })
    switch (exportType) {
        case 'excel':
            await exportToExcel(dataSource)
            notification.close('export_data_notification')
            break;
        case 'json':
            await exportToJson(dataSource)
            notification.close('export_data_notification')
            break;
        case 'csv':
            await exportToCsv(dataSource)
            notification.close('export_data_notification')
            break;
        default:
            break;
    }
} 

export function jsonToSheet(dataSource) {
    const sheet = XLSX.utils.json_to_sheet(dataSource)
    //console.log(sheet)
    return sheet
}

export function sheetToWorkbook(sheet) {
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, sheet, "dataSource")
    return wb
}

export function exportToExcel(dataSource) {
    const sheet = jsonToSheet(dataSource)
    const wb = sheetToWorkbook(sheet)
    XLSX.writeFile(wb, 'data.xlsx');
}

export function exportToCsv(dataSource) {
    const sheet = jsonToSheet(dataSource)
    const wb = sheetToWorkbook(sheet)
    XLSX.writeFile(wb, 'data.csv');
}

export function exportToJson(dataSource) {
    var blob = new Blob([JSON.stringify(dataSource, null, 2)], { type: "text/plain;charset=utf-8" });
    saveAs(blob, 'data.json')
}

export function exportToTrainTestData(dataSource) {
    var content = ""
    const data = dataSource.map(row => row.sentence)
    content = data.join('\n\n')
    var blob = new Blob([content], { type: "text/plain;charset=utf-8" })
    saveAs(blob, 'data.txt')
}

// export const prepareDataToExportJson = (exportedData, tokenDelimiter) => {
//     tokenDelimiter = tokenDelimiter === 'space' ? ' ' : ''
//     const results = exportedData.map(item => {
//         let tokens = []
//         const entities = []
//         if (!testIncludesNestedTag(item.sentence)) {
//             item.sentence.replace(/(^|>)\s+|\s+(?=<|$)/g, "$1__").split('__').map((segment, index) => {
//                 if (segment.includes('</')) {
//                     const tag = segment.match(/<[\s\S]*?>/g)[0].replace('<', '').replace('>', '')
//                     const contentInTag = segment.replace(`<${tag}>`, '').replace(`</${tag}>`, '')
//                     //console.log(tag, contentInTag)
//                     const tokensInContent = contentInTag.split(tokenDelimiter)
//                     const entity = {}
//                     entity.start = tokens.length
//                     tokens = tokens.concat(tokensInContent)
//                     entity.end = tokens.length - 1
//                     entity.label = tag
//                     entities.push(entity)
//                 }
//                 else {
//                     tokens = tokens.concat(segment.split(tokenDelimiter))
//                 }
//             })
//         }
//         return {
//             text: tokens.join(tokenDelimiter),
//             tokens: tokens,
//             entities: entities
//         }
//     })
//     // console.log(results)
//     return results
// }

export default {
    jsonToSheet
}
