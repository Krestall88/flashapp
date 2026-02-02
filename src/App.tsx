import { useEffect } from 'react'
import WebApp from '@twa-dev/sdk'
import { useAppStore } from './store/appStore'
import { api } from './api/client'
import Layout from './components/Layout'
import HomeView from './components/views/HomeView'
import BookingFlow from './components/views/BookingFlow'
import AdminDashboard from './components/views/AdminDashboard'
import AIAssistant from './components/views/AIAssistant'
import MyOrders from './components/views/MyOrders'

function App() {
  const { currentView, setUser, setIsAdmin, setCurrentView } = useAppStore()

  useEffect(() => {
    WebApp.ready()
    WebApp.expand()
    
    const initializeApp = async () => {
      let user = WebApp.initDataUnsafe?.user
      const adminId = import.meta.env.VITE_ADMIN_ID
      
      // Для локальной разработки в браузере (не в Telegram)
      if (!user && window.location.hostname === 'localhost') {
        console.log('🔧 Development mode: Using mock user data')
        user = {
          id: 323976163, // Ваш Telegram ID
          first_name: 'Admin',
          last_name: 'User',
          username: 'admin',
          language_code: 'ru'
        }
      }
      
      if (user) {
        setUser({
          id: user.id,
          firstName: user.first_name || '',
          lastName: user.last_name || '',
          username: user.username || '',
        })
        
        // ДЕМО-РЕЖИМ: Все пользователи видят админку (только просмотр)
        // Реальные админы (из env) могут вносить изменения
        const isRealAdmin = adminId && user.id.toString() === adminId
        
        // Для локальной разработки - всегда реальный админ
        let isUserAdmin = isRealAdmin
        if (window.location.hostname === 'localhost') {
          isUserAdmin = true
          console.log('🔧 Development mode: Admin access granted')
        }
        
        // В демо-режиме показываем админку всем
        console.log('🎭 Demo mode: Admin panel visible to all users (read-only for non-admins)')
        
        // Проверяем админа из Google Sheets
        if (!isUserAdmin) {
          try {
            const admins = await api.getAdmins()
            isUserAdmin = admins.some((admin: any) => admin.userId === user.id.toString())
          } catch (error) {
            console.error('Failed to load admins:', error)
          }
        }
        
        if (isUserAdmin) {
          setIsAdmin(true)
          
          const startParam = WebApp.initDataUnsafe?.start_param
          if (startParam === 'admin') {
            setCurrentView('admin')
          }
        }
      }
    }
    
    initializeApp()

    WebApp.setHeaderColor('#000000')
    WebApp.setBackgroundColor('#000000')
    
    WebApp.MainButton.hide()
  }, [setUser, setIsAdmin, setCurrentView])

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomeView />
      case 'booking':
        return <BookingFlow />
      case 'orders':
        return <MyOrders />
      case 'admin':
        return <AdminDashboard />
      case 'ai':
        return <AIAssistant />
      default:
        return <HomeView />
    }
  }

  return (
    <Layout>
      {renderView()}
    </Layout>
  )
}

export default App
