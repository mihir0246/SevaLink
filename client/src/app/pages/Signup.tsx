import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Building2, UserCircle, Mail, Lock, MapPin, Phone, Clock, Globe, ArrowRight, ArrowLeft } from 'lucide-react';
import { authAPI, saveAuth } from '../services/api';
import { useAuth } from '../context/AuthContext';

type UserRole = 'ngo' | 'volunteer' | null;

export default function Signup() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') as UserRole;

  const [step, setStep] = useState(initialRole ? 2 : 1);
  const [role, setRole] = useState<UserRole>(initialRole);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    ngoName: '',
    orgType: '',
    location: '',
    email: '',
    password: '',
    contact: '',
    name: '',
    skills: [] as string[],
    availability: '',
    language: 'en'
  });

  const skills = ['Medical', 'Food Distribution', 'Teaching', 'Construction', 'Driving', 'Counseling', 'IT Support', 'Translation'];
  const languages = ['English', 'Hindi', 'Marathi'];

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const isAdmin = role === 'ngo';
      const nameParts = (isAdmin ? formData.ngoName : formData.name).trim().split(' ');
      const payload = {
        firstName: nameParts[0] || 'User',
        lastName: nameParts.slice(1).join(' ') || '',
        email: formData.email,
        password: formData.password,
        role: isAdmin ? 'admin' : 'volunteer',
        skills: isAdmin ? [] : formData.skills,
        city: formData.location,
      };
      const res = await authAPI.register(payload);
      saveAuth(res.data.token, res.data.user);
      setUser(res.data.user);
      navigate(isAdmin ? '/admin/dashboard' : '/volunteer/dashboard');
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
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <Link to="/" className="text-xl tracking-tight text-[#1E3A8A] hover:opacity-80 transition-opacity">
          ← SevaLink
        </Link>
      </nav>

      <div className="flex items-center justify-center p-6 pt-12">
        <div className="w-full max-w-4xl">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${step >= 1 ? 'bg-[#1E3A8A] text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                1
              </div>
              <div className={`w-16 h-1 ${step >= 2 ? 'bg-[#1E3A8A]' : 'bg-gray-200'}`} />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${step >= 2 ? 'bg-[#1E3A8A] text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                2
              </div>
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span>Select Role</span>
              <span>Complete Profile</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* Step 1: Role Selection */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-2xl p-8 border border-gray-200"
              >
                <h1 className="text-3xl text-gray-900 mb-2 text-center">Join SevaLink</h1>
                <p className="text-gray-600 mb-8 text-center">Choose how you'd like to contribute</p>

                <div className="grid md:grid-cols-2 gap-6">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleRoleSelect('ngo')}
                    className="p-8 border-2 border-gray-200 rounded-2xl hover:border-[#1E3A8A] transition-all text-left group"
                  >
                    <div className="w-16 h-16 bg-[#1E3A8A]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#1E3A8A] transition-colors">
                      <Building2 className="w-8 h-8 text-[#1E3A8A] group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-xl text-gray-900 mb-2">Join as NGO / Admin</h3>
                    <p className="text-gray-600 text-sm">
                      Manage community needs, coordinate volunteers, and track impact
                    </p>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleRoleSelect('volunteer')}
                    className="p-8 border-2 border-gray-200 rounded-2xl hover:border-[#14B8A6] transition-all text-left group"
                  >
                    <div className="w-16 h-16 bg-[#14B8A6]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#14B8A6] transition-colors">
                      <UserCircle className="w-8 h-8 text-[#14B8A6] group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-xl text-gray-900 mb-2">Join as Volunteer</h3>
                    <p className="text-gray-600 text-sm">
                      Use your skills to help communities and make a real difference
                    </p>
                  </motion.button>
                </div>

                <p className="mt-8 text-center text-sm text-gray-600">
                  Already have an account?{' '}
                  <button
                    onClick={() => navigate('/login')}
                    className="text-[#1E3A8A] hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              </motion.div>
            )}

            {/* Step 2A: NGO Signup Form */}
            {step === 2 && role === 'ngo' && (
              <motion.div
                key="step2-ngo"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-2xl p-8 border border-gray-200"
              >
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back
                </button>

                <h1 className="text-3xl text-gray-900 mb-2">NGO / Admin Registration</h1>
                <p className="text-gray-600 mb-8">Tell us about your organization</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">NGO Name *</label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          required
                          value={formData.ngoName}
                          onChange={(e) => setFormData({ ...formData, ngoName: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#1E3A8A] transition-colors"
                          placeholder="Organization name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-2">Organization Type *</label>
                      <select
                        required
                        value={formData.orgType}
                        onChange={(e) => setFormData({ ...formData, orgType: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#1E3A8A] transition-colors"
                      >
                        <option value="">Select type</option>
                        <option value="ngo">NGO</option>
                        <option value="charity">Charity</option>
                        <option value="foundation">Foundation</option>
                        <option value="community">Community Group</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Location *</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#1E3A8A] transition-colors"
                        placeholder="City, State"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">Email *</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#1E3A8A] transition-colors"
                          placeholder="you@organization.org"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-2">Contact Number *</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          required
                          value={formData.contact}
                          onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#1E3A8A] transition-colors"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Password *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#1E3A8A] transition-colors"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  {error && (
                    <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</p>
                  )}

                  <div className="pt-4 space-y-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#1E3A8A] text-white py-3 rounded-xl hover:bg-[#1E3A8A]/90 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {loading ? 'Creating Account...' : 'Create Account'}
                      {!loading && <ArrowRight className="w-5 h-5" />}
                    </button>

                    <a
                      href="http://localhost:5001/api/auth/google"
                      className="w-full bg-white border border-gray-200 py-3 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-3"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      Sign up with Google
                    </a>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Step 2B: Volunteer Signup Form */}
            {step === 2 && role === 'volunteer' && (
              <motion.div
                key="step2-volunteer"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-2xl p-8 border border-gray-200"
              >
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back
                </button>

                <h1 className="text-3xl text-gray-900 mb-2">Volunteer Registration</h1>
                <p className="text-gray-600 mb-8">Tell us about yourself</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Full Name *</label>
                    <div className="relative">
                      <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#14B8A6] transition-colors"
                        placeholder="Your full name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Skills *</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {skills.map((skill) => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleSkill(skill)}
                          className={`px-3 py-2 rounded-lg text-sm transition-all ${formData.skills.includes(skill)
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
                      <label className="block text-sm text-gray-700 mb-2">Location *</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          required
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#14B8A6] transition-colors"
                          placeholder="City, State"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-2">Availability *</label>
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
                    <label className="block text-sm text-gray-700 mb-2">Preferred Language *</label>
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
                      <label className="block text-sm text-gray-700 mb-2">Email *</label>
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
                      <label className="block text-sm text-gray-700 mb-2">Password *</label>
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
                      {loading ? 'Creating Account...' : 'Create Account'}
                      {!loading && <ArrowRight className="w-5 h-5" />}
                    </button>

                    <button
                      type="button"
                      className="w-full bg-white border border-gray-200 py-3 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-3"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      Sign up with Google
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
