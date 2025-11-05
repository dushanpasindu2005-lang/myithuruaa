import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { signIn, useSession } from 'next-auth/react';

export default function Login() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // If already authenticated, redirect to home
  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/');
    }
  }, [status, router]);
  
  // Show loading while session is being checked
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-indigo-950">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  // Show sign-in UI only when unauthenticated
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
        <div className="container" style={{ maxWidth: 480 }}>
          <motion.div
            className="progress-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <div style={{ textAlign: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>Welcome back</div>
              <div style={{ color: 'var(--muted)', marginTop: 6 }}>Sign in to continue your savings journey</div>
            </div>

            <div style={{ marginTop: 8, marginBottom: 8 }}>
              <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 13, marginBottom: 10 }}>Continue with</div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => signIn('google', { callbackUrl: typeof window !== 'undefined' ? window.location.origin + '/' : '/' })}
                className="btn"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%' }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" width="20" height="20" aria-hidden>
                  <path fill="currentColor" d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" />
                </svg>
                <span style={{ fontWeight: 700 }}>Sign in with Google</span>
              </motion.button>
            </div>

            <div style={{ marginTop: 12, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
              By signing in, you agree to our Terms of Service and Privacy Policy
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  // If authenticated, component is null because useEffect will redirect
  return null;
}