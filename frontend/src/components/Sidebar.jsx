import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { getNavItems } from '../utils/navigation';
import GradientText from './ui/GradientText';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const navItems = getNavItems(user?.role);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="flex flex-col h-screen glass border-r border-white/10 sticky top-0 z-20"
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-white/5">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white font-bold text-sm flex-shrink-0 shadow-glow-sm">
          MQ
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <GradientText
                colors={['#818cf8', '#6366f1', '#a78bfa', '#818cf8']}
                animationSpeed={6}
                className="font-bold text-lg"
              >
                Merit Quest
              </GradientText>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-500/15 text-indigo-400 shadow-[inset_0_0_0_1px_rgba(99,102,241,0.2)]'
                    : 'text-white/60 hover:bg-white/5 hover:text-white/90'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative flex-shrink-0">
                    <Icon className="w-5 h-5" />
                    {isActive && (
                      <motion.div
                        layoutId="nav-glow"
                        className="absolute -inset-1 rounded-lg bg-indigo-500/20 blur-sm -z-10"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </div>
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="whitespace-nowrap overflow-hidden"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/5 p-2 space-y-1">
        {/* User info */}
        {!collapsed && (
          <div className="px-3 py-2">
            <p className="text-sm font-medium text-white/90 truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-white/40 truncate">{user?.role?.replace('_', ' ')}</p>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full py-2 rounded-xl text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>
    </motion.aside>
  );
}
