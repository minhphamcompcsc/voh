import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import {Row, Col , Tabs, DatePicker , Button } from 'antd';
import { BarChartOutlined, LineChartOutlined , PieChartOutlined , SearchOutlined } from '@ant-design/icons';
import BarChart from './Charts/BarChart'
import LineChart from './Charts/LineChart'
import PieChart from './Charts/PieChart'
import {  } from 'antd';
import type { TabsProps } from 'antd';
import moment from 'moment';
import dayjs from 'dayjs';
import axios from 'axios';
import type { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;
const onChange = (key: string) => {
  console.log(key);
};

function StatisticsPage() {
  const userId = window.localStorage.getItem("userId")
  const newsUri = "/api/getnews/" + userId
  const [news, setNews] = useState<any[]>([])
  type RangeValue = [Dayjs | null, Dayjs | null] | null;
  const [dateRange, setDateRange] = useState<RangeValue>([dayjs().subtract(7, 'days'), dayjs()]);
  const [dateRangeString, setDateRangeString] = useState<any[]>([dayjs().subtract(7, 'days').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')]);
  useEffect(() => {
    async function fetchData() {
      const _news = await fetch(newsUri,{
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(dateRangeString)
      })
      const _news_ = await _news.json()
      setNews(_news_.reverse())
    }
    fetchData()
  }, [])
  // setNews(news.reverse())
  // console.log("news", news)

  // Get unique dates
  const uniqueDates: number[] = Array.from(new Set(news.map(p => p.created_on)));
  const uniqueStates: number[] = Array.from(new Set(news.map(p => p.state)));
  const uniqueDistricts: number[] = Array.from(new Set(news.map(p => p.district)));

  // console.log(uniqueDates);
  // console.log(uniqueDistricts);

  const news_per_date_counts = uniqueDates.map((dates : any) => (
    news.filter(item => item.created_on === dates).length
  ));
  // console.log("news_per_date_counts",news_per_date_counts)
  
  const news_per_traffic_counts_per_dates = uniqueStates.map((traffics : any) => ({
    label: traffics,
    data: uniqueDates.map((dates : any) => (
      news.filter(item => item.state === traffics)
          .filter(item => item.created_on === dates).length
    ))
  }));
  // console.log("news_per_traffic_counts_per_dates", news_per_traffic_counts_per_dates)

  const news_per_traffic_counts_per_district = uniqueStates.map((traffics : any) => ({
    label: traffics,
    data: uniqueDistricts.map((districts : any) => (
      news.filter(item => item.state === traffics)
          .filter(item => item.district === districts).length
    ))
  }));
  // console.log("news_per_traffic_counts_per_district", news_per_traffic_counts_per_district)

  const barchartData = {
    // datasets: news_per_date_counts,
    labels: uniqueDistricts,
    datasets: news_per_traffic_counts_per_district
  }

  const linechartData = {
    // datasets: news_per_date_counts,
    labels: uniqueDates,
    datasets: news_per_traffic_counts_per_dates
  }

  // console.log('chartData: ', chartData)

  const piechartData = {
    // datasets: news_per_date_counts,
    labels: uniqueDates,
    datasets: [{
      label: 'Số tin',
      data: news_per_date_counts
    }]
  }

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: <BarChartOutlined />,
      children: <div style={{width: 'auto', height: '550px', display: 'flex', justifyContent: 'center'}}>
                  <BarChart chartData={barchartData} />
                </div>,
    },
    {
      key: '2',
      label: <LineChartOutlined />,
      children: <div style={{width: 'auto', height: '550px', display: 'flex', justifyContent: 'center'}}>
                  <LineChart chartData={linechartData} />
                </div>,
    },
    {
      key: '3',
      label: <PieChartOutlined />,
      children: <div style={{width: 'auto', height: '550px', display: 'flex', justifyContent: 'center'}}>
                  <PieChart chartData={piechartData} />
                </div>,
    },
  ];

  return (
    <div>
      <div style={{display:'flex', 
            // justifyContent:'space-between', 
            justifyContent:'flex-end', 
            alignItems:'center', columnGap: 8, marginTop: 2, marginBottom:2, width:'100%', height: '40px'}}>
        <div>
          <RangePicker 
            style = {{marginLeft: 10}}
            value={dateRange}
            onChange ={async (value, formatString : any) => {
              setDateRange(value)
              setDateRangeString(formatString)
            }}
          />
          
          <Button 
            type='text' 
            shape = 'circle' 
            icon = {<SearchOutlined />} 
            style={{marginLeft: '5px'}}
            onClick={async ()=>{
              const response = await fetch(newsUri,{
                method: "POST",
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify((dateRangeString[0] == '' || dateRangeString[1] == '')? null : dateRangeString)
              })
              const _news_ = await response.json()
              setNews(_news_.reverse())
              // console.log('news: ', news)
              // if(response.ok) {
              //   alert("Filter tin theo ngày thành công")
              // } else {
              //   alert("Không thể filter tin theo ngày thành công")
              // }
            }}
          >
          </Button>
        </div>
      </div>
      <Row gutter={[10,0]} style={{width: '100%', paddingLeft: 8}}>
        <Col  span = {24} 
              // style={{display:'flex', 
              //         justifyContent:'space-between', 
              //         width: '100%', 
              //         paddingLeft: 8}}
        >
          <Tabs
            onChange={onChange}
            type="card"
            items = {items}
          />
        </Col>
      </Row>

      
      {/* <PieChart chartData={pieChart} /> */}
    </div>
  )
}

// function StatisticsPage() {
//   // const[news, setNews] = useState({
//   //   labels: News.map((data) => data.time),
//   //   datasets: [{
//   //     label: "News",
//   //     data: News.map((data) => data.cause),
//   //   }]
//   // })

//   return (
//     <div>
//       Statistic Page
//     </div>
//   )
// }

export default StatisticsPage