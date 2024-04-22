import React from 'react';
import { useEffect, useState } from 'react';
import { Button } from "antd";
import { UnorderedListOutlined, AppstoreOutlined} from '@ant-design/icons'
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';


const baseUrl = `//${window.location.hostname}:5000`
// const baseUrl = `https://customer-chatbot-server.azurewebsites.net/`
// const baseUrl = `https://api.customer-chat.com`


interface ChatGPTProps {
  themeClassName: string;
}

const ChatGPT: React.FC<ChatGPTProps> = ({ themeClassName }) => {
    return (
      <ImageList sx={{ height: 900 }}>
        {itemData.map((item) => (
          <ImageListItem key={item.img}>
            <img
              srcSet={`${item.img}?w=248&fit=crop&auto=format&dpr=2 2x`}
              src={`${item.img}?w=248&fit=crop&auto=format`}
              alt={item.title}
              loading="lazy"
            />
            <ImageListItemBar
              title={item.title}
              subtitle={<span>by: <a href={item.author}>{item.author}</a></span>}
              position="below"
            />
          </ImageListItem>
        ))}
      </ImageList>
    );
}

const itemData = [
  {
    img: 'http://localhost:8000/Ba%20Th%C3%A1ng%20Hai%20-%20Cao%20Th%E1%BA%AFng.jpg',
    title: 'Ba Tháng Hai- Cao Thắng',
    author: 'http://giaothong.hochiminhcity.gov.vn:8007/Render/CameraHandler.ashx?id=5deb576d1dc17d7c5515acf8',
  },
  {
    img: 'http://localhost:8000/Ba%20Th%C3%A1ng%20Hai%20-%20L%C3%AA%20%C4%90%E1%BA%A1i%20H%C3%A0nh%201.jpg',
    title: 'Ba Tháng Hai - Lê Đại Hành 1',
    author: '@rollelflex_graphy726',
  },
  {
    img: 'http://localhost:8000/Ba%20Th%C3%A1ng%20Hai%20-%20L%C3%AA%20%C4%90%E1%BA%A1i%20H%C3%A0nh%202.jpg',
    title: 'Ba Tháng Hai - Lê Đại Hành 2',
    author: '@helloimnik',
  },
  {
    img: 'http://localhost:8000/Ba%20Th%C3%A1ng%20Hai%20-%20L%C3%AA%20H%E1%BB%93ng%20Phong%201.jpg',
    title: 'Ba Tháng Hai - Lê Hồng Phong 1',
    author: '@nolanissac',
  },
  {
    img: 'http://localhost:8000/Ba%20Th%C3%A1ng%20Hai%20-%20L%C3%AA%20H%E1%BB%93ng%20Phong%202.jpg',
    title: 'Ba Tháng Hai - Lê Hồng Phong 2',
    author: '@hjrc33',
  },
  {
    img: 'http://localhost:8000/Ba%20Th%C3%A1ng%20Hai%20-%20L%C3%BD%20Th%C3%A1i%20T%E1%BB%95.jpg',
    title: 'Ba Tháng Hai - Lý Thái Tổ',
    author: '@arwinneil',
  },
  {
    img: 'http://localhost:8000/Ba%20Th%C3%A1ng%20Hai%20-%20L%C3%BD%20Th%C6%B0%E1%BB%9Dng%20Ki%E1%BB%87t%202.jpg',
    title: 'Ba Tháng Hai - Lý Thường Kiệt 2',
    author: '@tjdragotta',
  },
  {
    img: 'http://localhost:8000/Ba%20Th%C3%A1ng%20Hai%20-%20L%C3%BD%20Th%C6%B0%E1%BB%9Dng%20Ki%E1%BB%87t%203.jpg',
    title: 'Ba Tháng Hai - Lý Thường Kiệt 3',
    author: '@katie_wasserman',
  },
  {
    img: 'http://localhost:8000/Ba%20Th%C3%A1ng%20Hai%20%E2%80%93%20S%C6%B0%20V%E1%BA%A1n%20H%E1%BA%A1nh.jpg',
    title: 'Ba Tháng Hai - Sư Vạn Hạnh',
    author: '@silverdalex',
  },
  {
    img: 'http://localhost:8000/BX%20Mi%E1%BB%81n%20%C4%90%C3%B4ng%20-%20%C4%90inh%20B%E1%BB%99%20L%C4%A9nh%201.jpg',
    title: 'Dinh Bo Linh - BX Mien Dong 1',
    author: '@shelleypauls',
  },
  {
    img: 'http://localhost:8000/BX%20Mi%E1%BB%81n%20%C4%90%C3%B4ng%20-%20%C4%90inh%20B%E1%BB%99%20L%C4%A9nh%202.jpg',
    title: 'Ba Tháng Hai - Lý Thường Kiệt',
    author: '@peterlaster',
  },
  {
    img: 'http://localhost:8000/BX%20Mi%E1%BB%81n%20%C4%90%C3%B4ng%20-%20Qu%E1%BB%91c%20L%E1%BB%99%2013%20(1).jpg',
    title: 'Quốc lộ 13 - BX Mien Dong 1',
    author: '@southside_customs',
  },
];

export default ChatGPT; 