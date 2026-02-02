import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Home, MessageCircle, Shield, ClipboardList } from 'lucide-react'
import { useAppStore } from '../store/appStore'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { currentView, setCurrentView } = useAppStore()

  // ДЕМО-РЕЖИМ: Админка видна всем пользователям
  const navItems = [
    { id: 'home', label: 'Главная', icon: Home },
    { id: 'orders', label: 'Заказы', icon: ClipboardList },
    { id: 'ai', label: 'AI помощник', icon: MessageCircle },
    { id: 'admin', label: 'Админ', icon: Shield }, // Всегда показываем в демо-режиме
  ]

  return (
    <div className="min-h-screen flex flex-col" style={{
      background: '#000000',
      color: '#ffffff',
    }}>
      <main className="flex-1 overflow-y-auto pb-20">
        <motion.div
          key={currentView}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 glass-card border-t border-white/10 backdrop-blur-xl">
        <div className="flex justify-around items-center h-16 px-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentView === item.id
            
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id as any)}
                className="flex flex-col items-center justify-center gap-1 relative"
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={`p-2 rounded-xl transition-colors ${
                    isActive 
                      ? 'bg-blue-500/20 text-blue-400' 
                      : 'text-gray-400'
                  }`}
                >
                  <Icon size={20} />
                </motion.div>
                <span className={`text-xs ${
                  isActive ? 'text-blue-400' : 'text-gray-500'
                }`}>
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
