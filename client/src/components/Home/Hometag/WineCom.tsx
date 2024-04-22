import React from 'react';
import { useState } from 'react';
import './Chat.css'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator} from '@chatscope/chat-ui-kit-react';
import { MessageDirection } from "@chatscope/use-chat";

// const baseUrl = `//${window.location.hostname}:5000`
// const baseUrl = `https://customer-chatbot-server.azurewebsites.net/`
const baseUrl = `https://api.customer-chat.com`

interface MessageChat {
  message: string;
  direction: MessageDirection;
  sentTime?: string;
  sender: string;
  action?: any;
}

interface ChatGPTProps {
  themeClassName: string;
}

const WineCom: React.FC<ChatGPTProps> = ({ themeClassName }) => {
  const [messages, setMessages] = useState<MessageChat[]>([
    {
      message: "Hello, I'm NOIS GPT! It's a pleasure to connect with you.",
      sentTime: "just now",
      direction: MessageDirection.Incoming,
      sender: "ChatGPT",
    },
    {
      message: "I would be delighted to answer any questions you have about wine.",
      sentTime: "just now",
      direction: MessageDirection.Incoming,
      sender: "ChatGPT",
    },
    {
      message: "Do you have any red wine that goes well with beef? Alcohol content as low as possible please. That's all.",
      sentTime: "just now",
      direction: MessageDirection.Outgoing,
      sender: "user",
      action: () => handleRecommendButtonClick("Do you have any red wine that goes well with beef? Alcohol content as low as possible please. That's all."),
    },
    {
      message: "Is there any non-alcoholic sparkling wine? I can't provide any other information.",
      sentTime: "just now",
      direction: MessageDirection.Outgoing,
      sender: "user",
      action: () => handleRecommendButtonClick("Is there any non-alcoholic sparkling wine? I can't provide any other information."),
    },
    {
      message: "I'm looking for a kind of port wine, from before 2015 if possible, with medium acidity. That's all.",
      sentTime: "just now",
      direction: MessageDirection.Outgoing,
      sender: "user",
      action: () => handleRecommendButtonClick("I'm looking for a kind of port wine, from before 2015 if possible, with medium acidity. That's all."),
    }
  ]);

  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isRecommend, setisRecommend] = useState<string>('need');

  // handle Recommend Button Click
  const handleRecommendButtonClick = async (message: string) => {
    const newMessages: MessageChat[] = [{
      message: "Hello, I'm NOIS GPT! It's a pleasure to connect with you.",
      sentTime: "just now",
      direction: MessageDirection.Incoming,
      sender: "ChatGPT",
    },
    {
      message: "I would be delighted to answer any questions you have about wine.",
      sentTime: "just now",
      direction: MessageDirection.Incoming,
      sender: "ChatGPT",
    },
    {
      message: message,
      direction: MessageDirection.Outgoing,
      sentTime: "just now",
      sender: "user",
    }]
    
    setMessages(newMessages);
    setIsTyping(true);

    const responseMessage: any = await processMessageToChatGPT(newMessages); 
    const responseData = {
      message: responseMessage,
      sentTime: "just now",
      direction: MessageDirection.Incoming,
      sender: "ChatGPT",
    }

    setMessages([...newMessages, responseData])
    setisRecommend('noneed')
  };

  const handleSend = async (message: string) => {
    const newMessage: MessageChat = {
      message,
      direction: MessageDirection.Outgoing,
      sentTime: "just now",
      sender: "user",
    };
    let newMessages: MessageChat[] = [];
    console.log(JSON.stringify(messages))

    if (JSON.stringify(messages) === JSON.stringify([
    {
      message: "Hello, I'm NOIS GPT! It's a pleasure to connect with you.",
      sentTime: "just now",
      direction: MessageDirection.Incoming,
      sender: "ChatGPT",
    },
    {
      message: "I would be delighted to answer any questions you have about wine.",
      sentTime: "just now",
      direction: MessageDirection.Incoming,
      sender: "ChatGPT",
    },
    {
      message: "Do you have any red wine that goes well with beef? Alcohol content as low as possible please. That's all.",
      sentTime: "just now",
      direction: MessageDirection.Outgoing,
      sender: "user",
      action: () => handleRecommendButtonClick("Do you have any red wine that goes well with beef? Alcohol content as low as possible please. That's all."),
    },
    {
      message: "Is there any non-alcoholic sparkling wine? I can't provide any other information.",
      sentTime: "just now",
      direction: MessageDirection.Outgoing,
      sender: "user",
      action: () => handleRecommendButtonClick("Is there any non-alcoholic sparkling wine? I can't provide any other information."),
    },
    {
      message: "I'm looking for a kind of port wine, from before 2015 if possible, with medium acidity. That's all.",
      sentTime: "just now",
      direction: MessageDirection.Outgoing,
      sender: "user",
      action: () => handleRecommendButtonClick("I'm looking for a kind of port wine, from before 2015 if possible, with medium acidity. That's all."),
    }
  ])){
      setisRecommend('noneed')

      newMessages = [{
        message: "Hello, I'm NOIS GPT! It's a pleasure to connect with you.",
        sentTime: "just now",
        direction: MessageDirection.Incoming,
        sender: "ChatGPT",
      },
      {
        message: "I would be delighted to answer any questions you have about wine.",
        sentTime: "just now",
        direction: MessageDirection.Incoming,
        sender: "ChatGPT",
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
    }
    setMessages([...newMessages, responseData])
  };

  // send message to  BE
  async function processMessageToChatGPT(chatMessages: MessageChat[]) {
    try {
      const response = await fetch(`${baseUrl}/chatWine`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(chatMessages[chatMessages.length - 1]?.message),
        "credentials": "include",
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
        <ChatContainer>       
          {/* <MessageList 
            className={`${themeClassName}-incoming ${themeClassName}-${isRecommend}-outgoing ${themeClassName}-messagelist`}
            scrollBehavior="auto" 
            typingIndicator={isTyping ? <TypingIndicator content="NOIS GPT is typing" /> : null}
          >
            {messages.map((message: MessageChat, i: number) => {
              return <div style={{display: 'block'}} onClick={message.action}>
                <Message key={i} model={message} />
                </div>;
            })}
          </MessageList>
          <MessageInput placeholder="Type your message here ..." autoFocus onSend={handleSend} attachButton={false}/> */}
          
        </ChatContainer>
      </MainContainer>
    </div>
  )
};

export default WineCom;