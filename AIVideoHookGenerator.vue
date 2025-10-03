<template>
  <div class="app-container">
    <!-- 侧边栏 -->
    <aside class="sidebar">
      <div class="logo">{{ translate('app.brand') }}</div>
      <nav>
        <ul class="nav-menu">
          <li class="nav-item" v-for="(item, index) in navItems" :key="index"
              :class="{ active: item.active }"
              @click="handleNavClick(index)">
            <span v-html="item.icon"></span> {{ translate(item.labelKey) }}
          </li>
        </ul>
      </nav>
      <div class="user-section">
        <div class="nav-item user-item">
          <span>👤</span>
          <div style="flex: 1;">
            <div class="user-name">{{ translate('app.user.account') }}</div>
            <div class="user-plan">{{ translate('app.user.proPlan') }}</div>
          </div>
        </div>
      </div>
    </aside>

    <!-- 主内容区域 -->
    <main class="main-container">
      <div class="content-wrapper">
        <div class="language-switcher">
          <label for="hook-language">{{ translate('language.label') }}</label>
          <el-select
            id="hook-language"
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
          <h1>{{ translate('hookGenerator.header.title') }}</h1>
          <p>{{ translate('hookGenerator.header.subtitle') }}</p>
        </div>

        <!-- Tab切换 -->
        <div class="tab-buttons">
          <button
            class="tab-btn"
            :class="{ active: currentTab === 'generate' }"
            @click="switchTab('generate')">
            {{ translate('hookGenerator.tabs.generate') }}
          </button>
          <button
            class="tab-btn"
            :class="{ active: currentTab === 'upload' }"
            @click="switchTab('upload')">
            {{ translate('hookGenerator.tabs.upload') }}
          </button>
        </div>

        <!-- 生成视频工作区 -->
        <div v-show="currentTab === 'generate'" class="workspace">
          <!-- 左侧：脚本输入和Voice选择 -->
          <div class="workspace-left">
            <!-- Hook脚本输入 -->
            <div class="upload-container">
              <div class="section-title">{{ translate('hookGenerator.script.title') }}</div>
              <div class="script-input-area" :class="{ focused: scriptFocused }">
                <el-input
                  type="textarea"
                  v-model="hookScript"
                  :rows="6"
                  :maxlength="240"
                  :placeholder="translate('hookGenerator.script.placeholder')"
                  class="script-textarea"
                  @focus="scriptFocused = true"
                  @blur="scriptFocused = false"
                  @input="handleScriptInput"
                  show-word-limit>
                </el-input>
              </div>
              <el-button
                type="primary"
                plain
                class="sample-btn"
                @click="useSampleScript">
                {{ translate('hookGenerator.script.useSample') }}
              </el-button>
            </div>

            <!-- Voice选择 -->
            <div class="samples-container">
              <div class="section-title">{{ translate('hookGenerator.voice.title') }}</div>
              <div class="voice-selector" @click="openVoiceSelector">
                <div class="voice-selector-text">
                  <span class="voice-selector-icon">➕</span>
                  <span>{{ selectedVoiceLabel || translate('hookGenerator.voice.placeholder') }}</span>
                </div>
                <i class="el-icon-arrow-right"></i>
              </div>
            </div>

            <!-- Avatar选择 -->
            <div class="samples-container">
              <div class="section-title">{{ translate('hookGenerator.avatar.title') }}</div>
              <div class="avatar-options">
                <button class="avatar-btn" @click="selectAvatar('library')">
                  <span>👤</span>
                  <span>{{ selectedAvatarLabel || translate('hookGenerator.avatar.placeholder') }}</span>
                </button>
                <button class="avatar-btn" @click="selectAvatar('custom')">
                  <span>➕</span>
                  <span>{{ translate('hookGenerator.avatar.custom') }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- 右侧：Hook Style选择、效果选择和操作按钮 -->
          <div class="workspace-right">
            <!-- Hook Style选择 -->
            <div class="settings-container">
              <div class="section-title">{{ translate('hookGenerator.style.title') }}</div>
              <div class="style-selector" @click="openStyleModal('generate')">
                <div class="style-selector-text">
                  <span class="style-selector-icon">🎨</span>
                  <span>{{ selectedStyleLabel }}</span>
                </div>
                <i class="el-icon-arrow-right"></i>
              </div>
            </div>

            <!-- 效果选择 -->
            <div class="settings-container">
              <div class="section-title">{{ translate('hookGenerator.effect.title') }}</div>
              <div class="effect-grid">
                <div
                  v-for="effect in effects"
                  :key="effect.id"
                  class="effect-item"
                  :class="{ selected: selectedEffect === effect.id }"
                  @click="selectEffect(effect.id)">
                  <div class="effect-thumbnail">{{ effect.icon }}</div>
                  <div class="effect-label">{{ translate(effect.labelKey) }}</div>
                </div>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="actions-container">
              <el-button
                v-if="!generationComplete"
                type="primary"
                class="action-btn btn-generate"
                :loading="generating"
                @click="startGeneration">
                <span v-if="!generating" class="btn-icon">🚀</span>
                <span>{{ generating ? translate('hookGenerator.actions.generating') : translate('hookGenerator.actions.generate') }}</span>
              </el-button>

              <el-button
                v-if="generationComplete"
                type="success"
                class="action-btn btn-upload"
                @click="downloadVideo">
                <span class="btn-icon">⬇️</span>
                {{ translate('hookGenerator.actions.download') }}
              </el-button>

              <div v-if="generating" class="process-info">
                <div class="process-status">
                  <div class="status-icon">⏳</div>
                  <div class="status-text">{{ translate('hookGenerator.status.generating') }}</div>
                  <div class="status-percent">{{ generationProgress }}%</div>
                </div>
                <el-progress
                  :percentage="generationProgress"
                  :stroke-width="8"
                  color="#6366f1">
                </el-progress>
              </div>

              <div v-if="generationComplete" class="process-info success-info">
                <div style="text-align: center; padding: 20px;">
                  <div style="font-size: 48px; margin-bottom: 10px;">✅</div>
                  <div style="font-size: 16px; color: #10b981; font-weight: 600;">
                    {{ translate('hookGenerator.status.successTitle') }}
                  </div>
                  <div style="font-size: 14px; color: #64748b; margin-top: 5px;">
                    {{ translate('hookGenerator.status.successDetailPrefix') }} {{ selectedStyleLabel }} {{ translate('hookGenerator.status.successDetailSuffix') }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 上传视频工作区 -->
        <div v-show="currentTab === 'upload'" class="workspace upload-workspace">
          <div style="width: 100%;">
            <!-- 上传视频区域 -->
            <div class="upload-container">
              <div class="section-title">{{ translate('hookGenerator.upload.title') }}</div>
              <el-upload
                class="upload-video-area"
                drag
                action="#"
                :before-upload="handleVideoUpload"
                :show-file-list="false"
                accept="video/*">
                <div v-if="!uploadedVideo">
                  <div class="upload-video-icon">⬆️</div>
                  <div class="upload-video-title">{{ translate('hookGenerator.upload.cta') }}</div>
                  <div class="upload-video-subtitle">{{ translate('hookGenerator.upload.instructions') }}</div>
                  <div class="upload-video-hint" v-html="translate('hookGenerator.upload.hints')"></div>
                </div>
                <div v-else class="upload-success">
                  <div style="color: #10b981; font-size: 48px; margin-bottom: 10px;">✔</div>
                  <div style="font-size: 18px; font-weight: 600; color: #1e293b; margin-bottom: 5px;">
                    {{ translate('hookGenerator.upload.successTitle') }}
                  </div>
                  <div style="font-size: 14px; color: #64748b;">{{ uploadedVideo.name }}</div>
                  <el-button type="primary" plain style="margin-top: 15px;" @click="uploadedVideo = null">
                    {{ translate('hookGenerator.upload.replace') }}
                  </el-button>
                </div>
              </el-upload>
            </div>

            <!-- Hook Style选择 -->
            <div class="settings-container" style="margin-top: 20px;">
              <div class="section-title">{{ translate('hookGenerator.style.applyTitle') }}</div>
              <div class="style-selector" @click="openStyleModal('upload')">
                <div class="style-selector-text">
                  <span class="style-selector-icon">🎨</span>
                  <span>{{ uploadStyleLabel }}</span>
                </div>
                <i class="el-icon-arrow-right"></i>
              </div>
            </div>

            <!-- 效果选择 -->
            <div class="settings-container" style="margin-top: 20px;">
              <div class="section-title">{{ translate('hookGenerator.effect.applyTitle') }}</div>
              <div class="effect-grid">
                <div
                  v-for="effect in effects"
                  :key="effect.id"
                  class="effect-item"
                  :class="{ selected: uploadEffect === effect.id }"
                  @click="selectUploadEffect(effect.id)">
                  <div class="effect-thumbnail">{{ effect.icon }}</div>
                  <div class="effect-label">{{ translate(effect.labelKey) }}</div>
                </div>
              </div>
            </div>

            <!-- 处理按钮 -->
            <div class="actions-container" style="margin-top: 20px;">
              <el-button
                type="primary"
                class="action-btn btn-generate"
                :disabled="!uploadedVideo"
                @click="processUploadedVideo">
                <span class="btn-icon">🎯</span>
                <span>{{ translate('hookGenerator.actions.applyStyle') }}</span>
              </el-button>
            </div>
          </div>
        </div>

        <!-- 生成结果展示区域 -->
        <div class="result-section">
          <div class="result-header">
            <h2 class="result-title">{{ translate('hookGenerator.results.title') }}</h2>
            <p class="result-subtitle">{{ translate('hookGenerator.results.subtitle') }}</p>
          </div>
          <div class="result-container">
            <div v-if="!generatedVideoUrl" class="result-placeholder">
              <div class="result-placeholder-icon">📦</div>
              <div class="result-placeholder-text">{{ translate('hookGenerator.results.placeholder') }}</div>
              <div class="result-placeholder-hint">{{ translate('hookGenerator.results.hint') }}</div>
            </div>
            <div v-else class="video-player">
              <video :src="generatedVideoUrl" controls></video>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Voice选择弹窗 -->
    <el-dialog
      :title="translate('hookGenerator.voice.modalTitle')"
      :visible.sync="voiceModalVisible"
      width="600px"
      :close-on-click-modal="true">
      <div class="voice-list">
        <div
          v-for="voice in voices"
          :key="voice.id"
          class="voice-item"
          :class="{ selected: selectedVoice === voice.id }"
          @click="selectVoice(voice)">
          <div class="voice-info">
            <div class="voice-avatar">{{ voice.avatar }}</div>
            <div class="voice-details">
              <div class="voice-name">{{ translate(voice.nameKey) }}</div>
              <div class="voice-type">{{ translate(voice.genderKey) }} • {{ translate(voice.accentKey) }}</div>
            </div>
          </div>
          <div class="voice-play">▶</div>
        </div>
      </div>
    </el-dialog>

    <!-- Avatar选择弹窗 -->
    <el-dialog
      :title="translate('hookGenerator.avatar.modalTitle')"
      :visible.sync="avatarModalVisible"
      width="900px"
      :close-on-click-modal="true">
      <div class="avatar-grid">
        <div
          v-for="avatar in avatars"
          :key="avatar.id"
          class="avatar-card"
          :class="{ selected: tempSelectedAvatar === avatar.id }"
          @click="openAvatarBackgrounds(avatar)">
          <div class="avatar-image">{{ avatar.icon }}</div>
          <div class="avatar-name">{{ translate(avatar.nameKey) }}</div>
        </div>
      </div>
      <div class="custom-upload-section">
        <div class="section-title" style="margin-bottom: 15px;">{{ translate('hookGenerator.avatar.uploadTitle') }}</div>
        <el-upload
          class="custom-upload-area"
          action="#"
          :before-upload="handleAvatarUpload"
          :show-file-list="false"
          accept="image/*">
          <div class="custom-upload-icon">📸</div>
          <div class="custom-upload-text">{{ translate('hookGenerator.avatar.uploadCta') }}</div>
          <div class="custom-upload-hint">{{ translate('hookGenerator.avatar.uploadHint') }}</div>
        </el-upload>
      </div>
    </el-dialog>

    <!-- Avatar背景选择弹窗 -->
    <el-dialog
      :title="translate('hookGenerator.avatar.backgroundTitle') + ' ' + (tempSelectedAvatarLabel || '')"
      :visible.sync="avatarBgModalVisible"
      width="800px"
      :close-on-click-modal="true">
      <div class="bg-options-grid">
        <div
          v-for="bg in avatarBackgrounds"
          :key="bg.id"
          class="bg-option"
          @click="selectAvatarWithBg(bg)">
          <div class="bg-preview" :style="{ background: bg.gradient }">
            <div class="avatar-preview-icon">{{ tempSelectedAvatarIcon }}</div>
          </div>
          <div class="bg-label">{{ translate(bg.labelKey) }}</div>
        </div>
      </div>
    </el-dialog>

    <!-- Hook Style选择弹窗 -->
    <el-dialog
      :title="translate('hookGenerator.style.modalTitle')"
      :visible.sync="styleModalVisible"
      width="900px"
      :close-on-click-modal="true">
      <div class="style-grid-modal">
        <div
          v-for="style in hookStyles"
          :key="style.id"
          class="style-item-modal"
          :class="{ selected: isStyleSelected(style.id) }"
          @click="selectStyleFromModal(style)">
          <div class="style-thumbnail" :class="style.thumbnailClass">
            <div v-if="style.id === 'no-style'" class="style-avatar">👤</div>
            <div v-else class="style-text-overlay">
              <div class="style-text" v-html="translate(style.textKey)"></div>
            </div>
          </div>
          <div class="style-label">{{ translate(style.labelKey) }}</div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { supportedLocales, translate as translateText } from './i18n'

export default {
  name: 'AIVideoHookGenerator',
  data() {
    return {
      availableLocales: supportedLocales,
      locale: 'en-US',
      // 导航菜单数据
      navItems: [
        { icon: '📊', labelKey: 'menu.dashboard', active: false },
        { icon: '✨', labelKey: 'menu.videoEnhancer', active: false },
        { icon: '🧹', labelKey: 'menu.watermarkRemover', active: false },
        { icon: '🎯', labelKey: 'menu.videoHook', active: true },
        { icon: '🎨', labelKey: 'menu.styleTransfer', active: false },
        { icon: '🔊', labelKey: 'menu.audioEnhancement', active: false },
        { icon: '📁', labelKey: 'menu.projects', active: false },
        { icon: '⚙️', labelKey: 'menu.settings', active: false }
      ],

      // Tab状态
      currentTab: 'generate',

      // 生成视频相关
      hookScript: '',
      scriptFocused: false,
      selectedVoice: null,
      selectedAvatar: null,
      selectedAvatarBg: null,
      selectedStyle: 'clean',
      selectedEffect: 'none',
      generating: false,
      generationProgress: 0,
      generationComplete: false,
      generatedVideoUrl: null,

      // 上传视频相关
      uploadedVideo: null,
      uploadStyle: 'clean',
      uploadEffect: 'none',
      currentStyleTab: 'generate',

      // 临时选择状态
      tempSelectedAvatar: null,
      tempSelectedAvatarIcon: null,

      // 弹窗显示状态
      voiceModalVisible: false,
      avatarModalVisible: false,
      avatarBgModalVisible: false,
      styleModalVisible: false,

      // Voice数据
      voices: [
        { id: 'emily', nameKey: 'hookGenerator.voice.options.emily.name', genderKey: 'hookGenerator.voice.options.emily.gender', accentKey: 'hookGenerator.voice.options.emily.accent', avatar: '👩' },
        { id: 'james', nameKey: 'hookGenerator.voice.options.james.name', genderKey: 'hookGenerator.voice.options.james.gender', accentKey: 'hookGenerator.voice.options.james.accent', avatar: '👨' },
        { id: 'sophia', nameKey: 'hookGenerator.voice.options.sophia.name', genderKey: 'hookGenerator.voice.options.sophia.gender', accentKey: 'hookGenerator.voice.options.sophia.accent', avatar: '👩‍💼' },
        { id: 'michael', nameKey: 'hookGenerator.voice.options.michael.name', genderKey: 'hookGenerator.voice.options.michael.gender', accentKey: 'hookGenerator.voice.options.michael.accent', avatar: '👨‍💼' },
        { id: 'aria', nameKey: 'hookGenerator.voice.options.aria.name', genderKey: 'hookGenerator.voice.options.aria.gender', accentKey: 'hookGenerator.voice.options.aria.accent', avatar: '👩‍🎤' },
        { id: 'ai-pro', nameKey: 'hookGenerator.voice.options.aiPro.name', genderKey: 'hookGenerator.voice.options.aiPro.gender', accentKey: 'hookGenerator.voice.options.aiPro.accent', avatar: '🤖' }
      ],

      // Avatar数据
      avatars: [
        { id: 'pro-woman', nameKey: 'hookGenerator.avatar.options.proWoman', icon: '👩‍💼' },
        { id: 'pro-man', nameKey: 'hookGenerator.avatar.options.proMan', icon: '👨‍💼' },
        { id: 'casual-woman', nameKey: 'hookGenerator.avatar.options.casualWoman', icon: '👩' },
        { id: 'casual-man', nameKey: 'hookGenerator.avatar.options.casualMan', icon: '👨' },
        { id: 'creative-woman', nameKey: 'hookGenerator.avatar.options.creativeWoman', icon: '👩‍🎨' },
        { id: 'creative-man', nameKey: 'hookGenerator.avatar.options.creativeMan', icon: '👨‍🎨' },
        { id: 'tech-woman', nameKey: 'hookGenerator.avatar.options.techWoman', icon: '👩‍💻' },
        { id: 'tech-man', nameKey: 'hookGenerator.avatar.options.techMan', icon: '👨‍💻' },
        { id: 'fitness', nameKey: 'hookGenerator.avatar.options.fitness', icon: '🏋️' }
      ],

      // Avatar背景数据
      avatarBackgrounds: [
        { id: 'office', labelKey: 'hookGenerator.avatar.backgrounds.office', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
        { id: 'studio', labelKey: 'hookGenerator.avatar.backgrounds.studio', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
        { id: 'outdoor', labelKey: 'hookGenerator.avatar.backgrounds.outdoor', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }
      ],

      // Hook Style数据
      hookStyles: [
        { id: 'no-style', labelKey: 'hookGenerator.styles.noStyle', thumbnailClass: 'no-style', textKey: 'hookGenerator.styles.text.noStyle' },
        { id: 'thermal', labelKey: 'hookGenerator.styles.thermal', thumbnailClass: 'thermal', textKey: 'hookGenerator.styles.text.thermal' },
        { id: 'blazing', labelKey: 'hookGenerator.styles.blazing', thumbnailClass: 'blazing', textKey: 'hookGenerator.styles.text.blazing' },
        { id: 'pulse', labelKey: 'hookGenerator.styles.pulse', thumbnailClass: 'pulse', textKey: 'hookGenerator.styles.text.pulse' },
        { id: 'clean', labelKey: 'hookGenerator.styles.clean', thumbnailClass: 'clean', textKey: 'hookGenerator.styles.text.clean' },
        { id: 'yellow', labelKey: 'hookGenerator.styles.yellow', thumbnailClass: 'yellow', textKey: 'hookGenerator.styles.text.yellow' },
        { id: 'glow', labelKey: 'hookGenerator.styles.glow', thumbnailClass: 'glow', textKey: 'hookGenerator.styles.text.glow' },
        { id: 'hyper', labelKey: 'hookGenerator.styles.hyper', thumbnailClass: 'hyper', textKey: 'hookGenerator.styles.text.hyper' },
        { id: 'aurum', labelKey: 'hookGenerator.styles.aurum', thumbnailClass: 'aurum', textKey: 'hookGenerator.styles.text.aurum' },
        { id: 'coral', labelKey: 'hookGenerator.styles.coral', thumbnailClass: 'coral', textKey: 'hookGenerator.styles.text.coral' },
        { id: 'orange', labelKey: 'hookGenerator.styles.orange', thumbnailClass: 'orange', textKey: 'hookGenerator.styles.text.orange' }
      ],

      // 效果数据
      effects: [
        { id: 'none', icon: '🚫', labelKey: 'hookGenerator.effects.none' },
        { id: 'fire', icon: '🔥', labelKey: 'hookGenerator.effects.fire' },
        { id: 'claw', icon: '🦾', labelKey: 'hookGenerator.effects.claw' },
        { id: 'earth', icon: '🌍', labelKey: 'hookGenerator.effects.earth' },
        { id: 'lightning', icon: '⚡', labelKey: 'hookGenerator.effects.lightning' },
        { id: 'sparkle', icon: '✨', labelKey: 'hookGenerator.effects.sparkle' },
        { id: 'neon', icon: '💫', labelKey: 'hookGenerator.effects.neon' },
        { id: 'glitch', icon: '📺', labelKey: 'hookGenerator.effects.glitch' },
        { id: 'smoke', icon: '💨', labelKey: 'hookGenerator.effects.smoke' },
        { id: 'rainbow', icon: '🌈', labelKey: 'hookGenerator.effects.rainbow' },
        { id: 'freeze', icon: '❄️', labelKey: 'hookGenerator.effects.freeze' },
        { id: 'burst', icon: '💥', labelKey: 'hookGenerator.effects.burst' }
      ],

      // 示例脚本
      sampleScriptKeys: [
        'hookGenerator.script.samples.first',
        'hookGenerator.script.samples.second',
        'hookGenerator.script.samples.third',
        'hookGenerator.script.samples.fourth'
      ],

      lastSampleKey: null,
      userEditedScript: false,
      settingSampleScript: false
    }
  },

  computed: {
    selectedVoiceOption() {
      return this.voices.find(voice => voice.id === this.selectedVoice) || null
    },

    selectedVoiceLabel() {
      if (!this.selectedVoiceOption) {
        return ''
      }
      const name = this.translate(this.selectedVoiceOption.nameKey)
      const gender = this.translate(this.selectedVoiceOption.genderKey)
      return `${name} (${gender})`
    },

    selectedAvatarOption() {
      if (!this.selectedAvatar || this.selectedAvatar === 'custom') {
        return null
      }
      return this.avatars.find(avatar => avatar.id === this.selectedAvatar) || null
    },

    selectedAvatarLabel() {
      if (this.selectedAvatar === 'custom') {
        return this.translate('hookGenerator.avatar.customLabel')
      }
      if (!this.selectedAvatarOption) {
        return ''
      }
      let label = this.translate(this.selectedAvatarOption.nameKey)
      if (this.selectedAvatarBg) {
        const bg = this.avatarBackgrounds.find(item => item.id === this.selectedAvatarBg)
        if (bg) {
          label += ` - ${this.translate(bg.labelKey)}`
        }
      }
      return label
    },

    tempSelectedAvatarLabel() {
      if (!this.tempSelectedAvatar) {
        return ''
      }
      if (this.tempSelectedAvatar === 'custom') {
        return this.translate('hookGenerator.avatar.customLabel')
      }
      const avatar = this.avatars.find(item => item.id === this.tempSelectedAvatar)
      return avatar ? this.translate(avatar.nameKey) : ''
    },

    selectedStyleLabel() {
      const style = this.hookStyles.find(item => item.id === this.selectedStyle)
      return style ? this.translate(style.labelKey) : ''
    },

    uploadStyleLabel() {
      const style = this.hookStyles.find(item => item.id === this.uploadStyle)
      return style ? this.translate(style.labelKey) : ''
    }
  },

  methods: {
    translate(key) {
      return translateText(this.locale, key)
    },

    // 导航点击处理
    handleNavClick(index) {
      this.navItems.forEach((item, i) => {
        item.active = i === index
      })
    },

    // Tab切换
    switchTab(tab) {
      this.currentTab = tab
    },

    // 使用示例脚本
    useSampleScript() {
      if (!this.sampleScriptKeys.length) {
        return
      }
      const randomKey = this.sampleScriptKeys[Math.floor(Math.random() * this.sampleScriptKeys.length)]
      this.settingSampleScript = true
      this.hookScript = this.translate(randomKey)
      this.lastSampleKey = randomKey
      this.userEditedScript = false
      this.$nextTick(() => {
        this.settingSampleScript = false
      })
    },

    handleScriptInput() {
      if (this.settingSampleScript) {
        return
      }
      this.userEditedScript = true
    },

    // 打开Voice选择器
    openVoiceSelector() {
      this.voiceModalVisible = true
    },

    // 选择Voice
    selectVoice(voice) {
      this.selectedVoice = voice.id
      setTimeout(() => {
        this.voiceModalVisible = false
      }, 200)
    },

    // 选择Avatar
    selectAvatar(type) {
      if (type === 'library') {
        this.avatarModalVisible = true
      } else {
        this.avatarModalVisible = true
        this.$nextTick(() => {
          const uploadSection = document.querySelector('.custom-upload-section')
          if (uploadSection) {
            uploadSection.scrollIntoView({ behavior: 'smooth' })
          }
        })
      }
    },

    // 打开Avatar背景选择
    openAvatarBackgrounds(avatar) {
      this.tempSelectedAvatar = avatar.id
      this.tempSelectedAvatarIcon = avatar.icon
      this.avatarBgModalVisible = true
    },

    // 选择Avatar和背景
    selectAvatarWithBg(bg) {
      if (this.tempSelectedAvatar) {
        this.selectedAvatar = this.tempSelectedAvatar
        this.selectedAvatarBg = bg.id
      }
      this.avatarBgModalVisible = false
      setTimeout(() => {
        this.avatarModalVisible = false
      }, 200)
    },

    // 处理Avatar上传
    handleAvatarUpload(file) {
      if (file.size > 10 * 1024 * 1024) {
        this.$message.error(this.translate('hookGenerator.messages.avatarTooLarge'))
        return false
      }

      this.selectedAvatar = 'custom'
      this.selectedAvatarBg = null
      this.avatarModalVisible = false
      this.avatarBgModalVisible = false
      this.$message.success(`${this.translate('hookGenerator.messages.avatarUploadPrefix')} ${file.name}`)
      return false
    },

    // 打开Style选择弹窗
    openStyleModal(tab) {
      this.currentStyleTab = tab
      this.styleModalVisible = true
    },

    // 判断Style是否被选中
    isStyleSelected(styleId) {
      if (this.currentStyleTab === 'generate') {
        return this.selectedStyle === styleId
      }
      return this.uploadStyle === styleId
    },

    // 从弹窗选择Style
    selectStyleFromModal(style) {
      if (this.currentStyleTab === 'generate') {
        this.selectedStyle = style.id
      } else {
        this.uploadStyle = style.id
      }
      setTimeout(() => {
        this.styleModalVisible = false
      }, 200)
    },

    // 选择效果
    selectEffect(effectId) {
      this.selectedEffect = effectId
    },

    // 选择上传视频的效果
    selectUploadEffect(effectId) {
      this.uploadEffect = effectId
    },

    // 开始生成
    startGeneration() {
      if (!this.hookScript.trim()) {
        this.$message.warning(this.translate('hookGenerator.messages.scriptRequired'))
        return
      }

      if (!this.selectedVoice) {
        this.$message.warning(this.translate('hookGenerator.messages.voiceRequired'))
        return
      }

      if (!this.selectedStyle) {
        this.$message.warning(this.translate('hookGenerator.messages.styleRequired'))
        return
      }

      this.generating = true
      this.generationProgress = 0
      this.generationComplete = false

      const interval = setInterval(() => {
        this.generationProgress += Math.random() * 15
        if (this.generationProgress >= 100) {
          this.generationProgress = 100
          clearInterval(interval)

          setTimeout(() => {
            this.generating = false
            this.generationComplete = true
            this.generatedVideoUrl = '#'
          }, 500)
        }
      }, 200)
    },

    // 处理视频上传
    handleVideoUpload(file) {
      if (file.size > 500 * 1024 * 1024) {
        this.$message.error(this.translate('hookGenerator.messages.videoTooLarge'))
        return false
      }

      if (!file.type.startsWith('video/')) {
        this.$message.error(this.translate('hookGenerator.messages.invalidVideo'))
        return false
      }

      this.uploadedVideo = file
      this.$message.success(`${this.translate('hookGenerator.messages.videoUploadPrefix')} ${file.name}`)
      return false
    },

    // 处理上传的视频
    processUploadedVideo() {
      if (!this.uploadedVideo) {
        this.$message.warning(this.translate('hookGenerator.messages.videoRequired'))
        return
      }

      const styleName = this.uploadStyleLabel
      const effect = this.effects.find(item => item.id === this.uploadEffect)
      const effectName = effect ? this.translate(effect.labelKey) : ''
      this.$message.success(`${this.translate('hookGenerator.messages.processingVideoPrefix')} ${styleName}${effectName ? ` ${this.translate('hookGenerator.messages.processingVideoWith')} ${effectName}` : ''}`)
    },

    // 下载视频
    downloadVideo() {
      this.$message.success(this.translate('hookGenerator.messages.download'))
    }
  },

  watch: {
    locale() {
      if (this.lastSampleKey && !this.userEditedScript) {
        this.settingSampleScript = true
        this.hookScript = this.translate(this.lastSampleKey)
        this.$nextTick(() => {
          this.settingSampleScript = false
        })
      }
    }
  },

  mounted() {
    this.selectedEffect = 'none'
    this.uploadEffect = 'none'
  }
}
</script>

<style lang="scss" scoped>
@import './AIVideoHookGenerator.scss';
</style>
