import { io, Socket } from 'socket.io-client';

let socket: Socket;

export const connectWebSocket = () => {
    socket = io('http://localhost:3001/news'); // Update the URL here

  socket.on('connect', () => {
    console.log('Connected to WebSocket');
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from WebSocket');
  });

  socket.on('news_added', (data: string) => {
    // Handle the received data in your UI
    console.log('New news added:', data);
    // Update your UI accordingly
  });
};

export const disconnectWebSocket = () => {
  if (socket) {
    socket.disconnect();
  }
};