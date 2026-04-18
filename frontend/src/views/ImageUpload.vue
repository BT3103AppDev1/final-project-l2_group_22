<template>
  <div class="web-page">
    <header class="page-header">
      <h1>Receipt Upload</h1>
    </header>

    <main class="page-content">
      <section class="content-shell">
        <ImageUploader />
      </section>
    </main>

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
  beforeRouteLeave(to, from, next) {
    const uploaderEl = this.$refs?.uploaderRef
    // If there's no active processing, allow navigation
    if (!uploaderEl || !uploaderEl.isProcessing) {
      const confirmed = window.confirm(
        'Are you sure you want to leave? If a receipt was scanned, the result will be saved automatically.'
      )
      if (confirmed) {
        next()
      } else {
        next(false)
      }
    } else {
      const confirmed = window.confirm(
        'A receipt is still being processed. Are you sure you want to leave? The scan may not be saved.'
      )
      if (confirmed) {
        next()
      } else {
        next(false)
      }
    }
  }
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
  border-bottom: 2px solid darkgray;
  background: #ffffff;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  color: #24302c;
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
