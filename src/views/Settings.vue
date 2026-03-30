<template>
    <div class="web-page">
        <header class="page-header">
            <h1>Settings</h1>
        </header>

        <main class="page-content">
            <p class="desc">Preferences</p>
            <div class="content settings-group">
                
                <button class="menu-item" @click="$router.push('/goals')">
                    <div class="menu-left">
                        <div class="menu-icon-circle">
                            <svg class="menu-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"></circle>
                                <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2"></circle>
                                <circle cx="12" cy="12" r="1" fill="currentColor"></circle>
                            </svg>
                        </div>
                        <div class="menu-text">
                            <p class="menu-title">Goals</p>
                            <p class="menu-subtext">Set spending caps and savings targets</p>
                        </div>
                    </div>
                    <svg class="menu-arrow" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 7L15 12L10 17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path>
                    </svg>
                </button>

                <button class="menu-item">
                    <div class="menu-left">
                        <div class="menu-icon-circle">
                            <svg class="menu-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6.5 7.5a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                                <path d="M3 6v5.172a2 2 0 0 0 .586 1.414l7.71 7.71a2.41 2.41 0 0 0 3.408 0l5.592 -5.592a2.41 2.41 0 0 0 0 -3.408l-7.71 -7.71a2 2 0 0 0 -1.414 -.586h-5.172a3 3 0 0 0 -3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                            </svg>
                        </div>
                        <div class="menu-text">
                            <p class="menu-title">Categories</p>
                            <p class="menu-subtext">Manage expense and income categories</p>
                        </div>
                    </div>
                    <svg class="menu-arrow" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 7L15 12L10 17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path>
                    </svg>
                </button>

            </div>
        </main>

        <BottomNav currentTab="settings" />
    </div>
</template>

<script>
// Make sure this path is correct for your project
import BottomNav from "@/components/BottomNav.vue"

export default {
    name: "Settings",
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
    background: #f2f2f2;
    font-family: "Trebuchet MS", "Avenir Next", "Segoe UI", sans-serif;
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

.desc {
    color: gray;
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    margin: 0 0 10px 4px;
}

.settings-group {
    background: white;
    border-radius: 18px;
    overflow: hidden;
    margin-bottom: 20px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.menu-item {
    width: 100%;
    background: white;
    border: none;
    padding: 16px 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
}

.menu-item + .menu-item {
    border-top: 1px solid #ececec;
}

.menu-left {
    display: flex;
    align-items: center;
    gap: 14px;
}

.menu-icon-circle {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #f3f4f6;
    color: #6b7280;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.menu-icon {
    width: 32px;
    height: 32px;
}

.menu-text {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.menu-title {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: #2f3640;
}

.menu-subtext {
    margin: 2px 0 0 0;
    font-size: 14px;
    color: #7b8190;
}

.menu-arrow {
    width: 18px;
    height: 18px;
    color: #a3aab5;
    flex-shrink: 0;
}

.why-icon, .info-icon {
    width: 30px;
    height:30px;
}

</style>
