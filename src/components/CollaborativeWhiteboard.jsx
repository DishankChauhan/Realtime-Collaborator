import React, { useState, useEffect, useRef } from 'react';
import { Camera, Download, Edit2, Image, Square } from 'lucide-react';
import Button from './ui/Button';

const CollaborativeWhiteboard = ({ ws, userId }) => {
  const [drawing, setDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [tool, setTool] = useState('pen');
  const [cursors, setCursors] = useState({});
  const canvasRef = useRef(null);
  const lastPositionRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2;

    if (ws) {
      ws.onmessage = async (event) => {
        const text = event.data instanceof Blob ? await event.data.text() : event.data;
        const data = JSON.parse(text);
        
        if (data.type === 'draw') {
          drawFromWebSocket(data);
        } else if (data.type === 'cursor') {
          updateCursor(data);
        }
      };
    }
  }, [ws]);

  const updateCursor = (data) => {
    if (data.userId !== userId) {
      setCursors(prev => ({...prev, [data.userId]: { x: data.x, y: data.y }}));
    }
  };

  const startDrawing = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    setDrawing(true);
    lastPositionRef.current = { x: offsetX, y: offsetY };
  };

  const draw = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    
    // Send cursor position
    ws.send(JSON.stringify({
      type: 'cursor',
      userId: userId,
      x: offsetX,
      y: offsetY
    }));

    if (!drawing) return;
    
    const data = {
      type: 'draw',
      from: lastPositionRef.current,
      to: { x: offsetX, y: offsetY },
      color,
      tool,
    };
    drawLine(data);
    lastPositionRef.current = { x: offsetX, y: offsetY };
    ws.send(JSON.stringify(data));
  };

  const drawLine = (data) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { from, to, color, tool } = data;

    ctx.beginPath();
    ctx.strokeStyle = color;

    if (tool === 'pen') {
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    } else if (tool === 'rectangle') {
      const width = to.x - from.x;
      const height = to.y - from.y;
      ctx.rect(from.x, from.y, width, height);
      ctx.stroke();
    }
  };

  const drawFromWebSocket = (data) => {
    drawLine(data);
  };

  const endDrawing = () => {
    setDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ws.send(JSON.stringify({ type: 'clear' }));
  };

  const saveImage = () => {
    const canvas = canvasRef.current;
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = 'whiteboard.png';
    link.click();
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex space-x-2 mb-4">
        <Button onClick={() => setTool('pen')}><Edit2 size={20} /></Button>
        <Button onClick={() => setTool('rectangle')}><Square size={20} /></Button>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-10 h-10 rounded-full"
        />
        <Button onClick={clearCanvas}>Clear</Button>
        <Button onClick={saveImage}><Download size={20} /></Button>
      </div>
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseOut={endDrawing}
          className="border border-gray-300"
        />
        {Object.entries(cursors).map(([userId, position]) => (
          <div
            key={userId}
            className="absolute w-3 h-3 bg-red-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"
            style={{ left: position.x, top: position.y }}
          />
        ))}
      </div>
    </div>
  );
};

export default CollaborativeWhiteboard;