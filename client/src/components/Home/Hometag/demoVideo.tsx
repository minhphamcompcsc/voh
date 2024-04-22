import React from 'react';
import { Flex } from 'antd';

interface ChatGPTProps {
    themeClassName: string;
  }

const DemoVideo: React.FC<ChatGPTProps> = ({ themeClassName }) => {
  return (
    <Flex vertical justify='center' align='center' style={{height:'100%', width:'100%'}}>
        <iframe src="https://www.youtube-nocookie.com/embed/VTNLCpjDySE?vq=hd1080&autoplay=1" 
        width="70%" height="70%" title="NOIS GPT - AI Virtual Assistant - Instruction" 
        frameBorder="0" allowFullScreen></iframe>
    </Flex>
  )
};

export default DemoVideo;