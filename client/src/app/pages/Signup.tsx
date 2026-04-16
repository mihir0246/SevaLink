import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { UserCircle, Mail, Lock, MapPin, Clock, Globe, ArrowRight } from 'lucide-react';
import { authAPI, saveAuth } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Signup() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    availability: '',
    language: 'en',
    email: '',
    password: '',
    skills: [] as string[]
  });

  const skills = ['Medical', 'Food Distribution', 'Teaching', 'Construction', 'Driving', 'Counseling', 'IT Support', 'Translation'];
  const languages = ['English', 'Hindi', 'Marathi'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const nameParts = formData.name.trim().split(' ');
      const payload = {
        firstName: nameParts[0] || 'User',
        lastName: nameParts.slice(1).join(' ') || '',
        email: formData.email,
        password: formData.password,
        role: 'volunteer',
        skills: formData.skills,
        city: formData.location,
      };
      const res = await authAPI.register(payload);
      saveAuth(res.data.token, res.data.user);
      setUser(res.data.user);
      navigate('/volunteer/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <Link to="/" className="text-xl tracking-tight text-[#1E3A8A] hover:opacity-80 transition-opacity">
          ← {t('nav.back')}
        </Link>
      </nav>

      <div className="flex items-center justify-center p-6 pt-12">
        <div className="w-full max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm"
          >
            <h1 className="text-3xl text-gray-900 mb-2">{t('auth.registration')}</h1>
            <p className="text-gray-600 mb-8">{t('auth.signupSubtitle')}</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm text-gray-700 mb-2">{t('auth.fullName')} *</label>
                <div className="relative">
                  <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#14B8A6] transition-colors"
                    placeholder={t('auth.fullName')}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">{t('auth.skills')} *</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {skills.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-2 rounded-lg text-sm transition-all ${
                        formData.skills.includes(skill)
                          ? 'bg-[#14B8A6] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">{t('auth.location')} *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#14B8A6] transition-colors"
                      placeholder={t('auth.location')}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">{t('auth.availability')} *</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      required
                      value={formData.availability}
                      onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#14B8A6] transition-colors"
                    >
                      <option value="">Select availability</option>
                      <option value="weekends">Weekends</option>
                      <option value="weekdays">Weekdays</option>
                      <option value="flexible">Flexible</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">{t('auth.language')} *</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    required
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#14B8A6] transition-colors"
                  >
                    {languages.map((lang) => (
                      <option key={lang} value={lang.toLowerCase()}>{lang}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">{t('auth.email')} *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#14B8A6] transition-colors"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">{t('auth.password')} *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#14B8A6] transition-colors"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</p>
              )}

              <div className="pt-4 space-y-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#14B8A6] text-white py-3 rounded-xl hover:bg-[#14B8A6]/90 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? t('auth.creatingAccount') : t('auth.createAccount')}
                  {!loading && <ArrowRight className="w-5 h-5" />}
                </button>

                <p className="text-center text-sm text-gray-600 mt-4">
                  {t('auth.hasAccount')}{' '}
                  <Link to="/login" className="text-[#14B8A6] hover:underline">
                    {t('auth.loginHere')}
                  </Link>
                </p>

                <a
                  href={`${import.meta.env.VITE_API_URL || 'http://localhost:5001/api'}/auth/google`}
                  className="w-full bg-white border border-gray-200 py-3 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-3"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  {t('auth.googleSignup')}
                </a>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
