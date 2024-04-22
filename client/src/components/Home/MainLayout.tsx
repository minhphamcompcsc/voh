import React, { useEffect, useState } from 'react';
import { Button, Layout, theme, Tooltip, Avatar } from 'antd';
import { LogoutOutlined, MenuUnfoldOutlined, MenuFoldOutlined, InfoCircleOutlined, UserOutlined } from '@ant-design/icons'
import Logo from './Hometag/Logo';
import MenuList from './Hometag/MenuList';
import "./Home.css";
import ToggleThemeButton from './Hometag/ToggleThemeButton';
import { useNavigate } from 'react-router-dom';
import { useLocation } from "react-router-dom"

import ChatGPT from './Hometag/ChatGPT';
import Bulletin from './Hometag/Bulletin';
import StructureFile from './Hometag/Statistic';
import Account from './Hometag/Account';
import ImageGen from './Hometag/ImageGen';
import HomeContent from './Hometag/HomeContent'
import Reason from './Hometag/Reason';

const { Header, Sider} =  Layout;

const Home: React.FC = () => {
    const [darkTheme, setdarkTheme] = useState(false)
    const [collapsed, setCollapsed] = useState(false)
    const [noted, setNoted] = useState(true)
    const [oldPath, setOldPath] = useState("/")

    console.log("Home")
    
    const location = useLocation();
    const currentRoute = location.pathname;

    if (oldPath != currentRoute){
      setNoted(true)
      setOldPath(currentRoute)
    }
    
    const [currentContent, setCurrentContent] = useState(currentRoute === '/' ? '/trangchu' : currentRoute);

    const ToggleTheme = () => {
        setdarkTheme(!darkTheme)
    };
    

    const {
        token: {colorBgContainer},
    } =  theme.useToken()

    const navigate = useNavigate();
    
    const handleMenuClick = (key: string) => {
        setCurrentContent(key);
        navigate(key);
      };

    const themeClassName = darkTheme ? 'dark-theme' : 'light-theme';

    let title = '';

    if ((currentContent === '/trangchu') || (currentContent === '/trangchu')) {
      title = ' ';
    } else if (currentContent === '/chatGPT') {
      title = ' ';
    } else if (currentContent === '/bantin') {
      title = ' ';
    } else if (currentContent === '/thongke') {
      title = ' ';
    } else if (currentContent === '/taikhoan') {
      title = ' ';
    } else if (currentContent === '/nguyennhan') {
      title = ' ';
    } else if (currentContent === '/hinhanh') {
      title = ' ';
    } 
  
    useEffect(() => {
        function handleResize() {    
          if (window.innerWidth < 600) {
            setCollapsed(true);
          }
          else if (window.innerWidth >= 600) {
            setCollapsed(false);
          }
        }
    
        window.addEventListener('resize', handleResize);
    
        handleResize();
    
        return () => {
          window.removeEventListener('resize', handleResize);
        };
      }, []);

    useEffect(() => {
      setCurrentContent(currentRoute === '/' ? '/trangchu' : currentRoute)
    }, [currentRoute])

    const logout = () => {
      window.localStorage.clear();
      navigate('/dangnhap')
    }
    const [sizeChar, setSizeChar] = useState({ sizeHeader: 18, sizeWord: 0, sizeImage: 0, sizeMargin: 0, sizeButton:0, gap: ""});

    return (
        <Layout style={{overflowY: 'hidden'}} className={themeClassName} >
            <Sider 
            collapsed={collapsed} 
            collapsible
            trigger={null}
            theme={darkTheme ? 'dark' : 'light'} 
            className={`sidebar-${themeClassName}`}
            >
                <Logo />
                <MenuList darkTheme={darkTheme} onClick={handleMenuClick} collapsed={collapsed} />
                <ToggleThemeButton darkTheme={darkTheme} toggleTheme={ToggleTheme}/>
            </Sider>

            <Layout className={themeClassName}>
                <Header 
                className={`taskbar-${themeClassName} ${themeClassName}`} 
                style={{padding: 20, display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{display: 'flex', alignItems: 'center'}}>
                    <Button 
                        type='text' 
                        className='toggle'
                        onClick={() => setCollapsed(!collapsed)}
                        icon={collapsed ? <MenuUnfoldOutlined className={themeClassName} /> : <MenuFoldOutlined className={themeClassName} />}
                    />
                  </div>

                  <div style={{display: 'flex', alignItems: 'center'}}>
                    <div style={{ fontSize: sizeChar.sizeHeader, textAlign: 'center'}}> {localStorage.getItem('name')} </div>
                    
                    <Button 
                        type='text' 
                        className='toggle'
                        onClick={() => logout()}
                        icon={collapsed ? <LogoutOutlined className={themeClassName} /> : <LogoutOutlined className={themeClassName} />}
                    />
                  </div>
                </Header>
              <Layout.Content style={{overflowY: 'scroll'}}>
                {currentContent === '/trangchu' && <HomeContent themeClassName={themeClassName}/>}
                {currentContent === '/chatGPT' && <ChatGPT themeClassName={themeClassName}/>}
                {currentContent === '/bantin' && <Bulletin themeClassName={themeClassName}/>}
                {currentContent === '/thongke' && <StructureFile/>}
                {currentContent === '/taikhoan' && <Account themeClassName={themeClassName}/>}
                {currentContent === '/nguyennhan' && <Reason themeClassName={themeClassName}/>}
                {currentContent === '/hinhanh' && <ImageGen themeClassName={themeClassName}/>} 
              </Layout.Content>
            </Layout>
        </Layout>

    );
}


export default Home;