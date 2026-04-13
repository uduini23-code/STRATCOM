import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import { Shield, Lock, Eye, EyeOff, ArrowLeft, User } from 'lucide-react';

export default function AdminLoginPage() {
  const { login, setViewerMode } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const success = login(username, password);
      if (success) {
        showToast(`Welcome back, ${username}!`, 'success');
        navigate('/admin/dashboard');
      } else {
        setError('Invalid username or password. Please try again.');
        showToast('Login failed. Invalid credentials.', 'error');
      }
      setLoading(false);
    }, 500);
  };

  const handleViewerMode = () => {
    setViewerMode();
    showToast('Viewing as guest', 'info');
    navigate('/');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-gray-50 to-green-50 px-4 py-12">
      <div className="w-full max-w-md animate-scale-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/20 animate-pulse-glow">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-accent">Admin Login</h1>
          <p className="text-muted mt-1">Enter your credentials to access the admin panel</p>
        </div>

        <div className="bg-white rounded-2xl border border-border shadow-lg p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-accent mb-2">
                <User className="w-3.5 h-3.5 inline mr-1.5" />
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError('');
                }}
                placeholder="Enter username"
                className={`w-full px-4 py-3 rounded-xl border ${
                  error ? 'border-red-300 focus:ring-red-300' : 'border-border focus:ring-primary/30'
                } bg-white text-sm focus:outline-none focus:ring-2 focus:border-primary transition-all`}
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-accent mb-2">
                <Lock className="w-3.5 h-3.5 inline mr-1.5" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter admin password"
                  className={`w-full px-4 py-3 rounded-xl border ${
                    error ? 'border-red-300 focus:ring-red-300' : 'border-border focus:ring-primary/30'
                  } bg-white text-sm focus:outline-none focus:ring-2 focus:border-primary transition-all pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-accent transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-green-500/20 hover:shadow-lg hover:shadow-green-500/30"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <button
              onClick={handleViewerMode}
              className="w-full py-2.5 rounded-xl border border-border text-sm font-medium text-muted hover:text-primary hover:border-primary/30 hover:bg-primary-bg/30 transition-all"
            >
              Continue as Viewer
            </button>
          </div>
        </div>

        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 mx-auto mt-6 text-sm text-muted hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>
      </div>
    </div>
  );
}
