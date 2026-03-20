<template>
  <main class="grand-page">
    <section class="grand-card">
      <h1>Grand Page</h1>
      <p>You are logged in successfully.</p>
      <router-link to="/login">Back to Login</router-link>
    </section>
  </main>
</template>

<style scoped>
.grand-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: linear-gradient(180deg, #f8faf9 0%, #f4f6f5 100%);
  padding: 24px;
}

.grand-card {
  width: min(100%, 460px);
  background: #ffffff;
  border: 1px solid #e8eeeb;
  border-radius: 12px;
  box-shadow: 0 14px 34px rgba(15, 29, 23, 0.08);
  padding: 32px;
  text-align: center;
}

.grand-card h1 {
  margin: 0 0 8px;
  color: #24302c;
}

.grand-card p {
  margin: 0 0 16px;
  color: #5e6c66;
}

.grand-card a {
  color: #5e9486;
  text-decoration: none;
  font-weight: 700;
}
</style>
