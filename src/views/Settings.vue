<template>
    <div class="web-page">
        <header class="page-header">
            <h1>Settings</h1>
        </header>

        <main class="page-content">
            <div class="placeholder">
                To insert Settings content
            </div>
        </main>

        <BottomNav currentTab="settings" />
    </div>
</template>

<script>
import BottomNav from "@/components/BottomNav.vue"

export default {
    name:"Settings",
    components: {
        BottomNav
    }
}
</script>

<style scoped>
.web-page {
    min-height: 100vh;
    display:flex;
    flex-direction: column;
    background: white;
}

.page-header {
    padding:20px;
    border-bottom: 2px solid darkgray;
}

.page-header h1 {
    margin: 0;
    font-size: 24px;
    color:black
}

.page-content {
    padding: 20px;
    flex: 1;
}

.placeholder {
    padding: 24px;
    text-align: center;
    color: #94a3b8;
    border: 1px solid #edf1f4;
    border-radius: 12px
}
</style>