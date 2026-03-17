import React, { useState } from 'react';
import { MessageSquare, Bot, Send, User, ArrowLeft, Lightbulb } from 'lucide-react';

export default function ConversationCoach() {
  const [messages, setMessages] = useState([
    { role: 'system', text: "Hello! I'm your Conversation Coach. I can help you practice how to talk to Jane when she's feeling confused or repetitive." },
    { role: 'bot', text: "Jane just asked you 'Where is my mother?' for the third time today. Her mother passed away many years ago. How would you respond?" }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    
    const newMessages = [...messages, { role: 'user', text: input }];
    setMessages(newMessages);
    setInput('');

    // Simulate coach feedback
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'bot', 
        text: "That's a good approach! Using 'Validation and Redirection' is very effective. You acknowledged her feelings without causing unnecessary grief by correcting her directly." 
      }]);
    }, 1000);
  };

  return (
    <div className="max-w-md mx-auto bg-slate-50 dark:bg-background-dark h-screen flex flex-col">
      <header className="bg-white dark:bg-slate-900 p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4">
        <div className="size-10 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
          <Bot className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">Conversation Coach</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Practice caregiver communication</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : msg.role === 'system'
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs text-center w-full'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700 shadow-sm rounded-tl-none'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
        <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-xl mb-4 flex gap-3 items-start">
          <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
            <strong>Tip:</strong> Try to focus on the emotion behind the question rather than the factual accuracy.
          </p>
        </div>
        <div className="flex gap-2">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your response..."
            className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 text-slate-900 dark:text-white"
          />
          <button 
            onClick={handleSend}
            className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
