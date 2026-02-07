import { motion } from 'framer-motion'
import { X, Phone, MessageCircle, Send } from 'lucide-react'

interface ContactMethod {
  type: 'phone' | 'whatsapp' | 'telegram'
  label: string
  icon: any
  url: string
}

interface ContactModalProps {
  phone: string
  contactMethods: string[]
  onClose: () => void
}

export default function ContactModal({ phone, contactMethods, onClose }: ContactModalProps) {
  const methods: ContactMethod[] = []

  if (contactMethods.includes('phone')) {
    methods.push({
      type: 'phone',
      label: 'Позвонить',
      icon: Phone,
      url: `tel:${phone}`
    })
  }

  if (contactMethods.includes('whatsapp')) {
    const cleanPhone = phone.replace(/[^0-9]/g, '')
    methods.push({
      type: 'whatsapp',
      label: 'WhatsApp',
      icon: MessageCircle,
      url: `https://wa.me/${cleanPhone}`
    })
  }

  if (contactMethods.includes('telegram')) {
    const cleanPhone = phone.replace(/[^0-9]/g, '')
    methods.push({
      type: 'telegram',
      label: 'Telegram',
      icon: Send,
      url: `https://t.me/+${cleanPhone}`
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass-card p-6 rounded-2xl max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">Связаться с нами</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3">
          <div className="text-center mb-4">
            <p className="text-2xl font-bold text-blue-400">{phone}</p>
          </div>

          {methods.map((method) => {
            const Icon = method.icon
            return (
              <motion.a
                key={method.type}
                href={method.url}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-3 p-4 glass-card rounded-xl hover:bg-white/10 transition-colors"
              >
                <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500">
                  <Icon size={20} className="text-white" />
                </div>
                <span className="font-medium">{method.label}</span>
              </motion.a>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  )
}
