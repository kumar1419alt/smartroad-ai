import React from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-800">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center space-y-5 animate-in fade-in duration-200">
            <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center mx-auto">
              <AlertTriangle size={32} />
            </div>

            <div>
              <h2 className="text-xl font-black text-slate-900">Something went wrong</h2>
              <p className="text-xs text-slate-500 mt-1">
                An unexpected interface error occurred. You can reload the page or return to the home screen.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-left font-mono text-[11px] text-red-600 overflow-x-auto">
                {this.state.error.message}
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
              >
                <RefreshCw size={14} />
                Reload Page
              </button>
              <button
                onClick={this.handleGoHome}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                <Home size={14} />
                Home
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
