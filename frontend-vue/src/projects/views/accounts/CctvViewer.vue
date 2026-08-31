<template>
  <div class="cctv-viewer-page">
    <div class="viewer-header mb-4">
      <div>
        <div class="text-muted">{{ $t('cctvViewer.directoryCctv') }}</div>
        <h1>{{ $t('cctvViewer.title') }}</h1>
        <p class="text-muted">{{ cameraName || $t('cctvViewer.noCamera') }} | {{ streamStatus }}</p>
      </div>
      <button class="btn btn-secondary" type="button" @click="closeWindow">{{ $t('cctvViewer.closeWindow') }}</button>
    </div>

    <div class="viewer-status mb-3">
      <span :class="['status-pill', statusClass]">{{ statusLabel }}</span>
    </div>

    <div class="viewer-grid">
      <div class="viewer-frame" ref="viewerWrapper">
        <img
          v-if="streamSrc"
          ref="streamImage"
          :src="streamSrc"
          crossorigin="anonymous"
          @load="onImageLoad"
          @error="onStreamError"
          class="stream-image"
          style="filter: brightness(1.4) contrast(1.2) saturate(1.1);"
          alt="CCTV Stream"
        />
        <canvas ref="overlayCanvas" class="overlay-canvas"></canvas>
        <canvas ref="preprocessCanvas" class="d-none"></canvas>
        <div v-if="!streamSrc" class="stream-placeholder">{{ $t('cctvViewer.noStreamLink') }}</div>
        <div v-if="streamError" class="stream-error">{{ streamError }}</div>
      </div>

      <div class="viewer-panel">
        <div class="panel-card">
          <h3>{{ $t('cctvViewer.status.title') }}</h3>
          <div class="panel-row">
            <span class="panel-label">{{ $t('cctvViewer.status.lastChecked') }}</span>
            <strong class="panel-value">{{ currentStableName !== 'unknown' ? currentStableName : $t('cctvViewer.status.noName') }}</strong>
          </div>
          <div class="panel-row">
            <span class="panel-label">{{ $t('cctvViewer.status.faceResult') }}</span>
            <span class="panel-value">{{ matchLabel || $t('cctvViewer.status.noFace') }}</span>
          </div>
          <div class="panel-row">
            <span class="panel-label">{{ $t('cctvViewer.status.aiStatus') }}</span>
            <span class="panel-value">{{ aiStatusText }}</span>
          </div>
          <div class="panel-row" v-if="streamSrc">
            <span class="panel-label">{{ $t('cctvViewer.status.streamUrl') }}</span>
            <span class="panel-value small-text">{{ streamSrc }}</span>
          </div>
        </div>

        <div class="panel-card">
          <h3>{{ $t('cctvViewer.history.title') }}</h3>
          <div v-if="recentRecognitions.length" class="history-list-container">
            <div
              class="history-item"
              v-for="(entry, index) in recentRecognitions"
              :key="`history-${index}`"
              @click="openDetails(entry)"
              style="cursor: pointer;"
              :title="$t('cctvViewer.history.clickDetail')"
            >
              <span class="history-index">{{ index + 1 }}</span>
              <div>
                <div class="history-name text-primary">{{ entry.name }} <small v-if="entry.studentName">({{ entry.studentName }})</small></div>
                <div v-if="entry.school" class="history-school text-muted font-size-sm">{{ entry.school }}</div>
                <div class="history-time">{{ entry.time }}</div>
              </div>
            </div>
          </div>
          <div v-else class="text-muted">{{ $t('cctvViewer.history.empty') }}</div>
        </div>

        <div class="panel-card mt-3">
          <h3>{{ $t('cctvViewer.uniqueToday.title') }}</h3>
          <div v-if="todayUniqueCheckIns.length" class="unique-list-container">
            <div
              class="history-item"
              v-for="(entry, index) in todayUniqueCheckIns"
              :key="`unique-${entry.name}`"
              @click="openDetails(entry)"
              style="cursor: pointer;"
              :title="$t('cctvViewer.history.clickDetail')"
            >
              <span class="history-index unique-index">{{ index + 1 }}</span>
              <div>
                <div class="history-name text-success">{{ entry.name }} <small v-if="entry.studentName">({{ entry.studentName }})</small></div>
                <div v-if="entry.school" class="history-school text-muted font-size-sm">{{ entry.school }}</div>
                <div class="history-time">{{ $t('cctvViewer.history.lastCheckIn') }} {{ entry.time }}</div>
              </div>
            </div>
          </div>
          <div v-else class="text-muted">{{ $t('cctvViewer.uniqueToday.empty') }}</div>
        </div>
      </div>
    </div>

    <div class="viewer-info mt-3">
      <div><strong>{{ $t('cctvViewer.info.streamLink') }}</strong> {{ streamSrc || '-' }}</div>
      <div><strong>{{ $t('cctvViewer.info.aiLevel') }}</strong> {{ aiStatusText }}</div>
      <div v-if="matchLabel"><strong>{{ $t('cctvViewer.info.faceResult') }}</strong> {{ matchLabel }}</div>
    </div>

    <!-- Details Modal -->
    <CModal
      :title="$t('cctvViewer.modal.title')"
      color="info"
      :show.sync="showDetailsModal"
    >
      <div v-if="selectedPerson">
        <div class="mb-2"><strong>{{ $t('cctvViewer.modal.studentId') }}</strong> {{ selectedPerson.name }}</div>
        <div class="mb-2"><strong>{{ $t('cctvViewer.modal.fullName') }}</strong> {{ selectedPerson.studentName || '-' }}</div>
        <div class="mb-2"><strong>{{ $t('cctvViewer.modal.school') }}</strong> {{ selectedPerson.school || '-' }}</div>
        <div class="mb-2"><strong>{{ $t('cctvViewer.modal.program') }}</strong> {{ selectedPerson.program || '-' }}</div>
        <div class="mb-2"><strong>{{ $t('cctvViewer.modal.section') }}</strong> {{ selectedPerson.section || '-' }}</div>
        <div class="mb-2"><strong>{{ $t('cctvViewer.modal.camera') }}</strong> {{ selectedPerson.cameraName || cameraName || '-' }}</div>
        <div class="mb-2"><strong>{{ $t('cctvViewer.modal.checkInTime') }}</strong> {{ selectedPerson.time }}</div>
      </div>
      <template #footer>
        <CButton color="secondary" @click="showDetailsModal = false">{{ $t('cctvViewer.modal.close') }}</CButton>
      </template>
    </CModal>
  </div>
</template>

<script>
import api from '@/service/api'
import { notifyError } from '@/projects/utils/notify'

function normalizeBaseUrl (url) {
  return String(url || '').replace(/\/+$/, '')
}

const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || (typeof window !== 'undefined' && window.location && window.location.hostname ? `http://${window.location.hostname}:8082` : 'http://127.0.0.1:8097')
const CCTV_SERVICE_HOST = normalizeBaseUrl(process.env.VUE_APP_CCTV_SERVICE_HOST || API_BASE_URL)

export default {
  name: 'CctvViewer',
  data () {
    return {
      cameraName: '',
      rtspUrl: '',
      isAiReady: false,
      currentStatus: '',
      streamLoaded: false,
      streamError: '',
      overlayCanvas: null,
      preprocessCanvas: null,
      detectionTimer: null,
      faceMatcher: null,
      matchLabel: null,
      knownFacesLoaded: false,
      knownFacesMeta: {},
      faceHistory: [],
      recognitionHistory: [],
      currentStableName: '',
      lastStableUpdateTime: 0,
      stableLockDuration: 2500, // ล็อกชื่อไว้อย่างน้อย 2.5 วินาที
      showDetailsModal: false,
      selectedPerson: null
    }
  },
  computed: {
    streamSrc () {
      if (!this.cameraName) {
        return ''
      }
      return `${CCTV_SERVICE_HOST}/api/v1/cctv/stream-proxy?camera=${encodeURIComponent(this.cameraName)}`
    },
    statusLabel () {
      return this.currentStatus
    },
    statusClass () {
      if (!this.isAiReady) return 'loading'
      if (this.streamError) return 'error'
      if (this.matchLabel) return 'match'
      return 'ready'
    },
    streamStatus () {
      if (this.streamError) return this.streamError
      if (!this.rtspUrl) return this.$t('cctvViewer.detection.noStream')
      return this.$t('cctvViewer.detection.connecting')
    },
    aiStatusText () {
      return this.isAiReady ? this.$t('cctvViewer.status.aiReady') : this.$t('cctvViewer.status.aiLoading')
    },
    recentRecognitions () {
      return this.recognitionHistory.slice(0, 100)
    },
    todayUniqueCheckIns () {
      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)
      
      const todayEnd = new Date()
      todayEnd.setHours(23, 59, 59, 999)
      
      const uniqueMap = {}
      this.recognitionHistory.forEach(item => {
        if (!item.rawDate) return
        const d = new Date(item.rawDate)
        if (d >= todayStart && d <= todayEnd) {
          if (!uniqueMap[item.name]) {
            uniqueMap[item.name] = item
          }
        }
      })
      return Object.values(uniqueMap)
    }
  },
    mounted () {
    this.cameraName = this.$route.query.name || ''
    this.rtspUrl = this.$route.query.rtsp || ''
    this.currentStatus = this.$t('cctvViewer.detection.preparing')
    this.currentStableName = this.$t('cctvViewer.detection.scanning')
    this.initFaceApi()
  },
  methods: {
    closeWindow () {
      window.close()
    },
        async initFaceApi () {
      try {
        if (!window.faceapi) {
          this.currentStatus = this.$t('cctvViewer.detection.waitingFaceApi')
          return
        }
        this.currentStatus = this.$t('cctvViewer.detection.loadingModel')
        await this.loadHighAccuracyModels()
        this.isAiReady = true
        this.currentStatus = this.$t('cctvViewer.detection.modelReady')
        await this.loadKnownFaces()
        await this.loadHistory()
      } catch (error) {
        console.error('initFaceApi error:', error)
        this.currentStatus = this.$t('cctvViewer.detection.modelError')
        notifyError(this.$store, error && error.message ? error.message : this.$t('cctvViewer.detection.modelError'))
      }
    },
    async loadHighAccuracyModels () {
      console.log('Starting model loading from /models...');
      try {
        console.log('1/3. Loading ssdMobilenetv1...');
        await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
        console.log('ssdMobilenetv1 loaded successfully.');
      } catch (err) {
        console.error('Failed to load ssdMobilenetv1:', err);
        throw new Error('ssdMobilenetv1 load failed: ' + err.message);
      }

      try {
        console.log('2/3. Loading faceLandmark68Net...');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
        console.log('faceLandmark68Net loaded successfully.');
      } catch (err) {
        console.error('Failed to load faceLandmark68Net:', err);
        throw new Error('faceLandmark68Net load failed: ' + err.message);
      }

      try {
        console.log('3/3. Loading faceRecognitionNet...');
        await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
        console.log('faceRecognitionNet loaded successfully.');
      } catch (err) {
        console.error('Failed to load faceRecognitionNet:', err);
        throw new Error('faceRecognitionNet load failed: ' + err.message);
      }
      console.log('All models loaded successfully.');
    },
        getFaceDetectionOptions () {
      return new faceapi.SsdMobilenetv1Options({ minConfidence: 0.15, maxResults: 6 })
    },
    async loadKnownFaces () {
      try {
        const response = await api.attendance('faces')
        if (response && response.data && response.data.success) {
          const faces = Array.isArray(response.data.faces) ? response.data.faces : []
          const labeledDescriptors = []
          this.knownFacesMeta = {} // Map studentId to { studentName, school, program }

          for (const item of faces) {
            const studentId = String(item.studentId || item.id || 'unknown')
            this.knownFacesMeta[studentId] = {
              studentName: item.studentName || '',
              school: item.school || '',
              program: item.program || '',
              section: item.section || ''
            }

            const features = item.faceFeatures
            let descriptorList = []
            if (Array.isArray(features)) {
              if (features.length && Array.isArray(features[0])) {
                descriptorList = features.map(f => new Float32Array(f))
              } else {
                descriptorList = [new Float32Array(features)]
              }
            } else if (typeof features === 'string') {
              if (features.startsWith('data:image')) {
                const descriptor = await this.extractDescriptorFromDataUrl(features)
                if (descriptor) {
                  descriptorList = [new Float32Array(Array.from(descriptor))]
                }
              } else {
                try {
                  const parsed = JSON.parse(features)
                  if (Array.isArray(parsed)) {
                    if (parsed.length && Array.isArray(parsed[0])) {
                      descriptorList = parsed.map(p => new Float32Array(p))
                    } else {
                      descriptorList = [new Float32Array(parsed)]
                    }
                  }
                } catch (parseError) {
                  console.warn('ไม่สามารถแปลง faceFeatures จาก DB ได้', parseError)
                }
              }
            }
            if (descriptorList.length) {
              labeledDescriptors.push(new faceapi.LabeledFaceDescriptors(
                studentId,
                descriptorList
              ))
            }
          }
          if (labeledDescriptors.length > 0) {
            this.faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.50)
            this.knownFacesLoaded = true
            this.currentStatus = this.$t('cctvViewer.detection.aiReadyWithFaces', { count: labeledDescriptors.length })
          } else {
            this.faceMatcher = null
            this.currentStatus = this.$t('cctvViewer.detection.aiReadyNoFaces')
          }
        }
      } catch (error) {
        console.error('loadKnownFaces error:', error)
      }
    },
    async loadHistory () {
      try {
        const response = await api.attendance('history?limit=200')
        if (response && response.data && response.data.success) {
          const history = response.data.history || []
          this.recognitionHistory = history.map(item => ({
            name: item.studentId,
            studentName: item.studentName || '',
            school: item.school || '',
            program: item.program || '',
            section: item.section || '',
            cameraName: item.cameraName || this.cameraName,
            time: new Date(item.checkedInAt).toLocaleString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
            rawDate: item.checkedInAt
          }))
        }
      } catch (error) {
        console.error('loadHistory error:', error)
      }
    },
    async extractDescriptorFromDataUrl (dataUrl) {
      try {
        const image = new Image()
        image.crossOrigin = 'anonymous'
        image.src = dataUrl
        await image.decode()
        const result = await faceapi
          .detectSingleFace(image, this.getFaceDetectionOptions())
          .withFaceLandmarks()
          .withFaceDescriptor()
        return result ? result.descriptor : null
      } catch (error) {
        console.warn('ไม่สามารถสร้าง descriptor จาก dataUrl ได้', error)
        return null
      }
    },
    onImageLoad () {
      this.streamLoaded = true
      this.streamError = ''
      if (!this.isAiReady) {
        return
      }
      this.overlayCanvas = this.$refs.overlayCanvas
      this.preprocessCanvas = this.$refs.preprocessCanvas
      this.resizeOverlayCanvas()
      this.resizePreprocessCanvas()
      this.currentStatus = this.$t('cctvViewer.detection.starting')
      this.startFaceDetectionLoop()
    },
    onStreamError (event) {
      this.streamError = this.$t('cctvViewer.detection.streamError')
      this.currentStatus = this.$t('cctvViewer.detection.cameraError')
      this.stopFaceDetectionLoop()
    },
    createOverlayCanvas () {
      if (!this.overlayCanvas) {
        this.overlayCanvas = this.$refs.overlayCanvas
      }
    },
    resizeOverlayCanvas () {
      const img = this.$refs.streamImage
      if (!this.overlayCanvas || !img) {
        return
      }
      const width = img.naturalWidth || img.clientWidth
      const height = img.naturalHeight || img.clientHeight
      this.overlayCanvas.width = width
      this.overlayCanvas.height = height
      this.overlayCanvas.style.width = `${img.clientWidth}px`
      this.overlayCanvas.style.height = `${img.clientHeight}px`
    },
    resizePreprocessCanvas () {
      const img = this.$refs.streamImage
      if (!this.preprocessCanvas || !img) {
        return
      }
      const width = img.naturalWidth || img.clientWidth
      const height = img.naturalHeight || img.clientHeight
      this.preprocessCanvas.width = width
      this.preprocessCanvas.height = height
    },
        startFaceDetectionLoop () {
      this.stopFaceDetectionLoop()
      this.detectionTimer = setInterval(() => {
        this.detectFaceFrame().catch(error => {
          console.error('Face detection error:', error)
        })
      }, 60)
    },
    stopFaceDetectionLoop () {
      if (this.detectionTimer) {
        clearInterval(this.detectionTimer)
        this.detectionTimer = null
      }
      if (this.overlayCanvas && this.overlayCanvas.getContext) {
        const ctx = this.overlayCanvas.getContext('2d')
        ctx.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height)
      }
    },
        async detectFaceFrame () {
          const img = this.$refs.streamImage
          if (!img || !this.overlayCanvas || !this.preprocessCanvas || !this.isAiReady || !window.faceapi || img.naturalWidth === 0) {
            return
          }
          
          this.resizeOverlayCanvas()
          this.resizePreprocessCanvas()

          // Pass img directly to faceapi instead of the pre-processed canvas
          // to avoid drawing/scaling issues with MJPEG streams on intermediate canvases
          const detections = await faceapi
            .detectAllFaces(img, this.getFaceDetectionOptions())
            .withFaceLandmarks()
            .withFaceDescriptors()

          const validDetections = detections.filter(d => d.detection && d.detection.score >= 0.20)
      
          const displaySize = { width: img.clientWidth, height: img.clientHeight }
          faceapi.matchDimensions(this.overlayCanvas, displaySize)
          const resizedDetections = faceapi.resizeResults(validDetections, displaySize)
      
          const overlayCtx = this.overlayCanvas.getContext('2d')
          overlayCtx.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height)

          // Draw bounding boxes with name labels for each detected face
          resizedDetections.forEach((rd, idx) => {
            const box = rd.detection.box
            let label = 'ไม่รู้จัก'
            let boxColor = 'rgba(239, 68, 68, 0.85)' // red for unknown
            let bgColor = 'rgba(239, 68, 68, 0.75)'

            if (this.faceMatcher && validDetections[idx]) {
              const bestMatch = this.faceMatcher.findBestMatch(validDetections[idx].descriptor)
              if (bestMatch && bestMatch.label && bestMatch.label !== 'unknown') {
                label = bestMatch.label
                boxColor = 'rgba(34, 197, 94, 0.9)' // green for recognized
                bgColor = 'rgba(34, 197, 94, 0.8)'
              }
            }

            // Draw bounding box
            overlayCtx.strokeStyle = boxColor
            overlayCtx.lineWidth = 3
            overlayCtx.strokeRect(box.x, box.y, box.width, box.height)

            // Draw corner accents for a modern look
            const cornerLen = Math.min(20, box.width * 0.2, box.height * 0.2)
            overlayCtx.lineWidth = 4
            // Top-left
            overlayCtx.beginPath()
            overlayCtx.moveTo(box.x, box.y + cornerLen)
            overlayCtx.lineTo(box.x, box.y)
            overlayCtx.lineTo(box.x + cornerLen, box.y)
            overlayCtx.stroke()
            // Top-right
            overlayCtx.beginPath()
            overlayCtx.moveTo(box.x + box.width - cornerLen, box.y)
            overlayCtx.lineTo(box.x + box.width, box.y)
            overlayCtx.lineTo(box.x + box.width, box.y + cornerLen)
            overlayCtx.stroke()
            // Bottom-left
            overlayCtx.beginPath()
            overlayCtx.moveTo(box.x, box.y + box.height - cornerLen)
            overlayCtx.lineTo(box.x, box.y + box.height)
            overlayCtx.lineTo(box.x + cornerLen, box.y + box.height)
            overlayCtx.stroke()
            // Bottom-right
            overlayCtx.beginPath()
            overlayCtx.moveTo(box.x + box.width - cornerLen, box.y + box.height)
            overlayCtx.lineTo(box.x + box.width, box.y + box.height)
            overlayCtx.lineTo(box.x + box.width, box.y + box.height - cornerLen)
            overlayCtx.stroke()

            // Draw name label background
            const fontSize = Math.max(14, Math.min(18, box.width * 0.12))
            overlayCtx.font = `bold ${fontSize}px "Segoe UI", Arial, sans-serif`
            const textMetrics = overlayCtx.measureText(label)
            const textWidth = textMetrics.width
            const labelHeight = fontSize + 10
            const labelX = box.x
            const labelY = box.y - labelHeight

            // Draw label background with rounded corners
            const radius = 4
            const lx = labelX - 1
            const ly = labelY > 0 ? labelY : box.y
            const lw = textWidth + 16
            const lh = labelHeight
            overlayCtx.fillStyle = bgColor
            overlayCtx.beginPath()
            overlayCtx.moveTo(lx + radius, ly)
            overlayCtx.lineTo(lx + lw - radius, ly)
            overlayCtx.quadraticCurveTo(lx + lw, ly, lx + lw, ly + radius)
            overlayCtx.lineTo(lx + lw, ly + lh - radius)
            overlayCtx.quadraticCurveTo(lx + lw, ly + lh, lx + lw - radius, ly + lh)
            overlayCtx.lineTo(lx + radius, ly + lh)
            overlayCtx.quadraticCurveTo(lx, ly + lh, lx, ly + lh - radius)
            overlayCtx.lineTo(lx, ly + radius)
            overlayCtx.quadraticCurveTo(lx, ly, lx + radius, ly)
            overlayCtx.closePath()
            overlayCtx.fill()

            // Draw label text
            overlayCtx.fillStyle = '#ffffff'
            overlayCtx.fillText(label, lx + 8, ly + fontSize + 3)
          })
      
          const now = Date.now()
          const isLocked = (now - this.lastStableUpdateTime) < this.stableLockDuration

          if (this.faceMatcher && validDetections.length > 0) {
            this.findIdentityFromDescriptor(validDetections[0].descriptor)
          } else if (validDetections.length > 0) {
            if (!isLocked) {
              this.matchLabel = `พบใบหน้า (${validDetections.length} คน)`
              this.currentStatus = `พบใบหน้า (${validDetections.length} คน)`
            }
          } else {
            // หากไม่พบใบหน้าเลย และหมดระยะล็อก ให้เคลียร์หน้าจอ
            if (!isLocked) {
              this.matchLabel = null
              this.currentStatus = 'ไม่พบใบหน้า'
              this.faceHistory = [] // ล้างประวัติเมื่อไม่พบคน
            }
          }
        },
        applyImageEnhancement (ctx, canvas) {
          try {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
            const data = imageData.data
            const sharpenKernel = [0, -1, 0, -1, 5, -1, 0, -1, 0]

            for (let y = 1; y < canvas.height - 1; y++) {
              for (let x = 1; x < canvas.width - 1; x++) {
                const idx = (y * canvas.width + x) * 4
                let r = 0
                let g = 0
                let b = 0
                let k = 0
                for (let ky = -1; ky <= 1; ky++) {
                  for (let kx = -1; kx <= 1; kx++) {
                    const offset = ((y + ky) * canvas.width + (x + kx)) * 4
                    const weight = sharpenKernel[k++] || 0
                    r += data[offset] * weight
                    g += data[offset + 1] * weight
                    b += data[offset + 2] * weight
                  }
                }
                data[idx] = Math.min(255, Math.max(0, r))
                data[idx + 1] = Math.min(255, Math.max(0, g))
                data[idx + 2] = Math.min(255, Math.max(0, b))
              }
            }
            ctx.putImageData(imageData, 0, 0)
          } catch (error) {
            console.warn('applyImageEnhancement failed', error)
          }
        },
        findIdentityFromDescriptor (descriptor) {
          if (!this.faceMatcher) return

          const bestMatch = this.faceMatcher.findBestMatch(descriptor)
          const label = bestMatch.label

          // 1. Buffer Aggregation (เก็บย้อนหลัง 7 เฟรม)
          this.faceHistory.push(label)
          if (this.faceHistory.length > 7) {
            this.faceHistory.shift()
          }

          // 2. Majority Voting Logic
          const counts = {}
          this.faceHistory.forEach(x => { counts[x] = (counts[x] || 0) + 1 })
      
          let winner = 'unknown'
          let maxCount = 0
          for (const name in counts) {
            if (counts[name] > maxCount) {
              maxCount = counts[name]
              winner = name
            }
          }

          const now = Date.now()
          const isLocked = (now - this.lastStableUpdateTime) < this.stableLockDuration

          // 3. Decision & UI Update
          // เงื่อนไข: เสียงส่วนใหญ่ต้องเกิน 55% (4 ใน 7 เฟรม) และไม่ใช่ unknown
          if (winner !== 'unknown' && maxCount >= 4) {
            const shouldRecord = winner !== this.currentStableName

            this.currentStableName = winner
            this.matchLabel = this.$t('cctvViewer.detection.recognized', { name: winner })
            this.currentStatus = this.$t('cctvViewer.detection.caught', { name: winner })
            this.lastStableUpdateTime = now // อัปเดตเวลาล็อกล่าสุด

            if (shouldRecord) {
              const meta = this.knownFacesMeta[winner] || {}
              this.recognitionHistory.unshift({
                name: winner,
                studentName: meta.studentName || '',
                school: meta.school || '',
                program: meta.program || '',
                section: meta.section || '',
                cameraName: this.cameraName,
                time: new Date().toLocaleString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
                rawDate: new Date().toISOString()
              })
              if (this.recognitionHistory.length > 200) {
                this.recognitionHistory.pop()
              }
              // Save to backend MongoDB
              api.attendance('checkin', { studentId: winner, cameraName: this.cameraName || 'Unknown CCTV' }, 'post')
                .catch(err => console.error('Failed to save checkin history', err))
            }
          } else {
            // กรณีไม่เข้าเงื่อนไขเสียงส่วนใหญ่ หรือเป็น unknown
            // จะเปลี่ยนเป็น Unknown ได้ต่อเมื่อไม่อยู่ในระยะ Lock เท่านั้น
            if (!isLocked) {
              this.currentStableName = 'unknown'
              this.matchLabel = this.$t('cctvViewer.detection.unknown')
              this.currentStatus = this.$t('cctvViewer.detection.unknownFace')
            }
          }
        },
        openDetails (entry) {
          this.selectedPerson = entry
          this.showDetailsModal = true
        }
  },
  beforeDestroy () {
    this.stopFaceDetectionLoop()
    this.overlayCanvas = null
  }
}
</script>

<style scoped>
.cctv-viewer-page {
  padding-bottom: 2rem;
}
.viewer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}
.viewer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  align-items: start;
}
.viewer-frame {
  width: 100%;
  max-width: 100%;
  aspect-ratio: 16 / 9;
  background: #000;
  position: relative;
  overflow: hidden;
  border-radius: 10px;
}
.viewer-panel {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.panel-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 18px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
}
.panel-card h3 {
  margin: 0 0 14px 0;
  font-size: 18px;
}
.panel-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f3f4f6;
}
.panel-row:last-child {
  border-bottom: none;
}
.panel-label {
  color: #6b7280;
}
.panel-value {
  color: #111827;
  font-weight: 700;
}
.small-text {
  font-size: 12px;
  color: #6b7280;
  word-break: break-all;
}
.history-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 10px;
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.2s;
  cursor: pointer;
}
.history-item:hover {
  background-color: #f9fafb;
}
.history-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #e5e7eb;
  color: #374151;
  font-size: 13px;
  font-weight: 700;
}
.history-name {
  font-size: 15px;
  color: #111827;
  font-weight: 600;
}
.history-time {
  font-size: 12px;
  color: #6b7280;
}
.stream-image {
  width: 100%;
  height: 100%;
  object-fit: fill;
  display: block;
}
.stream-placeholder,
.stream-error {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f8f9fa;
  background: rgba(0, 0, 0, 0.7);
  text-align: center;
  padding: 1rem;
  font-size: 1rem;
}
.status-pill {
  display: inline-flex;
  align-items: center;
  padding: 0.6rem 1rem;
  border-radius: 999px;
  border: 1px solid transparent;
  font-weight: 600;
}
.status-pill.loading {
  color: #856404;
  background: #fff3cd;
  border-color: #ffeeba;
}
.status-pill.ready {
  color: #0f5132;
  background: #d1e7dd;
  border-color: #badbcc;
}
.status-pill.match {
  color: #084298;
  background: #cfe2ff;
  border-color: #b6d4fe;
}
.status-pill.error {
  color: #842029;
  background: #f8d7da;
  border-color: #f5c2c7;
}
.overlay-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
}
.d-none {
  display: none !important;
}
.viewer-info {
  max-width: 1000px;
  color: #444;
}
.unique-list-container,
.history-list-container {
  max-height: 350px;
  overflow-y: auto;
  padding-right: 4px;
}
.history-list-container::-webkit-scrollbar,
.unique-list-container::-webkit-scrollbar {
  width: 6px;
}
.history-list-container::-webkit-scrollbar-track,
.unique-list-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}
.history-list-container::-webkit-scrollbar-thumb,
.unique-list-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}
.history-list-container::-webkit-scrollbar-thumb:hover,
.unique-list-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
.history-index.unique-index {
  background: #d1e7dd;
  color: #0f5132;
}
</style>
