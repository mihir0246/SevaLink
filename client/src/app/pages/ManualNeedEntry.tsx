import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Save, AlertTriangle, User, Phone, MapPin, Tag, Info, Loader2, Edit3 } from 'lucide-react';
import { recipientsAPI } from '../services/api';
import { toast } from 'sonner';

const NEED_TYPES = ['Food', 'Medical', 'Shelter', 'Education', 'Other'];
const URGENCY_LEVELS = [
  { id: 'low', label: 'Low', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { id: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { id: 'high', label: 'High', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { id: 'critical', label: 'Critical', color: 'bg-red-100 text-red-700 border-red-200' },
];

export default function ManualNeedEntry() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    city: '',
    address1: '',
    needType: 'Food',
    urgency: 'medium',
    preferredProducts: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName) {
      toast.error('First and Last name are required');
      return;
    }

    setLoading(true);
    try {
      await recipientsAPI.create(formData);
      toast.success('Emergency need logged successfully');
      navigate('/admin/needs');
    } catch (err: any) {
      console.error('Failed to log need:', err);
      toast.error(err.response?.data?.msg || 'Failed to save entry');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 md:pb-8">
      <div className="p-6 md:p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/surveys')}
              className="p-2 hover:bg-white rounded-xl border border-transparent hover:border-gray-200 transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">Log Community Need</h1>
              <p className="text-sm text-gray-500">Record a new community requirement for assignment</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-xl text-blue-700 text-xs font-bold uppercase tracking-wider">
            <Edit3 className="w-4 h-4" />
            Manual Entry Mode
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column: Basic Info */}
            <div className="md:col-span-2 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4"
              >
                <div className="flex items-center gap-2 text-[#1E3A8A] border-b border-gray-100 pb-3 mb-2">
                  <User className="w-5 h-5" />
                  <h3 className="font-bold">Recipient Details</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">First Name *</label>
                    <input
                      required
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="e.g. Rahul"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">Last Name *</label>
                    <input
                      required
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="e.g. Sharma"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 XXXXX XXXXX"
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center gap-2 text-[#1E3A8A] border-b border-gray-100 pb-3 mb-2">
                    <MapPin className="w-5 h-5" />
                    <h3 className="font-bold">Location</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700">City / Area</label>
                      <input
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="e.g. Mumbai"
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700">Address Line 1</label>
                      <input
                        name="address1"
                        value={formData.address1}
                        onChange={handleChange}
                        placeholder="Building/Street info"
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4"
              >
                <div className="flex items-center gap-2 text-[#1E3A8A] border-b border-gray-100 pb-3 mb-2">
                  <Info className="w-5 h-5" />
                  <h3 className="font-bold">Specific Items / Notes</h3>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Items Needed (Comma separated)</label>
                  <input
                    name="preferredProducts"
                    value={formData.preferredProducts}
                    onChange={handleChange}
                    placeholder="e.g. Rice, Saline, Oxygen"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Additional Instructions</label>
                  <textarea
                    name="notes"
                    rows={3}
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Detail the exact situation..."
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 transition-all resize-none"
                  />
                </div>
              </motion.div>
            </div>

            {/* Right Column: Priority & Save */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4"
              >
                <div className="flex items-center gap-2 text-[#1E3A8A] border-b border-gray-100 pb-3 mb-2">
                  <Tag className="w-5 h-5" />
                  <h3 className="font-bold">Categorization</h3>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Need Type</label>
                  <select
                    name="needType"
                    value={formData.needType}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 transition-all"
                  >
                    {NEED_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-700">Urgency Level</label>
                  <div className="grid grid-cols-1 gap-2">
                    {URGENCY_LEVELS.map(level => (
                      <button
                        key={level.id}
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, urgency: level.id }))}
                        className={`w-full px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                          formData.urgency === level.id
                            ? level.color
                            : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {level.label}
                        {formData.urgency === level.id && level.id === 'critical' && (
                          <span className="ml-2 animate-ping inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-[#1E3A8A] rounded-2xl p-6 shadow-xl shadow-blue-900/20 space-y-4"
              >
                <p className="text-blue-100 text-xs leading-relaxed font-medium">
                  Saving this entry will update the community map and analytics. It can then be assigned to an available volunteer.
                </p>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-white text-[#1E3A8A] rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  {loading ? 'Saving...' : 'Save Community Need'}
                </button>
              </motion.div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
