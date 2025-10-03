import { useEffect, useId } from 'react'

const Preloader = ({ isClosing = false }) => {
  // делаем id безопасным для url(#id)
  const raw = useId()
  const uid = raw.replace(/[^a-zA-Z0-9_-]/g, '')   // убираем двоеточия и т.п.

  const textId = `${uid}-wordmark`
  const maskId = `${uid}-mask`
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
            {/* Текст — только для маски */}
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

            {/* Маска: белое видно */}
            <mask
              id={maskId}
              maskUnits="userSpaceOnUse"
              maskContentUnits="userSpaceOnUse"
              x="0"
              y="0"
              width={VB_WIDTH}
              height={VB_HEIGHT}
            >
              <rect width={VB_WIDTH} height={VB_HEIGHT} fill="#000" />
              <use href={`#${textId}`} fill="#fff" />
            </mask>

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

          <g className="preloader__water-container" mask={`url(#${maskId})`}>
            {/* Поднимаемая группа: сразу ставим ниже текста */}
            <g className="preloader__rise" transform={`translate(0 ${VB_HEIGHT})`}>
              <rect x="0" y="0" width={VB_WIDTH} height={VB_HEIGHT} fill="transparent" />

              {/* базовая заливка снизу (необязательно) */}
              <rect x="0" y={VB_HEIGHT * 0.62} width={VB_WIDTH} height={VB_HEIGHT} fill="#fff" opacity="0.95" />

              {/* волны */}
              <g className="preloader__wave preloader__wave--one">
                <rect x={-VB_WIDTH} y={VB_HEIGHT * 0.56} width={VB_WIDTH * 2.4} height="80" fill={`url(#${waveTileId})`} />
              </g>
              <g className="preloader__wave preloader__wave--two">
                <rect x={-VB_WIDTH} y={VB_HEIGHT * 0.60} width={VB_WIDTH * 2.4} height="80" fill={`url(#${waveTileId})`} />
              </g>

              {/* Анимация подъёма: из той же стартовой позиции */}
              <animateTransform
                attributeName="transform"
                type="translate"
                from={`0 ${VB_HEIGHT}`}
                to={`0 ${-VB_HEIGHT}`}
                dur="5s"
                begin="0s"      /* старт сразу */
                fill="freeze"
                calcMode="linear"
              />
            </g>
          </g>



        </svg>
      </div>
    </div>
  )
}

export default Preloader
