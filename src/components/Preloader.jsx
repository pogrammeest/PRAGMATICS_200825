import { useEffect, useId } from 'react'

const Preloader = ({ isClosing = false }) => {
  // делаем id безопасным для url(#id)
  const raw = useId()
  const uid = raw.replace(/[^a-zA-Z0-9_-]/g, '')   // убираем двоеточия и т.п.

  const textId = `${uid}-wordmark`
  const clipId = `${uid}-clip`
  const waveTileId = `${uid}-wave-tile`

  // размеры в одном месте (чтобы не забыть поменять в нескольких тегах)
  const VB_WIDTH = 900
  const VB_HEIGHT = 160

  useEffect(() => {
    document.body.classList.add('preloader-active')
    return () => document.body.classList.remove('preloader-active')
  }, [])

  return (
    <div className={`preloader${isClosing ? ' preloader--closing' : ''}`}>
      <div className="preloader__inner" role="img" aria-label="PRAGMATICS loading">
        <svg
          className="preloader__svg"
          viewBox={`0 0 ${VB_WIDTH} ${VB_HEIGHT}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Текст — база для clipPath и обводки */}
            <text
              id={textId}
              x="50%"
              y="112"                        /* подогнано под VB_HEIGHT=160 */
              fontFamily="Arial, Helvetica, sans-serif"
              fontSize="120"
              fontWeight="700"
              letterSpacing="6"
              textAnchor="middle"
            >
              PRAGMATICS
            </text>

            {/* Ограничиваем область заливки по контуру текста */}
            <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
              <use href={`#${textId}`} />
            </clipPath>

            {/* Тайловая волна (userSpaceOnUse!) */}
            <pattern id={waveTileId} width="160" height="60" patternUnits="userSpaceOnUse">
              <path
                d="
                  M0,30
                  c20,-10 40,-10 60,0
                  c20,10  40,10  60,0
                  c20,-10 40,-10 60,0
                  V60 H0 Z
                "
                fill="#fff"
              />
            </pattern>
          </defs>

          {/* Контур текста для читабельности */}
          <use className="preloader__svg-outline" href={`#${textId}`} />

          {/* Вода видна только внутри текста */}
          <g className="preloader__water-container" clipPath={`url(#${clipId})`}>
            <rect
              className="preloader__fill"
              x="0"
              y={VB_HEIGHT * 0.55}
              width={VB_WIDTH}
              height={VB_HEIGHT * 0.45}
              fill="#fff"
            />

            <rect
              className="preloader__wave preloader__wave--one"
              x={-VB_WIDTH}
              y={VB_HEIGHT * 0.56}
              width={VB_WIDTH * 2.2}
              height="80"
              fill={`url(#${waveTileId})`}
            />

            <rect
              className="preloader__wave preloader__wave--two"
              x={-VB_WIDTH}
              y={VB_HEIGHT * 0.61}
              width={VB_WIDTH * 2.2}
              height="80"
              fill={`url(#${waveTileId})`}
            />
          </g>
        </svg>
      </div>
    </div>
  )
}

export default Preloader
