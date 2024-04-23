import React, { useEffect, useState } from 'react';
import { Button, Layout, theme, Tooltip, Avatar , Modal, Form, Checkbox, Input , Select, type SelectProps, type FormProps} from 'antd';
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
import { PasswordProps } from 'antd/es/input';

const { Header, Sider} =  Layout;
type FieldType = {
  oldpassword: string;
  newpassword: string;
};

const Home: React.FC = () => {

  const [darkTheme, setdarkTheme] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [noted, setNoted] = useState(true)
  const [oldPath, setOldPath] = useState("/")

  const userId = window.localStorage.getItem("userId")
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  
  const onFinish: FormProps<FieldType>["onFinish"] = async (data) => {
      const response = await fetch('/api/changepassword/' + userId,{
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
      })
      if (response.ok){
        alert("Đổi mật khẩu thành công. Vui lòng đăng nhập lại để sử dụng.")
        logout()
      }
      else{
        alert("Mật khẩu hiện tại không đúng")
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
    // console.log("Home")
    
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
                        size = {'large'} 
                        type ={"default"}
                        onClick={showModal}
                        style={{marginLeft: '15px'}}
                    >
                      Đổi mật khẩu
                    </Button>
                    <Modal  title="Đổi mật khẩu" 
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
                          label="Mật khẩu hiện tại"
                          name="oldpassword"
                          rules={[{ required: true, message: '' }]}
                        >
                          <Input type = 'password'/>
                        </Form.Item>

                        <Form.Item<FieldType>
                          label="Mật khẩu mới"
                          name="newpassword"
                          rules={[{ required: true, message: '' }]}
                        >
                          <Input type = 'password'/>
                        </Form.Item>

                        <Form.Item wrapperCol={{ span: 24 }} style = {{display: 'flex', justifyContent: 'center', marginBottom: 10}}>
                          <Button type="primary" htmlType="submit" style={{marginRight: 5, paddingLeft: 10, paddingRight: 10}} danger = {true} >
                            Đổi mật khẩu
                          </Button>
                        </Form.Item>

                      </Form>
                    </Modal>
                    <Button 
                        type='text' 
                        className='toggle'
                        onClick={() => logout()}
                        icon={<LogoutOutlined/>}
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