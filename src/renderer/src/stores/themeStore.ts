import { defineStore } from 'pinia'
import { ref } from 'vue'

/** 主题类型 */
export type Theme = 'light' | 'dark'

/**
 * 主题 Pinia Store
 * 管理亮色/暗色主题状态，同步 DOM class 和 SQLite 持久化
 */
export const useThemeStore = defineStore('theme', () => {
  /** 当前主题 */
  const currentTheme = ref<Theme>('light')

  /**
   * 检测系统是否偏好暗色主题
   * @returns 系统是否偏好暗色模式
   */
  function isSystemDark(): boolean {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  /**
   * 将主题应用到 DOM（在 html 标签上添加/移除 class="dark"）
   * @param theme - 要应用的主题
   */
  function applyThemeToDom(theme: Theme): void {
    const html = document.documentElement
    if (theme === 'dark') {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
  }

  /**
   * 将主题偏好持久化到 SQLite
   * @param theme - 要保存的主题
   */
  async function persistTheme(theme: Theme): Promise<void> {
    await window.db.config.set('theme', theme)
  }

  /**
   * 设置指定主题，同步更新 DOM 和持久化
   * @param theme - 目标主题
   */
  async function setTheme(theme: Theme): Promise<void> {
    currentTheme.value = theme
    applyThemeToDom(theme)
    await persistTheme(theme)
  }

  /**
   * 切换主题（亮色 <-> 暗色）
   */
  async function toggleTheme(): Promise<void> {
    const next: Theme = currentTheme.value === 'light' ? 'dark' : 'light'
    await setTheme(next)
  }

  /**
   * 初始化主题：从 SQLite 读取偏好，无记录则跟随系统
   * 应在应用启动时调用
   */
  async function initTheme(): Promise<void> {
    const saved = await window.db.config.get('theme')
    const theme: Theme =
      saved === 'dark' || saved === 'light' ? saved : isSystemDark() ? 'dark' : 'light'
    currentTheme.value = theme
    applyThemeToDom(theme)
  }

  return { currentTheme, setTheme, toggleTheme, initTheme }
})
