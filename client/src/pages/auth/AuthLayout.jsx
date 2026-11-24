import './auth.css'

export default function AuthLayout({ title, subtitle, footer, showCheck = false, children }) {
  return (
    <div className="auth">
      <aside className="auth-hero" aria-label="About Overview Teams">
        <span className="hero-arc arc-fill" aria-hidden="true" />
        <span className="hero-arc arc-ring" aria-hidden="true" />
        <div className="hero-brand">
          <span className="logo-o" aria-hidden="true">
            O
          </span>
          <div>
            <p className="hero-name">Overview Teams</p>
            <p className="hero-tag">Project management</p>
          </div>
        </div>
        <div className="hero-body">
          <p className="hero-eyebrow">Innovation &amp; Excellence</p>
          <p className="hero-headline">Forward-Thinking Solutions For Tomorrow’s Challenges.</p>
        </div>
        <p className="hero-foot">Overview Teams · Project management</p>
      </aside>

      <main className="auth-form">
        <div className="auth-box">
          <div className="auth-brand-mobile">
            <svg width="20" height="20" viewBox="0 0 18 18" aria-hidden="true">
              <rect x="1" y="9" width="4" height="8" rx="1" />
              <rect x="7" y="5" width="4" height="12" rx="1" />
              <rect x="13" y="1" width="4" height="16" rx="1" />
            </svg>
            <span>Overview Teams</span>
          </div>
          {showCheck && (
            <div className="notice-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
                <path d="M5 11.5l4 4 8-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}
          <h1>{title}</h1>
          <p className="auth-sub">{subtitle}</p>
          {children}
          {footer && <p className="auth-foot">{footer}</p>}
        </div>
      </main>
    </div>
  )
}
