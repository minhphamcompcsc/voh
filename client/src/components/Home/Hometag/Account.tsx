import React from 'react';
import {useState, useEffect} from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import Box from '@mui/material/Box';
import { DataGrid, GridColDef , GridRowSelectionModel } from '@mui/x-data-grid';
import { Button, Modal, Form, Checkbox, Input , Select, type SelectProps} from 'antd';
import {UserAddOutlined, UserDeleteOutlined, UndoOutlined, ExclamationOutlined} from '@ant-design/icons'
import type { FormProps } from 'antd';
import { Roles } from '../../../assets/data/role';

interface Account {
  themeClassName: string;
}
type FieldType = {
  name: string;
  username: string;
  phone_number: string;
  role: string;
};

const Account: React.FC<Account> = ({ themeClassName }) => {
  const userId = window.localStorage.getItem("userId")
  const [form] = Form.useForm();

  // Accounts the current user can view
  const [accounts, setAccounts] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLine, setSelectedLine] = useState<any>(false)
  const [rowSelectionModel, setRowSelectionModel] = React.useState<GridRowSelectionModel>([]);

  // This uri is used to send request to process CRUD operation of news
  const newsUri = "/api/admin/accounts/" + userId

  // Called when the page is rendered
  // This function fetches news that the current user can view
  // and their permission
  useEffect(() => {
    fetch(newsUri).then(
      _accounts => _accounts.json()
    ).then(
      _accounts => setAccounts(_accounts)
    )
  }, [])

  // console.log("account:", accounts)
  const onFinish: FormProps<FieldType>["onFinish"] = async (data) => {
    console.log('value exist: ', accounts.some(obj => obj.username === data['username']))
    if (accounts.some(obj => obj.username === data['username'])){
      alert("Username đã tồn tại, không thể thêm tài khoản người dùng")
    }
    else{
      const response = await fetch('/api/addaccount/' + userId,{
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
      })
      const _account_ = await response.json()
      // console.log('response: ', _account_)
      // console.log('news: ', accounts)
    
      setAccounts([
        _account_[0],
        ...accounts
      ])
      setIsModalOpen(false)
    }
    // console.log('data: ', data)
  };
  const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const columns: GridColDef<(typeof accounts)[number]>[] = [
    {
      field: 'name',
      headerName: 'Tên',
      width: 290,
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

  return (
    <div>
      <div style={{display:'flex', justifyContent:'flex-end', alignItems:'center', columnGap: 8, marginTop: 2, marginBottom:2, width:'99%'}}>
        <Button icon = {<UserAddOutlined />} size = {'large'} onClick={showModal} type ={"primary"} >
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

        <Modal  title="Thêm tài khoản" 
                open={isModalOpen} 
                onOk = {handleOk} 
                onCancel={handleCancel} 
                footer = {() => (
                  <>
                  </>
                )}
        >
          <Form form={form}
            name="basic"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            style={{ maxWidth: 600 }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
          >
            <Form.Item<FieldType>
              label="Tên người dùng"
              name="name"
              rules={[{ required: true, message: '' }]}
            >
              <Input placeholder="Nguyễn Văn A"/>
            </Form.Item>

            <Form.Item<FieldType>
              label="Tên đăng nhập"
              name="username"
              rules={[{ required: true, message: '' }]}
            >
              <Input placeholder="username"/>
            </Form.Item>

            <Form.Item<FieldType>
              label="Số điện thoại"
              name="phone_number"
              rules={[{ required: true, message: '' }]}
            >
              <Input placeholder="0123456789"/>
            </Form.Item>
            <Form.Item<FieldType>
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
                            form.setFieldsValue({
                              name: '',
                              username: '',
                              phone_number: '',
                              role: '',
                            })
                          }}
                  >
              </Button>
            </Form.Item>

          </Form>
        </Modal>
      </div>

      <Box sx={{ height: '100%', width: '100%' }}>
        <DataGrid
          getRowId={(obj)=>obj['_id']['$oid']}
          rows={accounts}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
              },
            },
          }}
          pageSizeOptions={[10]}
          checkboxSelection
          disableRowSelectionOnClick
          onRowSelectionModelChange={(newRowSelectionModel) => {
            setRowSelectionModel(newRowSelectionModel);
            // console.log('rowSelectionModel: ', rowSelectionModel)
          }}
        />
      </Box>

    </div>
  )
};

export default Account;