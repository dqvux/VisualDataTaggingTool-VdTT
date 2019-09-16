import moment from 'moment'

export function convert2LocalTime(timeString) {
    var localTime = moment(timeString).local().format('YYYY-MM-DD HH:mm:ss')
    return localTime
}