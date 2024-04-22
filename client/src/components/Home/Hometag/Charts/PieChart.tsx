// // // import { css } from '@emotion/core'
import React from 'react'
import { useRef } from 'react';
import { ReactNode, useState, useEffect } from 'react';
import {Pie, getDatasetAtEvent } from 'react-chartjs-2'
// // import type { ChartData, ChartOptions } from 'chart.js';
import {CategoryScale} from 'chart.js'; 
import Chart from 'chart.js/auto';
Chart.register(CategoryScale);

function PieChart({chartData}:any){
    return (
        <Pie 
            style={{
                width: '50%', 
                height: '50%', 
                display: 'flex',
                justifyItems: 'center',
                justifyContent: 'center',
                alignItems: 'center',
                alignContent: 'center'
            }} 
            data={chartData}/>
    )
}


// // import React from 'react'

// // export const BarChart: React.FC<{}> = () => {
// //     return (
// //         <Bar data={chartData} options={}>
// //         </Bar>
// //     )
// // }

export default PieChart;
export {}