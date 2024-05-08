import React, { useState, useEffect, useRef } from "react";
import { Stack, Grid, Box, TextField, Button, Typography } from "@mui/material";
import { SendOutlined } from '@ant-design/icons'
import io from "socket.io-client";

const socket = io("http://localhost:5000");

function ChatRoom() {
  const scrollRef = useRef();

  const [username, setUsername] = useState(localStorage.getItem('name'));
  const [userId, setUserId] = useState(localStorage.getItem('userId'));
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);

  useEffect(() => {
    async function getMessages() {
      const response = await fetch('/api/messages', {
        method: "GET"
      })
      const messages = await response.json()
  
      setChatMessages(messages)
    }
    getMessages()
  }, []);

  useEffect(() => {
    // Scroll to bottom if new message received
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }

    // Setup Socket Events
    const setupEvents = () => {
      socket.on("receive_message", (e) => {
        const data = JSON.parse(e);
        // const data = e;

        const lastMessage = chatMessages.length? chatMessages[chatMessages.length - 1] : null;
        if (!(lastMessage?.message === data.message && lastMessage?.createdDate === data.createdDate)) {
          chatMessages.push(data);
          setChatMessages([...chatMessages]);
        }
      });
    };

    setupEvents();
  }, [chatMessages]);

  // Send Messge
  const sendMessage = (e) => {
    e.preventDefault();

    const data = {userId, username, message, createdDate: new Date() };

    if (message != '') {
      socket.emit("send_message", JSON.stringify(data));
      // socket.emit("send_message", data);
    }
    
    setMessage("");
  };

  // Messages View
  const messagesView = () => (
    <Stack
      direction="column"
      spacing={3}
      px={2}
      sx={{ flex: 1, overflowY: "auto" }}
    >
      {chatMessages?.map(
        ({ username: otherUsername, message, createdDate }, index) => {
          const self = otherUsername === username;

          return (
            <Grid
              key={username + index}
              item
              sx={(theme) => ({
                alignSelf: self ? "flex-end" : "flex-start",
                maxWidth: "75%",
              })}
            >
              <Typography
                fontSize={11}
                sx={{
                  textAlign: self ? "right" : "left",
                }}
                px={1}
              >
                {otherUsername}
              </Typography>
              <Typography
                sx={(theme) => ({
                  backgroundColor: self
                    ? '#83c8ff'
                    : '#f0f0f0',
                  borderRadius: theme.shape.borderRadius,
                })}
                px={1}
              >
                {message}
              </Typography>

              {/* <Typography
                fontSize={11}
                sx={{
                  textAlign: self ? "right" : "left",
                }}
                px={1}
              >
                {format(new Date(createdDate), "hh:mm a")}
              </Typography> */}
            </Grid>
          );
        }
      )}
    </Stack>
  );

  // Send Message Input
  const controlsView = () => (
    <Grid container item padding={1} alignItems="center">
      <Grid item flex={1}>
        <TextField
          autoFocus
          variant="standard"
          fullWidth
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          sx={(theme) => ({
            border: "1px solid gray",
            borderRadius: theme.shape.borderRadius,
            paddingLeft: 2,
            backgroundColor: '#f0f0f0',
          })}
          InputProps={{
            disableUnderline: true,
          }}
          placeholder = "Aa"
        />
      </Grid>
      <Grid item>
        <Button type="submit"><SendOutlined /></Button>
      </Grid>
    </Grid>
  );

  return (
    <form onSubmit={sendMessage}>
      <Grid
        container
        direction="column"
        alignItems="center"
        style={{ height: "400px", padding: 0 }}
      >

        <Stack
          spacing={1}
          sx={(theme) => ({
            backgroundColor: "#fff",
            height: "100vh",
            width: "100%",
          })}
        >
          <div style={{height: '370px', overflowY: 'scroll'}} ref={scrollRef} >
            {messagesView()}
          </div>
          <div style = {{}} >
            {controlsView()}
          </div> 
        </Stack>
      </Grid>
    </form>
  );
}

export default ChatRoom;