import React from 'react';
import {useState, useEffect} from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import Box from '@mui/material/Box';
import { DataGrid, GridColDef , GridRowSelectionModel, GridToolbarContainer, GridToolbarExport } from '@mui/x-data-grid';
import { Button, Modal, Form, Checkbox, Input , Select, type SelectProps, Row, Col , Tabs, type FormProps, AutoComplete} from 'antd';
import {UserAddOutlined, UserDeleteOutlined, UndoOutlined, ExclamationOutlined , GoldOutlined , AppstoreAddOutlined} from '@ant-design/icons'
import { Roles } from '../../../assets/data/role';
import type { TabsProps } from 'antd';
import { Districts } from '../../../assets/data/district';
import unidecode from 'unidecode';

interface Account {
  themeClassName: string;
}

const { TextArea } = Input;

function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarExport />
    </GridToolbarContainer>
  );
}

type AccountFormFieldType = {
  name: string;
  username: string;
  phone_number: string;
  role: string;
};

type CTVFormFieldType = {
  name: string;
  phone_number: string;
};

type AddressFormFieldType = {
  name: string;
  direction?: string;
  district?: string[],
};

type ReasonFormFieldType = {
  name: string;
};

const Account: React.FC<Account> = ({ themeClassName }) => {
  const userId = window.localStorage.getItem("userId")
  const [formAccount] = Form.useForm();
  const [formCTV] = Form.useForm();
  const [formAddress] = Form.useForm();
  const [formReason] = Form.useForm();

  const [accounts, setAccounts] = useState<any[]>([])
  const [isAccountFormOpen, setIsAccountFormOpen] = useState(false);
  const [isCTVFormOpen, setIsCTVFormOpen] = useState(false);
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [isReasonFormOpen, setIsReasonFormOpen] = useState(false);
  const [rowSelectionModel, setRowSelectionModel] = React.useState<GridRowSelectionModel>([]);

  const [dataToPresent, setDataToPresent] = useState<any[]>([])
  const [typeDataToPresent, setTypeDataToPresent] = useState<any>('accounts')

  const [ctv, setCTV] = useState<any[]>([])
  const [address, setAddress] = useState<any[]>([])
  const [reasons, setReasons] = useState<any[]>([])

  // This uri is used to send request to process CRUD operation of news
  const accountUri = "/api/admin/accounts/" + userId
  const ctvUri = "/api/ctv/" + userId
  const adrUri = "/api/address/" + userId
  const reasonsUri = "/api/reasons/" + userId

  useEffect(() => {
    async function getData() {
      const _ctv = await fetch(ctvUri,{
        method: "GET",
      })
      const _ctv_ = await _ctv.json()
      setCTV(_ctv_)

      const _address = await fetch(adrUri,{
        method: "GET",
      })
      const _address_ = await _address.json()
      setAddress(_address_)
  
      const _reasons = await fetch(reasonsUri,{
        method: "GET",
      })
      const _reasons_ = await _reasons.json()
      setReasons(_reasons_)

      const _accounts = await fetch(accountUri,{
        method: "GET",
      })
      const _accounts_ = await _accounts.json()
  
      setAccounts(_accounts_)
      setDataToPresent(_accounts_)
    }
    getData()
  }, [])

  // console.log("account:", accounts)
  const addAccount: FormProps<AccountFormFieldType>["onFinish"] = async (data) => {
    if (accounts.some(obj => obj.username === data['username'])){
      alert("Username đã tồn tại, không thể thêm tài khoản người dùng")
    }
    else{
      const response = await fetch('/api/addaccount/' + userId,{
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
      })
      if(response.ok) {
        alert("Thêm tài khoản người dùng thành công")
      }
      const _account_ = await response.json()
      setAccounts([
        _account_[0],
        ...accounts
      ])
      if (typeDataToPresent == 'accounts') setDataToPresent([_account_[0], ...accounts])
      setIsAccountFormOpen(false)
    }
  };
  
  const addCTV: FormProps<CTVFormFieldType>["onFinish"] = async (data) => {
    if (ctv.some((obj) => { return obj.name == data['name'] && obj.phone_number == data['phone_number']})){
      alert("Cộng tác viên đã tồn tại")
    }
    else{
      const response = await fetch('/api/addctv/' + userId,{
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
      })
      if(response.ok) {
        alert("Thêm cộng tác viên thành công")
      }
      const _ctv_ = await response.json()
      console.log('ctvObj: ', _ctv_)
      setCTV([
        ...ctv,
        _ctv_[0]
      ])
      if (typeDataToPresent == 'ctv') setDataToPresent([...ctv, _ctv_[0]])
      setIsCTVFormOpen(false)
    }
  };

  const addAddress: FormProps<AddressFormFieldType>["onFinish"] = async (data) => {
    if (ctv.some((obj) => { return obj.name == data['name'] && obj.direction == data['direction'] && obj.district == data['district']})){
      alert("Địa điểm đã có trong dữ liệu")
    }
    else{
      if (data['direction'] == undefined) {
        data['direction'] = ''
      }
      if (data['district'] == undefined) {
        data['district'] = ['Quận khác']
      }
      const response = await fetch('/api/addaddress/' + userId,{
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
      })
      if(response.ok) {
        alert("Thêm địa điểm giao thông thành công")
      }
      const _address_ = await response.json()
      console.log('addressObj: ', _address_)
      setAddress([
        ...address,
        _address_[0]
      ])
      if (typeDataToPresent == 'address') setDataToPresent([...address, _address_[0]])
      setIsAddressFormOpen(false)
    }
  };

  const addReason: FormProps<ReasonFormFieldType>["onFinish"] = async (data) => {
    if (reasons.some(obj => obj.label === data['name'])){
      alert("Lý do đã có trong dữ liệu")
    }
    else{
      const response = await fetch('/api/addreason/' + userId,{
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
      })
      if(response.ok) {
        alert("Thêm nguyên nhân thành công")
      }
      const _reason_ = await response.json()
      console.log('reasonObj: ', _reason_)
      setReasons([
        ...reasons,
        _reason_[0]
      ])
      if (typeDataToPresent == 'reasons') setDataToPresent([...reasons, _reason_[0]])
      setIsReasonFormOpen(false)
    }
  };
  const handleCancel = () => {
    setIsAccountFormOpen(false);
    setIsCTVFormOpen(false)
    setIsAddressFormOpen(false)
    setIsReasonFormOpen(false)
  };

  const columnsAccounts: GridColDef<(typeof accounts)[number]>[] = [
    {
      field: 'name',
      headerName: 'Tên',
      flex: 2,
    },
    {
      field: 'phone_number',
      headerName: 'Số điện thoại',
      flex: 2,
    },
    {
      field: 'username',
      headerName: 'Username',
      flex: 2,
    },
    {
      field: 'role',
      headerName: 'Vai trò',
      flex: 2,
    },
    {
      field: 'created_on',
      headerName: 'Tạo ngày',
      flex: 2,
    },
  ];

  const columnsCTV: GridColDef<(typeof ctv)[number]>[] = [
    {
      field: 'name',
      headerName: 'Tên',
      flex: 2,
    },
    {
      field: 'phone_number',
      headerName: 'Số điện thoại',
      flex: 2,
    },
    {
      field: 'created_on',
      headerName: 'Tạo ngày',
      flex: 2,
    },
  ];

  const columnsAddress: GridColDef<(typeof ctv)[number]>[] = [
    {
      field: 'name',
      headerName: 'Địa điểm',
      flex: 6,
    },
    {
      field: 'direction',
      headerName: 'Hướng đi',
      flex: 3,
    },
    {
      field: 'districtString',
      headerName: 'Quận',
      flex: 2,
    },
    {
      field: 'created_on',
      headerName: 'Tạo ngày',
      flex: 2,
    },
  ];

  const columnsReason: GridColDef<(typeof ctv)[number]>[] = [
    {
      field: 'label',
      headerName: 'Nguyên nhân',
      flex: 8,
    },
    {
      field: 'created_on',
      headerName: 'Tạo ngày',
      flex: 2,
    },
  ];

  const items: TabsProps['items'] = [
    {
      key: 'accounts',
      label: 'Tài khoản',
      children: <></>,
    },
    {
      key: 'ctv',
      label: 'Cộng tác viên',
      children: <></>,
    },
    {
      key: 'address',
      label: 'Địa điểm',
      children: <></>,
    },
    {
      key: 'reasons',
      label: 'Nguyên nhân',
      children: <></>,
    },
  ];

  let _dateToPresent = dataToPresent
  const [columnToPresent, setColumnToPresent] = useState<any[]>(columnsAccounts)
  let columns = columnToPresent

  return (
    <div>
      {
        typeDataToPresent == 'accounts'?
        <div style={{display:'flex', justifyContent:'flex-end', alignItems:'center', columnGap: 8, marginTop: 2, marginBottom:2, width:'99%'}}>
          <Button icon = {<UserAddOutlined />} 
                  size = {'large'} 
                  onClick={() => {
                    setIsAccountFormOpen(true);
                  }} 
                  type ={"primary"} 
          >
            Thêm tài khoản
          </Button>
          <Button icon = {<ExclamationOutlined />} 
                  size = {'large'}
                  onClick={async ()=> {
                    if (rowSelectionModel.length != 0) {
                      const response = await fetch('/api/resetpassword/' + userId,{
                        method: "POST",
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify(rowSelectionModel)
                      })
                      if (response.ok){
                        alert("Reset mật khẩu thành công")
                        setRowSelectionModel([])
                      }
                      else {
                        alert("Không thể reset mật khẩu")
                      }
                    }
                  }}
          >
            Reset mật khẩu
          </Button>
          <Button icon = {<UserDeleteOutlined />}
                  type = 'primary'
                  danger = {true}
                  size = {'large'}
                  onClick={async ()=> {
                    if (rowSelectionModel.length != 0) {
                      const response = await fetch('/api/deleteaccount/' + userId,{
                        method: "POST",
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify(rowSelectionModel)
                      })
                      if (response.ok){
                        alert("Xóa tài khoản thành công")
                        const remainaccounts = accounts.filter((obj) => !rowSelectionModel.includes(obj['_id']['$oid']));
                        setAccounts(remainaccounts);
                        setRowSelectionModel([])
                      }
                      else {
                        alert("Không thể xóa tài khoản")
                      }
                    }
                  }}
          >
            Xóa tài khoản
          </Button>
        </div> : 
        typeDataToPresent == 'ctv'?
        <div style={{display:'flex', justifyContent:'flex-end', alignItems:'center', columnGap: 8, marginTop: 2, marginBottom:2, width:'99%'}}>
          <Button icon = {<UserAddOutlined />} 
                  size = {'large'} 
                  onClick={() => {
                    setIsCTVFormOpen(true);
                  }} 
                  type ={"primary"} 
          >
            Thêm cộng tác viên
          </Button>
        </div> : 
        typeDataToPresent == 'reasons'?
        <div style={{display:'flex', justifyContent:'flex-end', alignItems:'center', columnGap: 8, marginTop: 2, marginBottom:2, width:'99%'}}>
          <Button icon = {<AppstoreAddOutlined />} 
                  size = {'large'} 
                  onClick={() => {
                    setIsReasonFormOpen(true);
                  }} 
                  type ={"primary"} 
          >
            Thêm nguyên nhân
          </Button>
        </div> : 
        typeDataToPresent == 'address'?
        <div style={{display:'flex', justifyContent:'flex-end', alignItems:'center', columnGap: 8, marginTop: 2, marginBottom:2, width:'99%'}}>
          <Button icon = {<AppstoreAddOutlined />} 
                  size = {'large'} 
                  onClick={() => {
                    setIsAddressFormOpen(true);
                  }} 
                  type ={"primary"} 
          >
            Thêm địa điểm
          </Button>
        </div> : null
      }
      <Modal  title="Thêm tài khoản" open={isAccountFormOpen} onCancel={handleCancel} footer = {() => (<></>)}
      >
        <Form form={formAccount}
          name="basic"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          style={{ maxWidth: 600 }}
          onFinish={addAccount}
          autoComplete="off"
        >
          <Form.Item<AccountFormFieldType>
            label="Tên người dùng"
            name="name"
            rules={[{ required: true, message: '' }]}
          >
            <Input placeholder="Nguyễn Văn A"/>
          </Form.Item>

          <Form.Item<AccountFormFieldType>
            label="Tên đăng nhập"
            name="username"
            rules={[{ required: true, message: '' }]}
          >
            <Input placeholder="username"/>
          </Form.Item>

          <Form.Item<AccountFormFieldType>
            label="Số điện thoại"
            name="phone_number"
            rules={[{ required: true, message: '' }]}
          >
            <Input placeholder="0123456789"/>
          </Form.Item>
          <Form.Item<AccountFormFieldType>
            label="Vai trò"
            name="role"
            rules={[{ required: true, message: '' }]}
          >
            <Select
              showSearch
              placeholder="VD: MC"
              // onChange={onChange}
              // onSearch={onSearch}
              filterOption={(inputValue, option) => {
                return option!.value?.toLowerCase().indexOf(inputValue?.toLowerCase()) !== -1
              }}
              options={Roles}
            />
          </Form.Item>

          <Form.Item wrapperCol={{ span: 24 }} style = {{display: 'flex', justifyContent: 'center', marginBottom: 10}}>
            <Button type="primary" htmlType="submit" style={{marginRight: 5, paddingLeft: 10, paddingRight: 10}}>
              Thêm tài khoản
            </Button>
            <Button type='text' shape = 'circle' icon = {<UndoOutlined />} 
                        onClick={()=>{
                          formAccount.setFieldsValue({
                            name: undefined,
                            username: undefined,
                            phone_number: undefined,
                            role: undefined,
                          })
                        }}
                >
            </Button>
          </Form.Item>

        </Form>
      </Modal>
      <Modal  title="Thêm cộng tác viên" open={isCTVFormOpen} onCancel={handleCancel} footer = {() => (<></>)}
      >
        <Form form={formCTV}
          name="basic"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          style={{ maxWidth: 600 }}
          onFinish={addCTV}
          autoComplete="off"
        >
          <Form.Item<CTVFormFieldType>
            label="Tên cộng tác viên"
            name="name"
            rules={[{ required: true, message: '' }]}
          >
            <Input placeholder="Nguyễn Văn A"/>
          </Form.Item>

          <Form.Item<CTVFormFieldType>
            label="Số điện thoại"
            name="phone_number"
            rules={[{ required: true, message: '' }]}
          >
            <Input placeholder="0123456789"/>
          </Form.Item>

          <Form.Item wrapperCol={{ span: 24 }} style = {{display: 'flex', justifyContent: 'center', marginBottom: 10}}>
            <Button type="primary" htmlType="submit" style={{marginRight: 5, paddingLeft: 10, paddingRight: 10}}>
              Thêm CTV
            </Button>
            <Button type='text' shape = 'circle' icon = {<UndoOutlined />} 
                        onClick={()=>{
                          formCTV.setFieldsValue({
                            name: undefined,
                            phone_number: undefined,
                          })
                        }}
                >
            </Button>
          </Form.Item>

        </Form>
      </Modal>
      <Modal  title="Thêm địa điểm" 
              open={isAddressFormOpen} 
              onCancel={handleCancel}
              footer = {() => (
                <>
                </>
              )}
      >
        <Form form={formAddress}
          name="basic"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 20 }}
          style={{ maxWidth: 600 }}
          onFinish={addAddress}
          autoComplete="off"
        >
          <Form.Item<AddressFormFieldType>
            label="Địa điểm "
            name="name"
            rules={[{ required: true, message: '' }]}
          >
            <TextArea
              autoSize={{
                minRows: 1,
                maxRows: 3
              }}
              placeholder="Vd: Ngã sáu Cộng Hòa"
            />
          </Form.Item>

          <Form.Item<AddressFormFieldType>
            label="Hướng đi"
            name="direction"
            rules={[{ required: false}]}
          >
            <TextArea
              autoSize={{
                minRows: 1,
                maxRows: 3
              }}
              placeholder="Vd: Ngã tư Bảy Hiền"
            />
          </Form.Item>

          <Form.Item<AddressFormFieldType>
            label="Quận"
            name="district"
            rules={[{ required: false}]}
          >
            <Select
              mode="multiple"
              allowClear
              style={{ width: '100%' }}
              placeholder="Vd: Quận 1, Quận 3, Quận Tân Bình"
              onChange={(value: string[]) => {
                console.log(`selected ${value}`);
              }
              }
              options={Districts}
            />
          </Form.Item>

          <Form.Item wrapperCol={{ span: 24 }} style = {{display: 'flex', justifyContent: 'center', marginBottom: 10}}>
            <Button type="primary" htmlType="submit" style={{marginRight: 5, paddingLeft: 10, paddingRight: 10}}>
              Thêm địa điểm
            </Button>
            <Button type='text' shape = 'circle' icon = {<UndoOutlined />} 
                        onClick={()=>{
                          formAddress.setFieldsValue({
                            name: undefined,
                            direction: undefined,
                            district: undefined,
                          })
                        }}
                >
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal  title="Thêm nguyên nhân" open={isReasonFormOpen} onCancel={handleCancel} footer = {() => (<></>)}
      >
        <Form form={formReason}
          name="basic"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          style={{ maxWidth: 600 }}
          onFinish={addReason}
          autoComplete="off"
        >
          <Form.Item<ReasonFormFieldType>
            label="Nguyên nhân"
            name="name"
            rules={[{ required: true, message: '' }]}
          >
            <TextArea
              autoSize={{
                minRows: 1,
                maxRows: 3
              }}
              placeholder="Vd: Đường đang thi công"
            />
          </Form.Item>

          <Form.Item wrapperCol={{ span: 24 }} style = {{display: 'flex', justifyContent: 'center', marginBottom: 10}}>
            <Button type="primary" htmlType="submit" style={{marginRight: 5, paddingLeft: 10, paddingRight: 10}}>
              Thêm nguyên nhân
            </Button>
            <Button type='text' shape = 'circle' icon = {<UndoOutlined />} 
                        onClick={()=>{
                          formReason.setFieldsValue({
                            name: undefined,
                          })
                        }}
                >
            </Button>
          </Form.Item>

        </Form>
      </Modal>
      <Row gutter={[10, 0]} style={{ width: '100%', paddingLeft: 15 }}>
        <Box sx={{ height: '575px', width: '100%' }}>
          <Tabs
            onChange={(key: string) => {
              console.log(key);
              setTypeDataToPresent(key)
              if (key == 'accounts') {
                setDataToPresent(accounts)
                setColumnToPresent(columnsAccounts)
              } else if (key == 'ctv') {
                setDataToPresent(ctv)
                setColumnToPresent(columnsCTV)
              } else if (key == 'reasons') {
                setDataToPresent(reasons)
                setColumnToPresent(columnsReason)
              } else if (key == 'address') {
                setDataToPresent(address)
                setColumnToPresent(columnsAddress)
              }
            }}
            type="card"
            items={items}
          />
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
                backgroundColor: '#F0EBE3'
              },
            }}
            // getRowHeight={() => 'auto'}
            getRowId={(obj)=>obj['_id']['$oid']}
            rows={_dateToPresent}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 10,
                },
              },
            }}
            pageSizeOptions={[10]}
            checkboxSelection = {typeDataToPresent == 'accounts'? true : false}
            disableRowSelectionOnClick
            onRowSelectionModelChange={(newRowSelectionModel) => {
              setRowSelectionModel(newRowSelectionModel);
            }}
            slots={{
              toolbar: CustomToolbar,
            }}
          />
        </Box>
      </Row>


    </div>
  )
};

export default Account;