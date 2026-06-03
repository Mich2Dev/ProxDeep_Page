import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Minimize2, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const FloatingBot = () => {
  const { API_URL } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', content: '¡Hola! Soy el Asistente ProxDeep. ¿Quieres saber cómo blindar tus datos o ahorrar un 80% en costos de IA?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Dragging state
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const offsetRef = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e) => {
    // Only allow dragging from the header area
    setIsDragging(true);
    offsetRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - offsetRef.current.x,
        y: e.clientY - offsetRef.current.y
      });
    }
  };

  const handlePointerUp = (e) => {
    setIsDragging(false);
    e.target.releasePointerCapture(e.pointerId);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/bot/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });

      const data = await response.json();

      if (response.ok) {
        setMessages(prev => [...prev, { role: 'bot', content: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'bot', content: 'Lo siento, hubo un problema de conexión. ¿Puedes intentarlo de nuevo?' }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', content: 'Error de red. Asegúrate de tener conexión al servidor.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Botón Flotante */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Abrir chat"
        className={`fixed bottom-5 right-5 sm:bottom-6 sm:right-6 p-3.5 sm:p-4 rounded-full bg-emerald-500 text-[#050505] shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] transition-all duration-300 z-50 flex items-center justify-center transform hover:scale-105 ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
      >
        <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-[#050505]"></span>
        </span>
      </button>

      {/* Ventana de Chat — ocupa casi toda la pantalla en móvil */}
      <div 
        className={`fixed z-50 transition-all duration-300 origin-bottom-right
        bottom-0 right-0 left-0 sm:bottom-6 sm:right-6 sm:left-auto
        w-full sm:w-80 md:w-96
        h-[80vh] sm:h-[500px] sm:max-h-[80vh]
        bg-[#050505] border border-slate-800
        rounded-t-2xl sm:rounded-2xl
        shadow-[0_-4px_40px_rgba(0,0,0,0.5)] sm:shadow-[0_10px_40px_rgba(0,0,0,0.5)]
        flex flex-col
        ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}
        style={isOpen && position.x !== 0 ? { transform: `translate(${position.x}px, ${position.y}px)`, transition: isDragging ? 'none' : 'transform 0.3s' } : {}}
      >

        {/* Cabecera (Draggable) */}
        <div 
          className="p-3 sm:p-4 bg-[#0a0a0a] border-b border-slate-800 rounded-t-2xl flex justify-between items-center shrink-0 cursor-move"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-emerald-950/30 rounded-full border border-emerald-900/50">
              <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">Asistente ProxDeep</h3>
              <p className="text-emerald-400 text-xs flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> En línea
              </p>
            </div>
          </div>
          <div className="flex gap-2 text-slate-400">
            <button onClick={() => setIsOpen(false)} className="hover:text-white transition-colors p-1" aria-label="Minimizar">
              <Minimize2 className="h-5 w-5" />
            </button>
            <button onClick={() => setIsOpen(false)} className="hover:text-white transition-colors p-1" aria-label="Cerrar">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm ${
                msg.role === 'user'
                ? 'bg-emerald-500 text-[#050505] rounded-br-none font-medium'
                : 'bg-[#111] text-slate-300 border border-slate-800 rounded-bl-none font-light'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[85%] bg-[#111] border border-slate-800 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-2">
                <Loader2 className="h-4 w-4 text-emerald-400 animate-spin" />
                <span className="text-xs text-slate-400 font-light">Pensando...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 bg-[#0a0a0a] border-t border-slate-800 rounded-b-2xl shrink-0">
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu consulta..."
              className="flex-1 bg-[#050505] border border-slate-800 rounded-xl px-3 sm:px-4 py-2.5 text-sm text-white font-light focus:outline-none focus:border-emerald-500/50 transition-colors min-w-0"
              disabled={isLoading}
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2.5 bg-emerald-950/20 text-emerald-400 hover:bg-emerald-500 hover:text-[#050505] rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              aria-label="Enviar"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default FloatingBot;
