import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.error) return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertTriangle size={40} className="text-red-400" />
        <p className="text-slate-600 font-semibold">Une erreur est survenue sur cette page</p>
        <p className="text-slate-400 text-sm">{this.state.error.message}</p>
        <button
          className="btn-secondary"
          onClick={() => { this.setState({ error: null }); window.location.reload(); }}
        >
          <RefreshCw size={16} /> Réessayer
        </button>
      </div>
    );
    return this.props.children;
  }
}
