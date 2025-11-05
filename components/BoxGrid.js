import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { signIn, useSession } from 'next-auth/react'

export default function BoxGrid({ initialBoxes = [], onChange }) {
  const total = 200
  const { data: session } = useSession()
  const [completedSet, setCompletedSet] = useState(new Set(initialBoxes))
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    setCompletedSet(new Set(initialBoxes))
  }, [initialBoxes])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.01,
        delayChildren: 0.2
      }
    }
  }

  const boxVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.8,
      rotateX: -15
    },
    visible: {
      opacity: 1,
      scale: 1,
      rotateX: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20
      }
    },
    hover: {
      scale: 1.05,
      y: -5,
      boxShadow: "0 8px 32px -8px rgba(168, 85, 247, 0.4)",
      transition: { duration: 0.2 }
    },
    tap: {
      scale: 0.95
    }
  }

  async function toggle(i) {
    if (!session) {
      signIn("google")
      return
    }

    const isCompleted = completedSet.has(i)
    // Optimistic update
    const ns = new Set(completedSet)
    if (isCompleted) ns.delete(i)
    else ns.add(i)
    setCompletedSet(ns)

    try {
      // Request notification permission as part of a user gesture
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
        try { await Notification.requestPermission() } catch (e) { /* ignore */ }
      }

      await axios.post('/api/boxes', { index: i, completed: !isCompleted })
    } catch (err) {
      // revert on error
      const revert = new Set(completedSet)
      setCompletedSet(revert)
      console.error(err?.response?.data || err.message)
    }
    onChange && onChange(ns.size, ns)
  }

  if (!mounted) return null

  const completedCount = completedSet.size
  const progress = (completedCount / total) * 100

  return (
    <motion.div
      initial="hidden"
      animate={isLoading ? "hidden" : "visible"}
      variants={containerVariants}
      className="glass-panel p-6 space-y-6"
    >
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Your Progress</h2>
        <div className="progress-bar">
          <motion.div 
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        <div className="flex justify-between text-sm text-slate-300">
          <span>{completedCount} completed</span>
          <span>{total} total</span>
        </div>
      </div>

      <motion.div 
        className="grid-200"
      >
        <AnimatePresence>
          {Array.from({ length: total }, (_, i) => i + 1).map((i) => {
            const done = completedSet.has(i)
            return (
              <motion.button
                key={i}
                variants={boxVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={() => toggle(i)}
                className={`
                  box
                  ${done ? 'completed' : ''}
                `}
              >
                <motion.span
                  initial={false}
                  animate={{ 
                    scale: done ? 1.1 : 1,
                  }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 20 
                  }}
                  className="text-sm md:text-base font-medium"
                  aria-label="amount"
                >
                  1500
                </motion.span>
              </motion.button>
            )
          })}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}