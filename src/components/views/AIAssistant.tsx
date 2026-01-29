import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, Bot, User } from 'lucide-react'

interface Message {
  id: string
  text: string
  sender: 'user' | 'ai'
  timestamp: Date
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Привет! Я AI-ассистент. Чем могу помочь?',
      sender: 'ai',
      timestamp: new Date(),
    },
  ])
  const [inputText, setInputText] = useState('')

  const handleSend = () => {
    if (!inputText.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')

    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'ИИ-ассистент в разработке... Скоро я смогу помочь вам с выбором услуг, ответить на вопросы о детейлинге и аренде автомобилей! 🚗✨',
        sender: 'ai',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, aiMessage])
    }, 1000)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="p-4 glass-card border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <Bot size={20} />
          </div>
          <div>
            <h2 className="font-semibold">AI Ассистент</h2>
            <p className="text-xs text-gray-400">Всегда на связи</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              message.sender === 'ai' 
                ? 'bg-gradient-to-br from-blue-500 to-purple-500' 
                : 'bg-gray-700'
            }`}>
              {message.sender === 'ai' ? <Bot size={16} /> : <User size={16} />}
            </div>
            
            <div className={`max-w-[75%] ${message.sender === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
              <div className={`glass-card p-3 rounded-2xl ${
                message.sender === 'user' 
                  ? 'bg-blue-500/20 rounded-tr-sm' 
                  : 'rounded-tl-sm'
              }`}>
                <p className="text-sm">{message.text}</p>
              </div>
              <span className="text-xs text-gray-500 mt-1">
                {message.timestamp.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-4 glass-card border-t border-white/10">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Напишите сообщение..."
            className="flex-1 glass-card p-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none"
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="bg-blue-500 p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </motion.button>
        </div>
      </div>
    </div>
  )
}
