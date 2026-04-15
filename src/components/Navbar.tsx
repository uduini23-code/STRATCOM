import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Menu,
  X,
  Home,
  Image,
  Calendar,
  Shield,
  LogOut,
  LayoutDashboard,
  ChevronDown,
  Bell,
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { formatDistanceToNow } from 'date-fns';

export default function Navbar() {
  const { role, isAuthenticated, logout, canManageEvents, canManageUpdates } = useAuth();
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useData();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminDropdown, setAdminDropdown] = useState(false);
  const [notifDropdown, setNotifDropdown] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  const navLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/updates', label: 'Updates', icon: Image },
    { path: '/calendar', label: 'Calendar', icon: Calendar },
  ];

  const adminLinks = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ...(canManageUpdates ? [{ path: '/admin/updates', label: 'Manage Updates', icon: Image }] : []),
    ...(canManageEvents ? [{ path: '/admin/events', label: 'Manage Events', icon: Calendar }] : []),
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-white border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group" onClick={() => setMobileOpen(false)}>
            <img 
              src="https://ik.imagekit.io/UIUXD/sco.png" 
              alt="SCO Logo" 
              className="h-10 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold text-accent leading-tight">Strategic Communications</h1>
              <p className="text-[10px] text-muted font-medium tracking-wider uppercase">Office</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive(link.path)
                    ? 'bg-primary-bg text-primary'
                    : 'text-muted hover:text-accent hover:bg-gray-50'
                }`}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotifDropdown(!notifDropdown);
                  setAdminDropdown(false);
                }}
                className="p-2 rounded-lg text-muted hover:bg-gray-100 transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
                )}
              </button>
              {notifDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-border animate-scale-in overflow-hidden z-50">
                  <div className="p-3 bg-gray-50 border-b border-border flex items-center justify-between">
                    <p className="text-sm font-semibold text-accent">Notifications</p>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsAsRead}
                        className="text-xs text-primary hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-sm text-muted text-center">No notifications yet</p>
                    ) : (
                      <div className="divide-y divide-border">
                        {notifications.map(notif => (
                          <div
                            key={notif.id}
                            className={`p-3 hover:bg-gray-50 transition-colors cursor-pointer ${!notif.read ? 'bg-primary-bg/30' : ''}`}
                            onClick={() => {
                              markNotificationAsRead(notif.id);
                              if (notif.link) {
                                navigate(notif.link);
                                setNotifDropdown(false);
                              }
                            }}
                          >
                            <p className={`text-sm ${!notif.read ? 'font-semibold text-accent' : 'text-gray-700'}`}>
                              {notif.message}
                            </p>
                            <p className="text-xs text-muted mt-1">
                              {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {isAuthenticated && role === 'admin' ? (
              <div className="relative hidden md:block">
                <button
                  onClick={() => {
                    setAdminDropdown(!adminDropdown);
                    setNotifDropdown(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary-dark transition-all"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Admin
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${adminDropdown ? 'rotate-180' : ''}`} />
                </button>
                {adminDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-border animate-scale-in overflow-hidden">
                    <div className="p-2 bg-primary-bg border-b border-green-100">
                      <p className="text-xs font-semibold text-primary px-2">Admin Panel</p>
                    </div>
                    {adminLinks.map((link) => (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setAdminDropdown(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                          isActive(link.path)
                            ? 'bg-primary-bg text-primary font-medium'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <link.icon className="w-4 h-4" />
                        {link.label}
                      </Link>
                    ))}
                    <div className="border-t border-border p-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : isAuthenticated && role === 'viewer' ? (
              <button
                onClick={handleLogout}
                className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-muted hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            ) : (
              <Link
                to="/admin/login"
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary-dark transition-all shadow-sm"
              >
                <Shield className="w-4 h-4" />
                Admin Login
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-muted hover:bg-gray-100 transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-white animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-primary-bg text-primary'
                    : 'text-muted hover:text-accent hover:bg-gray-50'
                }`}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}

            {isAuthenticated && role === 'admin' && (
              <>
                <div className="border-t border-border my-2" />
                <p className="px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider">Admin</p>
                {adminLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      isActive(link.path)
                        ? 'bg-primary-bg text-primary font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 w-full transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            )}

            {!isAuthenticated && (
              <Link
                to="/admin/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary-dark transition-colors"
              >
                <Shield className="w-4 h-4" />
                Admin Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
