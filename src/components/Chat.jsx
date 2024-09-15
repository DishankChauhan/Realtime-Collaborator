import React, { useState, useEffect, useRef } from 'react';
import Button from './ui/Button';

const Chat = ({ ws, userId }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (ws) {
      ws.addEventListener('message', handleMessage);
    }
    return () => {
      if (ws) {
        ws.removeEventListener('message', handleMessage);
      }
    };
  }, [ws]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleMessage = async (event) => {
    const text = event.data instanceof Blob ? await event.data.text() : event.data;
    const data = JSON.parse(text);
    if (data.type === 'chat') {
      setMessages(prev => [...prev, data]);
    }
  };

  const sendMessage = () => {
    if (inputMessage.trim() && ws) {
      const messageData = {
        type: 'chat',
        userId,
        message: inputMessage.trim(),
        timestamp: new Date().toISOString(),
      };
      ws.send(JSON.stringify(messageData));
      setInputMessage('');
    }
  };

  return (
    <div className="w-64 h-full flex flex-col bg-white border-l border-gray-300">
      <div className="p-4 border-b border-gray-300">
        <h2 className="text-lg font-semibold">Chat</h2>
      </div>
      <div ref={chatContainerRef} className="flex-grow overflow-y-auto p-4">
        {messages.map((msg, index) => (
          <div key={index} className={`mb-2 ${msg.userId === userId ? 'text-right' : ''}`}>
            <span className="text-xs text-gray-500">{msg.userId.substr(0, 4)}:</span>
            <p className="bg-gray-100 inline-block p-2 rounded">{msg.message}</p>
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-gray-300">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          className="w-full p-2 border border-gray-300 rounded"
          placeholder="Type a message..."
        />
        <Button onClick={sendMessage} className="mt-2 w-full">Send</Button>
      </div>
    </div>
  );
};

export default Chat;