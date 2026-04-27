import { Component } from 'react';

/**
 * Catches render errors so the app does not fail silently to a blank #root.
 */
export default class RootErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[RootErrorBoundary]', error, info?.componentStack);
  }

  render() {
    const { error } = this.state;
    if (error) {
      return (
        <div
          style={{
            minHeight: '100vh',
            padding: '2rem',
            fontFamily: 'system-ui, sans-serif',
            background: '#f8fafc',
            color: '#0f172a',
          }}
        >
          <h1 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Something went wrong</h1>
          <p style={{ color: '#64748b', marginBottom: '1rem', maxWidth: '36rem' }}>
            The app hit an error while rendering. Try refreshing the page. If this keeps happening, open the browser
            developer console (F12) and share the red error message.
          </p>
          <pre
            style={{
              fontSize: '0.75rem',
              overflow: 'auto',
              padding: '1rem',
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              maxWidth: '100%',
            }}
          >
            {error?.stack || String(error)}
          </pre>
          <button
            type="button"
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#fff',
            }}
            onClick={() => window.location.reload()}
          >
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
