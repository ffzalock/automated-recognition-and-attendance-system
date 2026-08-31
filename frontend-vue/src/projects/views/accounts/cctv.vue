<template>
  <div class="cctv-page">
    <div class="page-header mb-4">
      <div>
        <div class="text-muted">Directory</div>
        <h1>CCTV</h1>
        <p>เชื่อมข้อมูลกล้อง CCTV จากไฟล์ข้อมูลภายในระบบ</p>
      </div>
    </div>

    <CRow>
      <CCol xl="12" lg="12" sm="12">
        <CCard>
          <CCardBody>
            <div class="d-flex flex-wrap align-items-center justify-content-between mb-3">
              <div class="d-flex flex-wrap align-items-center" style="gap: 0.75rem;">
                <div class="input-group search-input">
                  <input
                    v-model="search"
                    @input="applyFilters"
                    class="form-control"
                    type="text"
                    placeholder="ค้นหากล้อง ชื่อ IP หรือที่ตั้ง..."
                  />
                </div>

                <select v-model="building" @change="applyFilters" class="form-control building-select">
                  <option value="">อาคารทั้งหมด</option>
                  <option v-for="buildingName in buildings" :key="buildingName" :value="buildingName">
                    {{ buildingName }}
                  </option>
                </select>
              </div>
              <div>
                <button class="btn btn-secondary" type="button" @click="loadCameraData">รีเฟรช</button>
              </div>
            </div>

            <div class="mb-3 text-muted">กล้องทั้งหมด {{ filteredCameras.length }} ตัว</div>

            <div v-if="loading" class="text-center py-5">กำลังโหลดข้อมูลกล้อง...</div>
            <div v-if="error" class="alert alert-danger">{{ error }}</div>
            <div v-if="!loading && filteredCameras.length === 0" class="text-center py-5 text-muted">
              ไม่พบกล้องในระบบ
            </div>

            <div v-if="!loading && filteredCameras.length > 0" class="camera-grid">
              <div v-for="camera in filteredCameras" :key="camera.NO || camera['CAMERA NAME_NEW']" class="camera-card">
                <div class="camera-card-header">
                  <div>
                    <h5>{{ cameraName(camera) }}</h5>
                    <div class="text-muted small">{{ cameraLocation(camera) || '-' }}</div>
                  </div>
                  <div class="status-badge" :class="cameraRtsp(camera) ? 'status-ok' : 'status-offline'">
                    {{ cameraRtsp(camera) ? 'สตรีมพร้อม' : 'ไม่มี RTSP' }}
                  </div>
                </div>

                <div class="camera-info">
                  <div>
                    <span class="label">IP:</span>
                    <span class="value">{{ cameraIp(camera) || '-' }}</span>
                  </div>
                  <div>
                    <span class="label">อาคาร:</span>
                    <span class="value">{{ cameraBuilding(camera) || '-' }}</span>
                  </div>
                  <div>
                    <span class="label">ตำแหน่ง:</span>
                    <span class="value">{{ cameraLocation(camera) || '-' }}</span>
                  </div>
                  <div v-if="camera.Latitude && camera.Longtitude">
                    <span class="label">พิกัด:</span>
                    <span class="value">{{ camera.Latitude }}, {{ camera.Longtitude }}</span>
                  </div>
                </div>

                <div class="camera-actions">
                  <button
                    type="button"
                    class="btn btn-success btn-sm"
                    @click="openViewer(camera)"
                    :disabled="!cameraRtsp(camera)"
                  >
                    ดูสดผ่านเว็บ
                  </button>
                  <button
                    type="button"
                    class="btn btn-outline-secondary btn-sm"
                    @click="copyRtsp(camera)"
                    disabled
                  >
                    คัดลอก RTSP (ปิดเพื่อความปลอดภัย)
                  </button>
                </div>
              </div>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  </div>
</template>

<script>
import api from '@/service/api'

function normalizeBaseUrl (url) {
  return String(url || '').replace(/\/+$/, '')
}

const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || (typeof window !== 'undefined' && window.location && window.location.hostname ? `http://${window.location.hostname}:8082` : 'http://127.0.0.1:8097')
const CCTV_SERVICE_HOST = normalizeBaseUrl(process.env.VUE_APP_CCTV_SERVICE_HOST || API_BASE_URL)

export default {
  name: 'DirectoryCCTV',
  data () {
    return {
      cameras: [],
      search: '',
      building: '',
      loading: false,
      error: ''
    }
  },
  computed: {
    buildings () {
      const values = this.cameras
        .map(camera => camera.BUILDING || camera.building)
        .filter(Boolean)
        .map(String)
      return Array.from(new Set(values)).sort()
    },
    filteredCameras () {
      const searchTerm = String(this.search || '').toLowerCase().trim()
      return this.cameras.filter(camera => {
        const name = String(camera['CAMERA NAME_NEW'] || camera.camera_name || camera.name || '').toLowerCase()
        const ip = String(camera['IP ADDRESS'] || camera.ip || '').toLowerCase()
        const location = String(camera.Location || camera.location || camera.POSITION || camera.position || '').toLowerCase()
        const matchSearch = !searchTerm || name.includes(searchTerm) || ip.includes(searchTerm) || location.includes(searchTerm)
        const matchBuilding = !this.building || String(camera.BUILDING || camera.building) === String(this.building)
        return matchSearch && matchBuilding
      })
    }
  },
  methods: {
    cameraName (camera) {
      return camera['CAMERA NAME_NEW'] || camera.camera_name || camera.name || 'ไม่ระบุชื่อกล้อง'
    },
    cameraRtsp (camera) {
      return camera['ANPR&PTZ RTSP'] || camera.rtsp || camera['rtsp'] || ''
    },
    cameraLocation (camera) {
      return camera.Location || camera.location || camera.POSITION || camera.position || ''
    },
    cameraIp (camera) {
      return camera['IP ADDRESS'] || camera.ip || ''
    },
    cameraBuilding (camera) {
      return camera.BUILDING || camera.building || ''
    },
    async loadCameraData () {
      this.loading = true
      this.error = ''
      this.selectedCamera = null
      try {
        const response = await api.cctv('list')
        if (response && response.data && response.data.success) {
          this.cameras = Array.isArray(response.data.data) ? response.data.data : []
        } else if (response && response.data) {
          this.cameras = Array.isArray(response.data) ? response.data : []
        } else {
          this.cameras = []
        }
      } catch (err) {
        console.error('CCTV load failed', err)
        this.error = 'ไม่สามารถโหลดข้อมูลกล้อง CCTV ได้ โปรดตรวจสอบเซิร์ฟเวอร์'
      } finally {
        this.loading = false
      }
    },
    applyFilters () {
      // Trigger computed filtering
    },
    openViewer (camera) {
      if (!camera) {
        return
      }
      const url = `${window.location.origin}/directory/cctv/viewer?name=${encodeURIComponent(this.cameraName(camera))}`
      window.open(url, '_blank')
    },
    async copyRtsp (camera) {
      const rtsp = this.cameraRtsp(camera) || ''
      if (!rtsp) {
        return
      }
      try {
        await navigator.clipboard.writeText(rtsp)
        if (this.$toast && this.$toast.success) {
          this.$toast.success('คัดลอก RTSP เรียบร้อยแล้ว')
        } else {
          window.alert('คัดลอก RTSP เรียบร้อยแล้ว')
        }
      } catch (err) {
        console.warn('Clipboard copy failed', err)
        window.prompt('คัดลอก RTSP ด้วยตนเอง:', rtsp)
      }
    }
  },
  mounted () {
    this.loadCameraData()
  }
}
</script>

<style scoped>
.cctv-page .page-header h1 {
  margin-bottom: 0.5rem;
}
.camera-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}
.camera-card {
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1rem;
  background: #fff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 240px;
}
.camera-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 1rem;
}
.camera-card-header h5 {
  margin: 0;
  font-size: 1.05rem;
}
.camera-info {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.5rem;
  font-size: 0.95rem;
}
.camera-info .label {
  font-weight: 600;
}
.camera-info .value {
  color: #3f3f46;
}
.status-badge {
  padding: 0.35rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}
.status-ok {
  background: #dcfce7;
  color: #166534;
}
.status-offline {
  background: #fee2e2;
  color: #b91c1c;
}
.camera-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}
.search-input {
  min-width: 280px;
}
.building-select {
  min-width: 180px;
}
.live-viewer {
  margin-top: 1.5rem;
}
.viewer-wrap {
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1rem;
  background: #111;
}
.live-stream {
  width: 100%;
  max-height: 580px;
  display: block;
  border-radius: 0.5rem;
  background: #000;
}
.viewer-controls {
  margin-top: 0.75rem;
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
</style>
