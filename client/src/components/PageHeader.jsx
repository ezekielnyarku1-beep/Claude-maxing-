export default function PageHeader({ title, meta, children }) {
  return (
    <header className="page-header">
      <div className="page-header-title">
        <h1>{title}</h1>
        {meta && <span className="page-header-meta">{meta}</span>}
      </div>
      {children && <div className="page-header-actions">{children}</div>}
    </header>
  )
}
