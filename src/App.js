import React, { useState, useEffect, useRef } from 'react';
import CollaborativeWhiteboard from './components/CollaborativeWhiteboard';
import Chat from './components/Chat';

const App = () => {
  const [ws, setWs] = useState(null);
  const userIdRef = useRef(Math.random().toString(36).substr(2, 9));

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8080');
    setWs(socket);

    return () => {
      socket.close();
    };
  }, []);

  return (
    <div className="flex h-screen">
      <div className="flex-grow">
        <h1 className="text-2xl font-bold m-4">Collaborative Whiteboard</h1>
        <CollaborativeWhiteboard ws={ws} userId={userIdRef.current} />
        
      </div>
      <Chat ws={ws} userId={userIdRef.current} />
    </div>
  );
};

export default App;