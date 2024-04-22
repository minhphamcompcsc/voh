import React from 'react';
import {useState, useEffect} from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import Box from '@mui/material/Box';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Button, Modal, Form } from 'antd';
import {UserAddOutlined, UserDeleteOutlined} from '@ant-design/icons'

interface Account {
  themeClassName: string;
}
type AddAccountFormValue = {
  name: string,
  username: string,
  phone_number: string,
  role: string,
}
const Account: React.FC<Account> = ({ themeClassName }) => {
  const userId = window.localStorage.getItem("userId")

  // Accounts the current user can view
  const [accounts, setAccounts] = useState([])

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

  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields()
  };

  const handleOk = () => {
    let x = form.submit
    setIsModalOpen(false);
  };

  const [form] = Form.useForm();
  const { register, handleSubmit, formState: { errors }, } = useForm<AddAccountFormValue>()
  const login: SubmitHandler<AddAccountFormValue> = async (data : any) => {
    console.log("name", data.name)
    console.log("username", data.username)
    console.log("phone_number", data.phone_number)
    console.log("role", data.role)
  }

  const columns: GridColDef<(typeof accounts)[number]>[] = [
    {
      field: 'name',
      headerName: 'Tên',
      width: 290,
      editable: true,
    },
    {
      field: 'phone_number',
      headerName: 'Số điện thoại',
      width: 195,
      editable: true,
    },
    {
      field: 'username',
      headerName: 'Username',
      width: 180,
      editable: true,
    },
    {
      field: 'role',
      headerName: 'Vai trò',
      width: 250,
      editable: true,
    },
    {
      field: 'created_on',
      headerName: 'Tạo ngày',
      width: 150,
      editable: true,
    },
  ];

  return (
    <div>
      <div style={{display:'flex', justifyContent:'flex-end', alignItems:'center', columnGap: 8, marginTop: 2, marginBottom:2, width:'99%'}}>
        <Button icon = {<UserAddOutlined />} size = {'large'} onClick={showModal}>
          Thêm tài khoản
        </Button>
        <Button icon = {<UserDeleteOutlined />} size = {'large'}>
          Xóa tài khoản
        </Button>

        <Modal title="Thêm tài khoản" open={isModalOpen} onOk={form.submit} onCancel={handleCancel} >
          <Form form={form} onFinish={handleSubmit(login)}>
            <div className="inputs_container">
              <input
                type="text"
                placeholder="Tên tài khoản" {...register("name")}
              />
              <input
                type="text"
                placeholder="Tên đăng nhập"{...register("username")}
              />
              <input
                type="text"
                placeholder="Số điện thoại"{...register("phone_number")}
              />
              <input
                type="text"
                placeholder="Vai trò"{...register("role")}
              />
            </div>
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
        />
      </Box>

    </div>
  )
};

export default Account;