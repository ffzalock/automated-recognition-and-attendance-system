<template>
  <div class="face-enroll-form">
    <CRow>
      <CCol xl="5" lg="6" sm="12">
        <CCard>
          <CCardBody>
            <h5>{{ $t('registerPage.form.title') }}</h5>
            <p class="text-muted">{{ $t('registerPage.form.subtitle') }}</p>

            <CForm @submit.prevent="registerFace">
              <CInput
                v-model.trim="studentId"
                :label="$t('registerPage.form.studentIdLabel')"
                :placeholder="$t('registerPage.form.studentIdPlaceholder')"
                required
              />
              <CInput
                v-model.trim="studentName"
                :label="$t('registerPage.form.studentNameLabel')"
                :placeholder="$t('registerPage.form.studentNamePlaceholder')"
                required
              />

              <!-- School Dropdown -->
              <div class="form-group mb-3">
                <label class="form-label font-weight-bold">
                  {{ $t('registerPage.form.schoolLabel') }} <span class="text-danger">*</span>
                </label>
                <select
                  v-model="selectedSchool"
                  class="form-control"
                  required
                  @change="onSchoolChange"
                >
                  <option value="">{{ $t('registerPage.form.selectSchoolPlaceholder') }}</option>
                  <option v-for="school in schoolList" :key="school.id" :value="school.id">
                    {{ isEn ? school.en : school.th }}
                  </option>
                </select>
              </div>

              <!-- Program Dropdown -->
              <div class="form-group mb-3">
                <label class="form-label font-weight-bold">
                  {{ $t('registerPage.form.programLabel') }} <span class="text-danger">*</span>
                </label>
                <select
                  v-model="selectedProgram"
                  class="form-control"
                  required
                  :disabled="!selectedSchool"
                >
                  <option value="">{{ selectedSchool ? $t('registerPage.form.selectProgramPlaceholder') : $t('registerPage.form.selectSchoolFirstPlaceholder') }}</option>
                  <option v-for="prog in programList" :key="prog.id" :value="prog.id">
                    {{ isEn ? prog.en : prog.th }}
                  </option>
                </select>
              </div>

              <CInput
                v-model.trim="section"
                :label="$t('registerPage.form.sectionLabel')"
                :placeholder="$t('registerPage.form.sectionPlaceholder')"
                required
              />

              <div class="instructions mb-3 p-3 bg-light rounded text-dark font-size-sm">
                <strong>{{ $t('registerPage.instructions.title') }}</strong>
                <ol class="m-0 pl-3">
                  <li>{{ $t('registerPage.instructions.step1Prefix') }} <strong>{{ $t('registerPage.instructions.step1Bold') }}</strong></li>
                  <li>{{ $t('registerPage.instructions.step2Prefix') }} <strong>{{ $t('registerPage.instructions.step2Bold') }}</strong></li>
                  <li><strong>{{ $t('registerPage.instructions.step3Bold') }}</strong> {{ $t('registerPage.instructions.step3Suffix') }}</li>
                </ol>
              </div>

              <div class="form-group mb-3">
                <CButton color="primary" :disabled="loading" @click.prevent="startCamera">
                  {{ cameraActive ? $t('registerPage.buttons.cameraReady') : $t('registerPage.buttons.openCamera') }}
                </CButton>
                <CButton
                  color="danger"
                  class="ml-2"
                  :disabled="loading || !cameraActive || recording"
                  @click.prevent="recordVideo"
                >
                  {{ recording ? $t('registerPage.buttons.recording') : $t('registerPage.buttons.startRecord') }}
                </CButton>
              </div>

              <div class="mb-3">
                <label class="form-label font-weight-bold">{{ $t('registerPage.form.capturedAnglesTitle') }}</label>
                <div class="angle-selection-grid mb-3">
                  <div
                    v-for="(angle, idx) in localizedAngles"
                    :key="angle.key"
                    class="angle-slot completed"
                    :class="{ completed: angle.image }"
                  >
                    <div class="angle-icon-container">
                      <i v-if="angle.image" class="fas fa-check-circle text-success font-size-lg"></i>
                      <i v-else :class="['fas', angle.icon, 'font-size-md']"></i>
                    </div>
                    <div class="angle-label-wrapper">
                      <span class="angle-label">{{ angle.label }}</span>
                      <span class="angle-desc">{{ angle.description }}</span>
                    </div>
                    <div v-if="angle.image" class="angle-thumbnail">
                      <img :src="angle.image" />
                      <div class="remove-btn" @click.stop="removeImage(idx)">×</div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="form-group mb-3">
                <label class="form-label text-muted font-size-sm">{{ $t('registerPage.form.uploadPhotoLabel') }}</label>
                <input
                  type="file"
                  accept="image/*"
                  class="form-control"
                  multiple
                  @change="onFileChange"
                />
              </div>

              <CButton
                type="submit"
                color="success"
                :disabled="loading || !studentId || !selectedSchool || !selectedProgram || !section || images.length < 4"
                class="w-100 py-2 font-weight-bold"
              >
                {{ loading ? $t('registerPage.buttons.submitting') : $t('registerPage.buttons.submit') }}
              </CButton>
            </CForm>

            <div class="mt-3" v-if="message.text">
              <div :class="message.type === 'success' ? 'text-success font-weight-bold' : 'text-danger font-weight-bold'">
                {{ message.text }}
              </div>
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      <CCol xl="7" lg="6" sm="12">
        <CCard>
          <CCardBody>
            <div class="preview-section">
              <div class="preview-frame">
                <video ref="webcam" autoplay playsinline muted class="video-frame"></video>
                <div v-if="!cameraActive" class="preview-placeholder">
                  {{ $t('registerPage.preview.placeholder') }}
                </div>
                
                <!-- Video Record Overlay -->
                <div v-if="recording || countingDown" class="recording-overlay">
                  <div class="guide-text">{{ recordGuideText }}</div>
                  <div class="countdown-value">{{ countdownVal }}</div>
                </div>
              </div>

              <div v-if="images.length" class="preview-image-wrapper mt-3">
                <div class="preview-images-grid">
                  <div v-for="(img, idx) in images" :key="idx" class="preview-thumb">
                    <img :src="img" :alt="`preview-${idx}`" class="preview-image" />
                  </div>
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
import { notifyError, notifySuccess } from '@/projects/utils/notify'

const MFU_SCHOOLS = [
  {
    id: 'school_it',
    raw: 'สำนักวิชาเทคโนโลยีสารสนเทศ (School of Information Technology)',
    th: 'สำนักวิชาเทคโนโลยีสารสนเทศ',
    en: 'School of Information Technology',
    programs: [
      { id: 'prog_it_cpe', raw: 'วิศวกรรมคอมพิวเตอร์ (B.Eng. Computer Engineering)', th: 'วิศวกรรมคอมพิวเตอร์ (B.Eng.)', en: 'B.Eng. Computer Engineering' },
      { id: 'prog_it_it', raw: 'เทคโนโลยีสารสนเทศ (B.Sc. Information Technology)', th: 'เทคโนโลยีสารสนเทศ (B.Sc.)', en: 'B.Sc. Information Technology' },
      { id: 'prog_it_cs', raw: 'วิทยาการคอมพิวเตอร์ (B.Sc. Computer Science)', th: 'วิทยาการคอมพิวเตอร์ (B.Sc.)', en: 'B.Sc. Computer Science' },
      { id: 'prog_it_mta', raw: 'เทคโนโลยีมัลติมีเดียและการสร้างสรรค์ (B.Sc. Multimedia Technology and Animation)', th: 'เทคโนโลยีมัลติมีเดียและการสร้างสรรค์ (B.Sc.)', en: 'B.Sc. Multimedia Technology and Animation' },
      { id: 'prog_it_dce', raw: 'วิศวกรรมดิจิทัลและการสื่อสาร (B.Eng. Digital and Communication Engineering)', th: 'วิศวกรรมดิจิทัลและการสื่อสาร (B.Eng.)', en: 'B.Eng. Digital and Communication Engineering' },
      { id: 'prog_it_mcpe', raw: 'M.Sc./Ph.D. Computer Engineering', th: 'มหาบัณฑิต/ดุษฎีบัณฑิต วิศวกรรมคอมพิวเตอร์', en: 'M.Sc./Ph.D. Computer Engineering' },
      { id: 'prog_it_mit', raw: 'M.Sc./Ph.D. Information Technology', th: 'มหาบัณฑิต/ดุษฎีบัณฑิต เทคโนโลยีสารสนเทศ', en: 'M.Sc./Ph.D. Information Technology' }
    ]
  },
  {
    id: 'school_science',
    raw: 'สำนักวิชาวิทยาศาสตร์ (School of Science)',
    th: 'สำนักวิชาวิทยาศาสตร์',
    en: 'School of Science',
    programs: [
      { id: 'prog_sci_ac', raw: 'เคมีประยุกต์ (B.Sc. Applied Chemistry)', th: 'เคมีประยุกต์ (B.Sc.)', en: 'B.Sc. Applied Chemistry' },
      { id: 'prog_sci_ab', raw: 'ชีววิทยาประยุกต์ (B.Sc. Applied Biology)', th: 'ชีววิทยาประยุกต์ (B.Sc.)', en: 'B.Sc. Applied Biology' },
      { id: 'prog_sci_bs', raw: 'วิทยาศาสตร์ชีวภาพ (B.Sc. Biological Science)', th: 'วิทยาศาสตร์ชีวภาพ (B.Sc.)', en: 'B.Sc. Biological Science' },
      { id: 'prog_sci_ms', raw: 'วัสดุศาสตร์ (B.Sc. Materials Science)', th: 'วัสดุศาสตร์ (B.Sc.)', en: 'B.Sc. Materials Science' },
      { id: 'prog_sci_mac', raw: 'M.Sc./Ph.D. Applied Chemistry', th: 'มหาบัณฑิต/ดุษฎีบัณฑิต เคมีประยุกต์', en: 'M.Sc./Ph.D. Applied Chemistry' },
      { id: 'prog_sci_mbs', raw: 'M.Sc./Ph.D. Biological Science', th: 'มหาบัณฑิต/ดุษฎีบัณฑิต วิทยาศาสตร์ชีวภาพ', en: 'M.Sc./Ph.D. Biological Science' }
    ]
  },
  {
    id: 'school_agro',
    raw: 'สำนักวิชาอุตสาหกรรมเกษตร (School of Agro-Industry)',
    th: 'สำนักวิชาอุตสาหกรรมเกษตร',
    en: 'School of Agro-Industry',
    programs: [
      { id: 'prog_agro_fst', raw: 'วิทยาศาสตร์และเทคโนโลยีการอาหาร (B.Sc. Food Science and Technology)', th: 'วิทยาศาสตร์และเทคโนโลยีการอาหาร (B.Sc.)', en: 'B.Sc. Food Science and Technology' },
      { id: 'prog_agro_fie', raw: 'นวัตกรรมอาหารและประกอบการ (B.Sc. Food Innovation and Entrepreneurship)', th: 'นวัตกรรมอาหารและประกอบการ (B.Sc.)', en: 'B.Sc. Food Innovation and Entrepreneurship' },
      { id: 'prog_agro_mfst', raw: 'M.Sc./Ph.D. Food Science and Technology', th: 'มหาบัณฑิต/ดุษฎีบัณฑิต วิทยาศาสตร์และเทคโนโลยีการอาหาร', en: 'M.Sc./Ph.D. Food Science and Technology' }
    ]
  },
  {
    id: 'school_med',
    raw: 'สำนักวิชาแพทยศาสตร์ (School of Medicine)',
    th: 'สำนักวิชาแพทยศาสตร์',
    en: 'School of Medicine',
    programs: [
      { id: 'prog_med_md', raw: 'แพทยศาสตรบัณฑิต (M.D. Doctor of Medicine)', th: 'แพทยศาสตรบัณฑิต (M.D.)', en: 'M.D. Doctor of Medicine' }
    ]
  },
  {
    id: 'school_dent',
    raw: 'สำนักวิชาทันตแพทยศาสตร์ (School of Dentistry)',
    th: 'สำนักวิชาทันตแพทยศาสตร์',
    en: 'School of Dentistry',
    programs: [
      { id: 'prog_dent_dds', raw: 'ทันตแพทยศาสตรบัณฑิต (D.D.S. Doctor of Dental Surgery)', th: 'ทันตแพทยศาสตรบัณฑิต (D.D.S.)', en: 'D.D.S. Doctor of Dental Surgery' }
    ]
  },
  {
    id: 'school_nursing',
    raw: 'สำนักวิชาพยาบาลศาสตร์ (School of Nursing)',
    th: 'สำนักวิชาพยาบาลศาสตร์',
    en: 'School of Nursing',
    programs: [
      { id: 'prog_nurs_bns', raw: 'พยาบาลศาสตรบัณฑิต (B.N.S. Bachelor of Nursing Science)', th: 'พยาบาลศาสตรบัณฑิต (B.N.S.)', en: 'B.N.S. Bachelor of Nursing Science' },
      { id: 'prog_nurs_mns', raw: 'M.N.S. Advanced Nursing Practice', th: 'มหาบัณฑิต การปฏิบัติการพยาบาลขั้นสูง', en: 'M.N.S. Advanced Nursing Practice' }
    ]
  },
  {
    id: 'school_allied',
    raw: 'สำนักวิชาสหเวชศาสตร์ (School of Allied Health Sciences)',
    th: 'สำนักวิชาสหเวชศาสตร์',
    en: 'School of Allied Health Sciences',
    programs: [
      { id: 'prog_allied_mt', raw: 'เทคนิคการแพทย์ (B.Sc. Medical Technology)', th: 'เทคนิคการแพทย์ (B.Sc.)', en: 'B.Sc. Medical Technology' },
      { id: 'prog_allied_pt', raw: 'กายภาพบำบัด (B.Sc. Physical Therapy)', th: 'กายภาพบำบัด (B.Sc.)', en: 'B.Sc. Physical Therapy' }
    ]
  },
  {
    id: 'school_ph',
    raw: 'สำนักวิชาสาธารณสุขศาสตร์ (School of Public Health)',
    th: 'สำนักวิชาสาธารณสุขศาสตร์',
    en: 'School of Public Health',
    programs: [
      { id: 'prog_ph_bph', raw: 'สาธารณสุขศาสตร์ (B.P.H. Public Health)', th: 'สาธารณสุขศาสตร์ (B.P.H.)', en: 'B.P.H. Public Health' },
      { id: 'prog_ph_eh', raw: 'อนามัยสิ่งแวดล้อม (B.Sc. Environmental Health)', th: 'อนามัยสิ่งแวดล้อม (B.Sc.)', en: 'B.Sc. Environmental Health' },
      { id: 'prog_ph_ohs', raw: 'อาชีวอนามัยและความปลอดภัย (B.Sc. Occupational Health and Safety)', th: 'อาชีวอนามัยและความปลอดภัย (B.Sc.)', en: 'B.Sc. Occupational Health and Safety' },
      { id: 'prog_ph_mph', raw: 'M.P.H./Ph.D. Public Health', th: 'มหาบัณฑิต/ดุษฎีบัณฑิต สาธารณสุขศาสตร์', en: 'M.P.H./Ph.D. Public Health' }
    ]
  },
  {
    id: 'school_sim',
    raw: 'สำนักวิชาการแพทย์บูรณาการ (School of Integrative Medicine)',
    th: 'สำนักวิชาการแพทย์บูรณาการ',
    en: 'School of Integrative Medicine',
    programs: [
      { id: 'prog_sim_atm', raw: 'การแพทย์แผนไทยประยุกต์ (B.ATM. Applied Thai Traditional Medicine)', th: 'การแพทย์แผนไทยประยุกต์ (B.ATM.)', en: 'B.ATM. Applied Thai Traditional Medicine' },
      { id: 'prog_sim_tcm', raw: 'การแพทย์แผนจีน (B.CM. Traditional Chinese Medicine)', th: 'การแพทย์แผนจีน (B.CM.)', en: 'B.CM. Traditional Chinese Medicine' },
      { id: 'prog_sim_bsc', raw: 'วิทยาศาสตร์ความงามและเครื่องสำอาง (B.Sc. Beauty Science and Cosmetics)', th: 'วิทยาศาสตร์ความงามและเครื่องสำอาง (B.Sc.)', en: 'B.Sc. Beauty Science and Cosmetics' }
    ]
  },
  {
    id: 'school_antiaging',
    raw: 'สำนักวิชาเวชศาสตร์ชะลอวัยและฟื้นฟูสุขภาพ (School of Anti-Aging and Regenerative Medicine)',
    th: 'สำนักวิชาเวชศาสตร์ชะลอวัยและฟื้นฟูสุขภาพ',
    en: 'School of Anti-Aging and Regenerative Medicine',
    programs: [
      { id: 'prog_anti_msc', raw: 'M.Sc./Ph.D. Anti-Aging and Regenerative Medicine', th: 'มหาบัณฑิต/ดุษฎีบัณฑิต เวชศาสตร์ชะลอวัยและฟื้นฟูสุขภาพ', en: 'M.Sc./Ph.D. Anti-Aging and Regenerative Medicine' },
      { id: 'prog_anti_derm', raw: 'M.Sc. Dermatology', th: 'มหาบัณฑิต ตลับและตัจวิทยา', en: 'M.Sc. Dermatology' }
    ]
  },
  {
    id: 'school_mgmt',
    raw: 'สำนักวิชาการจัดการ (School of Management)',
    th: 'สำนักวิชาการจัดการ',
    en: 'School of Management',
    programs: [
      { id: 'prog_mgmt_bba', raw: 'บริหารธุรกิจ (B.B.A. Business Administration)', th: 'บริหารธุรกิจ (B.B.A.)', en: 'B.B.A. Business Administration' },
      { id: 'prog_mgmt_bacc', raw: 'การบัญชี (B.Acc. Accountancy)', th: 'การบัญชี (B.Acc.)', en: 'B.Acc. Accountancy' },
      { id: 'prog_mgmt_tm', raw: 'การจัดการการท่องเที่ยว (B.B.A. Tourism Management)', th: 'การจัดการการท่องเที่ยว (B.B.A.)', en: 'B.B.A. Tourism Management' },
      { id: 'prog_mgmt_him', raw: 'การจัดการอุตสาหกรรมบริการ (B.B.A. Hospitality Industry Management)', th: 'การจัดการอุตสาหกรรมบริการ (B.B.A.)', en: 'B.B.A. Hospitality Industry Management' },
      { id: 'prog_mgmt_lscm', raw: 'การจัดการโลจิสติกส์และโซ่อุปทาน (B.B.A. Logistics and Supply Chain Management)', th: 'การจัดการโลจิสติกส์และโซ่อุปทาน (B.B.A.)', en: 'B.B.A. Logistics and Supply Chain Management' },
      { id: 'prog_mgmt_econ', raw: 'เศรษฐศาสตร์ (B.Econ. Economics)', th: 'เศรษฐศาสตร์ (B.Econ.)', en: 'B.Econ. Economics' },
      { id: 'prog_mgmt_mba', raw: 'M.B.A. Business Administration', th: 'มหาบัณฑิต บริหารธุรกิจ (M.B.A.)', en: 'M.B.A. Business Administration' },
      { id: 'prog_mgmt_phd_lscm', raw: 'Ph.D. Logistics and Supply Chain Management', th: 'ดุษฎีบัณฑิต การจัดการโลจิสติกส์และโซ่อุปทาน', en: 'Ph.D. Logistics and Supply Chain Management' }
    ]
  },
  {
    id: 'school_la',
    raw: 'สำนักวิชาศิลปศาสตร์ (School of Liberal Arts)',
    th: 'สำนักวิชาศิลปศาสตร์',
    en: 'School of Liberal Arts',
    programs: [
      { id: 'prog_la_eng', raw: 'ภาษาอังกฤษ (B.A. English)', th: 'ภาษาอังกฤษ (B.A.)', en: 'B.A. English' },
      { id: 'prog_la_thai', raw: 'ภาษาและวัฒนธรรมไทย (B.A. Thai Language and Culture)', th: 'ภาษาและวัฒนธรรมไทย (B.A.)', en: 'B.A. Thai Language and Culture' },
      { id: 'prog_la_dev', raw: 'การพัฒนาระหว่างประเทศ (B.A. International Development)', th: 'การพัฒนาระหว่างประเทศ (B.A.)', en: 'B.A. International Development' },
      { id: 'prog_la_maeng', raw: 'M.A./Ph.D. English for Professional Development', th: 'มหาบัณฑิต/ดุษฎีบัณฑิต ภาษาอังกฤษเพื่อการพัฒนาวิชาชีพ', en: 'M.A./Ph.D. English for Professional Development' }
    ]
  },
  {
    id: 'school_sinology',
    raw: 'สำนักวิชาจีนวิทยา (School of Sinology)',
    th: 'สำนักวิชาจีนวิทยา',
    en: 'School of Sinology',
    programs: [
      { id: 'prog_sino_bc', raw: 'ภาษาจีนธุรกิจ (B.A. Business Chinese)', th: 'ภาษาจีนธุรกิจ (B.A.)', en: 'B.A. Business Chinese' },
      { id: 'prog_sino_cs', raw: 'จีนศึกษา (B.A. Chinese Studies)', th: 'จีนศึกษา (B.A.)', en: 'B.A. Chinese Studies' },
      { id: 'prog_sino_tc', raw: 'การสอนภาษาจีน (B.Ed. Teaching Chinese)', th: 'การสอนภาษาจีน (B.Ed.)', en: 'B.Ed. Teaching Chinese' },
      { id: 'prog_sino_clc', raw: 'ภาษาและวัฒนธรรมจีน (B.A. Chinese Language and Culture)', th: 'ภาษาและวัฒนธรรมจีน (B.A.)', en: 'B.A. Chinese Language and Culture' }
    ]
  },
  {
    id: 'school_law',
    raw: 'สำนักวิชานิติศาสตร์ (School of Law)',
    th: 'สำนักวิชานิติศาสตร์',
    en: 'School of Law',
    programs: [
      { id: 'prog_law_llb', raw: 'นิติศาสตรบัณฑิต (LL.B. Bachelor of Laws)', th: 'นิติศาสตรบัณฑิต (LL.B.)', en: 'LL.B. Bachelor of Laws' },
      { id: 'prog_law_llm', raw: 'LL.M. Master of Laws', th: 'นิติศาสตรมหาบัณฑิต (LL.M.)', en: 'LL.M. Master of Laws' }
    ]
  },
  {
    id: 'school_soc',
    raw: 'สำนักวิชานวัตกรรมสังคม (School of Social Innovation)',
    th: 'สำนักวิชานวัตกรรมสังคม',
    en: 'School of Social Innovation',
    programs: [
      { id: 'prog_soc_ir', raw: 'การระหว่างประเทศ (B.A. International Relations)', th: 'การระหว่างประเทศ (B.A.)', en: 'B.A. International Relations' },
      { id: 'prog_soc_sis', raw: 'M.A. Social Innovation and Sustainability', th: 'มหาบัณฑิต นวัตกรรมสังคมและความยั่งยืน', en: 'M.A. Social Innovation and Sustainability' }
    ]
  }
]

export default {
  name: 'FaceEnrollForm',
  data () {
    return {
      studentId: '',
      studentName: '',
      selectedSchool: '',
      selectedProgram: '',
      section: '',
      images: [],
      angles: [
        { key: 'front', label: '', description: '', image: null, icon: 'fa-user' },
        { key: 'left', label: '', description: '', image: null, icon: 'fa-arrow-left' },
        { key: 'right', label: '', description: '', image: null, icon: 'fa-arrow-right' },
        { key: 'tilted', label: '', description: '', image: null, icon: 'fa-arrows-alt-v' }
      ],
      currentAngleIndex: 0,
      cameraActive: false,
      loading: false,
      recording: false,
      countingDown: false,
      countdownVal: 3,
      recordGuideText: '',
      message: {
        text: '',
        type: ''
      },
      stream: null
    }
  },
  computed: {
    isEn () {
      return (this.$i18n && this.$i18n.locale === 'en') || (this.$root && this.$root.$i18n && this.$root.$i18n.locale === 'en')
    },
    localizedAngles () {
      return this.angles.map(angle => ({
        ...angle,
        label: this.$t(`registerPage.angles.${angle.key}`),
        description: this.$t(`registerPage.angles.${angle.key}Desc`)
      }))
    },
    schoolList () {
      return MFU_SCHOOLS
    },
    programList () {
      if (!this.selectedSchool) return []
      const schoolObj = MFU_SCHOOLS.find(s => s.id === this.selectedSchool)
      return schoolObj ? schoolObj.programs : []
    }
  },
  methods: {
    onSchoolChange () {
      this.selectedProgram = ''
    },

    async startCamera () {
      if (this.cameraActive) {
        return
      }

      this.loading = true
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' } })
        this.cameraActive = true
        await this.$nextTick()
        const video = this.$refs.webcam
        if (video) {
          video.srcObject = mediaStream
          try {
            await video.play()
          } catch (err) {
            // ignore play errors
          }
          this.stream = mediaStream
        }
      } catch (error) {
        notifyError(this.$store, error && error.message ? error.message : this.$t('registerPage.messages.cameraAccessError'))
      } finally {
        this.loading = false
      }
    },

    async ensureFaceApiModels () {
      if (!window.faceapi) {
        // Load face-api.js script dynamically if not loaded
        if (!document.getElementById('faceapi-script')) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script')
            script.id = 'faceapi-script'
            script.src = 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js'
            script.onload = resolve
            script.onerror = reject
            document.head.appendChild(script)
          })
        }
      }
      
      if (window.faceapi && (!faceapi.nets.tinyFaceDetector.isLoaded)) {
        this.message = { text: this.$t('registerPage.messages.loadingModel'), type: 'info' }
        // Use tinyFaceDetector model because it is very lightweight and runs fast in real-time
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models')
        this.message = { text: this.$t('registerPage.messages.modelLoaded'), type: 'success' }
      }
    },

    async recordVideo () {
      if (!this.stream) return
      
      this.loading = true
      try {
        await this.ensureFaceApiModels()
      } catch (err) {
        console.error('Failed to load face detection model:', err)
        notifyError(this.$store, this.$t('registerPage.messages.faceDetectLoadError'))
      }
      this.loading = false

      this.countingDown = true
      this.countdownVal = 3
      this.recordGuideText = this.$t('registerPage.preview.lookAtCameraGuide')
      
      // 3 seconds preparation countdown
      await new Promise(resolve => {
        const timer = setInterval(() => {
          this.countdownVal--
          if (this.countdownVal <= 0) {
            clearInterval(timer)
            resolve()
          }
        }, 1000)
      })

      this.countingDown = false
      this.recording = true
      this.countdownVal = 5
      this.recordGuideText = this.$t('registerPage.preview.turnFaceGuide')

      const video = this.$refs.webcam
      const canvas = document.createElement('canvas')
      canvas.width = 640
      canvas.height = 480
      const ctx = canvas.getContext('2d')
      const validFrames = []

      // Capture frames every 250ms (faster rate to yield more options)
      const captureInterval = setInterval(async () => {
        ctx.save()
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        ctx.restore()
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
        
        // Client-side validator: Check if a face actually exists in the frame
        if (window.faceapi) {
          try {
            const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 }))
            if (detection) {
              validFrames.push(dataUrl)
            }
          } catch (e) {
            // fallback if detection fails
            validFrames.push(dataUrl)
          }
        } else {
          validFrames.push(dataUrl)
        }
      }, 250)

      // 5 seconds recording timer
      await new Promise(resolve => {
        const timer = setInterval(() => {
          this.countdownVal--
          if (this.countdownVal <= 0) {
            clearInterval(timer)
            clearInterval(captureInterval)
            resolve()
          }
        }, 1000)
      })

      this.recording = false
      
      // Auto-assign captured valid face frames to the 4 angles
      if (validFrames.length >= 4) {
        // Distribute captured frames evenly to fit the 4 slots
        const step = Math.floor(validFrames.length / 4)
        this.angles[0].image = validFrames[0]
        this.angles[1].image = validFrames[step]
        this.angles[2].image = validFrames[step * 2]
        this.angles[3].image = validFrames[validFrames.length - 1]
        
        this.syncImagesFromAngles()
        this.message = { text: this.$t('registerPage.messages.recordSuccess', { count: validFrames.length }), type: 'success' }
      } else {
        this.message = { text: this.$t('registerPage.messages.noFaceRecorded'), type: 'error' }
        notifyError(this.$store, this.$t('registerPage.messages.noFaceError'))
      }
    },

    syncImagesFromAngles () {
      this.images = this.angles.map(a => a.image).filter(Boolean)
    },
    
    onFileChange (event) {
      const files = Array.from(event.target.files || [])
      if (!files.length) {
        return
      }

      let fileIdx = 0
      for (let i = 0; i < this.angles.length; i++) {
        if (!this.angles[i].image && fileIdx < files.length) {
          const file = files[fileIdx]
          if (!file.type.startsWith('image/')) {
            notifyError(this.$store, this.$t('registerPage.messages.imageOnly'))
            fileIdx++
            continue
          }

          const reader = new FileReader()
          reader.onload = (loadEvent) => {
            this.angles[i].image = loadEvent.target.result
            this.syncImagesFromAngles()
            this.message = { text: this.$t('registerPage.messages.uploadSuccess', { count: this.images.length }), type: 'success' }
          }
          reader.readAsDataURL(file)
          fileIdx++
        }
      }
    },

    async registerFace () {
      if (!this.studentId) {
        notifyError(this.$store, this.$t('registerPage.messages.requireStudentId'))
        return
      }
      if (!this.selectedSchool) {
        notifyError(this.$store, this.$t('registerPage.messages.requireSchool'))
        return
      }
      if (!this.selectedProgram) {
        notifyError(this.$store, this.$t('registerPage.messages.requireProgram'))
        return
      }
      if (!this.section) {
        notifyError(this.$store, this.$t('registerPage.messages.requireSection'))
        return
      }
      
      const missingAngles = this.localizedAngles.filter(a => !a.image).map(a => a.label)
      if (missingAngles.length > 0) {
        notifyError(this.$store, this.$t('registerPage.messages.requireAngles', { angles: missingAngles.join(', ') }))
        return
      }

      this.loading = true
      this.message = { text: '', type: '' }
      try {
        const schoolObj = MFU_SCHOOLS.find(s => s.id === this.selectedSchool)
        const programObj = schoolObj ? schoolObj.programs.find(p => p.id === this.selectedProgram) : null

        const schoolText = schoolObj ? (schoolObj.raw || `${schoolObj.th} (${schoolObj.en})`) : this.selectedSchool
        const programText = programObj ? (programObj.raw || `${programObj.th} (${programObj.en})`) : this.selectedProgram

        const payload = {
          studentId: this.studentId,
          studentName: this.studentName,
          school: schoolText,
          program: programText,
          section: this.section,
          faceFeatures: null, // Node.js registers and Python CCTV calculates vector later on sync
          imageBase64: this.angles[0].image || null,
          faceImages: {
            front:  this.angles.find(a => a.key === 'front')?.image || null,
            left:   this.angles.find(a => a.key === 'left')?.image || null,
            right:  this.angles.find(a => a.key === 'right')?.image || null,
            tilted: this.angles.find(a => a.key === 'tilted')?.image || null
          }
        }
        
        const response = await api.attendance('register', payload)
        if (response && response.data && response.data.success) {
          notifySuccess(this.$store, this.$t('registerPage.messages.saveSuccessNotification'))
          this.message = { text: this.$t('registerPage.messages.saveSuccessMsg'), type: 'success' }
          this.clearForm()
        } else {
          const message = response?.data?.message || this.$t('registerPage.messages.saveFailDefault')
          notifyError(this.$store, message)
          this.message = { text: message, type: 'error' }
        }
      } catch (error) {
        const message = error?.message || this.$t('registerPage.messages.saveErrorDefault')
        notifyError(this.$store, message)
        this.message = { text: message, type: 'error' }
      } finally {
        this.loading = false
      }
    },
    
    clearForm () {
      this.studentId = ''
      this.studentName = ''
      this.selectedSchool = ''
      this.selectedProgram = ''
      this.section = ''
      this.angles.forEach(a => { a.image = null })
      this.syncImagesFromAngles()
    },

    removeImage (index) {
      if (index >= 0 && index < this.angles.length) {
        this.angles[index].image = null
        this.syncImagesFromAngles()
      }
    }
  },
  beforeDestroy () {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop())
    }
  }
}
</script>

<style scoped>
.face-enroll-form .preview-section {
  min-height: 520px;
}
.face-enroll-form .preview-frame {
  width: 100%;
  min-height: 360px;
  max-height: 520px;
  background: #f4f5f7;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.face-enroll-form .preview-placeholder {
  color: #6c757d;
  padding: 1rem;
  text-align: center;
}
.face-enroll-form video {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #000;
}
.face-enroll-form .preview-image-wrapper {
  max-height: 420px;
  overflow: hidden;
}
.face-enroll-form .preview-image {
  width: 100%;
  border-radius: 8px;
  object-fit: contain;
}

/* Video Overlay */
.recording-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #fff;
  z-index: 10;
}
.guide-text {
  font-size: 1.2rem;
  font-weight: bold;
  background: rgba(0, 0, 0, 0.7);
  padding: 8px 16px;
  border-radius: 20px;
  margin-bottom: 12px;
}
.countdown-value {
  font-size: 4rem;
  font-weight: bold;
  color: #e74c3c;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
}

.preview-images-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

/* New Angle Grid Styles */
.angle-selection-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
.angle-slot {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  position: relative;
}
.angle-slot.completed {
  border-color: #10b981;
  border-style: solid;
  background-color: #ecfdf5;
}
.angle-icon-container {
  font-size: 1.2rem;
  color: #9ca3af;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.angle-slot.completed .angle-icon-container {
  color: #10b981;
}
.angle-label-wrapper {
  display: flex;
  flex-direction: column;
  flex: 1;
}
.angle-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #374151;
}
.angle-desc {
  font-size: 0.7rem;
  color: #6b7280;
}
.angle-thumbnail {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  position: relative;
}
.angle-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.remove-btn {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}
.remove-btn:hover {
  background: #dc2626;
}
</style>
