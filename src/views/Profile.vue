<template>
  <div class="web-page">
    <header class="page-header">
      <h1>Profile</h1>
    </header>

    <main class="page-content">
      <section class="profile-card">
        <div class="avatar" aria-hidden="true">{{ profileInitial }}</div>
        <div class="identity">
          <h2>{{ userName }}</h2>
          <p>{{ userEmail }}</p>
        </div>
      </section>

      <section class="account-card">
        <p class="section-label">ACCOUNT</p>
        <button class="action-item" @click="$router.push('/change-email')">
          <div class="action-copy">
            <p class="action-title">Change Email</p>
            <p class="action-subtext">Update your sign-in email address</p>
          </div>
          <span class="action-arrow">&rsaquo;</span>
        </button>

        <button class="action-item action-item--danger" @click="handleLogout">
          <div class="action-copy">
            <p class="action-title">Log Out</p>
            <p class="action-subtext">Sign out from this device</p>
          </div>
          <span class="action-arrow">&rsaquo;</span>
        </button>
      </section>
    </main>

    <BottomNav currentTab="settings" />
  </div>
</template>

<script>
import { onIdTokenChanged, signOut } from 'firebase/auth'
import { auth } from '@/firebase'
import BottomNav from '@/components/BottomNav.vue'
import { clearRememberMeCookie } from '@/utils/rememberMe'

export default {
  name: 'Profile',
  components: {
    BottomNav,
  },
  data() {
    return {
      userName: 'CashSight User',
      userEmail: 'No email linked',
      authUnsubscribe: null,
    }
  },
  computed: {
    profileInitial() {
      const base = this.userName !== 'CashSight User' ? this.userName : this.userEmail
      return base && base.length > 0 ? base[0].toUpperCase() : 'U'
    },
  },
  mounted() {
    this.syncProfileFromAuth()

    if (auth) {
      this.authUnsubscribe = onIdTokenChanged(auth, () => {
        this.syncProfileFromAuth()
      })
    }
  },
  beforeUnmount() {
    if (this.authUnsubscribe) {
      this.authUnsubscribe()
    }
  },
  methods: {
    async syncProfileFromAuth() {
      if (!auth) {
        this.setProfile(null)
        return
      }

      const user = auth.currentUser
      if (!user) {
        this.setProfile(null)
        return
      }

      try {
        await user.reload()
      } catch (error) {
        console.warn('Profile reload skipped:', error)
      }

      this.setProfile(auth.currentUser || user)
    },
    async handleLogout() {
      try {
        if (auth) {
          await signOut(auth)
        }
      } catch (error) {
        console.error('Logout failed:', error)
      } finally {
        clearRememberMeCookie()
        this.$router.push('/login')
      }
    },
    setProfile(user) {
      if (!user) {
        this.userName = 'CashSight User'
        this.userEmail = 'No email linked'
        return
      }

      this.userName = user.displayName || 'CashSight User'
      this.userEmail = user.email || 'No email linked'
    },
  },
}
</script>

<style scoped>
.web-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f2f2f2;
  font-family: 'Trebuchet MS', 'Avenir Next', 'Segoe UI', sans-serif;
}

.page-header {
  padding: 20px;
  border-bottom: 2px solid darkgray;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  color: black;
}

.page-content {
  padding: 20px;
  flex: 1;
}

.profile-card {
  background: white;
  border-radius: 18px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  margin-bottom: 20px;
}

.avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #dce7e2;
  color: #365244;
  font-size: 24px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.identity h2 {
  margin: 0;
  font-size: 20px;
  color: #2f3640;
}

.identity p {
  margin: 4px 0 0;
  color: #7b8190;
  font-size: 14px;
  overflow-wrap: anywhere;
}

.account-card {
  background: white;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.section-label {
  margin: 0;
  padding: 16px 18px 8px;
  color: gray;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.action-item {
  width: 100%;
  border: none;
  background: white;
  padding: 14px 18px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  border-top: 1px solid #ececec;
}

.action-copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.action-title {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: #2f3640;
}

.action-subtext {
  margin: 3px 0 0;
  font-size: 13px;
  color: #7b8190;
}

.action-arrow {
  font-size: 24px;
  line-height: 1;
  color: #a3aab5;
}

.action-item--danger .action-title {
  color: #b42318;
}
</style>
