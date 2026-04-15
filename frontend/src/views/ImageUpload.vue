<template>
  <div class="web-page">
    <header class="page-header">
      <h1>Receipt Upload</h1>
      <p>Turn a receipt image into a reviewed expense entry.</p>
    </header>

    <main class="page-content">
      <ImageUploader />
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
};
</script>

<style scoped>
.web-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(circle at 100% -10%, #dff1ea 0%, transparent 36%),
    radial-gradient(circle at 0% 0%, #e9f3ef 0%, transparent 30%),
    #f4f6f5;
}

.page-header {
  padding: 20px;
  border-bottom: 2px solid darkgray;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(4px);
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  color: #24302c;
}

.page-header p {
  margin: 6px 0 0;
  color: #5e6c66;
  font-size: 14px;
}

.page-content {
  flex: 1;
  padding: 20px;
}
</style>
