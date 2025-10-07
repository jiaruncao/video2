<template>
  <div class="noise-reducer-page">
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
          <h1 class="header-title">Audio Noise Reducer</h1>
          <p class="header-subtitle">
            Remove background noise, hum, and unwanted sounds from your videos using advanced AI-powered audio processing technology.
          </p>
        </div>

        <!-- 主要工作区 -->
        <div class="workspace">
          <!-- 左侧：上传和预览区域 -->
          <div class="workspace-left">
            <!-- 上传区域 -->
            <div class="upload-container">
              <h3 class="section-title">Upload Video</h3>
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
                  <div class="upload-title">Drop your video here</div>
                  <div class="upload-subtitle">or click to browse</div>
                  <el-button type="primary" size="small" class="upload-btn-small" @click.stop="triggerFileInput">
                    Choose Files
                  </el-button>
                  <input
                    ref="fileInput"
                    type="file"
                    class="file-input"
                    multiple
                    accept=".mp4,.mov,.m4v,.3gp,.avi"
                    @change="handleFileSelect"
                  />
                </div>

                <!-- 文件预览 -->
                <div v-else class="file-preview">
                  <div class="file-preview-item">
                    <video
                      v-if="fileType === 'video'"
                      :src="previewUrl"
                      class="preview-video"
                      controls
                    />
                  </div>
                  <div class="file-info">
                    <span class="file-name">{{ fileName }}</span>
                    <el-button type="danger" size="mini" @click.stop="removeFile">✕</el-button>
                  </div>
                </div>
              </div>
              <div class="supported-formats">
                Supported: .mp4, .mov, .m4v, .3gp, .avi (Max 8 files, 2GB each)
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
                  <span class="sample-label">{{ sample.label }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧：操作按钮 -->
          <div class="workspace-right">
            <div class="actions-container">
              <!-- 处理按钮 -->
              <el-button
                v-if="!processingComplete"
                type="primary"
                class="action-btn btn-process"
                :disabled="processing || !fileUploaded"
                @click="startProcessing"
                :loading="processing"
              >
                <span v-if="!processing" class="btn-icon">🔇</span>
                {{ processing ? 'Processing...' : buttonText }}
              </el-button>

              <!-- 下载按钮 -->
              <template v-if="processingComplete">
                <el-button
                  class="action-btn btn-download-preview"
                  @click="downloadPreview"
                >
                  <span class="btn-icon">👁️</span>
                  <span class="btn-label">
                    Preview (5s)
                    <small>Quick preview with noise reduction</small>
                  </span>
                </el-button>

                <el-button
                  type="success"
                  class="action-btn btn-download-full"
                  @click="downloadFull"
                >
                  <span class="btn-icon">⬇️</span>
                  <span class="btn-label">
                    Download Full Video
                    <small>Complete noise-reduced video</small>
                  </span>
                </el-button>
              </template>

              <!-- 处理进度 -->
              <div v-if="processing" class="process-info">
                <div class="process-status">
                  <span class="status-icon">⏳</span>
                  <span class="status-text">Processing your video...</span>
                  <span class="status-percent">{{ processPercent }}%</span>
                </div>
                <el-progress
                  :percentage="processPercent"
                  :stroke-width="8"
                  :show-text="false"
                  color="#6366f1"
                />
                <div class="process-details">
                  <small>Analyzing audio • Removing noise • Optimizing quality</small>
                </div>
              </div>

              <!-- 完成状态 -->
              <div v-if="processingComplete && !processing" class="process-complete">
                <div class="complete-icon">✅</div>
                <div class="complete-text">Noise Reduction Complete!</div>
                <div class="complete-subtitle">Your video is ready for download</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 对比区域 -->
        <div class="comparison-section">
          <div class="comparison-header">
            <h2 class="comparison-title">Audio Comparison</h2>
            <div v-show="showVideoControls" class="comparison-controls">
              <el-button
                class="control-btn"
                @click="togglePlayPause"
                size="small"
                round
              >
                <span class="control-icon">{{ isPlaying ? '⏸️' : '▶️' }}</span>
                {{ isPlaying ? 'Pause' : 'Play' }}
              </el-button>
              <el-button
                class="control-btn"
                @click="restartVideos"
                size="small"
                round
              >
                <span class="control-icon">🔄</span>
                Restart
              </el-button>
              <el-button
                class="control-btn"
                @click="toggleMute"
                size="small"
                round
              >
                <span class="control-icon">{{ isMuted ? '🔇' : '🔊' }}</span>
                {{ isMuted ? 'Muted' : 'Sound' }}
              </el-button>
              <el-slider
                v-model="videoProgress"
                @input="seekVideos"
                class="video-slider"
                :show-tooltip="false"
              />
            </div>
          </div>

          <div class="comparison-container">
            <!-- 原始视频 -->
            <div class="comparison-item">
              <div class="comparison-label">
                <span class="label-badge original">Original</span>
                <span class="label-info">With Background Noise</span>
              </div>
              <div class="video-wrapper" @click="toggleVideoPlayPause('original')">
                <video
                  v-show="showOriginalVideo"
                  ref="originalVideo"
                  :src="originalVideoSrc"
                  class="comparison-video"
                  :muted="isMuted"
                  @timeupdate="handleTimeUpdate"
                  @loadedmetadata="handleVideoLoaded"
                />
                <div class="play-overlay" v-if="showOriginalVideo">
                  <span class="play-overlay-icon">{{ isPlaying ? '⏸️' : '▶️' }}</span>
                </div>
                <div v-if="!fileUploaded" class="upload-placeholder">
                  <div class="placeholder-info">
                    <span class="placeholder-icon">📁</span>
                    <p class="placeholder-text">To be uploaded</p>
                    <small class="placeholder-hint">Upload a video to begin</small>
                  </div>
                </div>
              </div>
            </div>

            <!-- VS 分隔符 -->
            <div class="comparison-divider">
              <div class="divider-icon">VS</div>
            </div>

            <!-- 处理后的视频 -->
            <div class="comparison-item">
              <div class="comparison-label">
                <span class="label-badge processed">Processed</span>
                <span class="label-info">Noise Reduced</span>
              </div>
              <div class="video-wrapper" @click="toggleVideoPlayPause('processed')">
                <div v-if="processingComplete" class="preview-badge">Preview</div>
                <video
                  v-show="showProcessedVideo"
                  ref="processedVideo"
                  :src="processedVideoSrc"
                  class="comparison-video"
                  :muted="isMuted"
                />
                <div class="play-overlay" v-if="showProcessedVideo && processingComplete">
                  <span class="play-overlay-icon">{{ isPlaying ? '⏸️' : '▶️' }}</span>
                </div>
                <div v-if="!processingComplete || !fileUploaded" class="process-placeholder">
                  <div class="placeholder-info">
                    <span class="placeholder-icon">{{ placeholderIcon }}</span>
                    <p class="placeholder-text">{{ placeholderText }}</p>
                    <small class="placeholder-hint">{{ placeholderHint }}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 时间轴 -->
          <div v-show="showVideoControls" class="comparison-timeline">
            <span class="time-label">{{ currentTime }}</span>
            <div class="timeline-bar">
              <div class="timeline-progress" :style="{ width: videoProgress + '%' }" />
            </div>
            <span class="time-label">{{ totalTime }}</span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: 'NoiseReducer',
  data() {
    return {
      // 菜单项
      menuItems: [
        { icon: '📊', label: 'Dashboard', active: false },
        { icon: '🔇', label: 'Noise Reducer', active: true },
        { icon: '✨', label: 'Video Enhancer', active: false },
        { icon: '📝', label: 'Speech to Text', active: false },
        { icon: '📁', label: 'My Projects', active: false },
        { icon: '⚙️', label: 'Settings', active: false }
      ],
      
      // 示例文件
      samples: [
        { type: 'podcast', icon: '🎙️', label: 'Podcast', title: 'Podcast Recording' },
        { type: 'meeting', icon: '👥', label: 'Meeting', title: 'Video Conference' },
        { type: 'outdoor', icon: '🌳', label: 'Outdoor', title: 'Outdoor Recording' },
        { type: 'traffic', icon: '🚗', label: 'Traffic', title: 'Street Recording' }
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
      
      // 处理状态
      processing: false,
      processingComplete: false,
      processPercent: 0,
      buttonText: 'Reduce Noise',
      
      // 视频控制
      isPlaying: false,
      isMuted: false, // 音频降噪默认不静音
      videoProgress: 0,
      currentTime: '00:00',
      totalTime: '00:00',
      showVideoControls: false,
      
      // 显示状态
      showOriginalVideo: false,
      showProcessedVideo: false,
      originalVideoSrc: '',
      processedVideoSrc: '',
      
      // 占位符状态
      placeholderIcon: '⏳',
      placeholderText: 'To be processed',
      placeholderHint: 'Click Reduce Noise to begin'
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
      console.log('Noise Reducer component initialized')
    },
    
    // 清理资源
    cleanup() {
      // 释放视频资源
      if (this.originalVideoSrc && this.originalVideoSrc.startsWith('blob:')) {
        URL.revokeObjectURL(this.originalVideoSrc)
      }
      if (this.processedVideoSrc && this.processedVideoSrc.startsWith('blob:')) {
        URL.revokeObjectURL(this.processedVideoSrc)
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
      
      // 检查文件类型
      const file = files[0]
      const validTypes = ['video/mp4', 'video/quicktime', 'video/x-m4v', 'video/3gpp', 'video/x-msvideo']
      const fileType = file.type || 'video/mp4'
      
      if (!validTypes.some(type => fileType.includes(type.split('/')[1]))) {
        this.$message.error('Please upload a valid video file')
        return
      }
      
      // 检查文件大小 (2GB限制)
      const maxSize = 2 * 1024 * 1024 * 1024
      if (file.size > maxSize) {
        this.$message.error('File size exceeds 2GB limit')
        return
      }
      
      this.currentFile = file
      this.displayPreview(file)
    },
    
    // 显示预览
    displayPreview(file) {
      this.fileName = file.name
      this.fileType = 'video'
      
      // 读取文件
      const reader = new FileReader()
      reader.onload = (e) => {
        this.previewUrl = e.target.result
        this.filePreview = true
        
        // 延迟显示成功标记，模拟上传过程
        setTimeout(() => {
          this.uploadSuccess = true
          this.hasFile = true
          this.fileUploaded = true
          this.showComparisonWithFile()
          this.$message.success('Video uploaded successfully')
        }, 500)
      }
      reader.readAsDataURL(file)
    },
    
    // 显示对比
    showComparisonWithFile() {
      // 更新占位符提示
      this.placeholderIcon = '⏳'
      this.placeholderText = 'Ready to process'
      this.placeholderHint = 'Click Reduce Noise to begin'
      
      // 设置原始视频
      this.setupOriginalVideo()
    },
    
    // 设置原始视频
    setupOriginalVideo() {
      this.originalVideoSrc = this.previewUrl
      this.showOriginalVideo = true
      this.showVideoControls = true
      
      // 获取视频元数据
      this.$nextTick(() => {
        if (this.$refs.originalVideo) {
          this.$refs.originalVideo.onloadedmetadata = () => {
            const video = this.$refs.originalVideo
            this.totalTime = this.formatDuration(video.duration)
          }
        }
      })
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
      this.resetComparisonToInitial()
      this.resetProcessingState()
      
      // 重置文件输入
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = ''
      }
      
      this.$message.info('File removed')
    },
    
    // 重置对比区域到初始状态
    resetComparisonToInitial() {
      this.showOriginalVideo = false
      this.showProcessedVideo = false
      this.showVideoControls = false
      
      // 清理视频资源
      if (this.originalVideoSrc && this.originalVideoSrc.startsWith('blob:')) {
        URL.revokeObjectURL(this.originalVideoSrc)
      }
      if (this.processedVideoSrc && this.processedVideoSrc.startsWith('blob:')) {
        URL.revokeObjectURL(this.processedVideoSrc)
      }
      
      this.originalVideoSrc = ''
      this.processedVideoSrc = ''
      
      // 重置占位符
      this.placeholderIcon = '⏳'
      this.placeholderText = 'To be processed'
      this.placeholderHint = 'Upload a video first'
    },
    
    // 重置处理状态
    resetProcessingState() {
      this.processing = false
      this.processingComplete = false
      this.processPercent = 0
      this.buttonText = 'Reduce Noise'
    },
    
    // 加载示例
    loadSample(type) {
      // 创建示例视频（使用Canvas生成）
      const canvas = document.createElement('canvas')
      canvas.width = 1280
      canvas.height = 720
      const ctx = canvas.getContext('2d')
      
      // 不同类型的示例颜色
      const colors = {
        podcast: '#e0f2fe',
        meeting: '#fef3c7',
        outdoor: '#d4f4dd',
        traffic: '#fee2e2'
      }
      
      ctx.fillStyle = colors[type]
      ctx.fillRect(0, 0, 1280, 720)
      ctx.fillStyle = '#333'
      ctx.font = '48px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(`${type.charAt(0).toUpperCase() + type.slice(1)} Sample`, 640, 360)
      
      // 转换为Blob
      canvas.toBlob((blob) => {
        const file = new File([blob], `${type}_sample.mp4`, { type: 'video/mp4' })
        this.currentFile = file
        this.fileName = file.name
        this.fileType = 'video'
        this.previewUrl = canvas.toDataURL()
        this.filePreview = true
        
        // 延迟显示成功标记
        setTimeout(() => {
          this.uploadSuccess = true
          this.hasFile = true
          this.fileUploaded = true
          this.showComparisonWithFile()
          this.$message.success(`${type.charAt(0).toUpperCase() + type.slice(1)} sample loaded`)
        }, 500)
      })
    },
    
    // 开始处理
    startProcessing() {
      if (!this.fileUploaded && !this.filePreview) {
        this.$message.warning('Please upload a video first')
        return
      }
      
      this.processing = true
      this.processPercent = 0
      
      // 模拟处理进度
      const interval = setInterval(() => {
        this.processPercent += Math.random() * 15
        if (this.processPercent >= 100) {
          this.processPercent = 100
          clearInterval(interval)
          
          setTimeout(() => {
            this.processing = false
            this.processingComplete = true
            this.showProcessedResult()
          }, 500)
        }
      }, 200)
    },
    
    // 显示处理结果
    showProcessedResult() {
      // 实际应用中，这里应该是降噪后的视频URL
      this.processedVideoSrc = this.originalVideoSrc
      this.showProcessedVideo = true
      
      this.$message.success('Noise reduction completed!')
    },
    
    // 视频控制
    togglePlayPause() {
      if (this.$refs.originalVideo) {
        if (this.isPlaying) {
          this.$refs.originalVideo.pause()
          if (this.$refs.processedVideo) {
            this.$refs.processedVideo.pause()
          }
        } else {
          this.$refs.originalVideo.play()
          if (this.$refs.processedVideo && this.processingComplete) {
            this.$refs.processedVideo.play()
          }
        }
        this.isPlaying = !this.isPlaying
      }
    },
    
    // 点击视频播放/暂停
    toggleVideoPlayPause(side) {
      if (side === 'original' && this.showOriginalVideo) {
        this.togglePlayPause()
      } else if (side === 'processed' && this.showProcessedVideo && this.processingComplete) {
        this.togglePlayPause()
      }
    },
    
    // 重新开始
    restartVideos() {
      if (this.$refs.originalVideo) {
        this.$refs.originalVideo.currentTime = 0
        if (this.$refs.processedVideo) {
          this.$refs.processedVideo.currentTime = 0
        }
        if (this.isPlaying) {
          this.togglePlayPause()
        }
      }
    },
    
    // 静音切换
    toggleMute() {
      this.isMuted = !this.isMuted
    },
    
    // 跳转视频
    seekVideos(value) {
      if (this.$refs.originalVideo) {
        const time = (value / 100) * this.$refs.originalVideo.duration
        this.$refs.originalVideo.currentTime = time
        if (this.$refs.processedVideo && this.processingComplete) {
          this.$refs.processedVideo.currentTime = time
        }
      }
    },
    
    // 时间更新
    handleTimeUpdate() {
      if (this.$refs.originalVideo) {
        const current = this.$refs.originalVideo.currentTime
        const duration = this.$refs.originalVideo.duration
        this.videoProgress = (current / duration) * 100
        this.currentTime = this.formatDuration(current)
        
        // 同步处理后的视频
        if (this.$refs.processedVideo && this.processingComplete) {
          if (Math.abs(this.$refs.processedVideo.currentTime - current) > 0.1) {
            this.$refs.processedVideo.currentTime = current
          }
        }
      }
    },
    
    // 视频加载完成
    handleVideoLoaded() {
      if (this.$refs.originalVideo) {
        this.totalTime = this.formatDuration(this.$refs.originalVideo.duration)
      }
    },
    
    // 格式化时长
    formatDuration(seconds) {
      if (isNaN(seconds)) return '00:00'
      const minutes = Math.floor(seconds / 60)
      const secs = Math.floor(seconds % 60)
      return `${minutes}:${secs.toString().padStart(2, '0')}`
    },
    
    // 下载预览
    downloadPreview() {
      this.$message.info('Downloading 5-second preview...')
      // 实际实现下载逻辑
    },
    
    // 下载完整视频
    downloadFull() {
      const link = document.createElement('a')
      link.href = this.processedVideoSrc
      link.download = `noise_reduced_${this.fileName}`
      link.click()
      
      this.$message.success('Download started')
    }
  }
}
</script>

<style lang="scss" scoped>
@import './NoiseReducer.scss';

// 额外的样式补充
.file-input {
  display: none;
}

.preview-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

.btn-label {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  
  small {
    font-size: 11px;
    opacity: 0.8;
  }
}

.label-badge {
  &.original {
    background: linear-gradient(135deg, #fef2f2, #fee2e2);
    color: #dc2626;
    border: 1px solid #fca5a5;
  }
  
  &.processed {
    background: linear-gradient(135deg, #f0fdf4, #dcfce7);
    color: #16a34a;
    border: 1px solid #86efac;
  }
}

.sample-label {
  font-size: 12px;
  margin-top: 4px;
  display: block;
}
</style>