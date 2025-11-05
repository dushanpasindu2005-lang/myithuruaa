import Link from 'next/link'
import { motion } from 'framer-motion'
import { useSession, signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'

export default function Layout({ children }) {
  const { data: session, status } = useSession()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <motion.header
        className={`navbar fixed top-0 w-full z-50 ${isScrolled ? 'shadow-md' : ''}`}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <div className="container nav-inner">
          <div className="nav-left">
            <motion.div whileHover={{ scale: 1.03 }} transition={{ type: 'spring', stiffness: 400, damping: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 22 }}>💰</span>
                <span className="brand-word text-xl font-bold" aria-label="App name">
                  <span className="brand-letter" style={{ color: '#7c3aed' }}>1</span>
                  <span className="brand-letter" style={{ color: '#06b6d4' }}>5</span>
                  <span className="brand-letter" style={{ color: '#ef4444' }}>0</span>
                  <span className="brand-letter" style={{ color: '#f59e0b' }}>0</span>
                  <span className="brand-letter" style={{ color: '#60a5fa' }}> </span>
                  <span className="brand-letter" style={{ color: '#10b981' }}>T</span>
                  <span className="brand-letter" style={{ color: '#f472b6' }}>r</span>
                  <span className="brand-letter" style={{ color: '#7c3aed' }}>a</span>
                  <span className="brand-letter" style={{ color: '#06b6d4' }}>c</span>
                  <span className="brand-letter" style={{ color: '#ef4444' }}>k</span>
                  <span className="brand-letter" style={{ color: '#f59e0b' }}>e</span>
                  <span className="brand-letter" style={{ color: '#60a5fa' }}>r</span>
                </span>
              </div>
            </motion.div>
          </div>

          <div className="nav-right">
            <Link href="/" className="text-sm font-medium text-gray-700 hover:text-gray-900">Home</Link>

            {status !== 'authenticated' && (
              <Link href="/login" className="btn">Sign in</Link>
            )}

            {status === 'authenticated' && session?.user && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={async () => {
                    if (typeof window === 'undefined' || !('Notification' in window)) return
                    try {
                      const p = await Notification.requestPermission()
                      localStorage.setItem('remindersEnabled', p === 'granted' ? 'true' : 'false')
                      if (p === 'granted') {
                        new Notification('Reminders enabled', { body: 'You will receive one reminder per day.', icon: session.user.image })
                      }
                    } catch (e) { console.error(e) }
                  }}
                  title="Enable daily reminders"
                  className="p-2 rounded-full"
                >
                  <span className="text-lg">🔔</span>
                </motion.button>

                <img src={session.user.image} alt={session.user.name || 'avatar'} className="profile-avatar" />
                <div className="hidden md:block">
                  <div className="text-sm font-medium text-gray-800">{session.user.name?.split(' ')[0]}</div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="btn"
                >
                  Logout
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </motion.header>

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="container">
          {children}
        </div>
      </main>
    </div>
  )
}