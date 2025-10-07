<template>
  <div class="video-audio-to-text-page">
    <!-- 侧边栏 -->
    <aside class="sidebar">
      <div class="logo">{{ translate('app.brand') }}</div>
      <nav class="nav-menu">
        <div
          v-for="(item, index) in menuItems"
          :key="index"
          :class="['nav-item', { active: item.active }]"
          @click="handleMenuClick(index)"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span>{{ translate(item.labelKey) }}</span>
        </div>
      </nav>
      <div class="user-info">
        <div class="nav-item user-account">
          <span class="nav-icon">👤</span>
          <div class="user-details">
            <div class="user-name">{{ translate('app.user.account') }}</div>
            <div class="user-plan">{{ translate('app.user.proMember') }}</div>
          </div>
        </div>
      </div>
    </aside>

    <!-- 主内容区域 -->
    <main class="main-container">
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
          <h1 class="header-title">{{ translate('audioToText.header.title') }}</h1>
          <p class="header-subtitle">
            {{ translate('audioToText.header.subtitle') }}
          </p>
        </div>

        <!-- 主要工作区 -->
        <div class="workspace">
          <!-- 左侧：上传和预览区域 -->
          <div class="workspace-left">
            <!-- 上传区域 -->
            <div class="upload-container">
              <h3 class="section-title">{{ translate('audioToText.upload.title') }}</h3>
              <div
                :class="['upload-area', { 'has-file': hasFile, 'dragover': isDragover }]"
                @drop.prevent="handleDrop"
                @dragover.prevent="handleDragover"
                @dragleave="handleDragleave"
                @click="triggerFileInput"
              >
                <div v-if="uploadSuccess" class="upload-success-badge">✓</div>
                
                <!-- 上传内容 -->
                <div v-if="!filePreview" class="upload-content">
                  <div class="upload-icon">⬆️</div>
                  <div class="upload-title">{{ translate('audioToText.upload.instructions') }}</div>
                  <div class="upload-subtitle">{{ translate('audioToText.upload.hint') }}</div>
                  <el-button type="primary" size="small" class="upload-btn-small" @click.stop="triggerFileInput">
                    {{ translate('audioToText.upload.button') }}
                  </el-button>
                  <input
                    ref="fileInput"
                    type="file"
                    class="file-input"
                    accept=".mp4,.mov,.m4v,.mp3,.wav,.m4a,.aac"
                    @change="handleFileSelect"
                  />
                </div>

                <!-- 文件预览 -->
                <div v-else class="file-preview">
                  <div class="file-preview-item">
                    <div v-if="fileType === 'video'" class="preview-video-container">
                      <video
                        :src="previewUrl"
                        class="preview-video"
                        controls
                      />
                    </div>
                    <div v-else class="preview-audio-container">
                      <div class="audio-visualization">
                        <div class="media-icon">{{ mediaIcon }}</div>
                        <div class="media-info">
                          <div class="media-name">{{ fileName }}</div>
                          <div class="media-duration">{{ translate('audioToText.preview.durationLabel') }} {{ mediaDuration }}</div>
                        </div>
                        <div v-if="showWaveform" class="audio-waveform">
                          <div v-for="n in 20" :key="n" class="wave-bar" :style="{ height: Math.random() * 100 + '%' }"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="file-info">
                    <span class="file-name">{{ fileName }}</span>
                    <el-button type="danger" size="mini" @click.stop="removeFile">✕</el-button>
                  </div>
                </div>
              </div>
              <div class="supported-formats">
                {{ translate('audioToText.upload.supported') }}
              </div>
            </div>

            <!-- 示例文件 -->
            <div class="samples-container">
              <h3 class="section-title">{{ translate('audioToText.samples.title') }}</h3>
              <div class="sample-grid">
                <div
                  v-for="sample in samples"
                  :key="sample.type"
                  class="sample-item"
                  @click="loadSample(sample.type)"
                  :title="translate(sample.titleKey)"
                >
                  <span class="sample-icon">{{ sample.icon }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧：设置和选项 -->
          <div class="workspace-right">
            <!-- 转录设置 -->
            <div class="settings-container">
              <h3 class="section-title">{{ translate('audioToText.settings.title') }}</h3>

              <!-- 语言选择 -->
              <div class="setting-group">
                <div class="setting-label">{{ translate('audioToText.settings.languageDetection') }}</div>
                <el-select
                  v-model="languageSelect"
                  :placeholder="translate('audioToText.settings.languagePlaceholder')"
                  class="language-select-element"
                  @change="handleLanguageChange"
                >
                  <el-option
                    v-for="(label, code) in languageOptions"
                    :key="code"
                    :label="label"
                    :value="code"
                  />
                </el-select>
              </div>

              <!-- 翻译选项 -->
              <div class="setting-group">
                <div class="setting-label">{{ translate('audioToText.settings.translationTitle') }}</div>
                <div class="translation-toggle">
                  <el-switch
                    v-model="enableTranslation"
                    active-color="#6366f1"
                    @change="handleTranslationToggle"
                  >
                  </el-switch>
                  <span class="toggle-label">{{ translate('audioToText.settings.enableTranslation') }}</span>
                </div>
                <transition name="slide">
                  <div v-if="enableTranslation" class="translation-language-wrapper">
                    <div class="setting-sublabel">{{ translate('audioToText.settings.translateTo') }}</div>
                    <el-select
                      v-model="translationLanguage"
                      :placeholder="translate('audioToText.settings.translationPlaceholder')"
                      class="language-select-element"
                      @change="handleTranslationLanguageChange"
                    >
                      <el-option
                        v-for="(label, code) in translationOptions"
                        :key="code"
                        :label="label"
                        :value="code"
                      />
                    </el-select>
                  </div>
                </transition>
              </div>

              <!-- 输出格式 -->
              <div class="setting-group">
                <div class="setting-label">{{ translate('audioToText.settings.outputFormat') }}</div>
                <el-radio-group v-model="outputFormat" @change="handleFormatChange">
                  <div class="format-options">
                    <label class="format-option">
                      <el-radio label="txt">
                        <div class="format-content">
                          <span class="format-icon">📄</span>
                          <span class="format-title">{{ translate('audioToText.settings.formats.txt') }}</span>
                        </div>
                      </el-radio>
                    </label>
                    <label class="format-option">
                      <el-radio label="srt">
                        <div class="format-content">
                          <span class="format-icon">📺</span>
                          <span class="format-title">{{ translate('audioToText.settings.formats.srt') }}</span>
                        </div>
                      </el-radio>
                    </label>
                  </div>
                </el-radio-group>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="actions-container">
              <el-button
                v-if="!processingComplete"
                type="primary"
                class="action-btn btn-process"
                :disabled="processing || !fileUploaded"
                @click="startTranscription"
                :loading="processing"
              >
                <span v-if="!processing" class="btn-icon">🎯</span>
                {{ translate(buttonTextKey) }}
              </el-button>
              
              <el-button
                v-else
                type="success"
                class="action-btn btn-download"
                @click="downloadTranscription"
              >
                <span class="btn-icon">⬇️</span>
                {{ translate('audioToText.actions.download') }}
              </el-button>

              <!-- 处理进度 -->
              <div v-if="processing" class="process-info">
                <div class="process-status">
                  <span class="status-icon">⏳</span>
                  <span class="status-text">{{ translate(processStatusKey) }}</span>
                  <span class="status-percent">{{ processPercent }}%</span>
                </div>
                <el-progress
                  :percentage="processPercent"
                  :stroke-width="8"
                  :show-text="false"
                  color="#6366f1"
                />
                <div class="process-details">
                  <small>{{ translate(processDetailsKey) }}</small>
                </div>
              </div>

              <!-- 完成状态 -->
              <div v-if="processingComplete && !processing" class="process-complete">
                <div class="complete-icon">✅</div>
                <div class="complete-text">{{ translate('audioToText.processing.completeTitle') }}</div>
                <div class="complete-subtitle">{{ translate('audioToText.processing.completeSubtitle') }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 转录结果区域 -->
        <div v-if="transcriptionText" class="transcription-section">
          <div class="transcription-header">
            <h2 class="transcription-title">{{ translate('audioToText.result.title') }}</h2>
            <div class="transcription-controls">
              <el-button
                size="small"
                round
                @click="copyToClipboard"
              >
                <span class="control-icon">📋</span>
                {{ translate('audioToText.result.copy') }}
              </el-button>
              <el-button
                size="small"
                round
                @click="downloadTranscription"
              >
                <span class="control-icon">💾</span>
                {{ formatMessage('audioToText.result.saveAs', { format: outputFormat.toUpperCase() }) }}
              </el-button>
            </div>
          </div>
          <div class="transcription-content">
            <pre class="transcription-text">{{ transcriptionText }}</pre>
          </div>
          <div class="transcription-footer">
            <div class="transcription-stats">
              <span>{{ formatMessage('audioToText.result.words', { count: wordCount }) }}</span>
              <span>{{ formatMessage('audioToText.result.characters', { count: charCount }) }}</span>
              <span>{{ formatMessage('audioToText.result.language', { language: detectedLanguageLabel }) }}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { supportedLocales, translate as translateText } from './i18n'

export default {
  name: 'VideoAudioToText',
  data() {
    return {
      availableLocales: supportedLocales,
      locale: 'en-US',
      // 菜单项
      menuItems: [
        { icon: '📊', labelKey: 'menu.dashboard', active: false },
        { icon: '📝', labelKey: 'menu.audioToText', active: true },
        { icon: '🎨', labelKey: 'menu.styleTransfer', active: false },
        { icon: '🔊', labelKey: 'menu.audioEnhancement', active: false },
        { icon: '📁', labelKey: 'menu.projects', active: false },
        { icon: '⚙️', labelKey: 'menu.settings', active: false }
      ],

      languageOptionCodes: ['auto', 'en', 'es', 'fr', 'de', 'zh', 'ja', 'ko', 'ar', 'ru', 'pt'],
      translationOptionCodes: ['en', 'zh', 'zhTw', 'es', 'fr', 'de', 'ja', 'ko', 'ar', 'ru', 'pt', 'it', 'nl', 'hi', 'th'],

      // 示例文件
      samples: [
        { type: 'interview', icon: '🎙️', titleKey: 'audioToText.samples.interview' },
        { type: 'podcast', icon: '🎧', titleKey: 'audioToText.samples.podcast' },
        { type: 'meeting', icon: '💼', titleKey: 'audioToText.samples.meeting' },
        { type: 'lecture', icon: '🎓', titleKey: 'audioToText.samples.lecture' }
      ],
      
      // 上传状态
      isDragover: false,
      hasFile: false,
      uploadSuccess: false,
      filePreview: false,
      fileName: '',
      fileType: '',
      previewUrl: '',
      fileUploaded: false,
      currentFile: null,
      
      // 媒体相关
      mediaIcon: '🎵',
      mediaDuration: '00:00',
      showWaveform: false,

      // 设置选项
      languageSelect: 'auto',
      enableTranslation: false,
      translationLanguage: 'en',
      outputFormat: 'txt',

      // 处理状态
      processing: false,
      processingComplete: false,
      processPercent: 0,
      buttonTextKey: 'audioToText.actions.start',
      processStatusKey: 'audioToText.processing.inProgress',
      processDetailsKey: 'audioToText.processing.detailsGenerate',

      // 转录结果
      transcriptionText: '',
      detectedLanguageCode: 'en',
      wordCount: 0,
      charCount: 0
    }
  },

  computed: {
    languageOptions() {
      return this.languageOptionCodes.reduce((options, code) => {
        options[code] = this.translate(`audioToText.settings.languages.${code}`)
        return options
      }, {})
    },
    translationOptions() {
      return this.translationOptionCodes.reduce((options, code) => {
        const key = code === 'zhTw' ? 'audioToText.settings.translation.zhTw' : `audioToText.settings.translation.${code}`
        options[code] = this.translate(key)
        return options
      }, {})
    },
    detectedLanguageLabel() {
      return this.getLanguageName(this.detectedLanguageCode)
    }
  },
  
  mounted() {
    // 组件挂载后的初始化
    this.initializeComponent()
  },
  
  beforeDestroy() {
    // 清理资源
    this.cleanup()
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
    getLanguageName(code) {
      if (!code) {
        return ''
      }
      const normalized = code === 'zh-tw' ? 'zhTw' : code
      return this.translate(`audioToText.languageNames.${normalized}`)
    },

    // 初始化组件
    initializeComponent() {
      console.log('Video Audio to Text component initialized')
    },
    
    // 清理资源
    cleanup() {
      // 释放媒体资源
      if (this.previewUrl && this.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(this.previewUrl)
      }
    },
    
    // 菜单点击
    handleMenuClick(index) {
      this.menuItems.forEach((item, i) => {
        item.active = i === index
      })
    },
    
    // 触发文件选择
    triggerFileInput() {
      this.$refs.fileInput.click()
    },
    
    // 文件选择处理
    handleFileSelect(event) {
      const files = event.target.files
      if (files && files.length > 0) {
        this.handleFiles(files)
      }
    },
    
    // 文件拖拽处理
    handleDragover() {
      if (!this.hasFile) {
        this.isDragover = true
      }
    },
    
    handleDragleave() {
      this.isDragover = false
    },
    
    handleDrop(e) {
      this.isDragover = false
      if (!this.hasFile) {
        const files = e.dataTransfer.files
        this.handleFiles(files)
      }
    },
    
    // 处理文件
    handleFiles(files) {
      if (files.length > 8) {
        this.$message.warning(this.translate('audioToText.messages.maxFiles'))
        return
      }

      // 检查文件大小 (2GB限制)
      const maxSize = 2 * 1024 * 1024 * 1024
      if (files[0].size > maxSize) {
        this.$message.error(this.translate('audioToText.messages.totalSizeLimit'))
        return
      }
      
      const file = files[0]
      this.currentFile = file
      this.displayPreview(file)
    },
    
    // 显示预览
    displayPreview(file) {
      this.fileName = file.name
      
      // 判断文件类型
      if (file.type.startsWith('video')) {
        this.fileType = 'video'
        this.mediaIcon = '🎥'
        this.showWaveform = false
      } else if (file.type.startsWith('audio')) {
        this.fileType = 'audio'
        this.mediaIcon = '🎵'
        this.showWaveform = true
      }
      
      // 读取文件
      const reader = new FileReader()
      reader.onload = (e) => {
        this.previewUrl = e.target.result
        this.filePreview = true
        
        // 模拟获取媒体时长
        this.mediaDuration = this.generateRandomDuration()
        
        // 延迟显示成功标记，模拟上传过程
        setTimeout(() => {
          this.uploadSuccess = true
          this.hasFile = true
          this.fileUploaded = true
          this.$message.success(this.translate('audioToText.messages.uploadSuccess'))
        }, 500)
      }
      reader.readAsDataURL(file)
    },
    
    // 生成随机时长
    generateRandomDuration() {
      const minutes = Math.floor(Math.random() * 10) + 1
      const seconds = Math.floor(Math.random() * 60)
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    },
    
    // 移除文件
    removeFile() {
      this.filePreview = false
      this.fileName = ''
      this.fileType = ''
      this.previewUrl = ''
      this.uploadSuccess = false
      this.hasFile = false
      this.fileUploaded = false
      this.currentFile = null
      this.mediaDuration = '00:00'
      this.showWaveform = false
      this.resetProcessingState()
      
      // 重置文件输入
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = ''
      }
      
      // 清理资源
      if (this.previewUrl && this.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(this.previewUrl)
      }

      this.$message.info(this.translate('audioToText.messages.fileRemoved'))
    },
    
    // 加载示例
    loadSample(type) {
      const sampleInfo = {
        interview: { 
          name: 'interview_sample.mp3', 
          icon: '🎙️', 
          duration: '05:23',
          type: 'audio'
        },
        podcast: { 
          name: 'podcast_sample.mp3', 
          icon: '🎧', 
          duration: '15:47',
          type: 'audio'
        },
        meeting: { 
          name: 'meeting_recording.mp4', 
          icon: '💼', 
          duration: '45:12',
          type: 'video'
        },
        lecture: { 
          name: 'lecture_video.mp4', 
          icon: '🎓', 
          duration: '1:23:45',
          type: 'video'
        }
      }
      
      const sample = sampleInfo[type]
      
      // 创建模拟文件
      const blob = new Blob(['sample data'], { 
        type: sample.type === 'audio' ? 'audio/mp3' : 'video/mp4' 
      })
      const file = new File([blob], sample.name, { 
        type: sample.type === 'audio' ? 'audio/mp3' : 'video/mp4' 
      })
      
      this.currentFile = file
      this.fileName = sample.name
      this.fileType = sample.type
      this.mediaIcon = sample.icon
      this.mediaDuration = sample.duration
      this.showWaveform = (sample.type === 'audio')
      this.filePreview = true
      
      // 创建预览URL
      this.previewUrl = URL.createObjectURL(blob)
      
      // 延迟显示成功标记
      setTimeout(() => {
        this.uploadSuccess = true
        this.hasFile = true
        this.fileUploaded = true
        this.$message.success(this.translate('audioToText.messages.sampleLoaded'))
      }, 500)
    },
    
    // 处理语言更改
    handleLanguageChange() {
      console.log('Language changed to:', this.languageSelect)
      this.checkLanguageConflict()
      
      if (this.processingComplete) {
        this.resetToReprocess()
      }
    },
    
    // 处理翻译开关
    handleTranslationToggle() {
      if (this.enableTranslation) {
        this.checkLanguageConflict()
      }
      
      if (this.processingComplete) {
        this.resetToReprocess()
      }
    },
    
    // 处理翻译语言更改
    handleTranslationLanguageChange() {
      console.log('Translation language changed to:', this.translationLanguage)
      this.checkLanguageConflict()
      
      if (this.processingComplete) {
        this.resetToReprocess()
      }
    },
    
    // 检查语言冲突
    checkLanguageConflict() {
      if (this.enableTranslation &&
          this.languageSelect !== 'auto' &&
          this.languageSelect === this.translationLanguage) {
        this.$message.warning(this.translate('audioToText.messages.languageConflict'))

        // 自动切换到其他语言
        if (this.languageSelect !== 'en') {
          this.translationLanguage = 'en'
        } else {
          this.translationLanguage = 'zh'
        }
      }
    },
    
    // 处理格式更改
    handleFormatChange() {
      console.log('Output format changed to:', this.outputFormat)
      
      if (this.processingComplete) {
        this.resetToReprocess()
      }
    },
    
    // 重置为需要重新处理状态
    resetToReprocess() {
      this.buttonTextKey = 'audioToText.actions.retry'
      this.processingComplete = false
      this.transcriptionText = ''
    },

    // 重置处理状态
    resetProcessingState() {
      this.processing = false
      this.processingComplete = false
      this.processPercent = 0
      this.buttonTextKey = 'audioToText.actions.start'
      this.transcriptionText = ''
      this.wordCount = 0
      this.charCount = 0
    },
    
    // 开始转录
    startTranscription() {
      if (!this.fileUploaded && !this.filePreview) {
        this.$message.warning(this.translate('audioToText.messages.uploadRequired'))
        return
      }

      this.processing = true
      this.processPercent = 0
      this.transcriptionText = ''

      // 更新处理状态文本
      this.processDetailsKey = this.enableTranslation
        ? 'audioToText.processing.detailsTranslate'
        : 'audioToText.processing.detailsGenerate'
      this.processStatusKey = 'audioToText.processing.statusAnalyzing'

      // 模拟处理进度
      const interval = setInterval(() => {
        this.processPercent += Math.random() * 15

        // 更新状态文本
        if (this.processPercent < 30) {
          this.processStatusKey = 'audioToText.processing.statusAnalyzing'
        } else if (this.processPercent < 60) {
          this.processStatusKey = 'audioToText.processing.statusRecognizing'
        } else if (this.processPercent < 90) {
          this.processStatusKey = this.enableTranslation
            ? 'audioToText.processing.statusTranslating'
            : 'audioToText.processing.statusGenerating'
        }

        if (this.processPercent >= 100) {
          this.processPercent = 100
          clearInterval(interval)

          setTimeout(() => {
            this.processing = false
            this.processingComplete = true
            this.generateTranscriptionResult()
            this.$message.success(this.translate('audioToText.messages.processingComplete'))
          }, 500)
        }
      }, 200)
    },
    
    // 生成转录结果
    generateTranscriptionResult() {
      // 模拟转录文本
      const sampleText = `Welcome to our AI-powered transcription service. This is a sample transcription of your audio or video file.

The advanced speech recognition technology accurately converts spoken words into text, supporting multiple languages and dialects.

Our system can handle various audio qualities and background noise levels, ensuring reliable transcription results.

You can export the transcription in different formats, including plain text and SRT subtitles with timestamps.

Thank you for using our service. We hope you find the transcription helpful for your needs.`
      
      // 根据格式生成不同的输出
      if (this.outputFormat === 'srt') {
        this.transcriptionText = `1
00:00:00,000 --> 00:00:05,000
Welcome to our AI-powered transcription service.

2
00:00:05,000 --> 00:00:10,000
This is a sample transcription of your audio or video file.

3
00:00:10,000 --> 00:00:18,000
The advanced speech recognition technology accurately converts
spoken words into text, supporting multiple languages and dialects.

4
00:00:18,000 --> 00:00:25,000
Our system can handle various audio qualities and background noise levels,
ensuring reliable transcription results.

5
00:00:25,000 --> 00:00:32,000
You can export the transcription in different formats,
including plain text and SRT subtitles with timestamps.

6
00:00:32,000 --> 00:00:37,000
Thank you for using our service.
We hope you find the transcription helpful for your needs.`
      } else {
        this.transcriptionText = sampleText
      }
      
      // 计算统计信息
      const plainText = sampleText
      this.wordCount = plainText.split(/\s+/).length
      this.charCount = plainText.length
      
      // 设置检测到的语言
      const languageCodeMap = {
        auto: 'auto',
        en: 'en',
        zh: 'zh',
        es: 'es',
        fr: 'fr',
        de: 'de',
        ja: 'ja',
        ko: 'ko',
        ar: 'ar',
        ru: 'ru',
        pt: 'pt'
      }
      this.detectedLanguageCode = languageCodeMap[this.languageSelect] || 'en'
    },
    
    // 复制到剪贴板
    copyToClipboard() {
      navigator.clipboard.writeText(this.transcriptionText).then(() => {
        this.$message.success(this.translate('audioToText.messages.copySuccess'))
      }).catch(() => {
        this.$message.error(this.translate('audioToText.messages.copyFailed'))
      })
    },
    
    // 下载转录结果
    downloadTranscription() {
      const fileName = `transcription_${Date.now()}.${this.outputFormat}`
      const blob = new Blob([this.transcriptionText], { type: 'text/plain' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = fileName
      link.click()

      this.$message.success(this.translate('audioToText.messages.downloadStarted'))
    }
  }
}
</script>

<style lang="scss" scoped>
@import './VideoAudioToText.scss';

// 额外的样式调整，确保与VideoEnhancer一致
.file-input {
  display: none;
}

.preview-audio-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fb;
  border-radius: 8px;
  padding: 20px;

  .audio-visualization {
    text-align: center;
    width: 100%;

    .media-icon {
      font-size: 48px;
      margin-bottom: 10px;
    }

    .media-info {
      margin-bottom: 15px;

      .media-name {
        font-size: 14px;
        font-weight: 600;
        color: #1e293b;
        margin-bottom: 5px;
      }

      .media-duration {
        font-size: 12px;
        color: #64748b;
      }
    }

    .audio-waveform {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 2px;
      height: 40px;
      margin-top: 15px;

      .wave-bar {
        width: 3px;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        border-radius: 2px;
        animation: wave 1s ease-in-out infinite;
        
        @for $i from 1 through 20 {
          &:nth-child(#{$i}) {
            animation-delay: #{$i * 0.05}s;
          }
        }
      }
    }
  }
}

@keyframes wave {
  0%, 100% {
    transform: scaleY(0.5);
  }
  50% {
    transform: scaleY(1);
  }
}

.language-switcher {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.language-label {
  font-size: 12px;
  color: #64748b;
}

.language-select {
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background: #fff;
  font-size: 12px;
  color: #1e293b;
}
</style>
