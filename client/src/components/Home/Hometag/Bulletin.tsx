import React from 'react';
import { useEffect, useState  } from 'react';
import Box from '@mui/material/Box';
import {Row, Col, Button, Form, Skeleton, Card, type FormProps, Input, AutoComplete, theme, Select, DatePicker } from 'antd';
import type { SelectProps } from 'antd';
import { CloseOutlined, UndoOutlined, SearchOutlined } from '@ant-design/icons';
import { DataGrid, GridColDef, GridCellEditStopParams, GridCellEditStopReasons, } from '@mui/x-data-grid';
import { Districts } from '../../../assets/data/district';
import { Co2Sharp } from '@mui/icons-material';
import moment from 'moment';
import dayjs from 'dayjs';
import axios from 'axios';
import type { Dayjs } from 'dayjs';
import { io } from "socket.io-client";
import socketIOClient from 'socket.io-client';

interface Bulletin {
  themeClassName: string;
}

type FieldType = {
  personSharing: string;
  phone_number: string;
  address: string;
  direction: string;
  district: string;
  state: string;
  speed: number;
  reason: string;
  notice: string;
};

const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (errorInfo) => {
  console.log('Failed:', errorInfo);
};
const { RangePicker } = DatePicker;
// const defaultStartDate = dayjs().subtract(7, 'days'); // Subtract 7 days to the current date
// const defaultEndDate = dayjs(); // Get current date
let readOnly = false
const role = localStorage.getItem('role')
if (role == 'ROLE_MC') {
  readOnly = true
}
console.log('current date: ', dayjs())
const Bulletin: React.FC<Bulletin> = ({ themeClassName }) => {
  const [form] = Form.useForm();

  const userId = window.localStorage.getItem("userId")
  type RangeValue = [Dayjs | null, Dayjs | null] | null;
  // News the current user can view
  const [news, setNews] = useState<any[]>([])
  const [ctv, setCTV] = useState<any[]>([])
  const [address, setAddress] = useState<any[]>([])
  const [speeds, setSpeeds] = useState<any[]>([])
  const [reasons, setReasons] = useState<any[]>([])
  const [dateRange, setDateRange] = useState<RangeValue>([dayjs().subtract(7, 'days'), dayjs()]);
  const [dateRangeString, setDateRangeString] = useState<any[]>([dayjs().subtract(7, 'days').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')]);

  // This uri is used to send request to process CRUD operation of news
  const newsUri = "/api/getnews/" + userId
  const ctvUri = "/api/ctv/" + userId
  const adrUri = "/api/address/" + userId
  const spdUri = "/api/speed/" + userId
  const reasonsUri = "/api/reasons/" + userId

  // Called when the page is rendered
  // This function fetches news that the current user can view
  // and their permission
  async function fetchData() {
    console.log("fetchData")
    const _ctv = await fetch(ctvUri,{
      method: "GET",
    })
    const _ctv_ = await _ctv.json()
    setCTV(_ctv_)

    const _news = await fetch(newsUri,{
      method: "POST",
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify((dateRangeString[0] == '' || dateRangeString[1] == '')? null : dateRangeString)
    })
    const _news_ = await _news.json()
    setNews(_news_)

    const _address = await fetch(adrUri,{
      method: "GET",
    })
    const _address_ = await _address.json()
    setAddress(_address_)

    const _speeds = await fetch(spdUri,{
      method: "GET",
    })
    const _speeds_ = await _speeds.json()
    setSpeeds(_speeds_)

    const _reasons = await fetch(reasonsUri,{
      method: "GET",
    })
    const _reasons_ = await _reasons.json()
    setReasons(_reasons_)
  }
  async function getNews() {
    console.log("dateRangeString", dateRangeString)
    const response = await fetch(newsUri,{
      method: "POST",
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify((dateRangeString[0] == '' || dateRangeString[1] == '')? null : dateRangeString)
    })
    const _news_ = await response.json()
    setNews(_news_)
    console.log('news: ', news)
  }
  useEffect(() => {
    fetchData()
    const socket = io("http://127.0.0.1:5000", {
      transports: ["websocket"]
    });

    socket.on("add_news", (_new_) => {
      setNews(prevNews => [
        _new_[0],
        ...prevNews
      ])
    });

    // socket.on("update_news", (_new_) => {
    //   console.log('news updated: ', _new_)
    // });

    return function cleanup() {
      socket.disconnect();
    };
  }, [])

  // console.log("dateRangeString", dateRangeString)
  const onFinish: FormProps<FieldType>["onFinish"] = async (data) => {
    const response = await fetch('/api/addnews/' + userId,{
      method: "POST",
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data)
    })
    const _news_ = await response.json()
    console.log('response: ', _news_)
    console.log('news: ', news)

    setNews([
      _news_[0],
      ...news
    ])
  };

  const columns: GridColDef<(typeof news)[number]>[] = [
    {
      field: 'ctv',
      headerName: 'Người chia sẻ',
      flex: 2,
    },
    // {
    //   field: 'ctv_phone',
    //   headerName: 'Số điện thoại',
    //   flex: 2,
    // },
    {
      field: 'location',
      headerName: 'Địa điểm',
      flex: 8,
    },
    // {
    //   field: 'direction',
    //   headerName: 'Hướng đi',
    //   flex: 4,
    // },
    // {
    //   field: 'district',
    //   headerName: 'Quận',
    //   flex: 2,
    // },
    {
      field: 'state',
      headerName: 'Tình trạng',
      flex: 3,
    },
    // {
    //   field: 'speed',
    //   headerName: 'km/h',
    //   flex: 1,
    // },
    {
      field: 'distance',
      headerName: 'Tầm nhìn',
      flex: 1,
    },
    {
      field: 'reason',
      headerName: 'Nguyên nhân',
      flex: 2,
    },
    {
      field: 'status',
      headerName: 'Trạng thái',
      type: 'singleSelect',
      valueOptions: ['Nháp', 'Chờ đọc', 'Đã đọc', 'Không đọc', 'Lưu trữ'],
      editable: true,
      flex: 1.5,
    },
    {
      field: 'notice',
      headerName: 'Ghi chú',
      editable: true,
      flex: 2,
    },
    {
      field: 'created_on',
      headerName: 'Thời gian',
      flex: 1.75,
    },
  ];
  
  const [formOpen, setFormOpen] = useState(false)
  const [selectedLine, setSelectedLine] = useState<any>(false)

  const antdTheme = theme.useToken()
  // console.log(dateRangeString)
  return (
    <div>
      <div style={{display:'flex', 
            justifyContent:'space-between', 
            // justifyContent:'flex-end', 
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
              setNews(_news_)
              console.log('news: ', news)
              // if(response.ok) {
              //   alert("Filter tin theo ngày thành công")
              // } else {
              //   alert("Không thể filter tin theo ngày thành công")
              // }
            }}
          >
          </Button>
        </div>

        {
          (readOnly)? null : 
            formOpen? null :
            <Button onClick={() => {setFormOpen(!formOpen)}} danger = {formOpen? true : false} type = {"primary"}>
              Thêm tin
            </Button>
          
        }
      </div>

      <Row gutter={[10,0]} style={{width: '100%', paddingLeft: 8}}>

        {news.length > 0?
        <Col 
          span={(formOpen)? 16 : 24}
        >
          <Box sx={{ height: '100%', width: '100%' }}>
            <DataGrid
              editMode='row'
              getRowId={(obj)=>obj['_id']['$oid']}
              rows={news}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: {
                    pageSize: 10,
                  },
                },
                columns: {
                  columnVisibilityModel: {
                    notice: readOnly,
                    direction: false,
                    distance: false,
                  },
                },
              }}
              pageSizeOptions={[10]}
              checkboxSelection = {false}
              disableRowSelectionOnClick
              hideFooterSelectedRowCount = {true}
              processRowUpdate={async(row) =>{
                // console.log('row: ', row)
                const response = await fetch('/api/updatenews/' + userId,{
                  method: "PATCH",
                  headers: {'Content-Type': 'application/json'},
                  body: JSON.stringify(row)
                })
                // if(response.ok) {
                //   alert("Tin đã được chỉnh sửa!!!")
                // } else {
                //   alert("Không thể chỉnh sửa tin!!!")
                // }
                return row
              }}
            />
          </Box>
        </Col> : <Skeleton active></Skeleton>
        }
        {
          (formOpen)? 
          <Col span={8}>
            <Card title = 'Nhập chi tiết bản tin'
              extra = { <Button  type='text' shape = 'circle' icon = {<CloseOutlined/>} 
                                onClick={()=>{setFormOpen(false); setSelectedLine(false)
                                              form.setFieldsValue({
                                                personSharing: '',
                                                phone_number: '',
                                                address: '',
                                                direction: '',
                                                district: '',
                                                state: '',
                                                speed: '',
                                                reason: '',
                                                note: ''
                                              })}}/>}
              style={{
                borderColor: antdTheme.token.colorBorder,
                backgroundColor: '#f6f7fa',
              }}
              bodyStyle={{padding:16}}
              headStyle={{textAlign: 'center'}}
            >
              <Form form={form}
                name="inputNews"
                layout="vertical"
                wrapperCol={{ span: 24 }}
                style={{ maxWidth: '100%', margin: 0 }}
                initialValues={{ remember: true }}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="on"
              >
                <div style={{display: 'flex', flexDirection: 'row', width: '100%', alignItems: 'flex-end'}}>
                  <Form.Item<FieldType>
                    label = "Cộng tác viên"
                    name="personSharing"
                    rules={[{ required: true, message: '' }]}
                    style={{width: '80%', marginRight: 10, marginBottom: 10}}
                    
                  >
                    {/* <Input readOnly = {readOnly} placeholder='Tên cộng tác viên'/> */}
                    <AutoComplete
                      options={ctv}
                      placeholder="Tên cộng tác viên"
                      filterOption= {(inputValue, option) => {
                        return option!.label?.toLowerCase().indexOf(inputValue?.toLowerCase()) !== -1
                      }}
                      onSelect={(value, option) =>{
                        form.setFieldsValue({
                          personSharing: option.name,
                          phone_number: option.phone_number,
                        })
                      }}
                    />
                  </Form.Item>
                  <Form.Item<FieldType>
                    name="phone_number"
                    rules={[{ required: false}]}
                    style={{width: '40%', marginBottom: 10}}
                  >
                    <Input readOnly = {readOnly} placeholder='Số điện thoại'/>
                  </Form.Item>
                </div>

                <Form.Item<FieldType>
                    label = 'Địa điểm'
                    name="address"
                    rules={[{ required: true, message: '' }]}
                    style={{marginBottom: 10}}
                  >
                    {/* <Input.TextArea 
                      autoSize = {{
                        minRows: 1,
                        maxRows: 3
                      }}
                      readOnly = {readOnly}
                      placeholder='Địa điểm giao thông'/>  */}
                    <AutoComplete
                      options={address}
                      placeholder="Địa điểm giao thông"
                      filterOption= {(inputValue, option) => {
                        return option!.label?.toLowerCase().indexOf(inputValue?.toLowerCase()) !== -1
                      }}
                      onSelect={(value, option) =>{
                        // console.log('value onSelect: ', value)
                        // console.log('option: ', option)
                        form.setFieldsValue({
                          address: option.name,
                          direction: option.direction,
                          district: option.district,
                        })
                      }}
                    />
                </Form.Item>

                <div style={{display: 'flex', flexDirection: 'row', width: '100%'}}>
                  <Form.Item<FieldType>
                      label = 'Hướng đi'
                      name="direction"
                      rules={[{ required: false}]}
                      style={{width: '80%', marginRight: '10px', marginBottom: 10}}
                    >
                      {/* <Input.TextArea 
                        autoSize = {{
                          minRows: 1,
                          maxRows: 3
                        }}
                        readOnly = {readOnly}
                        placeholder='Hướng xe đi'/> */}
                    <AutoComplete
                      options={address}
                      placeholder="Hướng xe đi"
                      filterOption= {(inputValue, option) => {
                        return option!.label?.toLowerCase().indexOf(inputValue?.toLowerCase()) !== -1
                      }}
                      onSelect={(value, option) =>{
                        form.setFieldsValue({
                          direction: option.name,
                        })
                      }}
                    />
                  </Form.Item>

                  <Form.Item<FieldType>
                    label = 'Quận'
                    name="district"
                    rules={[{ required: false}]}
                    style={{width: '40%', marginBottom: 10}}
                  >
                    {/* <Input placeholder='Quận'/> */}
                    {/* <AutoComplete
                      options={Districts}
                      placeholder="Quận"
                      filterOption={(inputValue, option) =>{
                        console.log('inputValue', inputValue)
                        console.log('option', option)
                        return option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                      }}
                      disabled = {readOnly}
                    /> */}
                    <Select
                      showSearch
                      placeholder="Quận"
                      // onChange={onChange}
                      // onSearch={onSearch}
                      filterOption={(inputValue, option) => {
                        return option!.value?.toLowerCase().indexOf(inputValue?.toLowerCase()) !== -1
                      }}
                      options={Districts}
                    />
                  </Form.Item>
                </div>

                <div style={{display: 'flex', flexDirection: 'row', width: '100%', alignItems: 'flex-end'}}>
                  <Form.Item<FieldType>
                    label = 'Tình trạng giao thông'
                    name="state"
                    rules={[{ required: true, message: ''}]}
                    style={{width: '80%', marginRight: '10px', marginBottom: 10}}
                  >
                    {/* <Input readOnly = {readOnly} placeholder='Tình trạng giao thông'/> */}
                    {/* <AutoComplete
                      options={address}
                      placeholder="Hướng xe đi"
                      filterOption= {(inputValue, option) => {
                        return option!.label?.toLowerCase().indexOf(inputValue?.toLowerCase()) !== -1
                      }}
                      onSelect={(value, option) =>{
                        form.setFieldsValue({
                          direction: option.name,
                        })
                      }}
                    /> */}
                    <Select
                      showSearch
                      placeholder="Tình trạng giao thông"
                      // onChange={onChange}
                      // onSearch={onSearch}
                      filterOption={(inputValue, option) => {
                        return option!.label?.toLowerCase().indexOf(inputValue?.toLowerCase()) !== -1
                      }}
                      options={speeds}
                      onSelect={(value, option) =>{
                        // console.log('value: ', value)
                        form.setFieldsValue({
                          state: option.name,
                          speed: option.value,
                        })
                      }}
                    />
                  </Form.Item>

                  <Form.Item<FieldType>
                    label="Vận tốc"
                    name="speed"
                    rules={[{ required: false}]}
                    style={{width: '40%', marginBottom: 10}}
                  >
                    <Input readOnly = {true} placeholder='Vận tốc'/>
                  </Form.Item>
                </div>

                <Form.Item<FieldType>
                  label = 'Nguyên nhân'
                  name="reason"
                  rules={[{ required: false}]}
                  style={{marginBottom: 10}}
                >
                  {/* <Input.TextArea 
                    autoSize = {{
                      minRows: 1,
                      maxRows: 3
                    }}
                    readOnly = {readOnly} 
                    placeholder='Nguyên nhân sự việc'/> */}
                    <AutoComplete
                      options={reasons}
                      placeholder="Nguyên nhân sự việc"
                      filterOption= {(inputValue, option) => {
                        return option!.label?.toLowerCase().indexOf(inputValue?.toLowerCase()) !== -1
                      }}
                      onSelect={(value, option) =>{
                        form.setFieldsValue({
                          reason: option.label,
                        })
                      }}
                    />
                </Form.Item>

                <Form.Item<FieldType>
                  label = 'Ghi chú'
                  name="notice"
                  rules={[{ required: false}]}
                  style={{marginBottom: 10}}
                >
                  <Input.TextArea 
                    autoSize = {{
                      minRows: 1,
                      maxRows: 3
                    }}
                    placeholder='Ghi chú bản tin'/>
                </Form.Item>

                <Form.Item wrapperCol={{ span: 24 }} style = {{display: 'flex', justifyContent: 'center', marginBottom: 10}}>
                  <Button type="primary" htmlType="submit" style={{marginRight: 5, paddingLeft: 10, paddingRight: 10}}>
                    Duyệt tin
                  </Button>
                  <Button type='text' shape = 'circle' icon = {<UndoOutlined />} 
                              onClick={()=>{
                                setSelectedLine(false)
                                form.setFieldsValue({
                                  personSharing: '',
                                  phone_number: '',
                                  address: '',
                                  direction: '',
                                  district: '',
                                  state: '',
                                  speed: '',
                                  reason: '',
                                  note: ''
                                })
                              }}
                      >
                  </Button>
                </Form.Item>
              </Form>

            </Card>
          </Col> : null
        }
      </Row>
    </div>
  )
};

export default Bulletin;