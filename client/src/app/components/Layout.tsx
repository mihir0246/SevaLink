import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Map, CheckSquare, Users, UserCircle, Settings, Menu, X, MessageCircle, FileText, Activity, Upload, Globe, Zap, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { logout as apiLogout } from '../services/api';

interface LayoutProps {
  children: React.ReactNode;
  userRole?: 'admin' | 'volunteer';
}

const adminNavigation = [
  { name: 'Dashboard', to: '/admin/dashboard', icon: Home, key: 'nav.dashboard' },
  { name: 'Smart Assign', to: '/admin/smart-assign', icon: Zap, key: 'nav.smartAssign', highlight: true },
  { name: 'Surveys', to: '/admin/surveys', icon: Upload, key: 'nav.surveys' },
  { name: 'Needs', to: '/admin/needs', icon: Activity, key: 'nav.needs' },
  { name: 'Volunteers', to: '/admin/volunteers', icon: Users, key: 'nav.volunteers' },
  { name: 'Map', to: '/admin/map', icon: Map, key: 'nav.map' },
  { name: 'Reports', to: '/admin/reports', icon: FileText, key: 'nav.reports' },
  { name: 'Settings', to: '/admin/settings', icon: Settings, key: 'nav.settings' }
];

const volunteerNavigation = [
  { name: 'Dashboard', to: '/volunteer/dashboard', icon: Home, key: 'nav.dashboard' },
  { name: 'Available Tasks', to: '/volunteer/available-tasks', icon: CheckSquare, key: 'nav.availableTasks' },
  { name: 'My Tasks', to: '/volunteer/my-tasks', icon: FileText, key: 'nav.myTasks' },
  { name: 'Map', to: '/volunteer/map', icon: Map, key: 'nav.map' },
  { name: 'Profile', to: '/volunteer/profile', icon: UserCircle, key: 'nav.profile' }
];

export default function Layout({ children, userRole = 'admin' }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  const handleLogout = () => {
    apiLogout();
    navigate('/login');
  };

  const navigation = userRole === 'admin' ? adminNavigation : volunteerNavigation;
  const userName = userRole === 'admin' ? 'Admin User' : 'Sarah Johnson';
  const userRoleText = userRole === 'admin' ? 'NGO Admin' : 'Volunteer';

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' },
    { code: 'mr', name: 'मराठी' }
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex items-center justify-between h-16 flex-shrink-0 px-6 border-b border-gray-200">
            <span className="text-xl tracking-tight text-[#1E3A8A]">SevaLink</span>
            {/* Language Switcher */}
            <div className="relative group">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Globe className="w-5 h-5 text-gray-600" />
              </button>
              <div className="absolute right-0 top-full mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code as any)}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                      language === lang.code ? 'bg-[#1E3A8A]/10 text-[#1E3A8A]' : 'text-gray-700'
                    }`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigation.map((item: any) => {
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.name}
                  to={item.to}
                  className={`flex items-center px-3 py-2.5 text-sm rounded-lg transition-all relative ${
                    isActive
                      ? 'bg-[#1E3A8A] text-white shadow-lg shadow-blue-900/20'
                      : item.highlight
                      ? 'text-[#1E3A8A] bg-blue-50 hover:bg-blue-100 font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                  {item.highlight && !isActive && (
                    <span className="ml-auto text-[10px] font-black bg-[#1E3A8A] text-white px-1.5 py-0.5 rounded-full">AI</span>
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-[#1E3A8A] rounded-lg -z-10"
                      transition={{ type: "spring", duration: 0.5 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
          <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center min-w-0">
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full ${
                    userRole === 'admin' ? 'bg-[#1E3A8A]' : 'bg-[#14B8A6]'
                  } flex items-center justify-center text-white text-sm ring-2 ring-white shadow-sm`}>
                    {userName.split(' ').map(n => n[0]).join('')}
                  </div>
                </div>
                <div className="ml-3 truncate">
                  <p className="text-sm font-bold text-gray-900 truncate">{userName}</p>
                  <p className="text-[10px] uppercase tracking-wider font-extrabold text-gray-400">{userRoleText}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all group"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-40 flex h-16 bg-white border-b border-gray-200">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="px-4 text-gray-500 focus:outline-none"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        <div className="flex-1 flex items-center justify-center">
          <span className="text-lg tracking-tight text-[#1E3A8A]">SevaLink</span>
        </div>
        <div className="px-4 flex items-center gap-2">
          <div className="relative group">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Globe className="w-5 h-5 text-gray-600" />
            </button>
            <div className="absolute right-0 top-full mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code as any)}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                    language === lang.code ? 'bg-[#1E3A8A]/10 text-[#1E3A8A]' : 'text-gray-700'
                  }`}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25 }}
            className="md:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200"
          >
            <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
              <span className="text-xl tracking-tight text-[#1E3A8A]">SevaLink</span>
              <button onClick={() => setMobileMenuOpen(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <nav className="px-4 py-6 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={item.name}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center px-3 py-2.5 text-sm rounded-lg transition-colors ${
                      isActive
                        ? 'bg-[#1E3A8A] text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-4 border-t border-gray-100 pt-4"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Sign Out
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="md:pl-64">
        {children}
      </main>

      {/* Chatbot Widget */}
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {chatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="mb-4 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
            >
              <div className="bg-[#1E3A8A] text-white p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  <span className="text-sm">SevaLink Assistant</span>
                </div>
                <button onClick={() => setChatOpen(false)} className="text-white/80 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 h-96 overflow-y-auto">
                <div className="space-y-4">
                  <div className="bg-gray-100 rounded-lg p-3 text-sm">
                    Hello! I'm your SevaLink assistant. How can I help you today?
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs hover:border-[#1E3A8A] transition-colors">
                      Highest need areas
                    </button>
                    <button className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs hover:border-[#1E3A8A] transition-colors">
                      Urgent tasks
                    </button>
                    <button className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs hover:border-[#1E3A8A] transition-colors">
                      Available volunteers
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ask a question..."
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1E3A8A]"
                  />
                  <button className="px-4 py-2 bg-[#1E3A8A] text-white rounded-lg text-sm hover:bg-[#1E3A8A]/90 transition-colors">
                    Send
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setChatOpen(!chatOpen)}
          className="w-14 h-14 bg-[#1E3A8A] text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-[#1E3A8A]/90 transition-colors"
        >
          <MessageCircle className="w-6 h-6" />
        </motion.button>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-40">
        <nav className="flex justify-around py-2">
          {navigation.slice(0, 5).map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.name}
                to={item.to}
                className={`flex flex-col items-center px-3 py-2 text-xs ${
                  isActive ? 'text-[#1E3A8A]' : 'text-gray-500'
                }`}
              >
                <item.icon className="w-5 h-5 mb-1" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
