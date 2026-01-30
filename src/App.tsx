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
      const user = WebApp.initDataUnsafe?.user
      const adminId = import.meta.env.VITE_ADMIN_ID
      
      if (user) {
        setUser({
          id: user.id,
          firstName: user.first_name || '',
          lastName: user.last_name || '',
          username: user.username || '',
        })
        
        // Проверяем админа из env
        let isUserAdmin = adminId && user.id.toString() === adminId
        
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
