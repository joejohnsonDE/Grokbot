import { useCallback, useEffect, useState } from 'react'
import {
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
  type AppSettings,
} from '../lib/settings'

export function useSettings() {
  const [settings, setSettingsState] = useState<AppSettings>(() =>
    typeof window === 'undefined' ? { ...DEFAULT_SETTINGS } : loadSettings(),
  )

  useEffect(() => {
    setSettingsState(loadSettings())
  }, [])

  const setSettings = useCallback((next: AppSettings | ((prev: AppSettings) => AppSettings)) => {
    setSettingsState((prev) => {
      const value = typeof next === 'function' ? next(prev) : next
      saveSettings(value)
      return value
    })
  }, [])

  const update = useCallback(
    <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }))
    },
    [setSettings],
  )

  const reset = useCallback(() => {
    setSettings({ ...DEFAULT_SETTINGS })
  }, [setSettings])

  return { settings, setSettings, update, reset }
}
