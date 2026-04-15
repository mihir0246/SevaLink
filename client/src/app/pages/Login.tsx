import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { authAPI, saveAuth } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [role, setRole] = useState<'admin' | 'volunteer'>('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authAPI.login(email, password);
      saveAuth(res.data.token, res.data.user);
      setUser(res.data.user);
      const userRole = res.data.user.role;
      navigate(userRole === 'admin' ? '/admin/dashboard' : '/volunteer/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <Link to="/" className="text-xl tracking-tight text-[#1E3A8A] hover:opacity-80 transition-opacity">
          ← SevaLink
        </Link>
      </nav>

      <div className="flex-1 flex">
        {/* Left Side - Illustration */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#1E3A8A] to-[#14B8A6] p-12 flex-col justify-center items-center text-white"
        >
        <div className="max-w-md">
          <h1 className="text-5xl mb-6 tracking-tight">SevaLink</h1>
          <p className="text-xl text-white/90 mb-8">
            Connecting communities, empowering change
          </p>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🤝</span>
              </div>
              <div>
                <h3 className="text-lg mb-1">Connect with Purpose</h3>
                <p className="text-white/80 text-sm">Match volunteers with community needs instantly</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">📍</span>
              </div>
              <div>
                <h3 className="text-lg mb-1">Real-time Impact</h3>
                <p className="text-white/80 text-sm">Track and respond to urgent needs in your area</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🎯</span>
              </div>
              <div>
                <h3 className="text-lg mb-1">Measurable Change</h3>
                <p className="text-white/80 text-sm">See your impact through comprehensive analytics</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <div className="mb-8">
            <h2 className="text-3xl text-gray-900 mb-2">Welcome back</h2>
            <p className="text-gray-600">Sign in to continue making an impact</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-700 mb-2">I am a</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`px-4 py-3 rounded-xl border-2 transition-all ${
                    role === 'admin'
                      ? 'border-[#1E3A8A] bg-[#1E3A8A]/5 text-[#1E3A8A]'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => setRole('volunteer')}
                  className={`px-4 py-3 rounded-xl border-2 transition-all ${
                    role === 'volunteer'
                      ? 'border-[#14B8A6] bg-[#14B8A6]/5 text-[#14B8A6]'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Volunteer
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#1E3A8A] transition-colors"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#1E3A8A] transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</p>
            )}

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className={`w-full text-white py-3 rounded-xl transition-all flex items-center justify-center gap-2 group ${
                role === 'admin'
                  ? 'bg-[#1E3A8A] hover:bg-[#1E3A8A]/90'
                  : 'bg-[#14B8A6] hover:bg-[#14B8A6]/90'
              } disabled:opacity-60`}
            >
              {loading ? 'Signing in...' : `Sign In as ${role === 'admin' ? 'Admin' : 'Volunteer'}`}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-[#F9FAFB] text-gray-500">Or continue with</span>
              </div>
            </div>

            <a
              href={`${import.meta.env.VITE_API_URL || 'http://localhost:5001/api'}/auth/google`}
              className="w-full bg-white border border-gray-200 py-3 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </a>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#1E3A8A] hover:underline">
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>
      </div>
    </div>
  );
}
