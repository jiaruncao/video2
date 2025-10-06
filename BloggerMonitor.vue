<template>
  <DashboardLayout
    :locale="locale"
    :menu-items="menuItems"
    page-class="blogger-monitor-page"
    content-class="blogger-monitor-content"
    :active-key="activeMenu"
    @navigate="handleMenuClick"
  >
      <div class="content-wrapper">
        <!-- 标题区域 -->
        <div class="header">
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
          <h1>{{ translate('bloggerMonitor.header.title') }}</h1>
          <p>{{ translate('bloggerMonitor.header.subtitle') }}</p>
        </div>

        <!-- 统计卡片 -->
        <div class="stats-grid">
          <div class="stat-card" v-for="stat in statsData" :key="stat.id">
            <span class="stat-icon">{{ stat.icon }}</span>
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ translate(stat.labelKey) }}</div>
          </div>
        </div>

        <!-- 平台监控区域 -->
        <div class="platform-sections">
          <div 
            v-for="platform in platforms" 
            :key="platform.id"
            class="platform-monitor-container"
          >
            <div class="platform-header">
              <span class="platform-icon-large">{{ platform.icon }}</span>
              <span class="platform-name">{{ translate(platform.nameKey) }}</span>
            </div>
            
            <div class="blogger-input-area">
              <div class="input-with-button">
                <el-input
                  v-model="platform.inputValue"
                  :placeholder="translate(platform.placeholderKey)"
                  class="custom-input"
                  @keyup.enter="addBlogger(platform.id)"
                />
                <el-button 
                  type="primary" 
                  class="add-btn"
                  @click="addBlogger(platform.id)"
                >
                  {{ translate('bloggerMonitor.actions.add') }}
                </el-button>
              </div>
              <div class="input-hint">{{ translate(platform.hintKey) }}</div>
            </div>

            <div class="monitored-list">
              <div 
                v-for="(blogger, index) in platform.bloggers" 
                :key="index"
                class="monitored-item"
              >
                <div class="monitored-info">
                  <span class="monitored-name">{{ blogger.name }}</span>
                </div>
                <div :class="['monitored-status', `status-${blogger.status}`]">
                  <span class="status-dot"></span>
                  <span>{{ translate(blogger.statusKey) }}</span>
                </div>
                <el-button 
                  type="danger" 
                  size="mini" 
                  class="remove-btn"
                  @click="removeBlogger(platform.id, index)"
                >
                  {{ translate('bloggerMonitor.actions.remove') }}
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 更新日志区域 -->
        <div class="updates-log-section">
          <div class="log-header">
            <h2 class="log-title">{{ translate('bloggerMonitor.logs.title') }}</h2>
            <div class="log-filter">
              <button 
                v-for="filter in logFilters" 
                :key="filter.value"
                :class="['filter-btn', { active: currentFilter === filter.value }]"
                @click="filterLog(filter.value)"
              >
                {{ translate(filter.labelKey) }}
              </button>
            </div>
          </div>
          
          <div class="log-container">
            <div 
              v-for="(log, index) in filteredLogs" 
              :key="index"
              class="log-item"
              :data-platform="log.platform"
            >
              <div class="log-time">{{ log.timeKey ? translate(log.timeKey) : log.time }}</div>
              <div class="log-content">
                <span class="log-platform-badge">{{ log.platformIcon }} {{ translate(log.platformNameKey) }}</span>
                <div class="log-message">
                  <strong>{{ log.blogger }}</strong> {{ translateWithParams(log.messageKey, log.messageParams) }}
                </div>
                <a href="#" class="log-link" @click.prevent="viewContent(log)">
                  {{ translate(log.linkTextKey) }} →
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- 视频下载区域 -->
        <div class="download-section">
          <div class="download-header">
            <h2 class="download-title">{{ translate('bloggerMonitor.download.title') }}</h2>
            <p class="download-subtitle">{{ translate('bloggerMonitor.download.subtitle') }}</p>
          </div>
          
          <div class="download-input-wrapper">
            <div class="url-input-group">
              <el-input
                v-model="videoUrl"
                :placeholder="translate('bloggerMonitor.download.placeholder')"
                class="url-input"
                @keyup.enter="downloadVideo"
              />
              <el-button 
                type="primary" 
                class="download-btn"
                :loading="downloading"
                @click="downloadVideo"
              >
                <span v-if="!downloading">{{ translate('bloggerMonitor.download.button') }}</span>
                <span v-else>{{ translate('bloggerMonitor.download.processing') }}</span>
              </el-button>
            </div>
            
            <!-- 支持的平台 -->
            <div class="supported-platforms">
              <div 
                v-for="platform in supportedPlatforms" 
                :key="platform.id"
                class="platform-tag"
              >
                <span class="platform-tag-icon">{{ platform.icon }}</span>
                <span>{{ translate(platform.nameKey) }}</span>
              </div>
            </div>
          </div>

          <!-- 处理状态 -->
          <div v-if="downloading" class="process-status">
            <div class="process-icon">⚙️</div>
            <div class="process-text">{{ translate('bloggerMonitor.download.status') }}</div>
          </div>

          <!-- 成功消息 -->
          <transition name="slide-down">
            <div v-if="showSuccessMessage" class="success-message show">
              <span>✅</span> {{ translate('bloggerMonitor.download.success') }}
            </div>
          </transition>
        </div>
      </div>
  </DashboardLayout>
</template>

<script>
import { supportedLocales, translate as translateText } from './i18n'
import DashboardLayout from './components/DashboardLayout.vue'
import { createDashboardMenu } from './dashboardConfig'

export default {
  name: 'BloggerMonitor',

  components: {
    DashboardLayout
  },

  data() {
    return {
      availableLocales: supportedLocales,
      locale: 'en-US',
      // 菜单项
      menuItems: createDashboardMenu('bloggerMonitor'),
      activeMenu: 'bloggerMonitor',
      
      // 统计数据
      statsData: [
        { id: 'bloggers', icon: '👥', value: 8, labelKey: 'bloggerMonitor.stats.bloggers' },
        { id: 'updates', icon: '🔔', value: 12, labelKey: 'bloggerMonitor.stats.updates' },
        { id: 'platforms', icon: '📱', value: 4, labelKey: 'bloggerMonitor.stats.platforms' }
      ],
      
      // 平台数据
      platforms: [
        {
          id: 'tiktok',
          nameKey: 'bloggerMonitor.platforms.tiktok.name',
          icon: '🎵',
          inputValue: '',
          placeholderKey: 'bloggerMonitor.platforms.tiktok.placeholder',
          hintKey: 'bloggerMonitor.platforms.tiktok.hint',
          bloggers: [
            { name: '@trendy_creator', status: 'active', statusKey: 'bloggerMonitor.status.active' },
            { name: '@fashionista', status: 'checking', statusKey: 'bloggerMonitor.status.checking' }
          ]
        },
        {
          id: 'douyin',
          nameKey: 'bloggerMonitor.platforms.douyin.name',
          icon: '🎭',
          inputValue: '',
          placeholderKey: 'bloggerMonitor.platforms.douyin.placeholder',
          hintKey: 'bloggerMonitor.platforms.douyin.hint',
          bloggers: [
            { name: '美食达人', status: 'active', statusKey: 'bloggerMonitor.status.active' }
          ]
        },
        {
          id: 'instagram',
          nameKey: 'bloggerMonitor.platforms.instagram.name',
          icon: '📷',
          inputValue: '',
          placeholderKey: 'bloggerMonitor.platforms.instagram.placeholder',
          hintKey: 'bloggerMonitor.platforms.instagram.hint',
          bloggers: [
            { name: '@photography_pro', status: 'active', statusKey: 'bloggerMonitor.status.active' },
            { name: '@travel_diary', status: 'active', statusKey: 'bloggerMonitor.status.active' }
          ]
        },
        {
          id: 'youtube',
          nameKey: 'bloggerMonitor.platforms.youtube.name',
          icon: '📺',
          inputValue: '',
          placeholderKey: 'bloggerMonitor.platforms.youtube.placeholder',
          hintKey: 'bloggerMonitor.platforms.youtube.hint',
          bloggers: [
            { name: 'TechReviews', status: 'active', statusKey: 'bloggerMonitor.status.active' },
            { name: 'GamingChannel', status: 'active', statusKey: 'bloggerMonitor.status.active' }
          ]
        }
      ],
      
      // 日志过滤器
      logFilters: [
        { value: 'all', labelKey: 'bloggerMonitor.logs.filters.all' },
        { value: 'tiktok', labelKey: 'bloggerMonitor.logs.filters.tiktok' },
        { value: 'douyin', labelKey: 'bloggerMonitor.logs.filters.douyin' },
        { value: 'instagram', labelKey: 'bloggerMonitor.logs.filters.instagram' },
        { value: 'youtube', labelKey: 'bloggerMonitor.logs.filters.youtube' }
      ],
      currentFilter: 'all',
      
      // 日志数据
      logs: [
        {
          timeKey: 'bloggerMonitor.logs.times.tenThirtyTwo',
          platform: 'tiktok',
          platformIcon: '🎵',
          platformNameKey: 'bloggerMonitor.platforms.tiktok.name',
          blogger: '@trendy_creator',
          messageKey: 'bloggerMonitor.logs.messages.postedVideo',
          messageParams: { title: 'Morning Routine 2025 ✨' },
          linkTextKey: 'bloggerMonitor.logs.linkTexts.viewVideo'
        },
        {
          timeKey: 'bloggerMonitor.logs.times.nineFortyFive',
          platform: 'youtube',
          platformIcon: '📺',
          platformNameKey: 'bloggerMonitor.platforms.youtube.name',
          blogger: 'TechReviews',
          messageKey: 'bloggerMonitor.logs.messages.uploadedVideo',
          messageParams: { title: 'iPhone 16 Pro Max Unboxing & First Impressions' },
          linkTextKey: 'bloggerMonitor.logs.linkTexts.viewVideo'
        },
        {
          timeKey: 'bloggerMonitor.logs.times.nineTwenty',
          platform: 'instagram',
          platformIcon: '📷',
          platformNameKey: 'bloggerMonitor.platforms.instagram.name',
          blogger: '@photography_pro',
          messageKey: 'bloggerMonitor.logs.messages.sharedReel',
          messageParams: { title: 'Golden Hour Photography Tips' },
          linkTextKey: 'bloggerMonitor.logs.linkTexts.viewReel'
        },
        {
          timeKey: 'bloggerMonitor.logs.times.eightFiftyFive',
          platform: 'douyin',
          platformIcon: '🎭',
          platformNameKey: 'bloggerMonitor.platforms.douyin.name',
          blogger: '美食达人',
          messageKey: 'bloggerMonitor.logs.messages.postedVideo',
          messageParams: { title: '家常菜教程 - 红烧肉' },
          linkTextKey: 'bloggerMonitor.logs.linkTexts.viewVideo'
        },
        {
          timeKey: 'bloggerMonitor.logs.times.eightThirty',
          platform: 'tiktok',
          platformIcon: '🎵',
          platformNameKey: 'bloggerMonitor.platforms.tiktok.name',
          blogger: '@fashionista',
          messageKey: 'bloggerMonitor.logs.messages.wentLive',
          messageParams: { title: 'Fashion Q&A Session' },
          linkTextKey: 'bloggerMonitor.logs.linkTexts.watchRecording'
        },
        {
          timeKey: 'bloggerMonitor.logs.times.yesterday',
          platform: 'youtube',
          platformIcon: '📺',
          platformNameKey: 'bloggerMonitor.platforms.youtube.name',
          blogger: 'GamingChannel',
          messageKey: 'bloggerMonitor.logs.messages.premieredVideo',
          messageParams: { title: 'Cyberpunk 2077 - Full Walkthrough Part 1' },
          linkTextKey: 'bloggerMonitor.logs.linkTexts.viewVideo'
        }
      ],
      
      // 支持的平台
      supportedPlatforms: [
        { id: 'tiktok', icon: '🎵', nameKey: 'bloggerMonitor.platforms.tiktok.name' },
        { id: 'douyin', icon: '🎭', nameKey: 'bloggerMonitor.platforms.douyin.name' },
        { id: 'instagram', icon: '📷', nameKey: 'bloggerMonitor.supportedPlatforms.instagramReels' },
        { id: 'youtube', icon: '📺', nameKey: 'bloggerMonitor.supportedPlatforms.youtubeShorts' },
        { id: 'twitter', icon: '📱', nameKey: 'bloggerMonitor.supportedPlatforms.twitter' },
        { id: 'snapchat', icon: '👻', nameKey: 'bloggerMonitor.supportedPlatforms.snapchat' }
      ],
      
      // 视频下载
      videoUrl: '',
      downloading: false,
      showSuccessMessage: false,
      
      // 自动更新定时器
      updateTimer: null
    }
  },
  
  computed: {
    // 过滤后的日志
    filteredLogs() {
      if (this.currentFilter === 'all') {
        return this.logs
      }
      return this.logs.filter(log => log.platform === this.currentFilter)
    }
  },
  
  mounted() {
    // 启动自动更新检查
    this.startAutoUpdate()
  },
  
  beforeDestroy() {
    // 清理定时器
    if (this.updateTimer) {
      clearInterval(this.updateTimer)
    }
  },
  
  methods: {
    // 处理菜单点击
    handleMenuClick(key) {
      this.activeMenu = key
      this.menuItems = createDashboardMenu(key)
    },
    
    // 添加博主
    addBlogger(platformId) {
      const platform = this.platforms.find(p => p.id === platformId)
      if (!platform.inputValue.trim()) {
        this.$message.warning(this.translate('bloggerMonitor.messages.enterBlogger'))
        return
      }
      
      // 创建新博主
      const newBlogger = {
        name: platform.inputValue.trim(),
        status: 'checking',
        statusKey: 'bloggerMonitor.status.checking'
      }
      
      // 添加到列表
      platform.bloggers.push(newBlogger)
      
      // 模拟状态更新
      setTimeout(() => {
        newBlogger.status = 'active'
        newBlogger.statusKey = 'bloggerMonitor.status.active'
        
        // 添加日志
        this.addLogEntry(platformId, newBlogger.name)
      }, 2000)
      
      // 更新统计
      this.updateStats('bloggers', 1)
      
      // 清空输入
      platform.inputValue = ''
      
      // 显示成功消息
      this.$message.success(this.translate('bloggerMonitor.messages.addSuccess'))
    },
    
    // 移除博主
    removeBlogger(platformId, index) {
      const platform = this.platforms.find(p => p.id === platformId)
      platform.bloggers.splice(index, 1)
      
      // 更新统计
      this.updateStats('bloggers', -1)
      
      this.$message.info(this.translate('bloggerMonitor.messages.removeSuccess'))
    },
    
    getLocalizedTimeString(date = new Date()) {
      const locale = this.locale === 'zh-CN' ? 'zh-CN' : 'en-US'
      return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
    },

    // 添加日志条目
    addLogEntry(platformId, bloggerName) {
      const now = new Date()
      const time = this.getLocalizedTimeString(now)

      const platformInfo = {
        tiktok: { icon: '🎵', nameKey: 'bloggerMonitor.platforms.tiktok.name' },
        douyin: { icon: '🎭', nameKey: 'bloggerMonitor.platforms.douyin.name' },
        instagram: { icon: '📷', nameKey: 'bloggerMonitor.platforms.instagram.name' },
        youtube: { icon: '📺', nameKey: 'bloggerMonitor.platforms.youtube.name' }
      }
      
      const platform = platformInfo[platformId]
      
      const newLog = {
        time,
        timeKey: null,
        platform: platformId,
        platformIcon: platform.icon,
        platformNameKey: platform.nameKey,
        blogger: bloggerName,
        messageKey: 'bloggerMonitor.logs.messages.addedToMonitoring',
        messageParams: {},
        linkTextKey: 'bloggerMonitor.logs.linkTexts.checkProfile'
      }
      
      // 添加到日志开头
      this.logs.unshift(newLog)
      
      // 更新统计
      this.updateStats('updates', 1)
    },
    
    // 过滤日志
    filterLog(filter) {
      this.currentFilter = filter
    },
    
    // 查看内容
    viewContent(log) {
      this.$message.info(this.translateWithParams('bloggerMonitor.messages.openingContent', { blogger: log.blogger }))
      // 这里可以实现实际的跳转逻辑
    },
    
    // 下载视频
    async downloadVideo() {
      if (!this.videoUrl.trim()) {
        this.$message.warning(this.translate('bloggerMonitor.messages.enterVideoUrl'))
        return
      }
      
      if (!this.videoUrl.startsWith('http')) {
        this.$message.error(this.translate('bloggerMonitor.messages.invalidUrl'))
        return
      }
      
      this.downloading = true
      
      // 模拟下载过程
      setTimeout(() => {
        this.downloading = false
        this.showSuccessMessage = true
        
        // 清空输入
        this.videoUrl = ''
        
        // 3秒后隐藏成功消息
        setTimeout(() => {
          this.showSuccessMessage = false
        }, 3000)
        
        console.log('Video downloaded successfully')
      }, 2500)
    },
    
    // 更新统计
    updateStats(type, change) {
      const stat = this.statsData.find(s => s.id === type)
      if (stat) {
        stat.value += change
      }
    },
    
    // 启动自动更新
    startAutoUpdate() {
      // 每30秒检查一次更新
      this.updateTimer = setInterval(() => {
        this.checkForUpdates()
      }, 30000)
    },
    
    // 检查更新（模拟）
    checkForUpdates() {
      if (Math.random() > 0.5) {
        const platforms = ['tiktok', 'douyin', 'instagram', 'youtube']
        const bloggers = ['@trendy_creator', '美食达人', '@photography_pro', 'TechReviews']
        const messageTemplates = [
          { key: 'bloggerMonitor.logs.messages.postedVideo', notificationKey: 'bloggerMonitor.notifications.postedVideo' },
          { key: 'bloggerMonitor.logs.messages.wentLive', notificationKey: 'bloggerMonitor.notifications.wentLive' },
          { key: 'bloggerMonitor.logs.messages.sharedReel', notificationKey: 'bloggerMonitor.notifications.sharedReel' },
          { key: 'bloggerMonitor.logs.messages.uploadedContent', notificationKey: 'bloggerMonitor.notifications.uploadedContent' }
        ]

        const platform = platforms[Math.floor(Math.random() * platforms.length)]
        const blogger = bloggers[Math.floor(Math.random() * bloggers.length)]
        const template = messageTemplates[Math.floor(Math.random() * messageTemplates.length)]

        const now = new Date()
        const time = this.getLocalizedTimeString(now)

        const platformInfo = {
          tiktok: { icon: '🎵', nameKey: 'bloggerMonitor.platforms.tiktok.name' },
          douyin: { icon: '🎭', nameKey: 'bloggerMonitor.platforms.douyin.name' },
          instagram: { icon: '📷', nameKey: 'bloggerMonitor.platforms.instagram.name' },
          youtube: { icon: '📺', nameKey: 'bloggerMonitor.platforms.youtube.name' }
        }

        const platformData = platformInfo[platform]

        this.logs.unshift({
          time,
          platform,
          platformIcon: platformData.icon,
          platformNameKey: platformData.nameKey,
          blogger,
          messageKey: template.key,
          messageParams: { title: this.translate('bloggerMonitor.logs.messages.genericTitle') },
          linkTextKey: 'bloggerMonitor.logs.linkTexts.viewContent',
          timeKey: null
        })

        this.updateStats('updates', 1)

        this.$notify({
          title: this.translate('bloggerMonitor.notifications.title'),
          message: this.translateWithParams(template.notificationKey, { blogger }),
          type: 'info',
          duration: 3000
        })
      }
    },

    translate(key) {
      return translateText(this.locale, key)
    },

    translateWithParams(key, params = {}) {
      let textValue = this.translate(key)
      Object.keys(params || {}).forEach(param => {
        textValue = textValue.replace(new RegExp(`{${param}}`, 'g'), params[param])
      })
      return textValue
    }
  }
}
</script>

<style lang="scss" scoped>
@import './BloggerMonitor.scss';

.language-switcher {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  color: #475569;

  .language-label {
    font-size: 14px;
    font-weight: 500;
  }

  .language-select {
    padding: 6px 12px;
    border-radius: 8px;
    border: 1px solid #cbd5f5;
    background: #f8fafc;
    color: #334155;
    font-size: 14px;

    &:focus {
      outline: none;
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
    }
  }
}
</style>
