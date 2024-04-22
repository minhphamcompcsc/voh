import React from 'react';
import {useState, useEffect} from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import Box from '@mui/material/Box';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Button, Modal, Form } from 'antd';
import {UserAddOutlined, UserDeleteOutlined} from '@ant-design/icons'

interface Reason {
  themeClassName: string;
}

const Reason: React.FC<Reason> = ({ themeClassName }) => {
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

export default Reason;