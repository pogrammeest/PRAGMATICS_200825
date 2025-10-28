import { useEffect, useId } from 'react'

/**
 * Настройки (все опциональны):
 * waveDuration  — скорость волны по X (сек)
 * waveShift     — длина «тайла» волны (px) — совпадает с CSS --wave-shift
 * waveAmplitude — амплитуда (px)
 * level         — базовый уровень волны (0..1) относительно высоты SVG
 * riseDuration  — длительность подъёма (сек)
 * riseDelay     — задержка старта подъёма (сек)
 * overlap       — нахлёст тайлов (px), чтобы не было швов
 */
const Preloader = ({
  isClosing = false,
  waveDuration = 3,
  waveShift = 360,
  waveAmplitude = 50,
  level = 0.60,
  riseDuration = 5,
  riseDelay = 0,
  overlap = 2,
}) => {
  const raw = useId()
  const uid = raw.replace(/[^a-zA-Z0-9_-]/g, '')

  const textId     = `${uid}-wordmark`
  const maskId     = `${uid}-mask`
  const symWaveId  = `${uid}-sym-wave`

  // размеры SVG
  const VB_WIDTH  = 900
  const VB_HEIGHT = 120

  // параметры «тайла» волны
  const TILE = Math.max(80, Math.round(waveShift))
  const STEP = Math.max(1, TILE - Math.round(overlap))   // маленький нахлёст → без швов
  const AMP  = Math.max(1, Math.round(waveAmplitude))

  // высота тайла: 2*амплитуда + запас (минимум 100)
  const TILE_HEIGHT = Math.max(100, AMP * 2 + 230)
  const MID = TILE_HEIGHT / 2

  // ЗАКРЫТЫЙ путь (заливка под волной)
  const wavePathD = `
    M0,${MID}
    C ${TILE/6},${MID-AMP} ${TILE/3},${MID-AMP} ${TILE/2},${MID}
      S ${TILE*5/6},${MID+AMP} ${TILE},${MID}
    L ${TILE},${TILE_HEIGHT}
    L 0,${TILE_HEIGHT}
    Z
  `

  // полоса из повторов одного symbol с нахлёстом
  const makeStrip = (baselineY) => {
    // размещаем symbol так, чтобы его «MID» совпал с baseline
    const yTop = baselineY - MID
    const span   = VB_WIDTH * 3.2
    const count  = Math.ceil(span / STEP) + 4
    const startX = -TILE * 2
    return Array.from({ length: count }, (_, i) => (
      <use
        key={`tile-${i}`}
        href={`#${symWaveId}`}
        x={startX + i * STEP}
        y={yTop}
        width={TILE}
        height={TILE_HEIGHT}
      />
    ))
  }

  useEffect(() => {
    document.body.classList.add('preloader-active')
    return () => document.body.classList.remove('preloader-active')
  }, [])

  const baseline = VB_HEIGHT * level

  return (
    <div className={`preloader${isClosing ? ' preloader--closing' : ''}`}>
      <div
        className="preloader__inner"
        role="img"
        aria-label="PRAGMATICS loading"
        style={{
          '--wave-duration': `${waveDuration}s`,
          '--wave-shift': `${TILE}px`,
        }}
      >
        <svg
          className="preloader__svg"
          viewBox={`0 0 ${VB_WIDTH} ${VB_HEIGHT}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Текст → маска */}
            <text
              id={textId}
              x="50%"
              y="112"
              fontFamily="Arial, Helvetica, sans-serif"
              fontSize="120"
              fontWeight="700"
              letterSpacing="6"
              textAnchor="middle"
            >
              PRAGMATICS
            </text>

            <mask
              id={maskId}
              x="0" y="0"
              width={VB_WIDTH} height={VB_HEIGHT}
              maskUnits="userSpaceOnUse"
              maskContentUnits="userSpaceOnUse"
            >
              <rect width={VB_WIDTH} height={VB_HEIGHT} fill="#000" />
              <use href={`#${textId}`} fill="#fff" />
            </mask>

            {/* ОДНА волна с ЗАЛИВКОЙ снизу */}
            <symbol id={symWaveId} viewBox={`0 0 ${TILE} ${TILE_HEIGHT}`} preserveAspectRatio="none">
              <path d={wavePathD} fill="#fff" stroke="none" />
            </symbol>
          </defs>

          {/* Контур текста для читаемости */}
          <use className="preloader__svg-outline" href={`#${textId}`} />

          {/* Вода — только внутри букв */}
          <g className="preloader__water-container" mask={`url(#${maskId})`}>
            {/* Поднимаемая группа. Старт ниже текста → вначале не видно */}
            <g className="preloader__rise" transform={`translate(0 ${VB_HEIGHT})`}>
              {/* опорный bbox на весь SVG */}
              <rect x="0" y="0" width={VB_WIDTH} height={VB_HEIGHT} fill="transparent" />

              {/* Непрерывная полоса волны с ЗАЛИВКОЙ под ней */}
              <g className="preloader__wave preloader__wave--one">
                {makeStrip(baseline)}
              </g>

              {/* Подъём всей воды: низ → выше верха (в конце 100% залито) */}
              <animateTransform
                attributeName="transform"
                type="translate"
                from={`0 ${VB_HEIGHT}`}
                to={`0 ${-VB_HEIGHT}`}
                dur={`${riseDuration}s`}
                begin={`${riseDelay}s`}
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
