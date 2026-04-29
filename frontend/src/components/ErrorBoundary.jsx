import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="chart-card" style={{ borderColor: 'rgba(239,68,68,0.3)' }}>
          <div className="chart-title" style={{ color: '#ef4444' }}>
            ⚠️ {this.props.name || 'Chart'} failed to render
          </div>
          <div className="idle-state" style={{ height: 180 }}>
            <div style={{ fontSize: 12, color: '#ef4444', fontFamily: 'JetBrains Mono', textAlign: 'center', padding: '0 16px' }}>
              {this.state.error?.message || 'Rendering error'}
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
