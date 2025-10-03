import { useEffect, useId } from 'react'

const Preloader = ({ isClosing = false }) => {
  const uniqueId = useId()
  const patternId = `${uniqueId}-water-pattern`
  const textId = `${uniqueId}-wordmark`
  const maskId = `${uniqueId}-mask`

  useEffect(() => {
    document.body.classList.add('preloader-active')

    return () => {
      document.body.classList.remove('preloader-active')
    }
  }, [])

  return (
    <div className={`preloader${isClosing ? ' preloader--closing' : ''}`}>
      <div className="preloader__inner" role="img" aria-label="PRAGMATICS loading">
        <svg
          className="preloader__svg"
          viewBox="0 0 620 140"
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
        >
          <defs>
            <pattern
              id={patternId}
              width="0.25"
              height="1.1"
              patternContentUnits="objectBoundingBox"
            >
              <path
                fill="#ffffff"
                d="M0.25,1H0c0,0,0-0.659,0-0.916c0.083-0.303,0.158,0.334,0.25,0C0.25,0.327,0.25,1,0.25,1z"
              />
              <animateTransform
                attributeName="patternTransform"
                type="translate"
                from="0 0"
                to="1 0"
                dur="0.8s"
                repeatCount="indefinite"
              />
            </pattern>

            <text
              id={textId}
              x="50%"
              y="104"
              fontFamily="'Cabin Condensed', 'Arial Narrow', sans-serif"
              fontSize="100"
              letterSpacing="8"
              textAnchor="middle"
            >
              PRAGMATICS
            </text>

            <mask id={maskId}>
              <use xlinkHref={`#${textId}`} fill="#ffffff" />
            </mask>
          </defs>

          <use
            className="preloader__svg-outline"
            xlinkHref={`#${textId}`}
          />

          <g className="preloader__water-container" mask={`url(#${maskId})`}>
            <rect
              className="preloader__water"
              x="-620"
              y="-20"
              width="1240"
              height="180"
              fill={`url(#${patternId})`}
            />
          </g>
        </svg>
      </div>
    </div>
  )
}

export default Preloader
