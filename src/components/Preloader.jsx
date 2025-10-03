import { useEffect } from 'react'

const Preloader = ({ isClosing = false }) => {
  useEffect(() => {
    document.body.classList.add('preloader-active')

    return () => {
      document.body.classList.remove('preloader-active')
    }
  }, [])

  return (
    <div className={`preloader${isClosing ? ' preloader--closing' : ''}`}>
      <div className="preloader__inner">
        <span className="preloader__text preloader__text--base">PRAGMATICS</span>
        <span
          className="preloader__text preloader__text--fill"
          aria-hidden="true"
        >
          PRAGMATICS
        </span>
      </div>
    </div>
  )
}

export default Preloader
