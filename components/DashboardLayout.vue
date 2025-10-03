<template>
  <div :class="['dashboard-shell', pageClass]">
    <aside class="sidebar">
      <div class="logo">{{ translate('app.brand') }}</div>
      <nav class="nav-menu">
        <button
          v-for="item in normalizedMenu"
          :key="item.key"
          type="button"
          :class="['nav-item', { active: item.active } ]"
          @click="onMenuClick(item.key)"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span class="nav-label">{{ item.label }}</span>
        </button>
      </nav>
      <div class="sidebar-footer">
        <slot name="sidebar-footer">
          <div class="user-info">
            <div class="nav-item user-account">
              <span class="nav-icon">👤</span>
              <div class="user-details">
                <div class="user-name">{{ translate(user.nameKey || 'app.user.account') }}</div>
                <div class="user-plan">{{ translate(user.planKey || 'app.user.plan') }}</div>
              </div>
            </div>
          </div>
        </slot>
      </div>
    </aside>
    <main class="main-container">
      <div :class="['content-wrapper', contentClass]">
        <slot />
      </div>
    </main>
  </div>
</template>

<script>
import { translate as translateText } from '../i18n'

export default {
  name: 'DashboardLayout',
  props: {
    locale: {
      type: String,
      required: true
    },
    menuItems: {
      type: Array,
      default: () => []
    },
    pageClass: {
      type: String,
      default: ''
    },
    contentClass: {
      type: String,
      default: ''
    },
    activeKey: {
      type: String,
      default: ''
    },
    user: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['navigate'],
  computed: {
    normalizedMenu() {
      return this.menuItems.map(item => {
        const key = item.key || item.labelKey || item.label
        const label = item.labelKey
          ? this.translate(item.labelKey)
          : (item.label || key)
        const isActive = this.activeKey
          ? key === this.activeKey
          : !!item.active
        return {
          ...item,
          key,
          label,
          active: isActive
        }
      })
    }
  },
  methods: {
    translate(key) {
      return translateText(this.locale, key)
    },
    onMenuClick(key) {
      this.$emit('navigate', key)
    }
  }
}
</script>

<style scoped lang="scss">
.dashboard-shell {
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
  color: #0f172a;
  font-family: 'Inter', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.sidebar {
  width: 264px;
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
  color: #e2e8f0;
  padding: 32px 24px 24px;
  display: flex;
  flex-direction: column;
  box-shadow: 8px 0 24px rgba(15, 23, 42, 0.08);
}

.logo {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 40px;
  letter-spacing: 0.5px;
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.nav-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border: none;
  background: transparent;
  color: inherit;
  font-size: 14px;
  font-weight: 500;
  border-radius: 12px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
}

.nav-item:hover {
  background: rgba(148, 163, 184, 0.15);
  transform: translateX(4px);
}

.nav-item.active {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.18), rgba(59, 130, 246, 0.18));
  color: #ffffff;
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.2);
}

.nav-icon {
  font-size: 16px;
}

.sidebar-footer {
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid rgba(148, 163, 184, 0.2);
}

.user-info {
  margin-top: 12px;
}

.user-account {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(148, 163, 184, 0.12);
  color: #f8fafc;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-name {
  font-weight: 600;
}

.user-plan {
  font-size: 12px;
  color: rgba(226, 232, 240, 0.7);
}

.main-container {
  flex: 1;
  padding: 36px 48px;
  overflow-y: auto;
}

.content-wrapper {
  max-width: 1440px;
  margin: 0 auto;
  width: 100%;
}

@media (max-width: 1200px) {
  .dashboard-shell {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    flex-direction: row;
    align-items: center;
    gap: 16px;
    padding: 20px;
    overflow-x: auto;
  }

  .nav-menu {
    flex-direction: row;
    flex-wrap: nowrap;
  }

  .nav-item {
    flex: 0 0 auto;
  }

  .sidebar-footer {
    border-top: none;
    margin-top: 0;
    padding-top: 0;
  }

  .main-container {
    padding: 24px;
  }
}
</style>
