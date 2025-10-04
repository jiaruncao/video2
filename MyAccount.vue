<template>
  <DashboardLayout
    :locale="locale"
    :menu-items="menuItems"
    page-class="my-account-page"
    content-class="my-account-content"
    :active-key="activeMenu"
    @navigate="handleMenuClick"
  >
      <!-- 右上角用户头像 -->
      <div class="top-user-avatar" @click="scrollToTop">{{ userInitials }}</div>

      <div class="content-wrapper">
        <div class="language-switcher">
          <label :for="`${$options.name}-locale`" class="language-label">
            {{ translate('language.label') }}
          </label>
          <select :id="`${$options.name}-locale`" v-model="locale" class="language-select">
            <option v-for="code in availableLocales" :key="code" :value="code">
              {{ translate(`language.options.${code}`) }}
            </option>
          </select>
        </div>

        <!-- 标题区域 -->
        <div class="header">
          <h1>{{ translate('myAccount.header.title') }}</h1>
          <p>{{ translate('myAccount.header.subtitle') }}</p>
        </div>

        <!-- 账户概览卡片 -->
        <el-card class="card-container">
          <div class="section-title">{{ translate('myAccount.sections.accountOverview') }}</div>
          
          <!-- 点击展开账户信息 -->
          <div class="user-profile" @click="toggleAccountInfo">
            <div class="avatar">{{ userInitials }}</div>
            <div class="user-info">
              <div class="user-name">{{ userData.name }}</div>
              <div class="user-email">{{ userData.email }}</div>
              <el-tag 
                :type="currentPlan === 'FREE PLAN' ? 'warning' : 'primary'"
                effect="plain"
                class="user-badge"
              >
                {{ currentPlan }}
              </el-tag>
            </div>
            <div class="expand-indicator">
              <span>{{ translate('myAccount.account.viewSettings') }}</span>
              <i :class="['el-icon-arrow-down', 'expand-arrow', { expanded: accountInfoExpanded }]"></i>
            </div>
          </div>

          <!-- 可折叠的账户设置 -->
          <el-collapse-transition>
            <div v-show="accountInfoExpanded" class="account-settings">
              <div class="setting-row">
                <div class="setting-label">
                  <span class="setting-title">{{ translate('myAccount.account.fullName') }}</span>
                  <span class="setting-value">{{ userData.name }}</span>
                </div>
                <div class="setting-action">
                  <el-button size="small" @click.stop="editProfile">{{ translate('myAccount.account.edit') }}</el-button>
                </div>
              </div>
              
              <div class="setting-row">
                <div class="setting-label">
                  <span class="setting-title">{{ translate('myAccount.account.email') }}</span>
                  <span class="setting-value">{{ userData.email }}</span>
                </div>
                <div class="setting-action">
                  <el-button size="small" @click.stop="changeEmail">{{ translate('myAccount.account.changeEmail') }}</el-button>
                </div>
              </div>

              <div class="setting-row">
                <div class="setting-label">
                  <span class="setting-title">{{ translate('myAccount.account.password') }}</span>
                  <span class="setting-value">••••••••••••</span>
                </div>
                <div class="setting-action">
                  <el-button size="small" @click.stop="changePassword">{{ translate('myAccount.account.changePassword') }}</el-button>
                </div>
              </div>

              <div class="setting-row">
                <div class="setting-label">
                  <span class="setting-title">{{ translate('myAccount.account.accountCreated') }}</span>
                  <span class="setting-value">{{ userData.accountCreated }}</span>
                </div>
                <div class="setting-action">
                  <el-button type="danger" size="small" @click.stop="deleteAccount">{{ translate('myAccount.account.deleteAccount') }}</el-button>
                </div>
              </div>
            </div>
          </el-collapse-transition>
        </el-card>

        <!-- 每日使用限制 -->
        <el-card class="card-container">
          <div class="section-title">{{ translate('myAccount.sections.dailyUsage') }}</div>
          
          <div v-for="usage in usageData" :key="usage.type" class="usage-item">
            <div class="usage-header">
              <span class="usage-title">{{ translate(usage.titleKey) }}</span>
              <span class="usage-count">{{ usage.used }} / {{ usage.limit }} {{ translate(usage.unitKey) }}</span>
            </div>
            <el-progress 
              :percentage="usage.percentage" 
              :stroke-width="8"
              :show-text="false"
              :color="getProgressColor(usage.percentage)"
            />
          </div>

          <p class="usage-notice">
            {{ translate('myAccount.usage.notice') }}
          </p>
        </el-card>

        <!-- 订阅计划 -->
        <el-card class="card-container">
          <div class="section-title">{{ translate('myAccount.sections.subscriptionPlans') }}</div>
          
          <!-- 计费周期切换 -->
          <div class="billing-toggle">
            <span :class="['billing-option', { active: !isYearly }]">{{ translate('myAccount.billing.monthly') }}</span>
            <el-switch 
              v-model="isYearly"
              active-color="#6366f1"
              inactive-color="#e2e8f0"
              @change="handleBillingChange"
            />
            <span :class="['billing-option', { active: isYearly }]">{{ translate('myAccount.billing.yearly') }}</span>
            <el-tag type="success" size="mini" class="save-badge">{{ translate('myAccount.billing.save') }}</el-tag>
          </div>

          <el-row :gutter="20" class="plans-grid">
            <!-- 免费计划 -->
            <el-col :xs="24" :sm="24" :md="8">
              <div :class="['plan-card', { current: currentPlan === 'FREE PLAN' }]">
                <div class="plan-name">{{ translate('myAccount.plans.free.name') }}</div>
                <div class="plan-price">
                  {{ formatMessage('myAccount.plans.pricePerMonth', { price: '$0' }) }}
                </div>
                <div class="plan-desc">{{ translate('myAccount.plans.free.desc') }}</div>
                <el-tag type="warning" effect="plain" class="plan-expiry">
                  {{ translate('myAccount.plans.free.expiry') }}
                </el-tag>
                <ul class="plan-features">
                  <li
                    class="plan-feature"
                    v-for="featureKey in planFeatures.free"
                    :key="featureKey"
                  >
                    {{ translate(featureKey) }}
                  </li>
                </ul>
                <el-button
                  :disabled="currentPlan === 'FREE PLAN'"
                  class="plan-btn"
                >
                  {{ currentPlan === 'FREE PLAN'
                    ? translate('myAccount.plans.buttons.current')
                    : translate('myAccount.plans.buttons.downgrade')
                  }}
                </el-button>
              </div>
            </el-col>

            <!-- Pro计划 -->
            <el-col :xs="24" :sm="24" :md="8">
              <div :class="['plan-card', 'recommended', { current: currentPlan === 'PRO PLAN' }]">
                <el-tag type="success" class="plan-badge">{{ translate('myAccount.plans.pro.badge') }}</el-tag>
                <div class="plan-name">{{ translate('myAccount.plans.pro.name') }}</div>
                <div class="plan-price">
                  {{ formatMessage('myAccount.plans.pricePerMonth', { price: isYearly ? '$15.20' : '$19' }) }}
                  <span v-if="isYearly" class="original-price">{{ formatMessage('myAccount.plans.originalPrice', { price: '$19' }) }}</span>
                </div>
                <div class="plan-desc">{{ translate('myAccount.plans.pro.desc') }}</div>
                <el-tag
                  v-if="currentPlan === 'PRO PLAN'"
                  type="warning"
                  effect="plain"
                  class="plan-expiry"
                >
                  {{ formatMessage('myAccount.plans.expires', { date: proExpiry }) }}
                </el-tag>
                <ul class="plan-features">
                  <li
                    class="plan-feature"
                    v-for="featureKey in planFeatures.pro"
                    :key="featureKey"
                  >
                    {{ translate(featureKey) }}
                  </li>
                </ul>
                <el-button
                  type="primary"
                  class="plan-btn"
                  @click="upgradePlan('pro')"
                  :disabled="currentPlan === 'PRO PLAN'"
                >
                  {{ currentPlan === 'PRO PLAN'
                    ? translate('myAccount.plans.buttons.current')
                    : translate('myAccount.plans.buttons.upgradePro')
                  }}
                </el-button>
              </div>
            </el-col>

            <!-- Enterprise计划 -->
            <el-col :xs="24" :sm="24" :md="8">
              <div :class="['plan-card', { current: currentPlan === 'ENTERPRISE PLAN' }]">
                <div class="plan-name">{{ translate('myAccount.plans.enterprise.name') }}</div>
                <div class="plan-price">
                  {{ formatMessage('myAccount.plans.pricePerMonth', { price: isYearly ? '$79.20' : '$99' }) }}
                  <span v-if="isYearly" class="original-price">{{ formatMessage('myAccount.plans.originalPrice', { price: '$99' }) }}</span>
                </div>
                <div class="plan-desc">{{ translate('myAccount.plans.enterprise.desc') }}</div>
                <el-tag
                  v-if="currentPlan === 'ENTERPRISE PLAN'"
                  type="warning"
                  effect="plain"
                  class="plan-expiry"
                >
                  {{ formatMessage('myAccount.plans.expires', { date: enterpriseExpiry }) }}
                </el-tag>
                <ul class="plan-features">
                  <li
                    class="plan-feature"
                    v-for="featureKey in planFeatures.enterprise"
                    :key="featureKey"
                  >
                    {{ translate(featureKey) }}
                  </li>
                </ul>
                <el-button
                  type="primary"
                  class="plan-btn"
                  @click="upgradePlan('enterprise')"
                  :disabled="currentPlan === 'ENTERPRISE PLAN'"
                >
                  {{ currentPlan === 'ENTERPRISE PLAN'
                    ? translate('myAccount.plans.buttons.current')
                    : translate('myAccount.plans.buttons.upgradeEnterprise')
                  }}
                </el-button>
              </div>
            </el-col>
          </el-row>

          <!-- 取消订阅按钮 -->
          <div v-if="currentPlan !== 'FREE PLAN'" class="cancel-section">
            <el-button type="danger" @click="cancelSubscription">
              {{ translate('myAccount.plans.cancel') }}
            </el-button>
            <p class="cancel-notice">
              {{ translate('myAccount.plans.cancelNotice') }}
            </p>
          </div>
        </el-card>

        <!-- 最近活动 -->
        <el-card class="card-container">
          <div class="section-title">{{ translate('myAccount.sections.recentActivity') }}</div>
          <div class="activity-list">
            <div v-for="activity in activities" :key="activity.id" class="activity-item">
              <div
                class="activity-icon"
                :style="{ background: activity.iconBg, color: activity.iconColor }"
              >
                {{ activity.icon }}
              </div>
              <div class="activity-details">
                <div class="activity-title">{{ formatMessage(activity.titleKey, activity.titleParams) }}</div>
                <div class="activity-time">{{ formatMessage(activity.timeKey, activity.timeParams) }}</div>
              </div>
              <el-tag :type="activity.statusKey === 'myAccount.activities.status.completed' ? 'success' : 'warning'" size="mini">
                {{ translate(activity.statusKey) }}
              </el-tag>
              <el-button
                type="primary"
                size="mini"
                @click="downloadFile(activity.file)"
              >
                {{ translate('myAccount.activities.download') }}
              </el-button>
            </div>
          </div>
        </el-card>
      </div>
  </DashboardLayout>
</template>

<script>
import { supportedLocales, translate as translateText } from './i18n'
import DashboardLayout from './components/DashboardLayout.vue'
import { createDashboardMenu } from './dashboardConfig'

const PLAN_NAME_KEYS = {
  pro: 'myAccount.plans.pro.name',
  enterprise: 'myAccount.plans.enterprise.name'
}

const PLAN_STATE_VALUES = {
  pro: 'PRO PLAN',
  enterprise: 'ENTERPRISE PLAN'
}

export default {
  name: 'MyAccount',
  components: {
    DashboardLayout
  },
  data() {
    return {
      availableLocales: supportedLocales,
      locale: 'en-US',
      // 用户数据
      userData: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        accountCreated: 'January 15, 2024'
      },

      // 当前计划
      currentPlan: 'FREE PLAN',

      // 计费周期
      isYearly: true,

      // 账户信息展开状态
      accountInfoExpanded: false,

      // 计划到期日期
      proExpiry: '',
      enterpriseExpiry: '',

      // 菜单项
      menuItems: createDashboardMenu('settings'),
      activeMenu: 'settings',

      // 使用量数据
      usageData: [
        { type: 'video', titleKey: 'myAccount.usage.items.video.title', used: 3, limit: 5, unitKey: 'myAccount.usage.items.video.unit', percentage: 60 },
        { type: 'watermark', titleKey: 'myAccount.usage.items.watermark.title', used: 8, limit: 10, unitKey: 'myAccount.usage.items.watermark.unit', percentage: 80 },
        { type: 'style', titleKey: 'myAccount.usage.items.style.title', used: 1, limit: 3, unitKey: 'myAccount.usage.items.style.unit', percentage: 33 },
        { type: 'audio', titleKey: 'myAccount.usage.items.audio.title', used: 2, limit: 5, unitKey: 'myAccount.usage.items.audio.unit', percentage: 40 },
        { type: 'storage', titleKey: 'myAccount.usage.items.storage.title', used: 2.4, limit: 5, unitKey: 'myAccount.usage.items.storage.unit', percentage: 48 }
      ],

      // 计划特性
      planFeatures: {
        free: [
          'myAccount.plans.free.features.enhancements',
          'myAccount.plans.free.features.watermark',
          'myAccount.plans.free.features.style',
          'myAccount.plans.free.features.storage',
          'myAccount.plans.free.features.speed'
        ],
        pro: [
          'myAccount.plans.pro.features.enhancements',
          'myAccount.plans.pro.features.watermark',
          'myAccount.plans.pro.features.style',
          'myAccount.plans.pro.features.storage',
          'myAccount.plans.pro.features.speed',
          'myAccount.plans.pro.features.resolution'
        ],
        enterprise: [
          'myAccount.plans.enterprise.features.everything',
          'myAccount.plans.enterprise.features.team',
          'myAccount.plans.enterprise.features.storage',
          'myAccount.plans.enterprise.features.api',
          'myAccount.plans.enterprise.features.support',
          'myAccount.plans.enterprise.features.integrations'
        ]
      },

      // 最近活动
      activities: [
        {
          id: 1,
          icon: '✨',
          iconBg: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
          iconColor: '#1e40af',
          titleKey: 'myAccount.activities.titles.videoEnhanced',
          titleParams: { filename: 'summer_vacation.mp4' },
          timeKey: 'myAccount.activities.times.hoursAgo',
          timeParams: { count: 2 },
          statusKey: 'myAccount.activities.status.completed',
          file: 'summer_vacation_enhanced.mp4'
        },
        {
          id: 2,
          icon: '🧹',
          iconBg: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
          iconColor: '#065f46',
          titleKey: 'myAccount.activities.titles.watermarkRemoved',
          titleParams: { filename: 'product_photo.jpg' },
          timeKey: 'myAccount.activities.times.hoursAgo',
          timeParams: { count: 4 },
          statusKey: 'myAccount.activities.status.completed',
          file: 'product_photo_clean.jpg'
        },
        {
          id: 3,
          icon: '🎨',
          iconBg: 'linear-gradient(135deg, #ede9fe, #ddd6fe)',
          iconColor: '#5b21b6',
          titleKey: 'myAccount.activities.titles.styleTransfer',
          titleParams: { filename: 'portrait.png' },
          timeKey: 'myAccount.activities.times.yesterdayAt',
          timeParams: { time: '3:45 PM' },
          statusKey: 'myAccount.activities.status.completed',
          file: 'portrait_styled.png'
        },
        {
          id: 4,
          icon: '🔊',
          iconBg: 'linear-gradient(135deg, #fed7aa, #fdba74)',
          iconColor: '#9a3412',
          titleKey: 'myAccount.activities.titles.audioEnhanced',
          titleParams: { filename: 'podcast_episode.mp3' },
          timeKey: 'myAccount.activities.times.yesterdayAt',
          timeParams: { time: '10:30 AM' },
          statusKey: 'myAccount.activities.status.completed',
          file: 'podcast_episode_enhanced.mp3'
        },
        {
          id: 5,
          icon: '✨',
          iconBg: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
          iconColor: '#1e40af',
          titleKey: 'myAccount.activities.titles.videoEnhanced',
          titleParams: { filename: 'presentation.mp4' },
          timeKey: 'myAccount.activities.times.daysAgo',
          timeParams: { count: 2 },
          statusKey: 'myAccount.activities.status.completed',
          file: 'presentation_enhanced.mp4'
        }
      ]
    }
  },

  computed: {
    // 计算用户名缩写
    userInitials() {
      return this.userData.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
    }
  },

  methods: {
    translate(key) {
      return translateText(this.locale, key)
    },
    formatMessage(key, params = {}) {
      let message = this.translate(key)
      Object.entries(params || {}).forEach(([paramKey, value]) => {
        message = message.replace(new RegExp(`{${paramKey}}`, 'g'), value)
      })
      return message
    },

    // 切换账户信息展开/折叠
    toggleAccountInfo() {
      this.accountInfoExpanded = !this.accountInfoExpanded
    },

    // 处理菜单点击
    handleMenuClick(key) {
      this.activeMenu = key
      this.menuItems = createDashboardMenu(key)
    },

    // 处理计费周期切换
    handleBillingChange(value) {
      console.log('Billing changed to:', value ? 'Yearly' : 'Monthly')
    },

    // 获取进度条颜色
    getProgressColor(percentage) {
      if (percentage >= 80) return '#ef4444'
      if (percentage >= 60) return '#f59e0b'
      return '#6366f1'
    },

    // 升级计划
    upgradePlan(plan) {
      const planPrices = {
        pro: this.isYearly ? '$182.40/year' : '$19/month',
        enterprise: this.isYearly ? '$950.40/year' : '$99/month'
      }
      const planName = this.translate(PLAN_NAME_KEYS[plan])
      const billingLabel = this.translate(this.isYearly ? 'myAccount.billing.yearly' : 'myAccount.billing.monthly')

      this.$confirm(
        this.formatMessage('myAccount.dialogs.upgrade.message', {
          price: planPrices[plan],
          billing: billingLabel
        }),
        this.formatMessage('myAccount.dialogs.upgrade.title', { plan: planName }),
        {
          confirmButtonText: this.translate('myAccount.dialogs.upgrade.confirm'),
          cancelButtonText: this.translate('myAccount.dialogs.upgrade.cancel'),
          dangerouslyUseHTMLString: true,
          type: 'info'
        }
      ).then(() => {
        this.$message.info(this.translate('myAccount.messages.redirecting'))

        setTimeout(() => {
          this.currentPlan = PLAN_STATE_VALUES[plan]

          const today = new Date()
          const expiryDate = new Date(today)
          if (this.isYearly) {
            expiryDate.setFullYear(expiryDate.getFullYear() + 1)
          } else {
            expiryDate.setMonth(expiryDate.getMonth() + 1)
          }
          const expiryString = expiryDate.toLocaleDateString(this.locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })

          if (plan === 'pro') {
            this.proExpiry = expiryString
          } else {
            this.enterpriseExpiry = expiryString
          }

          this.$message.success(this.formatMessage('myAccount.messages.upgradeSuccess', { plan: planName }))
        }, 1500)
      }).catch(() => {
        console.log('Upgrade cancelled')
      })
    },

    // 取消订阅
    cancelSubscription() {
      this.$confirm(
        this.translate('myAccount.dialogs.cancelSubscription.message'),
        this.translate('myAccount.dialogs.cancelSubscription.title'),
        {
          confirmButtonText: this.translate('myAccount.dialogs.cancelSubscription.confirm'),
          cancelButtonText: this.translate('myAccount.dialogs.cancelSubscription.cancel'),
          type: 'warning'
        }
      ).then(() => {
        this.currentPlan = 'FREE PLAN'
        this.proExpiry = ''
        this.enterpriseExpiry = ''
        this.$message.success(this.translate('myAccount.messages.subscriptionCancelled'))
      }).catch(() => {
        console.log('Cancellation aborted')
      })
    },

    // 编辑个人资料
    editProfile() {
      this.$prompt(
        this.translate('myAccount.dialogs.editProfile.prompt'),
        this.translate('myAccount.dialogs.editProfile.title'),
        {
          confirmButtonText: this.translate('myAccount.dialogs.editProfile.confirm'),
          cancelButtonText: this.translate('myAccount.dialogs.editProfile.cancel'),
          inputValue: this.userData.name,
          inputPattern: /^.{2,}$/, 
          inputErrorMessage: this.translate('myAccount.dialogs.editProfile.validation')
        }
      ).then(({ value }) => {
        this.userData.name = value
        this.$message.success(this.translate('myAccount.messages.profileUpdated'))
      }).catch(() => {
        console.log('Edit cancelled')
      })
    },

    // 更改邮箱
    changeEmail() {
      this.$prompt(
        this.translate('myAccount.dialogs.changeEmail.prompt'),
        this.translate('myAccount.dialogs.changeEmail.title'),
        {
          confirmButtonText: this.translate('myAccount.dialogs.changeEmail.confirm'),
          cancelButtonText: this.translate('myAccount.dialogs.changeEmail.cancel'),
          inputValue: this.userData.email,
          inputPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          inputErrorMessage: this.translate('myAccount.dialogs.changeEmail.validation')
        }
      ).then(({ value }) => {
        this.$message.success(this.formatMessage('myAccount.messages.emailVerification', { email: value }))
      }).catch(() => {
        console.log('Email change cancelled')
      })
    },

    // 更改密码
    changePassword() {
      this.$prompt(
        this.translate('myAccount.dialogs.changePassword.currentPrompt'),
        this.translate('myAccount.dialogs.changePassword.title'),
        {
          confirmButtonText: this.translate('myAccount.dialogs.changePassword.next'),
          cancelButtonText: this.translate('myAccount.dialogs.changePassword.cancel'),
          inputType: 'password'
        }
      ).then(() => {
        return this.$prompt(
          this.translate('myAccount.dialogs.changePassword.newPrompt'),
          this.translate('myAccount.dialogs.changePassword.newTitle'),
          {
            confirmButtonText: this.translate('myAccount.dialogs.changePassword.confirm'),
            cancelButtonText: this.translate('myAccount.dialogs.changePassword.cancel'),
            inputType: 'password',
            inputPattern: /^.{8,}$/,
            inputErrorMessage: this.translate('myAccount.dialogs.changePassword.validation')
          }
        )
      }).then(() => {
        this.$message.success(this.translate('myAccount.messages.passwordChanged'))
      }).catch(() => {
        console.log('Password change cancelled')
      })
    },

    // 删除账户
    deleteAccount() {
      this.$confirm(
        this.translate('myAccount.dialogs.deleteAccount.message'),
        this.translate('myAccount.dialogs.deleteAccount.title'),
        {
          confirmButtonText: this.translate('myAccount.dialogs.deleteAccount.confirm'),
          cancelButtonText: this.translate('myAccount.dialogs.deleteAccount.cancel'),
          type: 'error',
          dangerouslyUseHTMLString: true
        }
      ).then(() => {
        return this.$prompt(
          this.translate('myAccount.dialogs.deleteAccount.prompt'),
          this.translate('myAccount.dialogs.deleteAccount.promptTitle'),
          {
            confirmButtonText: this.translate('myAccount.dialogs.deleteAccount.promptConfirm'),
            cancelButtonText: this.translate('myAccount.dialogs.deleteAccount.cancel'),
            inputPattern: /^DELETE$/,
            inputErrorMessage: this.translate('myAccount.dialogs.deleteAccount.promptValidation')
          }
        )
      }).then(() => {
        this.$message.warning(this.translate('myAccount.messages.accountDeletionInitiated'))
      }).catch(() => {
        console.log('Account deletion cancelled')
      })
    },

    // 下载文件
    downloadFile(filename) {
      this.$message.info(this.formatMessage('myAccount.messages.download', { filename }))
      console.log('Download initiated for:', filename)
    },

    // 滚动到顶部
    scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }
  },

  mounted() {
    console.log('MyAccount component mounted')
  }
}
</script>


<style lang="scss" scoped>
@import './MyAccount.scss';
</style>
