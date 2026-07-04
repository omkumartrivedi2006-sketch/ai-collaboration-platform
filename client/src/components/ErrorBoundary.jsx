import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Caught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0f172a',
          color: '#f8fafc',
          fontFamily: 'Inter, sans-serif',
          flexDirection: 'column',
          gap: '16px',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px' }}>⚠️</div>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#ef4444', margin: 0 }}>
            Application Error
          </h1>
          <p style={{ fontSize: '14px', color: '#94a3b8', maxWidth: '500px', margin: 0 }}>
            Something went wrong while loading. Check your browser console for more details.
          </p>
          <pre style={{
            background: '#1e293b',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#fca5a5',
            maxWidth: '600px',
            overflowX: 'auto',
            textAlign: 'left'
          }}>
            {this.state.error?.message || 'Unknown error'}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
