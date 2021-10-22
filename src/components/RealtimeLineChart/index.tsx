import React, {useEffect, useRef, useState} from "react";
import _ from 'lodash';
import moment from "moment";
import UplotReact from 'uplot-react';

import useComponentSize from '../../hooks/useComponentSize';
import "./styles.css"

import {getMantissaAndExponent} from "../../utils/scientificNotationHelper";
import {ParameterFormat} from "../../interfaces/ParameterFormat";

export function hashCode(str: string) { // java String#hashCode
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
}

export function intToRGB(i: number) {
    const c = (i & 0x00FFFFFF)
        .toString(16)
        .toUpperCase();

    return "00000".substring(0, 6 - c.length) + c;
}

function dataToLogScale(data: DataEntry[], lines: DataLine[]) {
    if (data) return data.map((item) => {
        const result = {...item};
        lines.forEach((line) => {
            const value: any = item[line.dataKey]
            if (value) {
                result[line.dataKey] = Math.log10(Number.parseFloat(value))
            }
        })
        return result
    })
}

function logTickFormatter(logVal) {
    const val = logVal ? Math.pow(10, logVal) : logVal;
    const components = getMantissaAndExponent(val);
    if (val && components) {
        return `${components[0]} E${components[1]}`
    } else if (val === 0) {
        return '1';
    }
    return '';
}

function scientificFormatter(val) {
    const sups = '⁰¹²³⁴⁵⁶⁷⁸⁹'.split('');
    const neg = '⁻';
    const components = getMantissaAndExponent(val);
    if (val && components) {
        let supExp = ("" + components[1]).split("").map(s => sups[+s]).join("");
        if (components[1] < 0) {
            supExp = `${neg}${supExp}`
        }
        let base: any = components[0];
        if (base === 1) base = '';
        return `${base} 10${supExp}`
    }
    return '';
}

interface DataLine {
    dataKey: string,
    color?: string,
    name?: string,
    unit?: string,
    strokeWidth?: number,
    format?: ParameterFormat
}

interface DataEntry {
    timestamp: number,

    [parameterId: string]: number,
}

interface Props {
    tickCount?: number,
    lines: DataLine[]
    scale: 'linear' | 'log'
    initValues?: DataEntry[],
    currentValues?: {
        [key: string]: number
    }
    height?: number | string,
    width?: number | string,
    timerange?: number,
    interval?: number,
    showLegend?: boolean
}

export function deepCompareEquals(a: any, b: any): boolean {
    return _.isEqual(a, b);
}

function useDeepCompareMemoize(value) {
    const ref = React.useRef()
    // it can be done by using useMemo as well
    // but useRef is rather cleaner and easier

    if (!deepCompareEquals(value, ref.current)) {
        ref.current = value
    }

    return ref.current
}

const RealtimeLineChart = (props: Props) => {
    const interval = props.interval || RealtimeLineChart.defaultProps.interval;
    const timerange = props.timerange || RealtimeLineChart.defaultProps.timerange;
    const startTime = new Date().getTime() - timerange;

    const [data, setData] = useState(props.initValues?.length ? props.initValues : Array.from(new Array(timerange / interval)).map((item, index) => ({
        timestamp: startTime + interval * index
    })))

    const wrapperRef: any = useRef<any>();
    const size = useComponentSize(wrapperRef);


    const scale = props.scale;

    useEffect(() => {
        const timer = setInterval(() => {
            setData((data) => {
                const startTime = new Date().getTime() - timerange;
                const now = new Date().getTime();

                if (data && data.length) {
                    let tmpData = _.orderBy(data, 'timestamp', 'asc');

                    // Fix gaps between initValues
                    if (props.initValues && tmpData.length === props.initValues.length) {

                        let values: any[] = [];
                        tmpData.forEach((item: any) => {
                            const valueKeys: string[] = Object.keys(item).filter((key: string) => key !== 'timestamp');

                            if (valueKeys && valueKeys.length > 0) {
                                values = [
                                    ...values,
                                    ...valueKeys.map((key: string) => ({[key]: item[key]}))
                                ];
                            }
                        });

                        tmpData.forEach((item: any, index: number) => {
                            const intervalStartTimestamp: number = _.get(tmpData[index - 1], 'timestamp', startTime);
                            const intervalStartValue: object = values[index - 1] || {};

                            const intervalStopTimestamp: number = item.timestamp;
                            const intervalStopValue: object = values[index];

                            if (intervalStopTimestamp - intervalStartTimestamp > interval) {
                                const timeBetween = (intervalStopTimestamp - intervalStartTimestamp) / interval;

                                let arrLength = Math.floor(timeBetween);
                                if (arrLength > 0 && !Number.isNaN(arrLength) && arrLength < Math.pow(2, 32)) {
                                    tmpData = [
                                        ...tmpData,
                                        ...Array.apply(null, Array(arrLength)).map(function (_item: any, arrIndex: number) {
                                            const timestamp = intervalStartTimestamp + arrIndex * interval;
                                            let valueObject = {};

                                            Object.keys(intervalStartValue).forEach((key: string) => {
                                                const startValue = intervalStartValue[key];
                                                const endValue = intervalStopValue[key];

                                                const m = (endValue - startValue) / (intervalStopTimestamp - intervalStartTimestamp);
                                                const n = startValue - m * intervalStartTimestamp;

                                                if (!valueObject[key]) {
                                                    valueObject[key] = m * timestamp + n;
                                                }
                                            });

                                            return {
                                                ...valueObject,
                                                timestamp: timestamp
                                            }
                                        })
                                    ]
                                }

                            }
                        });
                    }

                    //remove old Data
                    tmpData = tmpData.filter((item: any) => startTime <= item.timestamp && item.timestamp < now);

                    // Fix gaps if tab is changed
                    if (tmpData && _.get(_.last(tmpData), 'timestamp', 0) < now - 3 * interval) {

                        let arrLength = Math.floor((now - _.get(_.last(tmpData), 'timestamp', 0)) / interval);
                        if (arrLength > 0 && arrLength < Math.pow(2, 32) && !Number.isNaN(arrLength)) {
                            tmpData = [
                                ...tmpData,
                                ...Array.apply(null, Array(arrLength)).map(function (_item: any, index: number) {
                                    return {
                                        ..._.last(tmpData),
                                        timestamp: _.get(_.last(tmpData), 'timestamp', 0) + index * interval
                                    }
                                })
                            ]
                        }

                    }

                    return [
                        ...tmpData,
                        {
                            timestamp: new Date().getTime(),
                            ...props.lines.reduce((acc: any, cur) => {
                                acc[cur.dataKey] = _.get(props.currentValues, cur.dataKey)
                                return acc;
                            }, {})
                        }
                    ].filter((item) => {
                        return item.timestamp > startTime
                    });

                }

                // Init
                let arrLength = Math.floor(timerange / interval);
                if (arrLength > 0 && arrLength < Math.pow(2, 32) && !Number.isNaN(arrLength)) {
                    arrLength = 0
                }
                return Array.apply(null, Array(arrLength)).map(function (_item: any, index: number) {
                    return {
                        timestamp: startTime + index * interval
                    }
                })
            })

        }, props.interval);
        return () => clearInterval(timer);
    }, [props.lines, props.currentValues].map(useDeepCompareMemoize))


    const dataSeries = [[], ...props.lines.map(() => [])];
    data.forEach((entry) => {
        dataSeries[0].push(entry.timestamp / 1000)
        const startSeriesIndex = 1;
        props.lines.forEach((line, index) => {
            dataSeries[startSeriesIndex + index].push(entry[line.dataKey])
        })

    })
    const options = {
        width: props.width || size.width,
        height: props.height || size.width,
        axes: [
            {
                space: 40,
                incrs: [
                    // minute divisors (# of secs)
                    1,
                    5,
                    10,
                    15,
                    30,
                    // hour divisors
                    60,
                    60 * 5,
                    60 * 10,
                    60 * 15,
                    60 * 30,
                    // day divisors
                    3600,
                    // ...
                ],
                // [0]:   minimum num secs in found axis split (tick incr)
                // [1]:   default tick format
                // [2-7]: rollover tick formats
                // [8]:   mode: 0: replace [1] -> [2-7], 1: concat [1] + [2-7]
                values: [
                    // tick incr          default           year                             month    day                        hour     min                sec       mode
                    [3600 * 24 * 365, "{YYYY}", null, null, null, null, null, null, 1],
                    [3600 * 24 * 28, "{MMM}", "\n{YYYY}", null, null, null, null, null, 1],
                    [3600 * 24, "{MM}.{DD}", "\n{YYYY}", null, null, null, null, null, 1],
                    [3600, "{H}", "\n{MM}.{DD}.{YYYY}", null, "\n{MM}.{DD}", null, null, null, 1],
                    [60, "{H}:{mm}", "\n{MM}.{DD}.{YYYY}", null, "\n{MM}.{DD}", null, null, null, 1],
                    [1, ":{ss}", null, null, null, null, null, null, 1],
                    [0.001, ":{ss}.{fff}", "\n{MM}.{DD}.{YYYY} {H}:{mm}", null, "\n{MM}.{DD} {H}:{mm}", null, "\n{H}:{mm}", null, 1],
                ],
            },
            ...props.lines.map((line) => {
                return {
                    size: 50,
                    values: (self, ticks) => {
                        return ticks.map((rawValue, index) => {
                            if (line.format === 'scientific') {
                                const components = getMantissaAndExponent(rawValue);
                                if (components && components[0] !== 1) return;
                                return scientificFormatter(rawValue)
                            }
                            return rawValue
                        })
                    },

                    space: 20,
                    grid: {show: true},
                }
            })
        ],
        scales: {
            y: scale === 'log' ? {distr: 3} : undefined,
            x: {time: true}
        },
        series: [
            {},
            ...props.lines.map((line) => {
                return {
                    show: true,
                    label: line.name,
                    spanGaps: true,
                    stroke: line.color || `#${intToRGB(hashCode(line.dataKey))}`,
                    width: line.strokeWidth || 2
                }
            })
        ]
    }

    const lasttimestamp = _.get(_.last(data), 'timestamp');

    return <div
        data-test={"realtime-line-chart"}
        className={`realtime-line-chart ${props.showLegend ? '' : 'hide-legend'}`}>
        {
            options.width ? <UplotReact
                options={options}
                data={dataSeries as any}
            /> : null
        }
        <div ref={wrapperRef}
             data-test={"current-time"}
             className={"time-bar text-right"}>{lasttimestamp ? moment(lasttimestamp).format('HH:mm') : null}</div>
    </div>

}

RealtimeLineChart.defaultProps = {
    tickCount: 6,
    lines: [],
    initValues: [],
    currentValues: null,
    timerange: 30000,
    showLegend: false,
    interval: 20
};

export default RealtimeLineChart;
