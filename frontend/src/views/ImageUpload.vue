<template>
  <div class="web-page">
    <header class="page-header">
      <h1>Receipt Upload</h1>
    </header>

    <main class="page-content">
      <section class="content-shell">
        <ImageUploader ref="uploaderRef" />
      </section>
    </main>

    <div v-if="showLeaveModal" class="modal-overlay" @click.self="stayOnPage">
      <div class="leave-modal" role="dialog" aria-modal="true" aria-label="Leave upload page">
        <h2>Leave this page?</h2>
        <p>{{ leaveMessage }}</p>
        <button class="leave-btn confirm" @click="confirmLeave">Leave</button>
        <button class="leave-btn cancel" @click="stayOnPage">Stay</button>
      </div>
    </div>

    <BottomNav currentTab="uploader" />
  </div>
</template>

<script>
import BottomNav from "@/components/BottomNav.vue";
import ImageUploader from "@/components/ImageUploader.vue";

export default {
  name: "ImageUpload",
  components: {
    BottomNav,
    ImageUploader,
  },
  data() {
    return {
      showLeaveModal: false,
      leaveMessage: '',
      pendingNavigation: null,
    }
  },
  beforeRouteLeave(to, from, next) {
    const uploaderEl = this.$refs?.uploaderRef
    const isProcessing = Boolean(uploaderEl?.isProcessing?.value ?? uploaderEl?.isProcessing)
    const hasSelectedPhoto = Boolean(uploaderEl?.hasSelectedPhoto?.value ?? uploaderEl?.hasSelectedPhoto)

    if (!hasSelectedPhoto && !isProcessing) {
      next()
      return
    }

    this.leaveMessage = isProcessing
      ? 'A receipt is still being processed. Are you sure you want to leave? The scan may not be saved.'
      : 'Are you sure you want to leave? If a receipt was scanned, the result will be saved automatically.'

    this.pendingNavigation = next
    this.showLeaveModal = true
  },
  methods: {
    confirmLeave() {
      const next = this.pendingNavigation
      this.pendingNavigation = null
      this.showLeaveModal = false
      if (next) {
        next()
      }
    },
    stayOnPage() {
      const next = this.pendingNavigation
      this.pendingNavigation = null
      this.showLeaveModal = false
      if (next) {
        next(false)
      }
    },
  },
};
</script>

<style scoped>
.web-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(circle at 100% -10%, #d8efe4 0%, transparent 38%),
    radial-gradient(circle at 0% 5%, #f0efe6 0%, transparent 34%),
    linear-gradient(170deg, #f7f8f7 0%, #eff2f1 100%);
}

.page-header {
  padding: 20px;
  height: 76px;
  box-sizing: border-box;
  border-bottom: 1px solid #dfe6e3;
  background: #ffffff;
  display: flex;
  align-items: center;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  color: #24302c;
  font-weight: 600;
  font-family: 'Poppins', sans-serif;
}

.page-content {
  flex: 1;
  padding: 18px;
}

.content-shell {
  width: min(100%, 980px);
  margin: 0 auto;
  animation: content-enter 460ms ease-out;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.leave-modal {
  width: min(420px, 92%);
  background: #fff;
  border-radius: 18px;
  padding: 24px;
  text-align: center;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.18);
}

.leave-modal h2 {
  margin: 0;
  color: #24302c;
}

.leave-modal p {
  margin: 12px 0 18px;
  color: #5e6c66;
  line-height: 1.5;
}

.leave-btn {
  width: 100%;
  border-radius: 12px;
  padding: 12px;
  border: none;
  cursor: pointer;
  font-weight: 600;
}

.leave-btn.confirm {
  background: #b42318;
  color: #fff;
}

.leave-btn.cancel {
  margin-top: 8px;
  background: #f3f4f6;
  color: #374151;
}

@media (min-width: 768px) {
  .page-content {
    padding: 24px;
  }
}

@keyframes content-enter {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
