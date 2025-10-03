const FRAME_COUNT = 21
const MASK_IMAGES = new Array(FRAME_COUNT)
let maskLoadPromise = null

function encodeResourcePath(path) {
  return encodeURI(path)
}

function loadImage(path) {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = encodeResourcePath(path)
  })
}

async function loadMaskImage(index) {
  const num = String(index).padStart(5, '0')
  const primaryPath = `/SOURCE/ELEMENT_3D/ELEMENT 3D_${num}.webp`
  const fallbackPath = `/SOURCE/ELEMENT 3D/ELEMENT 3D_${num}.png`

  try {
    return await loadImage(primaryPath)
  } catch (primaryError) {
    try {
      return await loadImage(fallbackPath)
    } catch (fallbackError) {
      console.error(
        `Ошибка загрузки маски: ${encodeResourcePath(primaryPath)}`,
        primaryError,
        fallbackError
      )
      const emptyCanvas = document.createElement('canvas')
      emptyCanvas.width = 1600
      emptyCanvas.height = 900
      return emptyCanvas
    }
  }
}

function ensureMasksLoaded() {
  if (!maskLoadPromise) {
    maskLoadPromise = Promise.all(
      Array.from({ length: FRAME_COUNT }, (_, index) =>
        loadMaskImage(index).then((img) => {
          MASK_IMAGES[index] = img
          return img
        })
      )
    ).then(() => MASK_IMAGES)
  }

  return maskLoadPromise
}

function createShader(gl, type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Ошибка компиляции шейдера:', gl.getShaderInfoLog(shader))
    throw new Error('Ошибка компиляции шейдера')
  }

  return shader
}

function createTexture(gl) {
  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  return texture
}

function isCanvasFilterSupported() {
  const testCanvas = document.createElement('canvas')
  const ctx = testCanvas.getContext('2d')
  if (!ctx) return false
  ctx.filter = 'blur(2px)'
  return ctx.filter === 'blur(2px)'
}

function drawMaskStretched(maskImg, targetWidth, targetHeight) {
  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = targetWidth
  tempCanvas.height = targetHeight
  const ctx = tempCanvas.getContext('2d')
  if (!ctx) {
    return tempCanvas
  }
  ctx.clearRect(0, 0, targetWidth, targetHeight)
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(maskImg, 0, 0, targetWidth, targetHeight)
  return tempCanvas
}

function initializeLogo3d({ canvasId = 'logo3d', videoId = 'logoVideo' } = {}) {
  const canvas = document.getElementById(canvasId)
  if (!canvas) {
    console.error('Canvas #logo3d не найден!')
    return () => {}
  }

  const video = document.getElementById(videoId)
  if (!video) {
    console.error('Видео #logoVideo не найдено!')
    return () => {}
  }

  let gl =
    canvas.getContext('webgl', {
      alpha: true,
      premultipliedAlpha: true,
      preserveDrawingBuffer: false,
    }) ||
    canvas.getContext('experimental-webgl', {
      alpha: true,
      premultipliedAlpha: true,
      preserveDrawingBuffer: false,
    })

  if (!gl) {
    canvas.style.display = 'none'
    alert(
      'WebGL не поддерживается этим браузером! Попробуйте обновить браузер или использовать Chrome.'
    )
    return () => {}
  }

  canvas.width = 1600
  canvas.height = 900
  gl.viewport(0, 0, canvas.width, canvas.height)
  gl.enable(gl.BLEND)
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

  const vertexShaderSource = `
      attribute vec2 a_position;
      attribute vec2 a_texCoord;
      varying vec2 v_texCoord;

      void main() {
          gl_Position = vec4(a_position, 0.0, 1.0);
          v_texCoord = a_texCoord;
      }
  `

  const fragmentShaderSource = `
      precision mediump float;
      uniform sampler2D u_video;
      uniform sampler2D u_mask;
      uniform sampler2D u_overlay;
      varying vec2 v_texCoord;

      vec3 lightenBlend(vec3 base, vec3 blend, float opacity) {
          return mix(base, max(base, blend), opacity);
      }

      vec3 overlayBlend(vec3 base, vec3 blend, float opacity) {
          vec3 result;
          for(int i = 0; i < 3; i++) {
              if(base[i] < 0.5) {
                  result[i] = 2.0 * base[i] * blend[i];
              } else {
                  result[i] = 1.0 - 2.0 * (1.0 - base[i]) * (1.0 - blend[i]);
              }
          }
          return mix(base, result, opacity);
      }

      void main() {
          vec4 maskColor = texture2D(u_mask, v_texCoord);
          vec4 videoColor = texture2D(u_video, v_texCoord);
          vec4 overlayColor = texture2D(u_overlay, v_texCoord);
          vec3 lightenResult = lightenBlend(videoColor.rgb, maskColor.rgb, 0.25);
          vec3 overlayResult = overlayBlend(lightenResult, overlayColor.rgb, 0.10);
          float a = smoothstep(0.0, 0.9, maskColor.a);
          gl_FragColor = vec4(overlayResult, a);
      }
  `

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)

  const program = gl.createProgram()
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Ошибка линковки программы:', gl.getProgramInfoLog(program))
    throw new Error('Ошибка линковки программы')
  }

  gl.useProgram(program)

  const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1])
  const texCoords = new Float32Array([0, 1, 1, 1, 0, 0, 1, 0])

  const positionBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)

  const texCoordBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW)

  const positionLocation = gl.getAttribLocation(program, 'a_position')
  const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord')
  const videoLocation = gl.getUniformLocation(program, 'u_video')
  const maskLocation = gl.getUniformLocation(program, 'u_mask')
  const overlayLocation = gl.getUniformLocation(program, 'u_overlay')

  const videoTexture = createTexture(gl)
  const maskTexture = createTexture(gl)
  const overlayTexture = createTexture(gl)

  let currentFrame = 0
  let overlayScale = 0.75
  let targetOverlayScale = 0.75
  let videoScale = 0.75
  let targetVideoScale = 0.75
  const canvasFilterSupported = isCanvasFilterSupported()
  let destroyed = false
  let rafId = null
  let waitId = null
  let masksReady = false

  ensureMasksLoaded()
    .then(() => {
      masksReady = true
    })
    .catch((error) => {
      console.error('Ошибка загрузки масок', error)
    })

  const listeners = []
  const addListener = (target, event, handler, options) => {
    target.addEventListener(event, handler, options)
    listeners.push(() => {
      target.removeEventListener(event, handler, options)
    })
  }

  function drawVideoFixed(media, targetWidth, targetHeight) {
    const videoW = media.videoWidth || 1600
    const videoH = media.videoHeight || 900
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = targetWidth
    tempCanvas.height = targetHeight
    const ctx = tempCanvas.getContext('2d')
    if (!ctx) {
      return tempCanvas
    }
    ctx.clearRect(0, 0, targetWidth, targetHeight)

    const minScale = 1.0
    const maxScale = 10.0
    const maxBlur = 50
    const blurValue = Math.max(0, (maxBlur * (videoScale - minScale)) / (maxScale - minScale))

    if (typeof window.blurAnimated === 'undefined' || isNaN(window.blurAnimated)) {
      window.blurAnimated = blurValue
    }

    window.blurAnimated += (blurValue - window.blurAnimated) * 0.08

    if (canvasFilterSupported) {
      ctx.filter = `blur(${window.blurAnimated}px)`
    } else {
      ctx.filter = 'none'
      document.querySelectorAll('.logo-video, .bg-video').forEach((el) => {
        if (Math.round(window.blurAnimated) > 0) {
          el.style.filter = `blur(${Math.round(window.blurAnimated)}px)`
        } else {
          el.style.filter = ''
        }
      })
    }

    const smoothing = 0.15
    videoScale += (targetVideoScale - videoScale) * smoothing
    if (!isFinite(videoScale) || isNaN(videoScale)) videoScale = 1.0
    videoScale = Math.max(0.3, Math.min(videoScale, 4.55))
    const scaledW = videoW * videoScale
    const scaledH = videoH * videoScale
    const offsetX = (targetWidth - scaledW) / 2
    const offsetY = (targetHeight - scaledH) / 2
    ctx.drawImage(media, 0, 0, videoW, videoH, offsetX, offsetY, scaledW, scaledH)
    ctx.filter = 'none'
    return tempCanvas
  }

  function drawOverlayAnimated(overlayImg, targetWidth, targetHeight) {
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = targetWidth
    tempCanvas.height = targetHeight
    const ctx = tempCanvas.getContext('2d')
    if (!ctx || !overlayImg) {
      return tempCanvas
    }

    const smoothing = 0.15
    overlayScale += (targetOverlayScale - overlayScale) * smoothing
    if (!isFinite(overlayScale) || isNaN(overlayScale)) overlayScale = 1.0
    overlayScale = Math.max(0.3, Math.min(overlayScale, 600.0))

    const overlayW = overlayImg.naturalWidth || targetWidth
    const overlayH = overlayImg.naturalHeight || targetHeight
    const scaledW = overlayW * overlayScale
    const scaledH = overlayH * overlayScale
    const offsetX = (targetWidth - scaledW) / 2
    const offsetY = (targetHeight - scaledH) / 2

    ctx.drawImage(overlayImg, 0, 0, overlayW, overlayH, offsetX, offsetY, scaledW, scaledH)
    return tempCanvas
  }

  let overlayImg = null

  function render() {
    if (destroyed) {
      return
    }

    if (!masksReady || video.readyState < 2) {
      rafId = window.requestAnimationFrame(render)
      return
    }

    const fittedVideo = drawVideoFixed(video, canvas.width, canvas.height)
    gl.bindTexture(gl.TEXTURE_2D, videoTexture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, fittedVideo)

    const maskImg = MASK_IMAGES[currentFrame] || MASK_IMAGES.find(Boolean)
    if (!maskImg) {
      rafId = window.requestAnimationFrame(render)
      return
    }

    const fittedMask = drawMaskStretched(maskImg, canvas.width, canvas.height)
    gl.bindTexture(gl.TEXTURE_2D, maskTexture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, fittedMask)

    if (overlayImg && overlayImg.complete) {
      const fittedOverlay = drawOverlayAnimated(overlayImg, canvas.width, canvas.height)
      gl.bindTexture(gl.TEXTURE_2D, overlayTexture)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, fittedOverlay)
    } else {
      gl.bindTexture(gl.TEXTURE_2D, overlayTexture)
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        drawOverlayAnimated(null, canvas.width, canvas.height)
      )
    }

    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.enableVertexAttribArray(positionLocation)
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer)
    gl.enableVertexAttribArray(texCoordLocation)
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0)

    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, videoTexture)
    gl.uniform1i(videoLocation, 0)

    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, maskTexture)
    gl.uniform1i(maskLocation, 1)

    gl.activeTexture(gl.TEXTURE2)
    gl.bindTexture(gl.TEXTURE_2D, overlayTexture)
    gl.uniform1i(overlayLocation, 2)

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

    rafId = window.requestAnimationFrame(render)
  }

  function safeRender() {
    if (destroyed) {
      return
    }

    if (!masksReady || video.readyState < 2) {
      if (waitId === null) {
        waitId = window.requestAnimationFrame(() => {
          waitId = null
          safeRender()
        })
      }
      return
    }

    if (rafId === null) {
      rafId = window.requestAnimationFrame(render)
    }
  }

  function handleFrameChange(e) {
    let x
    if (e.touches && e.touches.length > 0) {
      x = e.touches[0].clientX
    } else {
      x = e.clientX
    }
    const rect = canvas.getBoundingClientRect()
    const percent = Math.max(0, Math.min(1, (x - rect.left) / rect.width))
    currentFrame = Math.floor(percent * (FRAME_COUNT - 1))
  }

  addListener(window, 'mousemove', handleFrameChange)
  addListener(window, 'touchmove', handleFrameChange, { passive: true })
  addListener(video, 'play', safeRender)
  addListener(video, 'loadeddata', safeRender)

  const bgVideo = document.querySelector('.bg-video')
  if (bgVideo) {
    const syncVideos = () => {
      if (destroyed) return
      bgVideo.currentTime = 0
      video.currentTime = 0
      bgVideo.play().catch(() => {})
      video.play().catch(() => {})
    }

    addListener(video, 'ended', syncVideos)
    addListener(bgVideo, 'ended', syncVideos)
    addListener(video, 'timeupdate', () => {
      if (video.duration && video.currentTime > video.duration - 0.05) {
        syncVideos()
      }
    })
    addListener(bgVideo, 'timeupdate', () => {
      if (bgVideo.duration && bgVideo.currentTime > bgVideo.duration - 0.05) {
        syncVideos()
      }
    })
  }

  ;['touchstart', 'click'].forEach((evt) => {
    addListener(window, evt, () => {
      if (video.paused) {
        video.play().catch(() => {})
      }
      if (bgVideo && bgVideo.paused) {
        bgVideo.play().catch(() => {})
      }
    })
  })

  safeRender()

  return () => {
    destroyed = true
    if (rafId !== null) {
      window.cancelAnimationFrame(rafId)
      rafId = null
    }
    if (waitId !== null) {
      window.cancelAnimationFrame(waitId)
      waitId = null
    }
    listeners.forEach((remove) => remove())
    listeners.length = 0
    document.querySelectorAll('.logo-video, .bg-video').forEach((el) => {
      el.style.filter = ''
    })
    const loseContext = gl.getExtension('WEBGL_lose_context')
    if (loseContext) {
      loseContext.loseContext()
    }
    gl = null
  }
}

export { initializeLogo3d }
export default initializeLogo3d
