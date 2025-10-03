import { useEffect, useId } from 'react'

const Preloader = ({ isClosing = false }) => {
  // делаем id безопасным для url(#id)
  const raw = useId()
  const uid = raw.replace(/[^a-zA-Z0-9_-]/g, '')   // убираем двоеточия и т.п.

  const textId = `${uid}-wordmark`
  const maskId = `${uid}-mask`
  const clipId = `${uid}-clip`

  const RISE_DURATION = 5
  const RISE_DELAY = 0.3
  const WAVE_ONE_START_Y = VB_HEIGHT * 0.56
  const WAVE_ONE_END_Y = VB_HEIGHT * 0.08
  const WAVE_TWO_START_Y = VB_HEIGHT * 0.61
  const WAVE_TWO_END_Y = VB_HEIGHT * 0.12
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

            {/* Альтернативный clipPath — так анимации работают в Safari/Firefox */}
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
          <g
            className="preloader__water-container"
            mask={`url(#${maskId})`}
            clipPath={`url(#${clipId})`}
          >
            <rect
              className="preloader__water-level"
              x="0"
              y={VB_HEIGHT}
              width={VB_WIDTH}
              height={VB_HEIGHT}
            >
              <animate
                attributeName="y"
                values={`${VB_HEIGHT};${VB_HEIGHT * 0.12};0`}
                keyTimes="0;0.6;1"
                dur={`${RISE_DURATION}s`}
                begin={`${RISE_DELAY}s`}
                fill="freeze"
              />
              <animate
                attributeName="height"
                values={`0;${VB_HEIGHT * 0.88};${VB_HEIGHT}`}
                keyTimes="0;0.6;1"
                dur={`${RISE_DURATION}s`}
                begin={`${RISE_DELAY}s`}
                fill="freeze"
              />
            </rect>

            <g className="preloader__wave preloader__wave--one">
              <rect
                x={-VB_WIDTH}
                y={WAVE_ONE_START_Y}        // позиция уровня
                width={VB_WIDTH * 2.2}
                height="80"
                fill={`url(#${waveTileId})`}
              />
              <animate
                attributeName="y"
                values={`${WAVE_ONE_START_Y};${WAVE_ONE_END_Y};${WAVE_ONE_END_Y}`}
                keyTimes="0;0.6;1"
                dur={`${RISE_DURATION}s`}
                begin={`${RISE_DELAY}s`}
                fill="freeze"
              />
            </g>

            <g className="preloader__wave preloader__wave--two">
              <rect
                x={-VB_WIDTH}
                y={WAVE_TWO_START_Y}
                width={VB_WIDTH * 2.2}
                height="80"
                fill={`url(#${waveTileId})`}
              />
              <animate
                attributeName="y"
                values={`${WAVE_TWO_START_Y};${WAVE_TWO_END_Y};${WAVE_TWO_END_Y}`}
                keyTimes="0;0.6;1"
                dur={`${RISE_DURATION}s`}
                begin={`${RISE_DELAY}s`}
                fill="freeze"
              />
            </g>
          </g>
        </svg>
      </div>
    </div>
  )
}

export default Preloader
