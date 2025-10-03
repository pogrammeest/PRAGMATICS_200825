import { useEffect, useRef } from 'react'

const LandingPage = () => {
  const bgVideoRef = useRef(null)
  const logoVideoRef = useRef(null)
  const maskedVideoRef = useRef(null)

  useEffect(() => {
    document.body.classList.add('landing-body')
    return () => {
      document.body.classList.remove('landing-body')
    }
  }, [])

  useEffect(() => {
    let cleanupLogo = null
    let isMounted = true

    const loadLogoAnimation = async () => {
      try {
        const module = await import('../../logo3d.js')
        if (!isMounted) {
          return
        }

        const initializer = module.initializeLogo3d || module.default
        if (typeof initializer === 'function') {
          cleanupLogo = initializer()
        }
      } catch (error) {
        if (isMounted) {
          console.error('Failed to load logo animation', error)
        }
      }
    }

    loadLogoAnimation()

    return () => {
      isMounted = false
      if (typeof cleanupLogo === 'function') {
        cleanupLogo()
      }
    }
  }, [])

  useEffect(() => {
    const bgVideo = bgVideoRef.current
    const logoVideo = logoVideoRef.current
    const maskedVideo = maskedVideoRef.current

    if (!bgVideo || !logoVideo || !maskedVideo) {
      return undefined
    }

    let bothReady = false

    const trySyncStart = () => {
      if (
        bgVideo.readyState >= 2 &&
        logoVideo.readyState >= 2 &&
        maskedVideo.readyState >= 2 &&
        !bothReady
      ) {
        bothReady = true
        ;[bgVideo, logoVideo, maskedVideo].forEach((video) => {
          video.currentTime = 0
          video.play().catch(() => {})
        })
      }
    }

    const fallbackPlay = setTimeout(() => {
      ;[bgVideo, logoVideo, maskedVideo].forEach((video) => {
        video.play().catch(() => {})
      })
    }, 100)

    const syncLoop = () => {
      ;[bgVideo, logoVideo].forEach((video) => {
        video.currentTime = 0
        video.play().catch(() => {})
      })
    }

    const handleResize = () => {
      if (logoVideo) {
        logoVideo.style.width = '100%'
        logoVideo.style.height = '100%'
      }
    }

    const interval = window.setInterval(() => {
      if (Math.abs(bgVideo.currentTime - logoVideo.currentTime) > 0.1) {
        const avg = (bgVideo.currentTime + logoVideo.currentTime) / 2
        bgVideo.currentTime = avg
        logoVideo.currentTime = avg
      }
    }, 500)

    bgVideo.addEventListener('loadeddata', trySyncStart)
    logoVideo.addEventListener('loadeddata', trySyncStart)
    maskedVideo.addEventListener('loadeddata', trySyncStart)
    bgVideo.addEventListener('ended', syncLoop)
    logoVideo.addEventListener('ended', syncLoop)
    window.addEventListener('resize', handleResize)
    handleResize()

    return () => {
      window.clearTimeout(fallbackPlay)
      window.clearInterval(interval)
      bgVideo.removeEventListener('loadeddata', trySyncStart)
      logoVideo.removeEventListener('loadeddata', trySyncStart)
      maskedVideo.removeEventListener('loadeddata', trySyncStart)
      bgVideo.removeEventListener('ended', syncLoop)
      logoVideo.removeEventListener('ended', syncLoop)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <div className="landing-page">
      <video
        ref={bgVideoRef}
        className="bg-video"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
      >
        <source src="/SOURCE/BG/BG.mp4" type="video/mp4" />
      </video>

      <div className="gradient-mask-container">
        <div className="mask-anim-wrapper">
          <img
            src="/SOURCE/PRAGMATICS%20BIG%20TXT/GRADIENT%20BG%201.png"
            className="gradient-bg-masked"
            alt="Gradient background"
          />
        </div>
      </div>

      <div className="main-bg">
        <video
          ref={maskedVideoRef}
          className="masked-video"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
        >
          <source src="/SOURCE/BG/BG.mp4" type="video/mp4" />
        </video>
      </div>

      <div className="logo-container">
        <video
          ref={logoVideoRef}
          id="logoVideo"
          className="logo-video"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          width="1920"
          height="1080"
        >
          <source src="/SOURCE/Video%20Reel/reel%20mini.mp4" type="video/mp4" />
        </video>
        <canvas id="logo3d" width="1920" height="1080"></canvas>
      </div>
    </div>
  )
}

export default LandingPage
