import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import httpClient from '../../httpClient';
import "./LoginPage.css";
import Card from "../Card/Card";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

type LoginFormValue = {
  username: string,
  password: string,
}

const LoginPage = () => {
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, } = useForm<LoginFormValue>()
  const login: SubmitHandler<LoginFormValue> = async (data : any) => {
    // Send an authentication request to the flask server
    const uri = "/api/authenticate/" + data.username + "/" + data.password
    const response = await fetch(uri, {
      method: "POST",
      headers: {'Content-Type': 'application/json'}
    })

    // console.log("acc:", acc)
    if(response.ok) {
      // Succeed
      // alert("Đăng nhập thành công!!!")
      // const userId = await response.text()
      let acc = await response.json()

      window.localStorage.setItem("userId", acc['id'])
      window.localStorage.setItem("name", acc['name'])
      window.localStorage.setItem("role", acc['role'])
      window.localStorage.setItem("loggedIn", "true")
      navigate("/");
    } else {
      // Fail
      alert("Tên đăng nhập hoặc mật khẩu không hợp lệ!!!")
    }
  }
  
  return (
  <div className='main_login'>
    <Card>
      <h1 className="title_login">Sign In</h1>
      <p className="subtitle_login">
        Please log in using your username and password!
      </p>
      <form onSubmit={handleSubmit(login)}>
        <div className="inputs_container">
          <input
            type="text"
            placeholder="Username"
            {
              ...register("username", {required: "Vui lòng nhập tên đăng nhập"})
            }
          />
          {
            errors.username && <p className='error-message'>{errors.username.message}</p>
          }
          <input
            type="password"
            placeholder="Password"
            {
              ...register("password", {required: "Vui lòng nhập mật khẩu"})
            }
          />
          {
            errors.password && <p className='error-message'>{errors.password.message}</p>
          }
        </div>
        <button type="submit" className="login_button">
            Log in
        </button>
        
      </form>
      <div className="link_container_login">
        <a href="" className="small_login">
          Forgot Password?
        </a>
      </div>
    </Card>
  </div>
  
  );
  };

  export default LoginPage;
