import { useEffect, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import LandingPage from './components/LandingPage'
import AboutPage from './components/AboutPage'
import Navigation from './components/Navigation'
import Preloader from './components/Preloader'

const PageTransition = ({ children }) => (
  <motion.div
    className="page-transition"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.6, ease: 'easeInOut' }}
  >
    {children}
  </motion.div>
)

const App = () => {
  const location = useLocation()
  const [isLoading, setIsLoading] = useState(true)
  const [isPreloaderVisible, setIsPreloaderVisible] = useState(true)

  useEffect(() => {
    const t = window.setTimeout(() => setIsLoading(false), 4_000)
    return () => window.clearTimeout(t)
  }, [])

  // плавное скрытие прелоадера после isLoading=false
  useEffect(() => {
    let timeoutId
    if (!isLoading) {
      timeoutId = window.setTimeout(() => setIsPreloaderVisible(false), 800)
    }
    return () => timeoutId && window.clearTimeout(timeoutId)
  }, [isLoading])

  return (
    <>
      {isPreloaderVisible && <Preloader isClosing={!isLoading} />}
      <div className={`app-shell${isLoading ? ' app-shell--hidden' : ''}`}>
        <Navigation />
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
            <Route path="/about" element={<PageTransition><AboutPage /></PageTransition>} />
          </Routes>
        </AnimatePresence>
      </div>
    </>
  )
}

export default App
