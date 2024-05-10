import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import NotFound from "./components/NotFound";
import LoginPage from "./components/LoginPage/LoginPage";
import Home from "./components/Home/MainLayout";
import axios from 'axios';

const Router = () => {
    
    const ProtectedRoute = ({ element }: any): any => {
        const isLogged = window.localStorage.getItem("loggedIn");
        
        // console.log(isLogged)
        if (!isLogged) {
            return <Navigate to="/dangnhap" />;
        }

        return <>{element}</>;
    };
    let role = localStorage.getItem('role')
    return (
        <BrowserRouter>
        <Routes>
            <Route path="/dangnhap" element={<LoginPage />} />
            <Route path="/" element={<ProtectedRoute element={<Home />} />} />

            <Route path='/dangnhap' element={<LoginPage/>}/>
   
            <Route path='/trangchu' element={<ProtectedRoute element={<Home />}  />}/> 
            <Route path='trangchu' element={<ProtectedRoute element={<Home />} />}/>
            <Route path='/chatGPT' element={<ProtectedRoute element={<Home />} />}/>
            <Route path='/bantin' element={<ProtectedRoute element={<Home />} />}/>  
            <Route path='/thongke' element={<ProtectedRoute element={<Home />} />}/>  
            <Route path='/dulieuadmin'  element={role == 'ROLE_ADMIN'? <ProtectedRoute element={<Home />} /> : <NotFound />}/>  
            <Route path='/hinhanh' element={<ProtectedRoute element={<Home />} />}/>
            <Route path='/nguyennhan' element={<ProtectedRoute element={<Home />} />}/> 
            <Route path='/demoVideo' element={<ProtectedRoute element={<Home />} />}/> 

            <Route path="*" element={<NotFound />} />
        </Routes>
        </BrowserRouter>
    );
};

export default Router;