export const DASHBOARD_MENU_ITEMS = [
  { key: 'dashboard', icon: '📊', labelKey: 'menu.dashboard' },
  { key: 'adGenerator', icon: '🎬', labelKey: 'menu.adGenerator' },
  { key: 'videoHook', icon: '🎣', labelKey: 'menu.videoHook' },
  { key: 'videoEnhancer', icon: '✨', labelKey: 'menu.videoEnhancer' },
  { key: 'watermarkRemover', icon: '🧼', labelKey: 'menu.watermarkRemover' },
  { key: 'bloggerMonitor', icon: '📡', labelKey: 'menu.bloggerMonitor' },
  { key: 'thumbnailGenerator', icon: '🖼️', labelKey: 'menu.thumbnailGenerator' },
  { key: 'backgroundRemover', icon: '🪄', labelKey: 'menu.backgroundRemover' },
  { key: 'noiseReducer', icon: '🔇', labelKey: 'menu.noiseReducer' },
  { key: 'videoDeduplication', icon: '🧬', labelKey: 'menu.videoDeduplication' },
  { key: 'audioToText', icon: '📝', labelKey: 'menu.audioToText' },
  { key: 'projects', icon: '📁', labelKey: 'menu.projects' },
  { key: 'settings', icon: '⚙️', labelKey: 'menu.settings' }
]

export function createDashboardMenu(activeKey = '') {
  return DASHBOARD_MENU_ITEMS.map(item => ({
    ...item,
    active: item.key === activeKey
  }))
}
