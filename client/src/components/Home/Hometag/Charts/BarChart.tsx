// // // import { css } from '@emotion/core'
import React from 'react'
import { useRef } from 'react';
import { ReactNode, useState, useEffect } from 'react';
import {Bar, getDatasetAtEvent } from 'react-chartjs-2'
// // import type { ChartData, ChartOptions } from 'chart.js';
import {CategoryScale} from 'chart.js'; 
import Chart from 'chart.js/auto';
Chart.register(CategoryScale);

function BarChart({chartData}:any){
    return (
        <Bar style={{height: '200px', width: '100%'}} data={chartData}/>
    )
}

export default BarChart;
export {}