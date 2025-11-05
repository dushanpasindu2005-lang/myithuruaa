import '../styles/globals.css'
import '../styles/tailwind.css'
import '../styles/modern.css'
import Layout from '../components/Layout'
import { SessionProvider } from 'next-auth/react'
import { AnimatePresence } from 'framer-motion'

export default function MyApp({ Component, pageProps }) {
  const { session, ...rest } = pageProps || {};
  return (
    <SessionProvider session={session}>
      <AnimatePresence mode="wait">
        <Layout>
          <Component {...rest} />
        </Layout>
      </AnimatePresence>
    </SessionProvider>
  )
}