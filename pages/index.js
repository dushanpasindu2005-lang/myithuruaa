import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import BoxGrid from '../components/BoxGrid';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';

export default function Home(){
  const { data: session, status } = useSession();
  const [boxes, setBoxes] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const router = useRouter();
  const observer = useRef();

  // Protect the page: if unauthenticated, redirect to /login
  useEffect(()=>{
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  },[status, router]);

  // Only fetch boxes once the session is confirmed authenticated
  useEffect(()=>{
    if (status !== 'authenticated') return;
    let cancelled = false;
    (async ()=>{
      try{
        const res = await axios.get('/api/boxes');
        if (cancelled) return;
        setBoxes(res.data.boxes || []);
        setLastUpdate(res.data.lastUpdateDate || null);
        setTotalCount((res.data.boxes||[]).length);
      }catch(err){
        console.error(err);
      }finally{if (!cancelled) setLoading(false)}
    })();
    return ()=>{ cancelled = true };
  },[status]);

  useEffect(()=>{
    // NOTE: We no longer request Notification permission on load because
    // browsers only allow the permission prompt inside a short-running
    // user gesture. Permission is requested when the user clicks a box.
  },[]);

  function handleChange(count, set) {
    setTotalCount(count);
    setBoxes(Array.from(set));
    setLastUpdate(new Date().toDateString());
  }

  useEffect(()=>{
    // daily reminder: show at most one notification per day (if reminders enabled and user hasn't updated today)
    const check = () => {
      if (typeof window === 'undefined' || !('Notification' in window)) return;
      const remindersEnabled = localStorage.getItem('remindersEnabled') === 'true';
      if (!remindersEnabled) return;

      const today = new Date().toDateString();
      const lastShown = localStorage.getItem('lastNotificationShownDate');
      // if we've already shown today, do nothing
      if (lastShown === today) return;

      // Only notify if user hasn't updated today
      if (lastUpdate !== today) {
        if (Notification.permission === 'granted') {
          const icon = session?.user?.image || 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=64&q=60';
          const options = {
            body: 'ඔබ අද 1500 එකක් දැමුවේ නැහැ — දැන්ම 1ක් දාන්න!',
            icon
          };
          try {
            new Notification('💰 අමතක නොකරන්න!', options);
            localStorage.setItem('lastNotificationShownDate', today);
          } catch (e) {
            console.error('Notification error', e);
          }
        }
      } else {
        // user already updated today; mark as shown so we don't remind again
        localStorage.setItem('lastNotificationShownDate', today);
      }
    }

    // Run check on load; we don't need repeated intervals because we show once per day
    try { check(); } catch (e) {}
    return () => {};
  },[lastUpdate, session]);

  // Scroll reveal effect
  useEffect(() => {
    const handleIntersection = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    };

    observer.current = new IntersectionObserver(handleIntersection, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    const hiddenElements = document.querySelectorAll('.reveal');
    hiddenElements.forEach(el => observer.current.observe(el));

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, []);

  const totalAmount = totalCount * 1500;

  // Handle session loading state to avoid redirect loop
  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  // If unauthenticated, the useEffect above will redirect; render nothing meanwhile
  if (status === 'unauthenticated') return null;

  // Authenticated: show the tracker
  return (
    <div className="min-h-screen py-12">
      {/* Hero section with cinematic animation */}
      <motion.div 
        className="text-center mb-16 reveal"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <motion.h1 
          className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-indigo-300 to-purple-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
        >
          💰 1500 × 200 ඉතුරු කිරීමේ Tracker
        </motion.h1>
        
        <motion.p 
          className="text-lg text-slate-300 max-w-2xl mx-auto mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4, ease: "easeOut" }}
        >
          එක එක කොටුව click කරලා "1500" දාලා ඉවර කියලා සලකන්න 😍
        </motion.p>
        
        <motion.div
          className="glass rounded-2xl p-6 max-w-3xl mx-auto mb-12"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.3, ease: "easeOut" }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-violet-400">{totalCount}</div>
              <div className="text-slate-400">Completed</div>
            </div>
            
            <div className="h-12 w-px bg-slate-700 hidden md:block"></div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-400">
                {totalAmount.toLocaleString()}
              </div>
              <div className="text-slate-400">Total Amount (LKR)</div>
            </div>
            
            <div className="h-12 w-px bg-slate-700 hidden md:block"></div>
            
            <div className="text-center">
              <div className="text-xl font-semibold text-slate-200">
                {lastUpdate || '—'}
              </div>
              <div className="text-slate-400">Last Update</div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Progress Summary (card) */}
      <motion.div
        className="mb-12 reveal"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4, ease: 'easeOut' }}
      >
        <div className="progress-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 18, color: '#111827', marginBottom: 6 }}>Your Progress</div>
              <div className="progress-figure">{totalCount} / 200 ({Math.round((totalCount / 200) * 100)}%)</div>
            </div>

            <div style={{ flex: 1, minWidth: 220 }}>
              <div className="progress-bar-outer">
                <motion.div
                  className="progress-bar-inner"
                  initial={{ width: 0 }}
                  animate={{ width: `${(totalCount / 200) * 100}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              </div>
            </div>

            <div style={{ minWidth: 140, textAlign: 'right' }}>
              <div style={{ fontSize: 14, color: 'var(--muted)' }}>Total Amount</div>
              <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{totalAmount.toLocaleString()} LKR</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Boxes grid */}
      <motion.div 
        className="reveal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.4, ease: "easeOut" }}
      >
        <div className="glass rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-6 text-slate-200">Your Savings Journey</h2>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
            </div>
          ) : (
            <BoxGrid initialBoxes={boxes} onChange={handleChange} />
          )}
        </div>
      </motion.div>

      {/* Motivational section */}
      <motion.div 
        className="mt-16 text-center reveal"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.4, ease: "easeOut" }}
      >
        <div className="glass rounded-2xl p-8 max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold mb-4 text-slate-200">Keep Going! 💪</h3>
          <p className="text-slate-300 mb-6">
            Every 1500 LKR you save brings you closer to your financial goals. 
            You've already saved {(totalAmount).toLocaleString()} LKR - that's amazing progress!
          </p>
          <div className="flex justify-center space-x-4">
            <div className="w-3 h-3 rounded-full bg-violet-500 animate-pulse"></div>
            <div className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse delay-150"></div>
            <div className="w-3 h-3 rounded-full bg-purple-500 animate-pulse delay-300"></div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}