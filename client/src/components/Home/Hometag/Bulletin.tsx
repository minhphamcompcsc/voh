import React from 'react';
import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import { Row, Col, Button, Form, Skeleton, Card, type FormProps, Input, AutoComplete, theme, Select, DatePicker } from 'antd';
import type { SelectProps } from 'antd';
import { CloseOutlined, UndoOutlined, SearchOutlined } from '@ant-design/icons';
import { DataGrid, GridColDef, GridCellEditStopParams, GridCellEditStopReasons, GridToolbar, GridToolbarContainer, GridToolbarExport, GridRenderCellParams } from '@mui/x-data-grid';
import { styled } from '@mui/material/styles';
import { Districts } from '../../../assets/data/district';
import { Co2Sharp } from '@mui/icons-material';
import moment from 'moment';
import dayjs from 'dayjs';
import axios from 'axios';
import type { Dayjs } from 'dayjs';
import unidecode from 'unidecode';
import { io } from "socket.io-client";
import { socket_port } from '../../../assets/ports';

import socketIOClient from 'socket.io-client';

interface Bulletin {
  themeClassName: string;
}

const Bulletin: React.FC<Bulletin> = ({ themeClassName }) => {
  type FieldType = {
    personSharing?: string;
    phone_number?: string;
    address: string;
    direction?: string;
    district?: string[];
    state: string;
    speed: number;
    reason?: string;
    notice?: string;
  };
  
  const { TextArea } = Input;
  
  const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };
  const { RangePicker } = DatePicker;
  
  function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <GridToolbarExport />
      </GridToolbarContainer>
    );
  }

  let hideAddingNewsButton = false
  const role = localStorage.getItem('role')
  console.log('role: ', role)
  if (role == 'ROLE_MC' || role == 'ROLE_EDITOR') {
    hideAddingNewsButton = true
  }
  const [form] = Form.useForm();

  const userId = window.localStorage.getItem("userId")
  type RangeValue = [Dayjs | null, Dayjs | null] | null;

  const [news, setNews] = useState<any[]>([null])
  const [ctv, setCTV] = useState<any[]>([])
  const [address, setAddress] = useState<any[]>([])
  const [speeds, setSpeeds] = useState<any[]>([])
  const [reasons, setReasons] = useState<any[]>([])
  const [dateRange, setDateRange] = useState<RangeValue>([dayjs(), dayjs()]);
  const [dateRangeString, setDateRangeString] = useState<any[]>([dayjs().format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')]);

  const newsUri = "/api/getnews/" + userId
  const ctvUri = "/api/ctv/" + userId
  const adrUri = "/api/address/" + userId
  const spdUri = "/api/speed/" + userId
  const reasonsUri = "/api/reasons/" + userId

  async function fetchData() {
    const _ctv = await fetch(ctvUri, {
      method: "GET",
    })
    const _ctv_ = await _ctv.json()
    setCTV(_ctv_)

    const _address = await fetch(adrUri, {
      method: "GET",
    })
    const _address_ = await _address.json()
    setAddress(_address_)

    const _speeds = await fetch(spdUri, {
      method: "GET",
    })
    const _speeds_ = await _speeds.json()
    setSpeeds(_speeds_)

    const _reasons = await fetch(reasonsUri, {
      method: "GET",
    })
    const _reasons_ = await _reasons.json()
    setReasons(_reasons_)
  }
  async function getNews() {
    // console.log("dateRangeString", dateRangeString)
    const response = await fetch(newsUri, {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify((dateRangeString[0] == '' || dateRangeString[1] == '') ? null : dateRangeString)
    })
    const _news_ = await response.json()

    setNews(_news_)
  }
  
  const socket = io(socket_port, {
    transports: ["websocket"]
  });

  useEffect(() => {
    fetchData()
    getNews()

    socket.on("add_news", (_new_) => {
      setNews(prevNews => [
        _new_[0],
        ...prevNews
      ])
      fetchData()
    });

    socket.on("update_news", (_new_) => {
      setNews(prevNews => {
        const updatedNews = prevNews.map(obj => {
          if (obj['_id']['$oid'] == _new_[0]['_id']['$oid']) {
            return _new_[0];
          } else {
            return obj;
          }
        });

        return updatedNews;
      });
    });

    return function cleanup() {
      socket.disconnect();
    };
  }, [])

  const onFinish: FormProps<FieldType>["onFinish"] = async (data) => {
    if (data['personSharing'] == undefined || data['personSharing'] == '') {
      data['personSharing'] = 'thính giả'
    }
    if (data['phone_number'] == undefined || data['phone_number'] == '') {
      data['phone_number'] = ''
    }
    if (data['direction'] == undefined || data['direction'] == '') {
      data['direction'] = ''
    }
    if (data['district'] == undefined || data['district'][0] == undefined || data['district'][0] == '') {
      data['district'] = ['Quận khác']
    }
    if (data['reason'] == undefined || data['reason'] == '') {
      data['reason'] = 'Chưa rõ nguyên nhân'
    }
    if (data['notice'] == undefined || data['notice'] == '') {
      data['notice'] = ''
    }
    // console.log('data: ', data)
    const response = await fetch('/api/addnews/' + userId, {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    const _news_ = await response.json()
    if(response.ok){
      form.setFieldsValue({
        personSharing: undefined,
        phone_number: undefined,
        address: undefined,
        direction: undefined,
        district: undefined,
        state: undefined,
        speed: undefined,
        reason: undefined,
        note: undefined
      })
    }
    // console.log('response: ', _news_)
    // console.log('news: ', news)

    // setNews([
    //   _news_[0],
    //   ...news
    // ])
  };

  let statusChoice = ['Nháp', 'Chờ duyệt', 'Chờ đọc', 'Đã đọc', 'Không đọc', 'Lưu trữ']
  if (role == 'ROLE_MC') {
    statusChoice = ['Chờ đọc', 'Đã đọc', 'Không đọc']
  }
  else if (role == 'ROLE_DATAENTRY') {
    statusChoice = ['Nháp', 'Chờ duyệt', 'Lưu trữ']
  }
  else if (role == 'ROLE_EDITOR') {
    statusChoice = ['Chờ duyệt', 'Chờ đọc', 'Đã đọc', 'Không đọc', 'Lưu trữ']
  }
  else if (role == 'ROLE_DATAENTRY_EDITOR') {
    statusChoice = ['Nháp', 'Chờ duyệt', 'Chờ đọc', 'Đã đọc', 'Không đọc', 'Lưu trữ']
  }
  let stateChoice = ['Thông thoáng 40 km/h', 'Xe đông di chuyển ổn định 35 km/h', 'Xe đông di chuyển khó khăn 15 km/h', 'Xe đông di chuyển chậm 25 km/h', 'Ùn tắc 5 km/h']
  const columns: GridColDef<(typeof news)[number]>[] = [
    {
      field: 'ctv',
      headerName: 'Người chia sẻ',
      flex: 2.5,
      editable: (role == 'ROLE_MC')? false : true,
    },
    {
      field: 'ctv_phone',
      headerName: 'SĐT',
      flex: 2,
      editable: (role == 'ROLE_MC')? false : true,
    },
    {
      field: 'location',
      headerName: 'Địa điểm',
      flex: 6,
      editable: (role == 'ROLE_MC')? false : true,
    },
    {
      field: 'direction',
      headerName: 'Hướng đi',
      flex: 3,
      editable: (role == 'ROLE_MC')? false : true,
    },
    {
      field: 'district',
      headerName: 'Quận',
      flex: 3,
      renderCell: (params: GridRenderCellParams<any>) => {
        return  <Select
                  mode="multiple"
                  variant="borderless"
                  allowClear
                  style={{ width: '100%' }}
                  placeholder="Vd: Quận 1, Quận 3, Quận Tân Bình"
                  onChange={async (value: string[]) => {
                    if (role == 'ROLE_EDITOR' || role == 'ROLE_DATAENTRY' || role == 'ROLE_DATAENTRY_EDITOR' || role == 'ROLE_ADMIN') {
                      // console.log('params.row: ', params.row)
                      params.row.district = value
                      if(params.row.district == '') {
                        params.row.district = ['Quận khác']
                      }
                      console.log('params.row.district: ', params.row.district)
                      const response = await fetch('/api/updatenews/' + userId, {
                        method: "PATCH",
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(params.row)
                      })
                    }
                  }}
                  value={params.row.district}
                  // defaultValue={params.row.district}
                  options={Districts}
                  // disabled = {role == 'ROLE_MC'? true : false}
                >
                  <TextArea
                    autoSize={{
                      minRows: 1,
                      maxRows: 3
                    }}
                    readOnly = {true}
                  />
                </Select>
      },
    },
    {
      field: 'state',
      headerName: 'Tình trạng',
      flex: 3,
      type: 'singleSelect',
      valueOptions: stateChoice,
      editable: (role == 'ROLE_MC')? false : true,
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
      editable: (role == 'ROLE_MC')? false : true,
    },
    {
      field: 'reason',
      headerName: 'Nguyên nhân',
      flex: 3,
      editable: (role == 'ROLE_MC')? false : true,
    },
    {
      field: 'status',
      headerName: 'Trạng thái',
      type: 'singleSelect',
      valueOptions: statusChoice,
      editable: true,
      flex: 3,
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
      flex: 2,
    },
  ];

  const [formOpen, setFormOpen] = useState(false)
  const [selectedLine, setSelectedLine] = useState<any>(false)

  const antdTheme = theme.useToken()
  // console.log(dateRangeString)

  let newsToPresent = news
  // newsToPresent = newsToPresent.filter((obj : any) => statusChoice.includes(obj['status']));
  if (role != 'ROLE_ADMIN' && newsToPresent[0] != null) {
    const to_remove = ['Lưu trữ']
    newsToPresent = newsToPresent.filter((obj: any) => !to_remove.includes(obj['status']));
  }
  if (role == 'ROLE_MC' && newsToPresent[0] != null) {
    const to_remove = ['Nháp', 'Chờ duyệt']
    newsToPresent = newsToPresent.filter((obj: any) => !to_remove.includes(obj['status']));
  }
  if (role == 'ROLE_EDITOR' && newsToPresent[0] != null) {
    const to_remove = ['Nháp']
    newsToPresent = newsToPresent.filter((obj: any) => !to_remove.includes(obj['status']));
  }

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        // justifyContent:'flex-end', 
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
              setNews(_news_)
            }}
          >
          </Button>
        </div>

        {
          (hideAddingNewsButton) ? null :
            formOpen ? null :
              <Button onClick={() => { setFormOpen(!formOpen) }} type={"primary"}>
                Thêm tin
              </Button>

        }
      </div>

      <Row gutter={[10, 0]} style={{ width: '100%', paddingLeft: 8 }}>

        {newsToPresent[0] == null && newsToPresent.length == 1
          ? <Skeleton active></Skeleton>
          : <Col
            span={(formOpen) ? 16 : 24}
          >
            <Box sx={{ height: '625px', width: '100%' }}>
              <DataGrid
                sx={{
                  "& .MuiDataGrid-cell": {
                    minHeight: 50,
                    maxHeight: 100,
                    alignContent: 'center',
                    
                    whiteSpace: "normal",
                    lineHeight: "normal",
                  },
                  "& .MuiDataGrid-columnHeaderTitle": {
                    whiteSpace: "normal",
                    lineHeight: "normal",
                  },
                  "& .MuiDataGrid-columnHeader": {
                    whiteSpace: "normal",
                    lineHeight: "normal",
                    backgroundColor: '#f6f7fa'
                  },
                }}
                getRowHeight={() => 'auto'}
                editMode='row'
                getRowId={(obj) => obj['_id']['$oid']}
                rows={newsToPresent[0] != null ? newsToPresent : []}
                columns={columns}
                initialState={{
                  pagination: {
                    paginationModel: {
                      pageSize: 10,
                    },
                  },
                  columns: {
                    columnVisibilityModel: {
                      distance: false,
                      created_on: false,
                    },
                  },
                }}
                pageSizeOptions={[10]}
                checkboxSelection={false}
                disableRowSelectionOnClick
                hideFooterSelectedRowCount={true}
                processRowUpdate={async (row) => {

                  console.log('row: ', row)
                  const response = await fetch('/api/updatenews/' + userId, {
                    method: "PATCH",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(row)
                  })
                  return row
                }}
                slots={{
                  toolbar: CustomToolbar,
                }}
              />
            </Box>
          </Col>
        }
        {
          (formOpen) ?
            <Col span={8}>
              <Card title='Nhập chi tiết bản tin'
                extra={<Button type='text' shape='circle' icon={<CloseOutlined />}
                  onClick={() => {
                    setFormOpen(false); setSelectedLine(false)
                    form.setFieldsValue({
                      personSharing: undefined,
                      phone_number: undefined,
                      address: undefined,
                      direction: undefined,
                      district: undefined,
                      state: undefined,
                      speed: undefined,
                      reason: undefined,
                      note: undefined
                    })
                  }} />}
                style={{
                  borderColor: antdTheme.token.colorBorder,
                  backgroundColor: '#f6f7fa',
                }}
                bodyStyle={{ padding: 16 }}
                headStyle={{ textAlign: 'center'}}
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
                  <div style={{ display: 'flex', flexDirection: 'row', width: '100%', alignItems: 'flex-end' }}>
                    <Form.Item<FieldType>
                      label="Cộng tác viên"
                      name="personSharing"
                      // rules={[{ required: true, message: '' }]}

                      rules={[{ required: false }]}
                      style={{ width: '80%', marginRight: 10, marginBottom: 10 }}

                    >
                      {/* <Input readOnly = {readOnly} placeholder='Tên cộng tác viên'/> */}
                      <AutoComplete
                        options={ctv}
                        placeholder="Tên cộng tác viên"
                        filterOption={(inputValue, option) => {
                          const normalizedInputValue = unidecode(inputValue || '').toLowerCase();
                          const normalizedOptionLabel = unidecode(option?.label || '').toLowerCase();
                          return normalizedOptionLabel.indexOf(normalizedInputValue) !== -1;
                          // return option!.label?.toLowerCase().indexOf(inputValue?.toLowerCase()) !== -1
                        }}
                        onSelect={(value, option) => {
                          form.setFieldsValue({
                            personSharing: option.name,
                            phone_number: option.phone_number,
                          })
                        }}
                      />
                    </Form.Item>
                    <Form.Item<FieldType>
                      name="phone_number"
                      rules={[{ required: false }]}
                      style={{ width: '40%', marginBottom: 10 }}
                    >
                      <Input placeholder='Số điện thoại' />
                    </Form.Item>
                  </div>

                  <Form.Item<FieldType>
                    label='Địa điểm'
                    name="address"
                    rules={[{ required: true, message: '' }]}
                    style={{ marginBottom: 10 }}
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
                      filterOption={(inputValue, option) => {
                        // return option!.label?.toLowerCase().indexOf(inputValue?.toLowerCase()) !== -1
                        const normalizedInputValue = unidecode(inputValue || '').toLowerCase();
                        const normalizedOptionLabel = unidecode(option?.label || '').toLowerCase();
                        return normalizedOptionLabel.indexOf(normalizedInputValue) !== -1;
                      }}

                      onSelect={(value, option) => {
                        // console.log('value onSelect: ', value)
                        // console.log('option: ', option)
                        form.setFieldsValue({
                          address: option.name,
                          direction: option.direction,
                          district: option.district,
                        })
                      }}
                    >
                      <TextArea
                        autoSize={{
                          minRows: 1,
                          maxRows: 3
                        }}
                      />
                    </AutoComplete>

                  </Form.Item>

                  <div style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
                    <Form.Item<FieldType>
                      label='Hướng đi'
                      name="direction"
                      rules={[{ required: false }]}
                      style={{ width: '80%', marginRight: '10px', marginBottom: 10 }}
                    >
                      <AutoComplete
                        options={address}
                        placeholder="Hướng xe đi"
                        filterOption={(inputValue, option) => {
                          // return option!.label?.toLowerCase().indexOf(inputValue?.toLowerCase()) !== -1
                          const normalizedInputValue = unidecode(inputValue || '').toLowerCase();
                          const normalizedOptionLabel = unidecode(option?.label || '').toLowerCase();
                          return normalizedOptionLabel.indexOf(normalizedInputValue) !== -1;
                        }}
                        onSelect={(value, option) => {
                          form.setFieldsValue({
                            direction: option.name,
                          })
                        }}
                      >
                        <TextArea
                          autoSize={{
                            minRows: 1,
                            maxRows: 3
                          }}
                        />
                      </AutoComplete>
                    </Form.Item>

                    <Form.Item<FieldType>
                      label='Quận'
                      name="district"
                      rules={[{ required: false }]}
                      style={{ width: '40%', marginBottom: 10 }}
                    >
                      <Select
                        mode="multiple"
                        allowClear
                        style={{ width: '100%' }}
                        placeholder="Quận"
                        onChange={(value: string[]) => {
                          console.log(`selected ${value}`);
                        }
                        }
                        options={Districts}
                      />
                    </Form.Item>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'row', width: '100%', alignItems: 'flex-end' }}>
                    <Form.Item<FieldType>
                      label='Tình trạng giao thông'
                      name="state"
                      rules={[{ required: true, message: '' }]}
                      style={{ width: '80%', marginRight: '10px', marginBottom: 10 }}
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
                          // return option!.label?.toLowerCase().indexOf(inputValue?.toLowerCase()) !== -1
                          const normalizedInputValue = unidecode(inputValue || '').toLowerCase();
                          const normalizedOptionLabel = unidecode(option?.label || '').toLowerCase();
                          return normalizedOptionLabel.indexOf(normalizedInputValue) !== -1;
                        }}
                        options={speeds}
                        onSelect={(value, option) => {
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
                      rules={[{ required: false }]}
                      style={{ width: '40%', marginBottom: 10 }}
                    >
                      <Input readOnly={true} placeholder='Vận tốc' />
                    </Form.Item>
                  </div>

                  <Form.Item<FieldType>
                    label='Nguyên nhân'
                    name="reason"
                    rules={[{ required: false }]}
                    style={{ marginBottom: 10 }}
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
                      filterOption={(inputValue, option) => {
                        // return option!.label?.toLowerCase().indexOf(inputValue?.toLowerCase()) !== -1
                        const normalizedInputValue = unidecode(inputValue || '').toLowerCase();
                        const normalizedOptionLabel = unidecode(option?.label || '').toLowerCase();
                        return normalizedOptionLabel.indexOf(normalizedInputValue) !== -1;
                      }}
                      onSelect={(value, option) => {
                        form.setFieldsValue({
                          reason: option.label,
                        })
                      }}
                    >
                      <TextArea
                        autoSize={{
                          minRows: 1,
                          maxRows: 3
                        }}
                      />
                    </AutoComplete>
                  </Form.Item>

                  <Form.Item<FieldType>
                    label='Ghi chú'
                    name="notice"
                    rules={[{ required: false }]}
                    style={{ marginBottom: 10 }}
                  >
                    <Input.TextArea
                      autoSize={{
                        minRows: 1,
                        maxRows: 3
                      }}
                      placeholder='Ghi chú bản tin' />
                  </Form.Item>

                  <Form.Item wrapperCol={{ span: 24 }} style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
                    <Button type="primary" htmlType="submit" style={{ marginRight: 5, paddingLeft: 10, paddingRight: 10 }}>
                      Duyệt tin
                    </Button>
                    <Button type='text' shape='circle' icon={<UndoOutlined />}
                      onClick={() => {
                        setSelectedLine(false)
                        form.setFieldsValue({
                          personSharing: undefined,
                          phone_number: undefined,
                          address: undefined,
                          direction: undefined,
                          district: undefined,
                          state: undefined,
                          speed: undefined,
                          reason: undefined,
                          note: undefined
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