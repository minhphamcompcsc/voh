import React from 'react';
import { Button } from 'antd';
import { HiOutlineSun, HiOutlineMoon } from 'react-icons/hi';

interface ToggleThemeButtonProps {
    darkTheme: boolean;
    toggleTheme: () => void;
  }
  
  const ToggleThemeButton: React.FC<ToggleThemeButtonProps> = ({ darkTheme, toggleTheme }) => {
    return (
      <div className='toggle-theme-btn'>
        <Button onClick={toggleTheme}>
          {darkTheme ? <HiOutlineMoon /> : <HiOutlineSun />}
        </Button>
      </div>
    );
  };
  
  export default ToggleThemeButton;