export const appearances = ['system', 'light', 'dark']

const storageKey = 'overview-teams-appearance'

export function getAppearance() {
  try {
    const saved = window.localStorage.getItem(storageKey)
    if (appearances.includes(saved)) return saved
  } catch {
    return document.documentElement.dataset.appearance ?? 'system'
  }
  return 'system'
}

export function applyAppearance(appearance) {
  document.documentElement.dataset.appearance = appearance
}

export function saveAppearance(appearance) {
  applyAppearance(appearance)
  try {
    window.localStorage.setItem(storageKey, appearance)
  } catch {
    return false
  }
  return true
}
