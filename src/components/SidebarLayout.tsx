import { useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useAdmin } from '../contexts/AdminContext';
import { Menu, X, LogOut, BarChart3, Users, Tag, Coins, Gift, Wallet, Smartphone } from 'lucide-react';

interface SidebarLayoutProps {
  children: ReactNode;
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { admin, logout } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: BarChart3 },
    { label: 'Users', path: '/users', icon: Users },
    { label: 'Categories', path: '/categories', icon: Tag },
    { label: 'Credit Packages', path: '/credits', icon: Coins },
    { label: 'Withdrawals', path: '/withdrawals', icon: Wallet },
    { label: 'Referral Settings', path: '/referral-settings', icon: Gift },
    { label: 'App Versions', path: '/app-versions', icon: Smartphone },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 fixed md:relative z-40 w-64 h-screen bg-slate-900 text-white transition-transform duration-300`}
      >
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-2xl font-bold">InnerVoice</h1>
          <p className="text-sm text-gray-400">Admin Panel</p>
        </div>

        <nav className="p-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-700">
          <div className="mb-4 pb-4 border-b border-slate-700">
            <p className="text-sm text-gray-400">Logged in as</p>
            <p className="font-medium">{admin?.name}</p>
            <p className="text-xs text-gray-400">{admin?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <h2 className="text-xl font-semibold text-gray-800">
            {navItems.find((item) => item.path === location.pathname)?.label ||
              'Dashboard'}
          </h2>
          <div />
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
