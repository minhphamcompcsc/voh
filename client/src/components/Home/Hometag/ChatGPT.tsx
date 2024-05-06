import React from 'react';
import { useState } from 'react';
import './Chat.css'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator, ConversationHeader, InfoButton} from '@chatscope/chat-ui-kit-react';
import { MessageDirection } from "@chatscope/use-chat";

const baseUrl = `//${window.location.hostname}:5000`
// const baseUrl = `https://customer-chatbot-server.azurewebsites.net/`
// const baseUrl = `https://api.customer-chat.com`

interface MessageChat {
  message: string;
  direction: MessageDirection;
  sentTime?: string;
  sender: string;
  action?: any;
  position: 0 | "normal" | 2 | 1 | "single" | "first" | "last" | 3;
}


interface ChatGPTProps {
  themeClassName: string;
}

const ChatGPT: React.FC<ChatGPTProps> = ({ themeClassName }) => {
  const [messages, setMessages] = useState<MessageChat[]>([
    {
      message: "Chào bạn, mình là VOH GPT. Bạn có thể hỏi những câu quan liên quan đến tính trạng giao thông và thời tiết thành phố Hồ Chí Minh",
      sentTime: "just now",
      direction: MessageDirection.Incoming,
      sender: "ChatGPT",
      position: "normal",
    },
    {
      message: "Thời tiết quận 10 bây giờ như thế nào?",
      sentTime: "just now",
      direction: MessageDirection.Outgoing,
      sender: "user",
      position: "normal",
      action: () => handleRecommendButtonClick("Thời tiết quận 10 bây giờ như thế nào?"),
    },  
    {
      message: "Tình hình giao thông ở ngã tư 7 hiền.",
      sentTime: "just now",
      direction: MessageDirection.Outgoing,
      sender: "user",
      position: "normal",
      action: () => handleRecommendButtonClick("Tình hình giao thông ở ngã tư 7 hiền."),
    },
    {
      message: "Chiều nay thành phố Hồ Chí Minh dự báo có mưa không?",
      sentTime: "just now",
      direction: MessageDirection.Outgoing,
      sender: "user",
      position: "normal",
      action: () => handleRecommendButtonClick("Chiều nay thành phố Hồ Chí Minh dự báo có mưa không?"),
    }
  ]);

  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isRecommend, setisRecommend] = useState<string>('need');

  // handle Recommend Button Click
  const handleRecommendButtonClick = async (message: string) => {
    const newMessages: MessageChat[] = [{
      message: "Chào bạn, mình là VOH GPT. Bạn có thể hỏi những câu quan liên quan đến tính trạng giao thông và thời tiết thành phố Hồ Chí Minh",
      sentTime: "just now",
      direction: MessageDirection.Incoming,
      sender: "ChatGPT",
      position: "normal",
      },
      {
        message: message,
        direction: MessageDirection.Outgoing,
        sentTime: "just now",
        sender: "user",
        position: "normal",
      }]
    
    setMessages(newMessages)
    setIsTyping(true)
    const responseMessage: any = await processMessageToChatGPT(newMessages); 
    const responseData = {
      message: responseMessage,
      sentTime: "just now",
      direction: MessageDirection.Incoming,
      sender: "ChatGPT",
      position: "normal",
    }

    setMessages([...newMessages, responseData])
    setisRecommend('noneed')
  };

  // handle Send 
  const handleSend = async (message: string) => {
    const newMessage: MessageChat = {
      message,
      direction: MessageDirection.Outgoing,
      sentTime: "just now",
      sender: "user",
      position: "normal",
    };
    let newMessages: MessageChat[] = [];
    console.log(JSON.stringify(messages))

    if (JSON.stringify(messages) === JSON.stringify([
      {
        message: "Chào bạn, mình là VOH GPT. Bạn có thể hỏi những câu quan liên quan đến tính trạng giao thông và thời tiết thành phố Hồ Chí Minh",
        sentTime: "just now",
        direction: MessageDirection.Incoming,
        sender: "ChatGPT",
        position: "normal",
      },
      {
        message: "Thời tiết quận 10 bây giờ như thế nào?",
        sentTime: "just now",
        direction: MessageDirection.Outgoing,
        sender: "user",
        position: "normal",
        action: () => handleRecommendButtonClick("Thời tiết quận 10 bây giờ như thế nào?"),
      },
      {
        message: "Tình hình giao thông ở ngã tư 7 hiền.",
        sentTime: "just now",
        direction: MessageDirection.Outgoing,
        sender: "user",
        position: "normal",
        action: () => handleRecommendButtonClick("Tình hình giao thông ở ngã tư 7 hiền."),
      },
      {
        message: "Chiều nay thành phố Hồ Chí Minh dự báo có mưa không?",
        sentTime: "just now",
        direction: MessageDirection.Outgoing,
        sender: "user",
        position: "normal",
        action: () => handleRecommendButtonClick("Chiều nay thành phố Hồ Chí Minh dự báo có mưa không?"),
      }
    ])){
      setisRecommend('noneed')

      newMessages = [{
        message: "Chào bạn, mình là VOH GPT. Bạn có thể hỏi những câu quan liên quan đến tính trạng giao thông và thời tiết thành phố Hồ Chí Minh",
        sentTime: "just now",
        direction: MessageDirection.Incoming,
        sender: "ChatGPT",
        position: "normal",
      }, newMessage];
    }
    else{
      newMessages = [...messages, newMessage];
    }
    
    // Initial system message to determine ChatGPT functionality
    // How it responds, how it talks, etc.
    setMessages(newMessages);
    setIsTyping(true);

    const responseMessage: any = await processMessageToChatGPT(newMessages); 
    const responseData = {
      message: responseMessage,
      sentTime: "just now",
      direction: MessageDirection.Incoming,
      sender: "ChatGPT",
      position: "normal",
    }
    setMessages([...newMessages, responseData])
  };        

  // send message to  BE
  async function processMessageToChatGPT(chatMessages: MessageChat[]) {
    try {
      const response = await fetch(`${baseUrl}/chatGPT`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(chatMessages[chatMessages.length - 1]?.message),
        credentials: "include",
      });
      
      setIsTyping(false);

      if (response.ok) {
        const responseData = await response.json();
        return responseData.value;
      
      } else {
        // Handle the error case
        throw new Error("Request failed with status: " + response.status);
      }
    } catch (error) {
      // Handle any network or other errors
      console.error("Error:", error);
    }
  }

  return (
    <div className={`App ${themeClassName}-chat-root`}> 
      <MainContainer>
      {/* <ConversationHeader>                             
          <ConversationHeader.Actions>                                                                             
            <InfoButton title="Show info" />
          </ConversationHeader.Actions>
      </ConversationHeader> */}

        <ChatContainer>       
          <MessageList 
            className={`${themeClassName}-incoming ${themeClassName}-${isRecommend}-outgoing ${themeClassName}-messagelist`}
            scrollBehavior="auto" 
            typingIndicator={isTyping ? <TypingIndicator content="VOH GPT is typing" /> : null}
          >
            {messages.map((message: MessageChat, i: number) => {
              return <div style={{display: 'block'}} onClick={message.action}>
                <Message key={i} model={message} />
                </div>;
            })}
          </MessageList>
          <MessageInput placeholder="Type your message here ..." autoFocus onSend={handleSend} attachButton={false}/>
          

        </ChatContainer>
      </MainContainer>
    </div>
  )
};

export default ChatGPT;