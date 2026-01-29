import { useEffect } from 'react'
import WebApp from '@twa-dev/sdk'
import { useAppStore } from './store/appStore'
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
    
    const user = WebApp.initDataUnsafe?.user
    const adminId = import.meta.env.VITE_ADMIN_ID
    
    if (user) {
      setUser({
        id: user.id,
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        username: user.username || '',
      })
      
      if (adminId && user.id.toString() === adminId) {
        setIsAdmin(true)
        
        const startParam = WebApp.initDataUnsafe?.start_param
        if (startParam === 'admin') {
          setCurrentView('admin')
        }
      }
    }

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
