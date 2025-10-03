<template>
  <DashboardLayout
    :locale="locale"
    :menu-items="menuItems"
    page-class="ai-video-generator-page"
    content-class="ai-video-generator-content"
    :active-key="activeMenu"
    @navigate="handleMenuClick"
  >
      <div class="content-wrapper">
        <div class="language-switcher">
          <label for="language-select">{{ translate('language.label') }}</label>
          <el-select
            id="language-select"
            v-model="locale"
            size="mini"
          >
            <el-option
              v-for="code in availableLocales"
              :key="code"
              :label="translate(`language.options.${code}`)"
              :value="code"
            />
          </el-select>
        </div>
        <!-- 标题区域 -->
        <div class="header">
          <h1>{{ translate('adGenerator.header.title') }}</h1>
          <p>{{ translate('adGenerator.header.subtitle') }}</p>
        </div>

        <!-- 模板选择区域 - 占满双栏 -->
        <div class="template-section">
          <div class="section-header">
            <h2 class="section-title-large">{{ translate('adGenerator.templatesSection.title') }}</h2>
            <p class="section-subtitle">{{ translate('adGenerator.templatesSection.subtitle') }}</p>
          </div>

          <!-- 分类标签 -->
          <div class="template-categories">
            <div class="category-tabs">
              <button
                v-for="category in categories"
                :key="category.value"
                :class="['category-tab', { active: currentCategory === category.value }]"
                @click="filterTemplates(category.value)"
              >
                {{ translate(category.labelKey) }}
              </button>
            </div>
          </div>

          <!-- 模板网格 -->
          <div class="template-grid-large">
            <div 
              v-for="template in filteredTemplates"
              :key="template.id"
              :class="['template-card', { 
                'selected': selectedTemplate === template.id,
                'horizontal-template': template.horizontal 
              }]"
              :data-category="template.category"
              @click="selectTemplate(template.id)"
            >
              <div class="template-preview-wrapper">
                <img class="template-preview" :src="template.preview" :alt="translate(template.nameKey)">
                <div class="template-overlay">
                  <span class="play-icon">▶</span>
                </div>
              </div>
              <div class="template-info">
                <h3 class="template-name">{{ translate(template.nameKey) }}</h3>
                <p class="template-desc">{{ translate(template.descriptionKey) }}</p>
                <div class="template-tags">
                  <span class="tag">{{ translate(template.platformKey) }}</span>
                  <span v-if="template.badgeKey" :class="['tag', template.badgeType]">{{ translate(template.badgeKey) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 主要工作区 -->
        <div class="workspace">
          <!-- 左侧：产品上传 -->
          <div class="workspace-left">
            <!-- 产品上传 -->
            <div class="upload-container">
              <div class="upload-header">
                <span class="section-title">{{ translate('adGenerator.upload.title') }}</span>
                <el-button type="text" class="reset-btn" @click="resetUpload">
                  <i class="el-icon-refresh-left"></i> {{ translate('adGenerator.upload.reset') }}
                </el-button>
              </div>
              <p class="upload-hint">{{ translate('adGenerator.upload.hint') }}</p>

              <el-upload
                class="upload-area"
                drag
                action="#"
                :show-file-list="false"
                :before-upload="handleFileUpload"
                accept="image/jpeg,image/jpg,image/png"
              >
                <div v-if="!productImage" class="upload-content">
                  <div class="upload-icon">📤</div>
                  <div class="upload-title">{{ translate('adGenerator.upload.placeholder') }}</div>
                  <div class="upload-subtitle">{{ translate('adGenerator.upload.instructions') }}</div>
                  <el-button class="upload-btn">{{ translate('adGenerator.upload.button') }}</el-button>
                </div>
                <img v-else :src="productImage" class="uploaded-image">
              </el-upload>

              <div class="tip-box">
                <strong>{{ translate('adGenerator.upload.tipLabel') }}</strong> {{ translate('adGenerator.upload.tipContent') }}
              </div>

              <!-- 示例产品 -->
              <div class="sample-products">
                <div
                  v-for="sample in sampleProducts"
                  :key="sample.type"
                  class="sample-product"
                  @click="loadSampleProduct(sample.type)"
                >
                  <img :src="sample.image" :alt="translate(sample.altKey)">
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧：运动文案和设置 -->
          <div class="workspace-right">
            <!-- 运动文案 -->
            <div class="settings-container">
              <div class="section-title">{{ translate('adGenerator.motion.title') }}</div>
              <el-input
                type="textarea"
                v-model="motionText"
                :rows="5"
                :placeholder="translate('adGenerator.motion.placeholder')"
                class="motion-input"
                @input="handleMotionInput"
              ></el-input>
              <div class="motion-preset">
                <el-button
                  v-for="preset in motionPresets"
                  :key="preset.type"
                  size="small"
                  class="preset-btn"
                  @click="setMotionPreset(preset.type)"
                >
                  {{ translate(preset.labelKey) }}
                </el-button>
              </div>
            </div>

            <!-- 生成按钮 -->
            <div class="actions-container">
              <el-button
                type="primary"
                class="generate-btn"
                :disabled="!productImage || isGenerating"
                :loading="isGenerating"
                @click="generateVideo"
              >
                <span v-if="!isGenerating">{{ translate('adGenerator.actions.generate') }} <span class="credit-count">1</span></span>
                <span v-else>{{ translate('adGenerator.actions.generating') }}</span>
              </el-button>

              <!-- 进度信息 -->
              <div v-if="isGenerating" class="process-info">
                <div class="process-status">
                  <div class="status-icon">⏳</div>
                  <div class="status-text">{{ translate('adGenerator.status.processing') }}</div>
                  <div class="status-percent">{{ processPercent }}%</div>
                </div>
                <el-progress
                  :percentage="processPercent"
                  :stroke-width="8"
                  :show-text="false"
                ></el-progress>
              </div>
            </div>
          </div>
        </div>

        <!-- 预览区域 -->
        <div class="preview-section">
          <div class="preview-header">
            <h2 class="preview-title">{{ translate('adGenerator.preview.title') }}</h2>
          </div>
          <div class="preview-container">
            <div v-if="!generatedVideo" class="preview-placeholder">
              <div class="preview-placeholder-icon">🎥</div>
              <p class="placeholder-title">{{ translate('adGenerator.preview.placeholderTitle') }}</p>
              <p class="placeholder-text">{{ translate('adGenerator.preview.placeholderText') }}</p>
            </div>
            <div v-else class="generated-content">
              <div class="video-mockup">
                <div class="mockup-icon">🎬</div>
                <div>{{ translate('adGenerator.preview.successTitle') }}</div>
                <div class="mockup-info">{{ translate('adGenerator.preview.templateLabel') }} {{ selectedTemplateName }}</div>
              </div>
              <div class="preview-actions">
                <el-button type="success" @click="downloadVideo">
                  <i class="el-icon-download"></i> {{ translate('adGenerator.actions.download') }}
                </el-button>
                <el-button type="primary" @click="regenerateVideo">
                  <i class="el-icon-refresh"></i> {{ translate('adGenerator.actions.regenerate') }}
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
  </DashboardLayout>
</template>

<script>
import { supportedLocales, translate as translateText } from './i18n'
import DashboardLayout from './components/DashboardLayout.vue'
import { createDashboardMenu } from './dashboardConfig'

export default {
  name: 'AIAdVideoGenerator',
  components: {
    DashboardLayout
  },
  data() {
    return {
      availableLocales: supportedLocales,
      locale: 'en-US',
      // 菜单项
      menuItems: createDashboardMenu('adGenerator'),
      activeMenu: 'adGenerator',

      // 分类
      categories: [
        { value: 'all', labelKey: 'adGenerator.categories.all' },
        { value: 'tiktok', labelKey: 'adGenerator.categories.tiktok' },
        { value: 'youtube', labelKey: 'adGenerator.categories.youtube' },
        { value: 'trending', labelKey: 'adGenerator.categories.trending' }
      ],
      currentCategory: 'all',

      // 模板数据
      templates: [
        {
          id: 'unboxing',
          nameKey: 'adGenerator.templates.unboxing.name',
          descriptionKey: 'adGenerator.templates.unboxing.description',
          category: 'tiktok trending',
          platformKey: 'adGenerator.templates.unboxing.platform',
          badgeKey: 'adGenerator.templates.unboxing.badge',
          badgeType: 'hot',
          preview: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9 16"%3E%3Crect fill="%23ff69b4" width="9" height="16"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="white" font-size="2">📦%3C/text%3E%3C/svg%3E',
          horizontal: false
        },
        {
          id: 'product-reveal',
          nameKey: 'adGenerator.templates.productReveal.name',
          descriptionKey: 'adGenerator.templates.productReveal.description',
          category: 'tiktok',
          platformKey: 'adGenerator.templates.productReveal.platform',
          preview: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9 16"%3E%3Crect fill="%236366f1" width="9" height="16"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="white" font-size="2">✨%3C/text%3E%3C/svg%3E',
          horizontal: false
        },
        {
          id: 'before-after',
          nameKey: 'adGenerator.templates.beforeAfter.name',
          descriptionKey: 'adGenerator.templates.beforeAfter.description',
          category: 'tiktok',
          platformKey: 'adGenerator.templates.beforeAfter.platform',
          preview: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9 16"%3E%3Crect fill="%2310b981" width="9" height="16"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="white" font-size="2">🔄%3C/text%3E%3C/svg%3E',
          horizontal: false
        },
        {
          id: 'lifestyle',
          nameKey: 'adGenerator.templates.lifestyle.name',
          descriptionKey: 'adGenerator.templates.lifestyle.description',
          category: 'tiktok trending',
          platformKey: 'adGenerator.templates.lifestyle.platform',
          badgeKey: 'adGenerator.templates.lifestyle.badge',
          badgeType: 'trending',
          preview: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9 16"%3E%3Crect fill="%23fbbf24" width="9" height="16"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="white" font-size="2">🌟%3C/text%3E%3C/svg%3E',
          horizontal: false
        },
        {
          id: 'testimonial',
          nameKey: 'adGenerator.templates.testimonial.name',
          descriptionKey: 'adGenerator.templates.testimonial.description',
          category: 'tiktok',
          platformKey: 'adGenerator.templates.testimonial.platform',
          preview: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9 16"%3E%3Crect fill="%23a855f7" width="9" height="16"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="white" font-size="2">💬%3C/text%3E%3C/svg%3E',
          horizontal: false
        },
        {
          id: 'flash-sale',
          nameKey: 'adGenerator.templates.flashSale.name',
          descriptionKey: 'adGenerator.templates.flashSale.description',
          category: 'tiktok trending',
          platformKey: 'adGenerator.templates.flashSale.platform',
          badgeKey: 'adGenerator.templates.flashSale.badge',
          badgeType: 'new',
          preview: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9 16"%3E%3Crect fill="%23ef4444" width="9" height="16"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="white" font-size="2">⚡%3C/text%3E%3C/svg%3E',
          horizontal: false
        },
        {
          id: 'youtube-intro',
          nameKey: 'adGenerator.templates.youtubeIntro.name',
          descriptionKey: 'adGenerator.templates.youtubeIntro.description',
          category: 'youtube',
          platformKey: 'adGenerator.templates.youtubeIntro.platform',
          preview: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 9"%3E%3Crect fill="%23dc2626" width="16" height="9"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="white" font-size="2">▶️%3C/text%3E%3C/svg%3E',
          horizontal: true
        },
        {
          id: 'comparison',
          nameKey: 'adGenerator.templates.comparison.name',
          descriptionKey: 'adGenerator.templates.comparison.description',
          category: 'youtube',
          platformKey: 'adGenerator.templates.comparison.platform',
          preview: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 9"%3E%3Crect fill="%230891b2" width="16" height="9"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="white" font-size="2">⚖️%3C/text%3E%3C/svg%3E',
          horizontal: true
        },
        {
          id: 'tutorial',
          nameKey: 'adGenerator.templates.tutorial.name',
          descriptionKey: 'adGenerator.templates.tutorial.description',
          category: 'youtube',
          platformKey: 'adGenerator.templates.tutorial.platform',
          preview: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 9"%3E%3Crect fill="%2316a34a" width="16" height="9"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="white" font-size="2">📚%3C/text%3E%3C/svg%3E',
          horizontal: true
        },
        {
          id: 'showcase',
          nameKey: 'adGenerator.templates.showcase.name',
          descriptionKey: 'adGenerator.templates.showcase.description',
          category: 'youtube trending',
          platformKey: 'adGenerator.templates.showcase.platform',
          badgeKey: 'adGenerator.templates.showcase.badge',
          badgeType: 'hot',
          preview: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 9"%3E%3Crect fill="%237c3aed" width="16" height="9"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="white" font-size="2">🎬%3C/text%3E%3C/svg%3E',
          horizontal: true
        }
      ],

      // 示例产品
      sampleProducts: [
        {
          type: 'cosmetic',
          image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23e0f2fe" width="100" height="100"/%3E%3Ctext x="50" y="55" text-anchor="middle" font-size="40">🧴%3C/text%3E%3C/svg%3E',
          altKey: 'adGenerator.samples.cosmetic'
        },
        {
          type: 'perfume',
          image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23fce7f3" width="100" height="100"/%3E%3Ctext x="50" y="55" text-anchor="middle" font-size="40">🍾%3C/text%3E%3C/svg%3E',
          altKey: 'adGenerator.samples.perfume'
        },
        {
          type: 'skincare',
          image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23dcfce7" width="100" height="100"/%3E%3Ctext x="50" y="55" text-anchor="middle" font-size="40">🧪%3C/text%3E%3C/svg%3E',
          altKey: 'adGenerator.samples.skincare'
        }
      ],

      // 运动预设
      motionPresets: [
        { type: 'dramatic', labelKey: 'adGenerator.motion.presets.dramatic' },
        { type: 'smooth', labelKey: 'adGenerator.motion.presets.smooth' },
        { type: 'energetic', labelKey: 'adGenerator.motion.presets.energetic' },
        { type: 'elegant', labelKey: 'adGenerator.motion.presets.elegant' }
      ],

      presetTextKeys: {
        default: 'adGenerator.motion.defaults.default',
        dramatic: 'adGenerator.motion.defaults.dramatic',
        smooth: 'adGenerator.motion.defaults.smooth',
        energetic: 'adGenerator.motion.defaults.energetic',
        elegant: 'adGenerator.motion.defaults.elegant'
      },

      // 状态
      selectedTemplate: 'unboxing',
      productImage: '',
      motionText: '',
      isGenerating: false,
      processPercent: 0,
      generatedVideo: false,
      currentMotionPreset: 'default',
      userEditedMotion: false,
      settingMotionPreset: false
    }
  },

  computed: {
    // 过滤后的模板
    filteredTemplates() {
      if (this.currentCategory === 'all') {
        return this.templates
      }
      return this.templates.filter(template =>
        template.category.includes(this.currentCategory)
      )
    },

    selectedTemplateInfo() {
      return this.templates.find(template => template.id === this.selectedTemplate) || null
    },

    selectedTemplateName() {
      return this.selectedTemplateInfo ? this.translate(this.selectedTemplateInfo.nameKey) : ''
    }
  },

  methods: {
    translate(key) {
      return translateText(this.locale, key)
    },

    // 处理菜单点击
    handleMenuClick(key) {
      this.activeMenu = key
      this.menuItems = createDashboardMenu(key)
    },

    // 筛选模板
    filterTemplates(category) {
      this.currentCategory = category
    },

    // 选择模板
    selectTemplate(templateId) {
      this.selectedTemplate = templateId
    },

    // 文件上传处理
    handleFileUpload(file) {
      const isImage = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg'
      const isLt10M = file.size / 1024 / 1024 < 10

      if (!isImage) {
        this.$message.error(this.translate('adGenerator.messages.imageType'))
        return false
      }
      if (!isLt10M) {
        this.$message.error(this.translate('adGenerator.messages.imageSize'))
        return false
      }

      // 读取文件
      const reader = new FileReader()
      reader.onload = (e) => {
        this.productImage = e.target.result
      }
      reader.readAsDataURL(file)
      return false // 阻止默认上传
    },

    // 加载示例产品
    loadSampleProduct(type) {
      const sample = this.sampleProducts.find(s => s.type === type)
      if (sample) {
        this.productImage = sample.image
      }
    },

    // 重置上传
    resetUpload() {
      this.productImage = ''
      this.generatedVideo = false
    },

    // 设置运动预设
    setMotionPreset(type) {
      const key = this.presetTextKeys[type]
      if (key) {
        this.settingMotionPreset = true
        this.currentMotionPreset = type
        this.motionText = this.translate(key)
        this.userEditedMotion = false
        this.$nextTick(() => {
          this.settingMotionPreset = false
        })
      }
    },

    // 生成视频
    generateVideo() {
      if (!this.productImage) {
        this.$message.warning(this.translate('adGenerator.messages.uploadRequired'))
        return
      }

      this.isGenerating = true
      this.processPercent = 0

      // 模拟生成进度
      const interval = setInterval(() => {
        this.processPercent += Math.floor(Math.random() * 15)
        if (this.processPercent >= 100) {
          this.processPercent = 100
          clearInterval(interval)

          setTimeout(() => {
            this.isGenerating = false
            this.generatedVideo = true
            this.$message.success(this.translate('adGenerator.messages.generateSuccess'))
          }, 500)
        }
      }, 300)
    },

    // 下载视频
    downloadVideo() {
      this.$message.success(this.translate('adGenerator.messages.download'))
      // 实际实现下载逻辑
    },

    // 重新生成
    regenerateVideo() {
      this.generatedVideo = false
      this.generateVideo()
    },

    handleMotionInput() {
      if (this.settingMotionPreset) {
        return
      }
      this.userEditedMotion = true
      this.currentMotionPreset = null
    }
  },

  watch: {
    locale() {
      if (this.currentMotionPreset && !this.userEditedMotion) {
        const key = this.presetTextKeys[this.currentMotionPreset]
        if (key) {
          this.settingMotionPreset = true
          this.motionText = this.translate(key)
          this.$nextTick(() => {
            this.settingMotionPreset = false
          })
        }
      }
    }
  },

  mounted() {
    // 默认选中第一个模板
    if (this.templates.length > 0) {
      this.selectedTemplate = this.templates[0].id
    }
    const defaultKey = this.presetTextKeys.default
    if (defaultKey) {
      this.settingMotionPreset = true
      this.motionText = this.translate(defaultKey)
      this.userEditedMotion = false
      this.$nextTick(() => {
        this.settingMotionPreset = false
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import './AIAdVideoGenerator.scss';
</style>
