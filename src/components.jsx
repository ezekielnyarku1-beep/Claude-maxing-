import React, { useLayoutEffect, useState } from 'react'

export function Brand() {
  return (
    <div className="brand">
      <span className="brand-mark" aria-hidden="true">O</span>
      <div><strong>Overview Teams</strong><small>Project management</small></div>
    </div>
  )
}

function savedTheme() {
  try {
    const saved = window.localStorage.getItem('overview-theme')
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    // Storage can be blocked; fall back to the system setting.
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeSwitch() {
  const [theme, setTheme] = useState(savedTheme)

  useLayoutEffect(() => {
    document.documentElement.style.colorScheme = theme
  }, [theme])

  function select(next) {
    setTheme(next)
    try {
      window.localStorage.setItem('overview-theme', next)
    } catch {
      // Not saved, but still applied for this visit.
    }
  }

  return (
    <div className="theme-switch" role="group" aria-label="Appearance">
      {['light', 'dark'].map(mode => (
        <button key={mode} type="button" aria-pressed={theme === mode} onClick={() => select(mode)}>
          {mode}
        </button>
      ))}
    </div>
  )
}

export function usePageTitle(title) {
  useLayoutEffect(() => {
    document.title = title + ' · Overview Teams'
  }, [title])
}
