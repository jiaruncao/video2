<template>
  <div class="video-deduplication-page">
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
          <h1 class="header-title">Video Batch Deduplication</h1>
          <p class="header-subtitle">
            Batch process multiple videos to remove duplicates and apply smart effects for unique content creation.
          </p>
        </div>

        <!-- 主要工作区 -->
        <div class="workspace">
          <!-- 左侧：上传和预览区域 -->
          <div class="workspace-left">
            <!-- 上传区域 -->
            <div class="upload-container">
              <h3 class="section-title">
                <span class="section-icon">📁</span>
                Upload Videos
              </h3>
              <div
                :class="['upload-area', { 'has-file': hasFiles, 'dragover': isDragover }]"
                @drop.prevent="handleDrop"
                @dragover.prevent="handleDragover"
                @dragleave="handleDragleave"
                @click="triggerFileInput"
              >
                <!-- 上传内容 -->
                <div v-if="!hasFiles" class="upload-content">
                  <div class="upload-icon">📹</div>
                  <div class="upload-title">Drop your videos here</div>
                  <div class="upload-subtitle">or click to browse (Multiple files supported)</div>
                  <el-button type="primary" size="small" class="upload-btn-small" @click.stop="triggerFileInput">
                    Choose Files
                  </el-button>
                  <input
                    ref="fileInput"
                    type="file"
                    class="file-input"
                    multiple
                    accept=".mp4,.mov,.m4v,.3gp,.avi,.mkv,.webm"
                    @change="handleFileSelect"
                  />
                </div>

                <!-- 文件列表 -->
                <div v-else class="files-list">
                  <div class="files-header">
                    <span class="files-count">{{ uploadedFiles.length }} files selected</span>
                    <el-button type="text" size="mini" @click.stop="clearAllFiles">Clear all</el-button>
                  </div>
                  <div class="files-scroll">
                    <div v-for="(file, index) in uploadedFiles" :key="file.id" class="file-item">
                      <div class="file-icon">🎥</div>
                      <div class="file-details">
                        <div class="file-name">{{ file.name }}</div>
                        <div class="file-info-text">{{ file.size }}</div>
                      </div>
                      <el-button
                        type="danger"
                        size="mini"
                        circle
                        @click.stop="removeFile(index)"
                      >
                        ✕
                      </el-button>
                    </div>
                  </div>
                  <div class="upload-success-badge" v-if="uploadSuccess">✓</div>
                </div>
              </div>
              <div class="supported-formats">
                Supported: .mp4, .mov, .m4v, .3gp, .avi, .mkv, .webm (Max 500MB each)
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="actions-container">
              <el-button
                v-if="!processingComplete"
                type="primary"
                class="action-btn btn-process"
                :disabled="processing || !hasFiles"
                @click="startProcessing"
                :loading="processing"
              >
                <span v-if="!processing" class="btn-icon">🚀</span>
                {{ processing ? 'Processing...' : buttonText }}
              </el-button>
              
              <el-button
                v-if="processingComplete"
                type="success"
                class="action-btn btn-download"
                @click="downloadResults"
              >
                <span class="btn-icon">⬇️</span>
                Download All Results
              </el-button>

              <!-- 处理进度 -->
              <div v-if="processing" class="process-info">
                <div class="process-status">
                  <span class="status-icon">⏳</span>
                  <span class="status-text">Processing {{ currentProcessingFile }}...</span>
                  <span class="status-percent">{{ processPercent }}%</span>
                </div>
                <el-progress
                  :percentage="processPercent"
                  :stroke-width="8"
                  :show-text="false"
                  color="#6366f1"
                />
                <div class="process-details">
                  <small>Processing {{ processedCount }}/{{ uploadedFiles.length }} videos</small>
                </div>
              </div>

              <!-- 完成状态 -->
              <div v-if="processingComplete && !processing" class="process-complete">
                <div class="complete-icon">✅</div>
                <div class="complete-text">Processing Complete!</div>
                <div class="complete-subtitle">All videos have been processed</div>
              </div>
            </div>
          </div>

          <!-- 右侧：设置和选项 -->
          <div class="workspace-right">
            <!-- 处理模式 -->
            <div class="settings-container">
              <h3 class="section-title">
                <span class="section-icon">⚙️</span>
                Processing Mode
              </h3>

              <!-- 模式选择 -->
              <el-radio-group v-model="processingMode" @change="handleModeChange">
                <div class="mode-cards">
                  <label class="mode-card-wrapper">
                    <el-radio label="smart">
                      <div class="mode-card" :class="{ selected: processingMode === 'smart' }">
                        <div class="mode-card-icon">🧠</div>
                        <div class="mode-card-title">Smart Mode</div>
                        <div class="mode-card-desc">Automatic optimization</div>
                      </div>
                    </el-radio>
                  </label>
                  <label class="mode-card-wrapper">
                    <el-radio label="custom">
                      <div class="mode-card" :class="{ selected: processingMode === 'custom' }">
                        <div class="mode-card-icon">⚡</div>
                        <div class="mode-card-title">Custom Mode</div>
                        <div class="mode-card-desc">Manual settings</div>
                      </div>
                    </el-radio>
                  </label>
                </div>
              </el-radio-group>

              <!-- 自定义设置 -->
              <transition name="fade">
                <div v-show="processingMode === 'custom'" class="custom-settings">
                  <el-collapse v-model="activeCollapse" class="custom-collapse">
                    <!-- 基础去重选项 -->
                    <el-collapse-item name="basic">
                      <template slot="title">
                        <div class="collapsible-title">
                          <span>🔧</span>
                          <span>Basic Deduplication</span>
                        </div>
                      </template>
                      <div class="checkbox-group">
                        <el-checkbox-group v-model="basicOptions">
                          <div v-for="option in basicDedupOptions" :key="option.value" class="checkbox-item">
                            <el-checkbox :label="option.value">
                              {{ option.label }}
                            </el-checkbox>
                          </div>
                        </el-checkbox-group>
                      </div>
                    </el-collapse-item>

                    <!-- 特效选项 -->
                    <el-collapse-item name="effects">
                      <template slot="title">
                        <div class="collapsible-title">
                          <span>✨</span>
                          <span>Special Effects</span>
                        </div>
                      </template>
                      <div class="effect-grid">
                        <button
                          v-for="effect in specialEffects"
                          :key="effect.value"
                          :class="['effect-btn', { selected: selectedEffect === effect.value }]"
                          @click="selectEffect(effect.value)"
                        >
                          <span class="effect-icon">{{ effect.icon }}</span>
                          <span>{{ effect.label }}</span>
                        </button>
                      </div>
                    </el-collapse-item>
                  </el-collapse>
                </div>
              </transition>
            </div>

            <!-- Zoom设置 -->
            <div class="settings-container zoom-settings">
              <h3 class="section-title">
                <span class="section-icon">🔍</span>
                Zoom Settings
              </h3>
              <div class="zoom-options">
                <button
                  v-for="zoom in zoomOptions"
                  :key="zoom.value"
                  :class="['zoom-btn', { selected: selectedZoom === zoom.value }]"
                  @click="selectZoom(zoom.value)"
                >
                  <span class="zoom-icon">{{ zoom.icon }}</span>
                  <span>{{ zoom.label }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 结果预览区域 -->
        <div v-if="processingComplete" class="results-section">
          <div class="results-header">
            <h2 class="results-title">Processing Results</h2>
            <div class="results-stats">
              <div class="stat-item">
                <span class="stat-label">Total Videos:</span>
                <span class="stat-value">{{ statistics.totalVideos }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Processed:</span>
                <span class="stat-value">{{ statistics.processedVideos }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Effects Applied:</span>
                <span class="stat-value">{{ statistics.effectsCount }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Success Rate:</span>
                <span class="stat-value">{{ statistics.successRate }}%</span>
              </div>
            </div>
          </div>

          <div class="results-grid">
            <div v-for="(result, index) in processedResults" :key="result.id" class="result-item">
              <div class="result-preview">
                <video :src="result.url" class="result-video" controls></video>
                <div class="result-badge">{{ result.effects.join(', ') }}</div>
              </div>
              <div class="result-info">
                <div class="result-name">{{ result.name }}</div>
                <el-button size="mini" @click="downloadSingle(result)">
                  Download
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: 'VideoDeduplication',
  data() {
    return {
      // 菜单项
      menuItems: [
        { icon: '📊', label: 'Dashboard', active: false },
        { icon: '🎬', label: 'Video Dedup', active: true },
        { icon: '✨', label: 'Video Enhancer', active: false },
        { icon: '📝', label: 'Speech to Text', active: false },
        { icon: '📁', label: 'My Projects', active: false },
        { icon: '⚙️', label: 'Settings', active: false }
      ],
      
      // 上传状态
      isDragover: false,
      hasFiles: false,
      uploadSuccess: false,
      uploadedFiles: [],
      currentFile: null,
      
      // 处理模式
      processingMode: 'smart',
      activeCollapse: ['basic'],
      
      // 基础去重选项
      basicOptions: [],
      basicDedupOptions: [
        { value: 'removeduplicates', label: 'Remove Duplicates' },
        { value: 'mirrorflip', label: 'Mirror Flip' },
        { value: 'randomshift', label: 'Random Shift' },
        { value: 'modifymd5', label: 'Modify MD5' },
        { value: 'smartextract', label: 'Smart Extract' },
        { value: 'smartcolor', label: 'Smart Color' },
        { value: 'sharpening', label: 'Sharpening' },
        { value: 'randomspeed', label: 'Random Speed' },
        { value: 'trimheadtail', label: 'Trim Head/Tail' },
        { value: 'randommirror', label: 'Random Mirror' }
      ],
      
      // 特效选项
      selectedEffect: null,
      specialEffects: [
        { value: 'scanline', icon: '📺', label: 'Scanline' },
        { value: 'spotlight', icon: '💡', label: 'Spotlight' },
        { value: 'fade', icon: '🌅', label: 'Fade' },
        { value: 'booklet', icon: '📖', label: 'Booklet' },
        { value: 'dissolve', icon: '✨', label: 'Dissolve' },
        { value: 'split', icon: '📱', label: 'Split Screen' },
        { value: 'product', icon: '🛍️', label: 'Product' },
        { value: 'film', icon: '🎬', label: 'Film' },
        { value: 'drama', icon: '🎭', label: 'Drama' }
      ],
      
      // Zoom选项
      selectedZoom: null,
      zoomOptions: [
        { value: 'stretch', icon: '↔️', label: 'Stretch' },
        { value: 'compress', icon: '↕️', label: 'Compress' },
        { value: 'dynamic', icon: '🔄', label: 'Dynamic' }
      ],
      
      // 处理状态
      processing: false,
      processingComplete: false,
      processPercent: 0,
      buttonText: 'Start Processing',
      currentProcessingFile: '',
      processedCount: 0,
      
      // 处理结果
      processedResults: [],
      
      // 统计数据
      statistics: {
        totalVideos: 0,
        processedVideos: 0,
        effectsCount: 0,
        successRate: 100
      }
    }
  },
  
  mounted() {
    this.initializeComponent()
  },
  
  beforeDestroy() {
    this.cleanup()
  },
  
  methods: {
    // 初始化组件
    initializeComponent() {
      console.log('Video Deduplication component initialized')
    },
    
    // 清理资源
    cleanup() {
      // 释放所有视频URL
      this.uploadedFiles.forEach(file => {
        if (file.url && file.url.startsWith('blob:')) {
          URL.revokeObjectURL(file.url)
        }
      })
      this.processedResults.forEach(result => {
        if (result.url && result.url.startsWith('blob:')) {
          URL.revokeObjectURL(result.url)
        }
      })
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
        this.handleFiles(Array.from(files))
      }
    },
    
    // 文件拖拽处理
    handleDragover() {
      if (!this.processing) {
        this.isDragover = true
      }
    },
    
    handleDragleave() {
      this.isDragover = false
    },
    
    handleDrop(e) {
      this.isDragover = false
      if (!this.processing) {
        const files = Array.from(e.dataTransfer.files)
        this.handleFiles(files)
      }
    },
    
    // 处理文件
    handleFiles(files) {
      const validFiles = []
      
      files.forEach(file => {
        // 检查文件类型
        const validTypes = ['video/mp4', 'video/quicktime', 'video/x-m4v', 'video/3gpp', 'video/x-msvideo', 'video/x-matroska', 'video/webm']
        const fileType = file.type || 'video/mp4'
        
        if (!validTypes.some(type => fileType.includes(type.split('/')[1]))) {
          this.$message.error(`${file.name} is not a valid video file`)
          return
        }
        
        // 检查文件大小 (500MB限制)
        const maxSize = 500 * 1024 * 1024
        if (file.size > maxSize) {
          this.$message.error(`${file.name} exceeds 500MB limit`)
          return
        }
        
        validFiles.push(file)
      })
      
      if (validFiles.length > 0) {
        this.addFiles(validFiles)
      }
    },
    
    // 添加文件到列表
    addFiles(files) {
      files.forEach(file => {
        const fileData = {
          id: Date.now() + Math.random(),
          name: file.name,
          size: this.formatFileSize(file.size),
          file: file,
          url: URL.createObjectURL(file),
          type: 'video'
        }
        this.uploadedFiles.push(fileData)
      })
      
      this.hasFiles = true
      this.uploadSuccess = true
      
      // 设置当前文件用于预览
      if (this.uploadedFiles.length === 1) {
        this.currentFile = this.uploadedFiles[0]
      }
      
      this.$message.success(`${files.length} file(s) added successfully`)
    },
    
    // 移除单个文件
    removeFile(index) {
      const file = this.uploadedFiles[index]
      
      // 释放URL
      if (file.url && file.url.startsWith('blob:')) {
        URL.revokeObjectURL(file.url)
      }
      
      this.uploadedFiles.splice(index, 1)
      
      if (this.uploadedFiles.length === 0) {
        this.hasFiles = false
        this.uploadSuccess = false
        this.currentFile = null
      } else if (this.currentFile && this.currentFile.id === file.id) {
        this.currentFile = this.uploadedFiles[0]
      }
    },
    
    // 清空所有文件
    clearAllFiles() {
      // 释放所有URL
      this.uploadedFiles.forEach(file => {
        if (file.url && file.url.startsWith('blob:')) {
          URL.revokeObjectURL(file.url)
        }
      })
      
      this.uploadedFiles = []
      this.hasFiles = false
      this.uploadSuccess = false
      this.currentFile = null
      this.processingComplete = false
      this.processedResults = []
      
      // 重置文件输入
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = ''
      }
      
      this.$message.info('All files cleared')
    },
    
    // 格式化文件大小
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
    },
    
    // 处理模式更改
    handleModeChange(value) {
      console.log('Processing mode changed to:', value)
      if (value === 'smart') {
        // 智能模式：自动选择一些选项
        this.basicOptions = ['removeduplicates', 'smartcolor', 'modifymd5']
        this.selectedEffect = 'fade'
        this.selectedZoom = 'dynamic'
      }
    },
    
    // 选择特效
    selectEffect(value) {
      this.selectedEffect = this.selectedEffect === value ? null : value
    },
    
    // 选择Zoom
    selectZoom(value) {
      this.selectedZoom = this.selectedZoom === value ? null : value
    },
    
    // 开始处理
    startProcessing() {
      if (this.uploadedFiles.length === 0) {
        this.$message.warning('Please upload videos first')
        return
      }
      
      this.processing = true
      this.processPercent = 0
      this.processedCount = 0
      this.processedResults = []
      
      // 模拟批量处理
      const totalFiles = this.uploadedFiles.length
      let currentIndex = 0
      
      const processNext = () => {
        if (currentIndex < totalFiles) {
          const file = this.uploadedFiles[currentIndex]
          this.currentProcessingFile = file.name
          
          // 模拟单个文件处理进度
          const fileProgress = setInterval(() => {
            this.processPercent += 5
            
            if (this.processPercent >= ((currentIndex + 1) / totalFiles) * 100) {
              clearInterval(fileProgress)
              
              // 添加处理结果
              this.processedResults.push({
                id: file.id,
                name: `processed_${file.name}`,
                url: file.url, // 实际应用中应该是处理后的URL
                effects: this.getAppliedEffects()
              })
              
              this.processedCount++
              currentIndex++
              
              if (currentIndex < totalFiles) {
                setTimeout(processNext, 500)
              } else {
                this.completeProcessing()
              }
            }
          }, 100)
        }
      }
      
      processNext()
    },
    
    // 获取应用的效果
    getAppliedEffects() {
      const effects = []
      
      if (this.processingMode === 'smart') {
        effects.push('Smart Mode')
      } else {
        if (this.basicOptions.length > 0) {
          effects.push(...this.basicOptions.slice(0, 2))
        }
        if (this.selectedEffect) {
          effects.push(this.selectedEffect)
        }
        if (this.selectedZoom) {
          effects.push(this.selectedZoom)
        }
      }
      
      return effects.length > 0 ? effects : ['Default']
    },
    
    // 完成处理
    completeProcessing() {
      this.processing = false
      this.processingComplete = true
      this.processPercent = 100
      
      // 更新统计数据
      this.statistics = {
        totalVideos: this.uploadedFiles.length,
        processedVideos: this.processedResults.length,
        effectsCount: this.selectedEffect ? 1 : 0 + this.basicOptions.length,
        successRate: 100
      }
      
      this.$message.success('All videos processed successfully!')
    },
    
    // 下载所有结果
    downloadResults() {
      this.$message.info('Preparing download for all processed videos...')
      
      // 实际应用中，这里应该打包所有文件并下载
      this.processedResults.forEach((result, index) => {
        setTimeout(() => {
          this.downloadSingle(result)
        }, index * 500)
      })
    },
    
    // 下载单个文件
    downloadSingle(result) {
      const link = document.createElement('a')
      link.href = result.url
      link.download = result.name
      link.click()
    }
  }
}
</script>

<style lang="scss" scoped>
@import './VideoDeduplication.scss';

// 额外的样式补充
.file-input {
  display: none;
}

.files-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #e2e8f0;
  
  .files-count {
    font-size: 14px;
    font-weight: 600;
    color: #1e293b;
  }
}

.files-scroll {
  max-height: 300px;
  overflow-y: auto;
  padding: 10px;
}

.section-icon {
  margin-right: 8px;
}

.mode-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  
  .mode-card-wrapper {
    cursor: pointer;
    
    ::v-deep .el-radio__input {
      display: none;
    }
    
    ::v-deep .el-radio__label {
      padding: 0;
      width: 100%;
    }
  }
}

.custom-settings {
  margin-top: 20px;
}

.results-section {
  background: white;
  border-radius: 20px;
  padding: 40px;
  margin-top: 30px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  
  .results-header {
    margin-bottom: 30px;
    
    .results-title {
      font-size: 28px;
      font-weight: 700;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 20px;
    }
    
    .results-stats {
      display: flex;
      gap: 30px;
      
      .stat-item {
        display: flex;
        align-items: center;
        gap: 8px;
        
        .stat-label {
          color: #64748b;
          font-size: 14px;
        }
        
        .stat-value {
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
        }
      }
    }
  }
  
  .results-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
    
    .result-item {
      background: #f8f9fb;
      border-radius: 12px;
      overflow: hidden;
      
      .result-preview {
        position: relative;
        
        .result-video {
          width: 100%;
          height: 150px;
          object-fit: cover;
        }
        
        .result-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          background: rgba(99, 102, 241, 0.9);
          color: white;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
        }
      }
      
      .result-info {
        padding: 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .result-name {
          font-size: 13px;
          color: #1e293b;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
  }
}

.zoom-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  
  .zoom-btn {
    padding: 12px;
    background: #f8f9fb;
    border: 2px solid #e2e8f0;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    
    .zoom-icon {
      font-size: 20px;
    }
    
    &:hover {
      border-color: #6366f1;
      background: #f1f3ff;
    }
    
    &.selected {
      border-color: #6366f1;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: white;
    }
  }
}
</style>