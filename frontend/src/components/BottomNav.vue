<template>
    <div class="bottom-nav-shell">
        <div class="bottom-nav-spacer" aria-hidden="true"></div>

        <nav class="bottom-nav">
            <!--5 buttons in Nav Bar, with logo and label, colour switch on current tab opened-->
            <button class="nav-button" :class="{ active: currentTab === 'dashboard'}" :disabled="disableNavigation" @click="navigate('/dashboard')">
                <svg class="nav-icon" viewBox="0 0 24 24" fill="none">
                    <rect x="4" y="4" width="6" height="6" rx="1" />
                    <rect x="14" y="4" width="6" height="6" rx="1" />
                    <rect x="4" y="14" width="6" height="6" rx="1" />
                    <rect x="14" y="14" width="6" height="6" rx="1" />
                </svg>
                <span class="nav-label">Dashboard</span>
            </button>

            <button class="nav-button" :class="{ active: currentTab === 'transactions'}" :disabled="disableNavigation" @click="navigate('/transactions')">
                <svg class="nav-icon" viewBox="0 0 24 24" fill="none">
                    <path d="M6 3h12v18l-2-1-2 1-2-1-2 1-2-1-2 1V3z" />
                    <path d="M9 8h6" />
                    <path d="M9 12h6" />
                </svg>
                <span class="nav-label">Transaction</span>
            </button>

            <button class="nav-button" :class="{ active: currentTab === 'insights'}" :disabled="disableNavigation" @click="navigate('/insights')">
                <svg class="nav-icon" viewBox="0 0 24 24" fill="none">
                    <path d="M4 16l5-5 4 3 7-7" />
                    <path d="M17 7h3v3" />
                </svg>
                <span class="nav-label">Insights</span>
            </button>

            <button class="nav-button" :class="{ active: currentTab === 'uploader'}" :disabled="disableNavigation" @click="navigate('/uploader')">
                <svg class="nav-icon" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <circle cx="9" cy="10" r="2" />
                    <path d="M5 17l5-5 3 3 2-2 4 4" />
                </svg>
                <span class="nav-label">Upload</span>
            </button>

            <button class="nav-button" :class="{ active: currentTab === 'settings'}" :disabled="disableNavigation" @click="navigate('/settings')">
                <svg class="nav-icon" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="3.2" />
                    <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a2 2 0 1 1-4 0v-.2a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a2 2 0 1 1 0-4h.2a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9V4a2 2 0 1 1 4 0v.2a1 1 0 0 0 .6.9 1 1 0 0 0 1.1-.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6H20a2 2 0 1 1 0 4h-.2a1 1 0 0 0-.9.6z" />
                </svg>
                <span class="nav-label">Settings</span>
            </button>
        </nav>
    </div>
</template>

<script>
export default {
    name: "BottomNav",
    props: {
        currentTab: {
            type: String,
            required: true
        },
        disableNavigation: {
            type: Boolean,
            default: false
        }
    },
    methods: {
        navigate(path) {
            if (this.disableNavigation) {
                return
            }
            this.$router.push(path)
        }
    }
};
</script>

<style scoped>
.bottom-nav-shell {
    position: relative;
}

.bottom-nav-spacer {
    height: calc(60px + env(safe-area-inset-bottom));
}

.bottom-nav {
    position: fixed;
    left: 0;
    transform: none;
    width: 100%;
    bottom: 0;
    z-index: 20;
    display: flex;
    justify-content: space-between;
    gap: 2px;
    padding: 6px 8px calc(8px + env(safe-area-inset-bottom));
    background: #fff;
    border-top: 1px solid #b7bfbc;
    box-shadow: 0 -3px 12px rgba(15, 23, 42, 0.08);
}

.nav-button {
    border: 0;
    background: transparent;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 2px;
    color: #98a2b3;
    cursor: pointer;
    flex: 1 1 0;
    max-width: none;
    min-width: 0;
    padding: 4px 0;
}

.nav-button:disabled {
    opacity: 0.45;
    cursor: not-allowed;
}

.nav-icon {
    width: 18px;
    height: 18px;
    stroke: currentColor;
    stroke-width: 1.8;
    stroke-linecap: round;
    stroke-linejoin: round;
}

.nav-label {
    font-size: 11px;
    font-weight: 500;
    text-align: center;
    width: 100%;
    white-space: nowrap;
}

.nav-button.active{
    color: #2f6657
}
</style>