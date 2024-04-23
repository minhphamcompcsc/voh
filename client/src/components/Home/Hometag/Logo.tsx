import React from 'react'
import {FireFilled} from '@ant-design/icons'
import { Link } from 'react-router-dom';
import logo from './logo.jpg';

const Logo = () => {
  return (
    <div className='logo-home'>
        <div className='logo-icon-home'>
            <Link to="/">
              <img src={logo} alt="Logo" style={{marginTop: '60px', width: '110%' }}/>
            </Link>
        </div>
    </div>
  )
}

export default Logo