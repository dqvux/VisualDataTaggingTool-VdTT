import Highcharts from 'highcharts'

export function _genLabelsChart(data) {
    Highcharts.chart('label-chart', {
        chart: {
            type: 'bar'
        },
        title: {
            text: 'Labels'
        },
        subtitle: {
            text: ''
        },
        xAxis: {
            type: 'category',
            labels: {
                //rotation: -45,
                style: {
                    fontSize: '13px',
                    fontFamily: 'Verdana, sans-serif'
                }
            }
        },
        yAxis: {
            // min: 0,
            // max: 100,
            allowDecimals: false,
            type: 'interger',
            title: {
                text: 'Total'
            }
        },
        legend: {
            enabled: false
        },
        tooltip: {
            pointFormat: 'Total: <b>{point.y}</b>'
        },
        credits: false,
        series: [{
            name: '',
            data: data,
            dataLabels: {
                enabled: true,
                //rotation: -90,
                color: '#FFFFFF',
                align: 'low',
                format: '{point.y}', // one decimal
                //y: 10, // 10 pixels down from the top
                style: {
                    fontSize: '13px',
                    fontFamily: 'Verdana, sans-serif'
                }
            }
        }]
    })
}

export function _genLabelGroup1Chart(data) {
    Highcharts.chart('label-group-1-chart', {
        chart: {
            type: 'bar'
        },
        title: {
            text: 'Label Group 1'
        },
        subtitle: {
            text: ''
        },
        xAxis: {
            type: 'category',
            labels: {
                //rotation: -45,
                style: {
                    fontSize: '13px',
                    fontFamily: 'Verdana, sans-serif'
                }
            }
        },
        yAxis: {
            // min: 0,
            // max: 100,
            allowDecimals: false,
            type: 'interger',
            title: {
                text: 'Total'
            }
        },
        legend: {
            enabled: false
        },
        tooltip: {
            pointFormat: 'Total: <b>{point.y}</b>'
        },
        credits: false,
        series: [{
            name: '',
            data: data,
            dataLabels: {
                enabled: true,
                //rotation: -90,
                color: '#FFFFFF',
                align: 'right',
                format: '{point.y}', // one decimal
                //y: 10, // 10 pixels down from the top
                style: {
                    fontSize: '13px',
                    fontFamily: 'Verdana, sans-serif'
                }
            }
        }]
    })
}

export function _genLabelGroup2Chart(data) {
    Highcharts.chart('label-group-2-chart', {
        chart: {
            type: 'bar'
        },
        title: {
            text: 'Label Group 2'
        },
        subtitle: {
            text: ''
        },
        xAxis: {
            type: 'category',
            labels: {
                //rotation: -45,
                style: {
                    fontSize: '13px',
                    fontFamily: 'Verdana, sans-serif'
                }
            }
        },
        yAxis: {
            // min: 0,
            // max: 100,
            allowDecimals: false,
            type: 'interger',
            title: {
                text: 'Total'
            }
        },
        legend: {
            enabled: false
        },
        tooltip: {
            pointFormat: 'Total: <b>{point.y}</b>'
        },
        credits: false,
        series: [{
            name: '',
            data: data,
            dataLabels: {
                enabled: true,
                //rotation: -90,
                color: '#FFFFFF',
                align: 'right',
                format: '{point.y}', // one decimal
                //y: 10, // 10 pixels down from the top
                style: {
                    fontSize: '13px',
                    fontFamily: 'Verdana, sans-serif'
                }
            }
        }]
    })
}

export function _genWorkingProgressChart(data) {
    Highcharts.chart('working-progress-chart', {
        chart: {
            type: 'pie',
            options3d: {
                enabled: true,
                alpha: 45,
                beta: 0
            }
        },
        title: {
            text: 'Progress'
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                depth: 35,
                // showInLegend: true,
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                    // style: {
                    //     color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                    // }
                },
                colors: ['green', 'blue', '#656161']
            }
        },
        credits: false,
        series: [{
            name: 'Brands',
            colorByPoint: true,
            data: data
        }]
    })
}
