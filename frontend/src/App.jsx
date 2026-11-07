import { Component } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { BookingProvider } from './context/BookingContext.jsx';
import { PrefsProvider } from './context/PrefsContext.jsx';
import AppRoutes from './routes/AppRoutes.jsx';
import { ErrorState } from './components/common/States.jsx';
import { store } from './utils/storage.js';

class Boundary extends Component {
  state = { err: null };
  static getDerivedStateFromError(err) { return { err }; }
  render() {
    if (!this.state.err) return this.props.children;
    return <div className="min-h-screen grid place-items-center"><ErrorState title="Something went wrong" message="An unexpected error occurred. Reloading usually fixes it; if it keeps happening, reset the demo data." onRetry={() => window.location.reload()} />
      <button className="fixed bottom-4 right-4 text-label-sm text-on-surface-variant underline" onClick={() => { store.reset(); window.location.reload(); }}>Reset demo data</button></div>;
  }
}

export default function App({ Router = BrowserRouter }) {
  return (
    <Boundary><Router><ToastProvider><AuthProvider><PrefsProvider><BookingProvider><AppRoutes /></BookingProvider></PrefsProvider></AuthProvider></ToastProvider></Router></Boundary>
  );
}
