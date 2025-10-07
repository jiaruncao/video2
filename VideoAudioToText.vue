<template>
  <div class="video-audio-to-text-page">
    <!-- 侧边栏 -->
    <aside class="sidebar">
      <div class="logo">MediaEnhance Pro</div>
      <nav class="nav-menu">
        <div
          v-for="(item, index) in menuItems"
          :key="index"
          :class="['nav-item', { active: item.active }]"
          @click="handleMenuClick(index)"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </div>
      </nav>
      <div class="user-info">
        <div class="nav-item user-account">
          <span class="nav-icon">👤</span>
          <div class="user-details">
            <div class="user-name">User Account</div>
            <div class="user-plan">Pro Member</div>
          </div>
        </div>
      </div>
    </aside>

    <!-- 主内容区域 -->
    <main class="main-container">
      <div class="content-wrapper">
        <!-- 标题区域 -->
        <div class="header">
          <h1 class="header-title">Video & Audio to Text</h1>
          <p class="header-subtitle">
            Convert your video and audio files into accurate text transcriptions using advanced AI speech recognition technology. Support for multiple languages and export formats.
          </p>
        </div>

        <!-- 主要工作区 -->
        <div class="workspace">
          <!-- 左侧：上传和预览区域 -->
          <div class="workspace-left">
            <!-- 上传区域 -->
            <div class="upload-container">
              <h3 class="section-title">Upload Media</h3>
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
                  <div class="upload-title">Drop your media files here</div>
                  <div class="upload-subtitle">or click to browse</div>
                  <el-button type="primary" size="small" class="upload-btn-small" @click.stop="triggerFileInput">
                    Choose Files
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
                          <div class="media-duration">Duration: {{ mediaDuration }}</div>
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
                Supported: .mp4, .mov, .m4v, .mp3, .wav, .m4a, .aac (Max 8 files, 2GB total)
              </div>
            </div>

            <!-- 示例文件 -->
            <div class="samples-container">
              <h3 class="section-title">Quick Samples</h3>
              <div class="sample-grid">
                <div
                  v-for="sample in samples"
                  :key="sample.type"
                  class="sample-item"
                  @click="loadSample(sample.type)"
                  :title="sample.title"
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
              <h3 class="section-title">Transcription Settings</h3>
              
              <!-- 语言选择 -->
              <div class="setting-group">
                <div class="setting-label">Language Detection</div>
                <el-select
                  v-model="languageSelect"
                  placeholder="Select language"
                  class="language-select-element"
                  @change="handleLanguageChange"
                >
                  <el-option label="Auto-detect Language" value="auto"></el-option>
                  <el-option label="English" value="en"></el-option>
                  <el-option label="Spanish" value="es"></el-option>
                  <el-option label="French" value="fr"></el-option>
                  <el-option label="German" value="de"></el-option>
                  <el-option label="Chinese (Mandarin)" value="zh"></el-option>
                  <el-option label="Japanese" value="ja"></el-option>
                  <el-option label="Korean" value="ko"></el-option>
                  <el-option label="Arabic" value="ar"></el-option>
                  <el-option label="Russian" value="ru"></el-option>
                  <el-option label="Portuguese" value="pt"></el-option>
                </el-select>
              </div>

              <!-- 翻译选项 -->
              <div class="setting-group">
                <div class="setting-label">Translation Options</div>
                <div class="translation-toggle">
                  <el-switch
                    v-model="enableTranslation"
                    active-color="#6366f1"
                    @change="handleTranslationToggle"
                  >
                  </el-switch>
                  <span class="toggle-label">Enable Translation</span>
                </div>
                <transition name="slide">
                  <div v-if="enableTranslation" class="translation-language-wrapper">
                    <div class="setting-sublabel">Translate to:</div>
                    <el-select
                      v-model="translationLanguage"
                      placeholder="Select translation language"
                      class="language-select-element"
                      @change="handleTranslationLanguageChange"
                    >
                      <el-option label="English" value="en"></el-option>
                      <el-option label="Chinese (Simplified)" value="zh"></el-option>
                      <el-option label="Chinese (Traditional)" value="zh-tw"></el-option>
                      <el-option label="Spanish" value="es"></el-option>
                      <el-option label="French" value="fr"></el-option>
                      <el-option label="German" value="de"></el-option>
                      <el-option label="Japanese" value="ja"></el-option>
                      <el-option label="Korean" value="ko"></el-option>
                      <el-option label="Arabic" value="ar"></el-option>
                      <el-option label="Russian" value="ru"></el-option>
                      <el-option label="Portuguese" value="pt"></el-option>
                      <el-option label="Italian" value="it"></el-option>
                      <el-option label="Dutch" value="nl"></el-option>
                      <el-option label="Hindi" value="hi"></el-option>
                      <el-option label="Thai" value="th"></el-option>
                    </el-select>
                  </div>
                </transition>
              </div>

              <!-- 输出格式 -->
              <div class="setting-group">
                <div class="setting-label">Output Format</div>
                <el-radio-group v-model="outputFormat" @change="handleFormatChange">
                  <div class="format-options">
                    <label class="format-option">
                      <el-radio label="txt">
                        <div class="format-content">
                          <span class="format-icon">📄</span>
                          <span class="format-title">TXT</span>
                        </div>
                      </el-radio>
                    </label>
                    <label class="format-option">
                      <el-radio label="srt">
                        <div class="format-content">
                          <span class="format-icon">📺</span>
                          <span class="format-title">SRT</span>
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
                {{ buttonText }}
              </el-button>
              
              <el-button
                v-else
                type="success"
                class="action-btn btn-download"
                @click="downloadTranscription"
              >
                <span class="btn-icon">⬇️</span>
                Download Transcription
              </el-button>

              <!-- 处理进度 -->
              <div v-if="processing" class="process-info">
                <div class="process-status">
                  <span class="status-icon">⏳</span>
                  <span class="status-text">{{ processStatusText }}</span>
                  <span class="status-percent">{{ processPercent }}%</span>
                </div>
                <el-progress
                  :percentage="processPercent"
                  :stroke-width="8"
                  :show-text="false"
                  color="#6366f1"
                />
                <div class="process-details">
                  <small>{{ processDetailsText }}</small>
                </div>
              </div>

              <!-- 完成状态 -->
              <div v-if="processingComplete && !processing" class="process-complete">
                <div class="complete-icon">✅</div>
                <div class="complete-text">Transcription Complete!</div>
                <div class="complete-subtitle">Your text is ready for download</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 转录结果区域 -->
        <div v-if="transcriptionText" class="transcription-section">
          <div class="transcription-header">
            <h2 class="transcription-title">Transcription Result</h2>
            <div class="transcription-controls">
              <el-button
                size="small"
                round
                @click="copyToClipboard"
              >
                <span class="control-icon">📋</span>
                Copy Text
              </el-button>
              <el-button
                size="small"
                round
                @click="downloadTranscription"
              >
                <span class="control-icon">💾</span>
                Save as {{ outputFormat.toUpperCase() }}
              </el-button>
            </div>
          </div>
          <div class="transcription-content">
            <pre class="transcription-text">{{ transcriptionText }}</pre>
          </div>
          <div class="transcription-footer">
            <div class="transcription-stats">
              <span>Words: {{ wordCount }}</span>
              <span>Characters: {{ charCount }}</span>
              <span>Language: {{ detectedLanguage }}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: 'VideoAudioToText',
  data() {
    return {
      // 菜单项
      menuItems: [
        { icon: '📊', label: 'Dashboard', active: false },
        { icon: '📝', label: 'Speech to Text', active: true },
        { icon: '🎨', label: 'Style Transfer', active: false },
        { icon: '🔊', label: 'Audio Enhancement', active: false },
        { icon: '📁', label: 'My Projects', active: false },
        { icon: '⚙️', label: 'Settings', active: false }
      ],
      
      // 示例文件
      samples: [
        { type: 'interview', icon: '🎙️', title: 'Interview Sample' },
        { type: 'podcast', icon: '🎧', title: 'Podcast Sample' },
        { type: 'meeting', icon: '💼', title: 'Meeting Sample' },
        { type: 'lecture', icon: '🎓', title: 'Lecture Sample' }
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
      buttonText: 'Start Transcription',
      processStatusText: 'Processing your media...',
      processDetailsText: 'Analyzing audio • Recognizing speech • Generating text',
      
      // 转录结果
      transcriptionText: '',
      detectedLanguage: 'English',
      wordCount: 0,
      charCount: 0
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
        this.$message.warning('Maximum 8 files allowed at once')
        return
      }
      
      // 检查文件大小 (2GB限制)
      const maxSize = 2 * 1024 * 1024 * 1024
      if (files[0].size > maxSize) {
        this.$message.error('File size exceeds 2GB limit')
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
          this.$message.success('File uploaded successfully')
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
      
      this.$message.info('File removed')
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
        this.$message.success('Sample loaded successfully')
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
        this.$message.warning('Source language and translation language cannot be the same')
        
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
      this.buttonText = 'Retranscribe'
      this.processingComplete = false
      this.transcriptionText = ''
    },
    
    // 重置处理状态
    resetProcessingState() {
      this.processing = false
      this.processingComplete = false
      this.processPercent = 0
      this.buttonText = 'Start Transcription'
      this.transcriptionText = ''
      this.wordCount = 0
      this.charCount = 0
    },
    
    // 开始转录
    startTranscription() {
      if (!this.fileUploaded && !this.filePreview) {
        this.$message.warning('Please upload a file first')
        return
      }
      
      this.processing = true
      this.processPercent = 0
      this.transcriptionText = ''
      
      // 更新处理状态文本
      if (this.enableTranslation) {
        this.processDetailsText = 'Analyzing audio • Recognizing speech • Translating text'
      } else {
        this.processDetailsText = 'Analyzing audio • Recognizing speech • Generating text'
      }
      
      // 模拟处理进度
      const interval = setInterval(() => {
        this.processPercent += Math.random() * 15
        
        // 更新状态文本
        if (this.processPercent < 30) {
          this.processStatusText = 'Analyzing audio...'
        } else if (this.processPercent < 60) {
          this.processStatusText = 'Recognizing speech...'
        } else if (this.processPercent < 90) {
          this.processStatusText = this.enableTranslation ? 'Translating text...' : 'Generating text...'
        }
        
        if (this.processPercent >= 100) {
          this.processPercent = 100
          clearInterval(interval)
          
          setTimeout(() => {
            this.processing = false
            this.processingComplete = true
            this.generateTranscriptionResult()
            this.$message.success('Transcription completed successfully!')
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
      const languageMap = {
        'auto': 'English (Auto-detected)',
        'en': 'English',
        'zh': 'Chinese',
        'es': 'Spanish',
        'fr': 'French',
        'de': 'German',
        'ja': 'Japanese',
        'ko': 'Korean',
        'ar': 'Arabic',
        'ru': 'Russian',
        'pt': 'Portuguese'
      }
      this.detectedLanguage = languageMap[this.languageSelect] || 'English'
    },
    
    // 复制到剪贴板
    copyToClipboard() {
      navigator.clipboard.writeText(this.transcriptionText).then(() => {
        this.$message.success('Text copied to clipboard')
      }).catch(() => {
        this.$message.error('Failed to copy text')
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
      
      this.$message.success('Download started')
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
</style>