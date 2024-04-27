import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Row, Col, Tabs, DatePicker, Button } from 'antd';
import { BarChartOutlined, LineChartOutlined, PieChartOutlined, SearchOutlined } from '@ant-design/icons';
import BarChart from './Charts/BarChart'
import LineChart from './Charts/LineChart'
import PieChart from './Charts/PieChart'
import type { TabsProps } from 'antd';
import moment from 'moment';
import dayjs from 'dayjs';
import axios from 'axios';
import type { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;

function StatisticsPage() {
  const userId = window.localStorage.getItem("userId")
  const newsUri = "/api/getnews/" + userId
  const [news, setNews] = useState<any[]>([])
  const [dataToPresent, setDataToPresent] = useState<any>({
    labels: [],
    datasets: []
  })
  type RangeValue = [Dayjs | null, Dayjs | null] | null;
  const [dateRange, setDateRange] = useState<RangeValue>([dayjs().subtract(7, 'days'), dayjs()]);
  const [dateRangeString, setDateRangeString] = useState<any[]>([dayjs().subtract(7, 'days').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')]);


  useEffect(() => {
    async function fetchData() {
      const _news = await fetch(newsUri, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dateRangeString)
      })
      const _news_ = await _news.json()

      const to_remove = ['Nháp', 'Lưu trữ']
      const remain_news = _news_.filter((obj: any) => !to_remove.includes(obj['status']));
      setNews(remain_news.reverse())
      let statResult = statistic(remain_news, 'perDistrict')
      setDataToPresent(statResult)
    }
    fetchData()
  }, [])

  ///////////////////////////////////////////////////////////////////////////////////////////

  function statistic(news: any[], require: string) {
    const uniqueDates: number[] = Array.from(new Set(news.map(p => p.created_on)));
    const uniqueStates: number[] = Array.from(new Set(news.map(p => p.state)));
    const uniqueDistricts: number[] = Array.from(new Set(news.map(p => p.district)));

    const news_per_date_counts = uniqueDates.map((dates: any) => (
      news.filter(item => item.created_on === dates).length
    ));

    const news_per_traffic_counts_per_dates = uniqueStates.map((traffics: any) => ({
      label: traffics,
      data: uniqueDates.map((dates: any) => (
        news.filter(item => item.state === traffics)
          .filter(item => item.created_on === dates).length
      ))
    }));

    const news_per_traffic_counts_per_district = uniqueStates.map((traffics: any) => ({
      label: traffics,
      data: uniqueDistricts.map((districts: any) => (
        news.filter(item => item.state === traffics)
          .filter(item => item.district === districts).length
      ))
    }));

    const TrafficperDistrict = {
      labels: uniqueDistricts,
      datasets: news_per_traffic_counts_per_district
    }

    const TrafficperDate = {
      labels: uniqueDates,
      datasets: news_per_traffic_counts_per_dates
    }

    const TotalbyDate = {
      labels: uniqueDates,
      datasets: [{
        label: 'Số tin',
        data: news_per_date_counts
      }]
    }
    if (require == 'perDistrict') {
      return TrafficperDistrict
    } else if (require == 'perDate') {
      return TrafficperDate
    } else if (require == 'totalDate') {
      return TotalbyDate
    }
  }
  ///////////////////////////////////////////////////////////////////////////////////////////

  const subitems: TabsProps['items'] = [
    {
      key: 'bar',
      label: <div><BarChartOutlined /></div>,
      children: <div style={{ width: 'auto', height: '550px', display: 'flex', justifyContent: 'center' }}>
        <BarChart chartData={dataToPresent} />
      </div>,
    },
    {
      key: 'line',
      label: <div> <LineChartOutlined /></div>,
      children: <div style={{ width: 'auto', height: '550px', display: 'flex', justifyContent: 'center' }}>
        <LineChart chartData={dataToPresent} />
      </div>,
    },
    {
      key: 'pie',
      label: <div> <PieChartOutlined /></div>,
      children: <div style={{ width: 'auto', height: '550px', display: 'flex', justifyContent: 'center' }}>
        <PieChart chartData={dataToPresent} />
      </div>,
    },
  ];

  const items: TabsProps['items'] = [
    {
      key: 'TrafficperDistrict',
      label: <div>Theo quận</div>,
      children: <div style={{ width: 'auto', height: '550px', display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>
        <Tabs
          tabPosition='right'
          type="line"
          items={subitems}
        />
      </div>,
    },
    {
      key: 'TrafficperDate',
      label: <div>Theo ngày</div>,
      children: <div style={{ width: 'auto', height: '550px', display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>
        <Tabs
          tabPosition='right'
          type="line"
          items={subitems}
        />
      </div>,
    },
    {
      key: 'TotalbyDate',
      label: <div>Tổng theo ngày</div>,
      children: <div style={{ width: 'auto', height: '550px', display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>
        <Tabs
          tabPosition='right'
          type="line"
          items={subitems}
        />
      </div>,
    },
  ];

  return (
    <div>
      <div style={{
        display: 'flex',
        // justifyContent:'space-between', 
        justifyContent: 'flex-end',
        alignItems: 'center', columnGap: 8, marginTop: 2, marginBottom: 2, width: '100%', height: '40px'
      }}>
        <div>
          <RangePicker
            style={{ marginLeft: 10 }}
            value={dateRange}
            onChange={async (value, formatString: any) => {
              setDateRange(value)
              setDateRangeString(formatString)
            }}
          />

          <Button
            type='text'
            shape='circle'
            icon={<SearchOutlined />}
            style={{ marginLeft: '5px' }}
            onClick={async () => {
              const response = await fetch(newsUri, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify((dateRangeString[0] == '' || dateRangeString[1] == '') ? null : dateRangeString)
              })
              const _news_ = await response.json()
              setNews(_news_.reverse())
            }}
          >
          </Button>
        </div>
      </div>
      <Row gutter={[10, 0]} style={{ width: '100%', paddingLeft: 8 }}>
        <Col span={24} >
          <Tabs
            onChange={(key: string) => {
              console.log(key);
              if (key == 'TrafficperDistrict') {
                // setDataToPresent(TrafficperDistrict)
                let statResult = statistic(news, 'perDistrict')
                setDataToPresent(statResult)
              } else if (key == 'TrafficperDate') {
                // setDataToPresent(TrafficperDate)
                let statResult = statistic(news, 'perDate')
                setDataToPresent(statResult)
              } else if (key == 'TotalbyDate') {
                // setDataToPresent(TotalbyDate)
                let statResult = statistic(news, 'totalDate')
                setDataToPresent(statResult)
              }
            }}
            type="card"
            items={items}
          />
        </Col>
      </Row>
    </div>
  )
}

export default StatisticsPage