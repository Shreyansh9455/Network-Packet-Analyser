import React from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('💥 Uncaught UI error in React tree:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-screen">
          <div className="error-boundary-card">
            <div className="error-boundary-icon">
              <AlertOctagon size={48} color="#f43f5e" />
            </div>
            <h2>Something went wrong in the UI</h2>
            <p>
              An unexpected render error occurred in the Packet Analyser dashboard.
            </p>
            {this.state.error && (
              <pre className="error-details-box">
                {this.state.error.toString()}
              </pre>
            )}
            <button className="btn btn-primary" onClick={this.handleReload}>
              <RefreshCw size={16} />
              <span>Reload Application</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
