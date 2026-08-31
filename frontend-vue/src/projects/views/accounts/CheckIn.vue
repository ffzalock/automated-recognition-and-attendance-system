<template>
  <div class="checkin-page">
    <div class="checkin-header mb-4">
      <div>
        <div class="text-muted">{{ $t('checkIn.directory') }}</div>
        <h1>{{ $t('checkIn.title') }}</h1>
        <p>{{ $t('checkIn.subtitle') }}</p>
      </div>
    </div>

    <CRow>
      <CCol xl="6" lg="7" sm="12">
        <CCard>
          <CCardBody>
            <div class="mb-4">
              <h5 class="mb-2">{{ $t('checkIn.status.title') }}</h5>
              <p class="text-muted">{{ checkInStatusText }}</p>
            </div>

            <div class="checkin-camera-frame mb-4" ref="cameraWrapper">
              <video id="webcam" ref="webcam" class="camera-video" autoplay playsinline muted @play="onVideoPlay"></video>
            </div>

            <div class="checkin-status mb-3">
              <span :class="['status-pill', isAiReady ? 'ready' : 'loading']">
                {{ statusLabel }}
              </span>
            </div>

            <CButton color="primary" :disabled="loading || !isAiReady" @click="startWebcam" class="mr-2">
              <CIcon name="cil-check" class="mr-2" /> {{ $t('checkIn.buttons.scan') }}
            </CButton>
            <CButton color="secondary" :disabled="loadingFaces" @click="reloadFaces" class="mr-2">
              <span v-if="loadingFaces">{{ $t('checkIn.buttons.loading') }}</span>
              <span v-else>{{ $t('checkIn.buttons.reload') }}</span>
            </CButton>
            <CButton color="light" @click="showSettingsModal = true" :title="$t('checkIn.settings.title')">
              {{ $t('checkIn.buttons.settings') }}
            </CButton>
          </CCardBody>
        </CCard>
      </CCol>

      <!-- History Panel -->
      <CCol xl="6" lg="5" sm="12">
        <CCard>
          <CCardBody>
            <h5 class="mb-4">{{ $t('checkIn.history.title') }}</h5>
            <div v-if="recentRecognitions.length" class="history-list-container">
              <div
                class="history-item"
                v-for="(entry, index) in recentRecognitions"
                :key="`history-${index}`"
                @click="openDetails(entry)"
                style="cursor: pointer;"
                :title="$t('checkIn.history.clickDetail')"
              >
                <span class="history-index">{{ index + 1 }}</span>
                <div>
                  <div class="history-name text-primary">{{ entry.name }} <small v-if="entry.studentName">({{ entry.studentName }})</small></div>
                  <div v-if="entry.school" class="history-school text-muted font-size-sm">{{ entry.school }}</div>
                  <div class="history-time">{{ entry.time }}</div>
                </div>
              </div>
            </div>
            <div v-else class="text-muted">{{ $t('checkIn.history.empty') }}</div>
          </CCardBody>
        </CCard>

        <CCard class="mt-4">
          <CCardBody>
            <h5 class="mb-4">{{ $t('checkIn.uniqueToday.title') }}</h5>
            <div v-if="todayUniqueCheckIns.length" class="unique-list-container">
              <div
                class="history-item"
                v-for="(entry, index) in todayUniqueCheckIns"
                :key="`unique-${entry.name}`"
                @click="openDetails(entry)"
                style="cursor: pointer;"
                :title="$t('checkIn.history.clickDetail')"
              >
                <span class="history-index unique-index">{{ index + 1 }}</span>
                <div>
                  <div class="history-name text-success">{{ entry.name }} <small v-if="entry.studentName">({{ entry.studentName }})</small></div>
                  <div v-if="entry.school" class="history-school text-muted font-size-sm">{{ entry.school }}</div>
                  <div class="history-time">{{ $t('checkIn.uniqueToday.lastCheckIn') }}{{ entry.time }}</div>
                </div>
              </div>
            </div>
            <div v-else class="text-muted">{{ $t('checkIn.uniqueToday.empty') }}</div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <!-- Details Modal -->
    <CModal
      :title="$t('checkIn.modal.title')"
      color="info"
      :show.sync="showDetailsModal"
    >
      <div v-if="selectedPerson">
        <div class="mb-2"><strong>{{ $t('checkIn.modal.studentId') }}</strong> {{ selectedPerson.name }}</div>
        <div class="mb-2"><strong>{{ $t('checkIn.modal.fullName') }}</strong> {{ selectedPerson.studentName || '-' }}</div>
        <div class="mb-2"><strong>{{ $t('checkIn.modal.school') }}</strong> {{ selectedPerson.school || '-' }}</div>
        <div class="mb-2"><strong>{{ $t('checkIn.modal.program') }}</strong> {{ selectedPerson.program || '-' }}</div>
        <div class="mb-2"><strong>{{ $t('checkIn.modal.section') }}</strong> {{ selectedPerson.section || '-' }}</div>
        <div class="mb-2"><strong>{{ $t('checkIn.modal.camera') }}</strong> {{ selectedPerson.cameraName || '-' }}</div>
        <div class="mb-2"><strong>{{ $t('checkIn.modal.checkInTime') }}</strong> {{ selectedPerson.time }}</div>
      </div>
      <template #footer>
        <CButton color="secondary" @click="showDetailsModal = false">{{ $t('checkIn.modal.close') }}</CButton>
      </template>
    </CModal>

    <!-- ===== Settings Modal ===== -->
    <CModal
      :title="$t('checkIn.settings.title')"
      color="dark"
      size="lg"
      :show.sync="showSettingsModal"
    >
      <div class="settings-modal-body">

        <!-- Status bar -->
        <div v-if="settingsSaved" class="settings-saved-bar">
          {{ $t('checkIn.settings.saved') }}
        </div>

        <!-- Section: Detection -->
        <div class="settings-section-title">{{ $t('checkIn.settings.detectionTitle') }}</div>
        <div class="settings-card">

          <!-- minConfidence -->
          <div class="settings-row">
            <div class="settings-info">
              <div class="settings-label">
                Detection Confidence
                <span class="settings-badge badge-blue">SSD</span>
              </div>
              <div class="settings-desc">
                {{ $t('checkIn.settings.minConfidenceDesc') }}
              </div>
            </div>
            <div class="settings-ctrl">
              <input
                type="range" class="settings-slider"
                v-model.number="draftSettings.minConfidence"
                min="0.30" max="0.95" step="0.01"
              />
              <span class="settings-val">{{ draftSettings.minConfidence.toFixed(2) }}</span>
            </div>
          </div>

          <!-- matcherThreshold -->
          <div class="settings-row">
            <div class="settings-info">
              <div class="settings-label">
                Match Distance Threshold
                <span class="settings-badge badge-green">FaceMatcher</span>
              </div>
              <div class="settings-desc">
                {{ $t('checkIn.settings.matcherThresholdDesc') }}
              </div>
            </div>
            <div class="settings-ctrl">
              <input
                type="range" class="settings-slider"
                v-model.number="draftSettings.matcherThreshold"
                min="0.30" max="0.80" step="0.01"
              />
              <span class="settings-val">{{ draftSettings.matcherThreshold.toFixed(2) }}</span>
            </div>
          </div>

        </div>

        <!-- Section: Voting -->
        <div class="settings-section-title">{{ $t('checkIn.settings.votingTitle') }}</div>
        <div class="settings-card">

          <!-- historySize -->
          <div class="settings-row">
            <div class="settings-info">
              <div class="settings-label">
                Face History Buffer
                <span class="settings-badge badge-blue">Voting</span>
              </div>
              <div class="settings-desc">
                {{ $t('checkIn.settings.historySizeDesc') }}
              </div>
            </div>
            <div class="settings-ctrl">
              <input
                type="range" class="settings-slider"
                v-model.number="draftSettings.historySize"
                min="3" max="20" step="1"
              />
              <span class="settings-val">{{ draftSettings.historySize }}</span>
            </div>
          </div>

          <!-- voteThreshold -->
          <div class="settings-row">
            <div class="settings-info">
              <div class="settings-label">
                Vote Threshold
                <span class="settings-badge badge-blue">Voting</span>
              </div>
              <div class="settings-desc">
                {{ $t('checkIn.settings.voteThresholdDesc', { size: draftSettings.historySize }) }}
              </div>
            </div>
            <div class="settings-ctrl">
              <input
                type="range" class="settings-slider"
                v-model.number="draftSettings.voteThreshold"
                :min="2" :max="draftSettings.historySize" step="1"
              />
              <span class="settings-val">{{ draftSettings.voteThreshold }}</span>
            </div>
          </div>

          <!-- stableLockDuration -->
          <div class="settings-row">
            <div class="settings-info">
              <div class="settings-label">
                Stable Lock Duration
                <span class="settings-badge badge-yellow">Lock</span>
              </div>
              <div class="settings-desc">
                {{ $t('checkIn.settings.stableLockDurationDesc') }}
              </div>
            </div>
            <div class="settings-ctrl">
              <input
                type="range" class="settings-slider"
                v-model.number="draftSettings.stableLockDuration"
                min="500" max="10000" step="500"
              />
              <span class="settings-val">{{ draftSettings.stableLockDuration }}ms</span>
            </div>
          </div>

        </div>

        <!-- Default note -->
        <div class="settings-note">
          {{ $t('checkIn.settings.note') }}
        </div>

      </div>
      <template #footer>
        <CButton color="danger" variant="outline" @click="resetSettingsToDefault" class="mr-auto">
          {{ $t('checkIn.settings.reset') }}
        </CButton>
        <CButton color="secondary" @click="showSettingsModal = false">{{ $t('checkIn.settings.cancel') }}</CButton>
        <CButton color="primary" @click="applySettings">{{ $t('checkIn.settings.save') }}</CButton>
      </template>
    </CModal>

  </div>
</template>

<script>
import api from '@/service/api'
import { notifyError } from '@/projects/utils/notify'

export default {
  data () {
    const saved = JSON.parse(localStorage.getItem('checkin_settings') || '{}')
    const defaults = {
      minConfidence: 0.65,
      matcherThreshold: 0.50,
      historySize: 7,
      voteThreshold: 4,
      stableLockDuration: 2500
    }
    const merged = { ...defaults, ...saved }
    return {
      loading: false,
      loadingFaces: false,
      lastCheckIn: null,
      stream: null,
      overlayCanvas: null,
      isAiReady: false,
      currentStatus: '',
      faceMatcher: null,
      detectionTimer: null,
      studentMatchingId: null,
      faceHistory: [],
      currentStableName: 'unknown',
      lastStableUpdateTime: 0,
      stableLockDuration: merged.stableLockDuration,
      recognitionHistory: [],
      knownFacesMeta: {},
      showDetailsModal: false,
      selectedPerson: null,
      // ── Settings ──
      showSettingsModal: false,
      settingsSaved: false,
      settings: { ...merged },
      draftSettings: { ...merged }
    }
  },
  mounted () {
    this.initFaceApi()
  },
  computed: {
    statusLabel () {
      return this.currentStatus
    },
    checkInStatusText () {
      return this.lastCheckIn
        ? `${this.$t('checkIn.status.lastCheckIn')}${this.formatDate(this.lastCheckIn)}`
        : this.$t('checkIn.status.noCheckIn')
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
  methods: {
    async initFaceApi () {
      try {
        this.currentStatus = this.$t('checkIn.messages.loadingAi')
        await this.loadHighAccuracyModels()
        this.isAiReady = true
        this.currentStatus = this.$t('checkIn.messages.aiReadyToScan')
        await this.loadKnownFaces()
        await this.loadHistory()
      } catch (error) {
        console.error(error)
        this.currentStatus = this.$t('checkIn.messages.aiLoadError')
        notifyError(this.$store, error && error.message ? error.message : this.$t('checkIn.messages.aiLoadGenericError'))
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
      return new faceapi.SsdMobilenetv1Options({ minConfidence: this.settings.minConfidence })
    },
    async loadKnownFaces () {
      try {
        const response = await api.attendance('faces')
        if (response && response.data && response.data.success) {
          const faces = Array.isArray(response.data.faces) ? response.data.faces : []
          const labeledDescriptors = []
          this.knownFacesMeta = {} // Map studentId to metadata

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
            this.faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, this.settings.matcherThreshold)
            this.currentStatus = this.$t('checkIn.messages.aiReadyLoaded', { count: labeledDescriptors.length })
          } else {
            this.faceMatcher = null
            this.currentStatus = this.$t('checkIn.messages.noFacesData')
          }
        }
      } catch (error) {
        console.error(error)
        notifyError(this.$store, error && error.message ? error.message : this.$t('checkIn.messages.facesLoadError'))
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
            cameraName: item.cameraName || '-',
            time: new Date(item.checkedInAt).toLocaleString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
            rawDate: item.checkedInAt
          }))
        }
      } catch (error) {
        console.error('loadHistory error:', error)
      }
    },
    async reloadFaces () {
      this.loadingFaces = true
      try {
        await this.loadKnownFaces()
      } finally {
        this.loadingFaces = false
      }
    },
    async startWebcam () {
      if (this.stream) {
        return
      }

      this.loading = true
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true })
        const video = this.$refs.webcam
        if (video) {
          video.srcObject = mediaStream
          this.stream = mediaStream
          this.currentStatus = this.$t('checkIn.messages.waitingVideo')
        }
      } catch (error) {
        notifyError(this.$store, error && error.message ? error.message : this.$t('checkIn.messages.cameraAccessError'))
      } finally {
        this.loading = false
      }
    },
    async extractDescriptorFromDataUrl (dataUrl) {
      if (!window.faceapi) {
        return null
      }
      try {
        const image = new Image()
        image.crossOrigin = 'anonymous'
        image.src = dataUrl
        await image.decode()
        const result = await faceapi
          .detectSingleFace(image, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.7 }))
          .withFaceLandmarks()
          .withFaceDescriptor()
        return result ? result.descriptor : null
      } catch (error) {
        console.warn('ไม่สามารถสร้าง descriptor จาก dataUrl ได้', error)
        return null
      }
    },
    async onVideoPlay () {
      if (!this.isAiReady || this.detectionTimer) {
        return
      }
      const video = this.$refs.webcam
      if (!video || video.paused || video.ended) {
        return
      }
      this.createOverlayCanvas()
      this.resizeOverlayCanvas(video)
      this.currentStatus = this.$t('checkIn.messages.startingDetection')
      this.startFaceDetectionLoop()
    },
    createOverlayCanvas () {
      if (this.overlayCanvas) {
        return
      }
      const wrapper = this.$refs.cameraWrapper
      if (!wrapper) {
        return
      }
      const canvas = document.createElement('canvas')
      canvas.className = 'overlay-canvas'
      canvas.style.position = 'absolute'
      canvas.style.top = '0'
      canvas.style.left = '0'
      canvas.style.width = '100%'
      canvas.style.height = '100%'
      canvas.style.pointerEvents = 'none'
      wrapper.appendChild(canvas)
      this.overlayCanvas = canvas
    },
    resizeOverlayCanvas (video) {
      if (!this.overlayCanvas || !video) {
        return
      }
      const width = video.videoWidth || video.clientWidth
      const height = video.videoHeight || video.clientHeight
      this.overlayCanvas.width = width
      this.overlayCanvas.height = height
      this.overlayCanvas.style.width = `${video.clientWidth}px`
      this.overlayCanvas.style.height = `${video.clientHeight}px`
    },
    startFaceDetectionLoop () {
      this.stopFaceDetectionLoop()
      this.detectionTimer = setInterval(() => {
        this.detectFaceFrame().catch(error => {
          console.error('Face detection error:', error)
        })
      }, 100)
    },
    stopFaceDetectionLoop () {
      if (this.detectionTimer) {
        clearInterval(this.detectionTimer)
        this.detectionTimer = null
      }
      if (this.overlayCanvas && this.overlayCanvas.getContext) {
        this.overlayCanvas.getContext('2d').clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height)
      }
      this.faceHistory = []
    },
    async detectFaceFrame () {
      const video = this.$refs.webcam
      const overlay = this.overlayCanvas
      if (!video || !overlay || video.paused || video.ended || !this.faceMatcher) {
        return
      }

      const detections = await faceapi
        .detectAllFaces(video, this.getFaceDetectionOptions())
        .withFaceLandmarks()
        .withFaceDescriptors()

      const validDetections = detections.filter(detection => (
        detection.detection && detection.detection.score >= 0.65
      ))

      const displaySize = { width: video.videoWidth, height: video.videoHeight }
      faceapi.matchDimensions(overlay, displaySize)
      const resizedDetections = faceapi.resizeResults(validDetections, displaySize)
      const ctx = overlay.getContext('2d')
      ctx.clearRect(0, 0, overlay.width, overlay.height)
      faceapi.draw.drawDetections(overlay, resizedDetections)

      if (validDetections.length > 0) {
        this.findIdentityFromDescriptor(validDetections[0].descriptor)
      } else {
        this.currentStatus = this.$t('checkIn.messages.noReliableFace')
        this.studentMatchingId = null
      }
    },
    findIdentityFromDescriptor (descriptor) {
      if (!this.faceMatcher) {
        return
      }
      const bestMatch = this.faceMatcher.findBestMatch(descriptor)
      const label = (bestMatch && bestMatch.distance <= this.settings.matcherThreshold) ? bestMatch.label : 'unknown'

      // 1. Buffer Aggregation (เก็บย้อนหลัง N เฟรมตาม settings)
      this.faceHistory.push(label)
      if (this.faceHistory.length > this.settings.historySize) {
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

      // 3. Decision
      if (winner !== 'unknown' && maxCount >= this.settings.voteThreshold) {
        const shouldRecord = winner !== this.currentStableName

        this.currentStableName = winner
        this.studentMatchingId = winner
        this.currentStatus = this.$t('checkIn.messages.studentId', { id: winner })
        this.lastStableUpdateTime = now

        if (shouldRecord) {
          this.lastCheckIn = new Date()
          
          const meta = this.knownFacesMeta[winner] || {}
          this.recognitionHistory.unshift({
            name: winner,
            studentName: meta.studentName || '',
            school: meta.school || '',
            program: meta.program || '',
            section: meta.section || '',
            cameraName: '-',
            time: new Date().toLocaleString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
            rawDate: new Date().toISOString()
          })
          if (this.recognitionHistory.length > 200) {
            this.recognitionHistory.pop()
          }

          api.attendance('checkin', { studentId: winner, cameraName: '-' }, 'post')
            .then(() => {
              this.currentStatus = this.$t('checkIn.messages.checkInSuccess', { id: winner })
            })
            .catch(err => {
              console.error('Failed to save checkin history', err)
              this.currentStatus = this.$t('checkIn.messages.checkInFailed', { id: winner })
            })
        }
      } else {
        if (!isLocked) {
          this.currentStableName = 'unknown'
          this.studentMatchingId = null
          this.currentStatus = this.$t('checkIn.messages.unknownFace', { dist: bestMatch ? bestMatch.distance.toFixed(3) : '-' })
        }
      }
    },
    stopStream () {
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop())
        this.stream = null
      }
      this.stopFaceDetectionLoop()
      this.destroyOverlayCanvas()
    },
    destroyOverlayCanvas () {
      if (this.overlayCanvas && this.overlayCanvas.parentNode) {
        this.overlayCanvas.parentNode.removeChild(this.overlayCanvas)
      }
      this.overlayCanvas = null
    },
    checkIn () {
      this.saving = true
      setTimeout(() => {
        this.lastCheckIn = new Date()
        this.saving = false
      }, 500)
    },
    formatDate (value) {
      if (!value) return ''
      return new Date(value).toLocaleString('th-TH', {
        dateStyle: 'short',
        timeStyle: 'short'
      })
    },
    openDetails (entry) {
      this.selectedPerson = entry
      this.showDetailsModal = true
    },
    // ── Settings ──────────────────────────────────────────
    applySettings () {
      this.settings = { ...this.draftSettings }
      this.stableLockDuration = this.settings.stableLockDuration
      localStorage.setItem('checkin_settings', JSON.stringify(this.settings))
      // Re-create FaceMatcher with new threshold
      if (this.faceMatcher) {
        this.faceMatcher = new faceapi.FaceMatcher(
          this.faceMatcher.labeledDescriptors,
          this.settings.matcherThreshold
        )
      }
      this.showSettingsModal = false
      this.settingsSaved = true
      setTimeout(() => { this.settingsSaved = false }, 3000)
    },
    resetSettingsToDefault () {
      const defaults = {
        minConfidence: 0.65,
        matcherThreshold: 0.50,
        historySize: 7,
        voteThreshold: 4,
        stableLockDuration: 2500
      }
      this.draftSettings = { ...defaults }
    }
  },
  beforeDestroy () {
    this.stopStream()
  }
}
</script>

<style scoped>
.checkin-header h1 {
  margin-bottom: 0.5rem;
}

.checkin-camera-frame {
  width: 100%;
  max-width: 640px;
  aspect-ratio: 4 / 3;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 6px;
  position: relative;
}

.checkin-camera-frame video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(1.2) contrast(1.1);
}

.status-pill.loading {
  background: #fff3cd;
  color: #856404;
  border-color: #ffeeba;
}

.status-pill.ready {
  background: #d4edda;
  color: #155724;
  border-color: #c3e6cb;
}

.status-pill.match {
  background: #cce5ff;
  color: #004085;
  border-color: #b8daff;
}

.overlay-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
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

/* ⚙️ Face Detection Settings Styles */
.settings-modal-body {
  padding: 10px 15px;
}
.settings-saved-bar {
  background: rgba(40, 167, 69, 0.15);
  border: 1px solid rgba(40, 167, 69, 0.3);
  color: #28a745;
  padding: 10px 15px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 20px;
}
.settings-section-title {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: #6c757d;
  margin-bottom: 12px;
  margin-top: 15px;
}
.settings-card {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 24px;
}
.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 16px 20px;
  border-bottom: 1px solid #dee2e6;
}
.settings-row:last-child {
  border-bottom: none;
}
.settings-info {
  flex: 1;
}
.settings-label {
  font-size: 14px;
  font-weight: 600;
  color: #212529;
  display: flex;
  align-items: center;
  gap: 8px;
}
.settings-desc {
  font-size: 12px;
  color: #6c757d;
  margin-top: 4px;
  line-height: 1.5;
}
.settings-ctrl {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 190px;
  justify-content: flex-end;
}
.settings-badge {
  font-size: 9px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 20px;
  letter-spacing: 0.5px;
}
.badge-blue {
  background: rgba(0, 123, 255, 0.1);
  color: #007bff;
}
.badge-green {
  background: rgba(40, 167, 69, 0.1);
  color: #28a745;
}
.badge-yellow {
  background: rgba(255, 193, 7, 0.15);
  color: #ffc107;
}
.settings-slider {
  width: 120px;
  height: 4px;
  background: #e9ecef;
  border-radius: 99px;
  cursor: pointer;
  outline: none;
}
.settings-val {
  min-width: 50px;
  text-align: right;
  font-size: 14px;
  font-weight: 700;
  color: #007bff;
  font-variant-numeric: tabular-nums;
}
.settings-note {
  font-size: 12px;
  color: #6c757d;
  margin-top: 15px;
  font-style: italic;
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
  background: #d4edda;
  color: #155724;
}
</style>
