<template>
  <div class="register-page">
    <div class="register-header mb-4">
      <div>
        <div class="text-muted">{{ $t('registerPage.directory') }}</div>
        <h1>{{ $t('registerPage.title') }}</h1>
        <p>{{ $t('registerPage.subtitle') }}</p>
      </div>
    </div>

    <CRow>
      <CCol xl="12" lg="12" sm="12">
        <CCard>
          <CCardBody>
            <h5>{{ $t('registerPage.sectionTitle') }}</h5>
            <p>{{ $t('registerPage.sectionSubtitle') }}</p>
            <FaceEnrollForm />
            <div class="mt-4 text-right">
              <router-link class="btn btn-primary" to="/directory/cctv">{{ $t('registerPage.goToCctv') }}</router-link>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  </div>
</template>

<script>
import FaceEnrollForm from '@/components/Attendance/FaceEnrollForm'

export default {
  name: 'AccountRegister',
  components: {
    FaceEnrollForm
  }
}
</script>

<style scoped>
.register-header h1 {
  margin-bottom: 0.5rem;
}
</style>
