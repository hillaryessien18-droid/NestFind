import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { getUnreadNotificationCount } from '@/api/payments';
import { Home, Search, Heart, LayoutDashboard, LogOut, Menu, X, PlusCircle, MessageSquare, User, Building2, Bell, CreditCard, History } from 'lucide-react';

const navLinkClass = ({ isActive }) =>
  `flex items-center gap-1.5 text-sm font-medium transition-colors ${
    isActive ? 'text-primary-600' : 'text-gray-600 hover:text-primary-600'
  }`;

export default function Navbar() {
  const { user, isAuthenticated, isHost, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: unreadData } = useQuery({
    queryKey: ['unread-notifications'],
    queryFn: getUnreadNotificationCount,
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });
  const unreadCount = unreadData?.count || 0;

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <Building2 className="h-7 w-7 text-primary-600" />
          <span className="text-xl font-bold text-gray-900">NestFind</span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <NavLink to="/" className={navLinkClass} end>
            <Home className="h-4 w-4" /> Home
          </NavLink>
          <NavLink to="/properties" className={navLinkClass}>
            <Search className="h-4 w-4" /> Properties
          </NavLink>
          {isAuthenticated && (
            <>
              <NavLink to="/saved" className={navLinkClass}>
                <Heart className="h-4 w-4" /> Saved
              </NavLink>
              <NavLink to="/enquiries" className={navLinkClass}>
                <MessageSquare className="h-4 w-4" /> Enquiries
              </NavLink>
              <NavLink to="/bookings" className={navLinkClass}>
                <CreditCard className="h-4 w-4" /> Bookings
              </NavLink>
              <NavLink to="/notifications" className={navLinkClass}>
                <span className="relative">
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </span>
                Notifications
              </NavLink>
              {isHost && (
                <>
                  <NavLink to="/dashboard" className={navLinkClass}>
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </NavLink>
                  <NavLink to="/my-properties" className={navLinkClass}>
                    <Building2 className="h-4 w-4" /> My Properties
                  </NavLink>
                </>
              )}
            </>
          )}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <>
              {isHost && (
                <Link
                  to="/properties/create"
                  className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
                >
                  <PlusCircle className="h-4 w-4" /> List Property
                </Link>
              )}
              <Link to="/profile" className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary-600">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                  {user?.first_name?.[0] || user?.email?.[0]?.toUpperCase()}
                </div>
                <span className="hidden lg:inline">{user?.first_name || 'Profile'}</span>
              </Link>
              <button onClick={handleLogout} className="text-gray-500 hover:text-red-600 transition-colors" title="Logout">
                <LogOut className="h-5 w-5" />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-primary-600">
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-md p-2 text-gray-600 hover:bg-gray-100 md:hidden"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="border-t border-gray-100 bg-white px-4 pb-4 md:hidden">
          <div className="flex flex-col gap-2 pt-3">
            <NavLink to="/" className={navLinkClass} onClick={() => setMobileOpen(false)} end>
              <Home className="h-4 w-4" /> Home
            </NavLink>
            <NavLink to="/properties" className={navLinkClass} onClick={() => setMobileOpen(false)}>
              <Search className="h-4 w-4" /> Properties
            </NavLink>
              {isAuthenticated && (
            <>
              <NavLink to="/saved" className={navLinkClass} onClick={() => setMobileOpen(false)}>
                <Heart className="h-4 w-4" /> Saved
              </NavLink>
              <NavLink to="/enquiries" className={navLinkClass} onClick={() => setMobileOpen(false)}>
                <MessageSquare className="h-4 w-4" /> Enquiries
              </NavLink>
              <NavLink to="/bookings" className={navLinkClass} onClick={() => setMobileOpen(false)}>
                <CreditCard className="h-4 w-4" /> Bookings
              </NavLink>
              <NavLink to="/notifications" className={navLinkClass} onClick={() => setMobileOpen(false)}>
                <span className="relative">
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </span>
                Notifications
              </NavLink>
              {isHost && (
                  <>
                    <NavLink to="/dashboard" className={navLinkClass} onClick={() => setMobileOpen(false)}>
                      <LayoutDashboard className="h-4 w-4" /> Dashboard
                    </NavLink>
                    <NavLink to="/my-properties" className={navLinkClass} onClick={() => setMobileOpen(false)}>
                      <Building2 className="h-4 w-4" /> My Properties
                    </NavLink>
                  </>
                )}
              </>
            )}
            <hr className="my-2" />
            {isAuthenticated ? (
              <>
              <NavLink to="/profile" className={navLinkClass} onClick={() => setMobileOpen(false)}>
                <User className="h-4 w-4" /> Profile
              </NavLink>
              <NavLink to="/payment-history" className={navLinkClass} onClick={() => setMobileOpen(false)}>
                <History className="h-4 w-4" /> Payment History
              </NavLink>
                {isHost && (
                  <Link
                    to="/properties/create"
                    className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white"
                    onClick={() => setMobileOpen(false)}
                  >
                    <PlusCircle className="h-4 w-4" /> List Property
                  </Link>
                )}
                <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm font-medium text-red-600">
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </>
            ) : (
              <div className="flex gap-3">
                <Link to="/login" className="text-sm font-medium text-gray-700" onClick={() => setMobileOpen(false)}>
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
