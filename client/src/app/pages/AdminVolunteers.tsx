import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users, Star, MapPin, Activity, TrendingUp, Award,
  X, Phone, Mail, Calendar, Clock, ShieldCheck, Briefcase,
  CheckCircle2, AlertCircle, Search, Trash2, Filter, ArrowUpDown, UserCheck
} from 'lucide-react';
import { volunteersAPI } from '../services/api';
import { toast } from 'sonner';
import { useLanguage } from '../context/LanguageContext';

export default function AdminVolunteers() {
  const { t } = useLanguage();
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [selectedVolunteer, setSelectedVolunteer] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showInactive, setShowInactive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    volunteersAPI.getAll({ all: showInactive })
      .then(res => setVolunteers(res.data))
      .catch(() => toast.error('Failed to load volunteers'))
      .finally(() => setLoading(false));
  }, [showInactive]);

  const filteredVolunteers = volunteers
    .filter(v => {
      const fullName = `${v.firstName || ''} ${v.lastName || ''}`.toLowerCase();
      const email = (v.email || '').toLowerCase();
      const skills = (v.skills || []).map((s: string) => s.toLowerCase());
      const q = searchQuery.toLowerCase();
      
      const matchesSearch = fullName.includes(q) || email.includes(q) || skills.some((s: string) => s.includes(q));
      
      let matchesRating = true;
      if (ratingFilter === '4plus') matchesRating = (v.rating || 5) >= 4;
      else if (ratingFilter === '3plus') matchesRating = (v.rating || 5) >= 3;
      else if (ratingFilter === 'under3') matchesRating = (v.rating || 5) < 3;
      
      return matchesSearch && matchesRating;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.joinedDate || 0).getTime() - new Date(a.joinedDate || 0).getTime();
      if (sortBy === 'rating-high') return (b.rating || 5) - (a.rating || 5);
      if (sortBy === 'rating-low') return (a.rating || 5) - (b.rating || 5);
      if (sortBy === 'name') return (a.firstName || '').localeCompare(b.firstName || '');
      return 0;
    });

  const getInitials = (v: any) =>
    `${v.firstName?.[0] || ''}${v.lastName?.[0] || ''}`.toUpperCase();

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-yellow-600';
    return 'text-red-500';
  };

  const totalActiveTasks = volunteers.reduce((acc, v) => acc + (v.actionsActive || 0), 0);
  const totalDone = volunteers.reduce((acc, v) => acc + (v.actionsCompleted || 0), 0);
  const avgRating = volunteers.length > 0
    ? (volunteers.reduce((acc, v) => acc + (v.rating || 0), 0) / volunteers.length).toFixed(1)
    : '5.0';

  const worstVolunteer = volunteers.length > 0
    ? [...volunteers]
        .filter(v => (v.actionsCompleted || 0) > 0)
        .sort((a, b) => (a.rating || 5) - (b.rating || 5))[0]
    : null;

  const handleToggleActive = async (volunteer: any, currentlyActive: boolean) => {
    const id = volunteer._id || volunteer.id;
    const action = currentlyActive ? 'deactivate' : 'activate';
    const confirmMsg = currentlyActive ? t('admin.vol.confirmDeactivate') : t('admin.vol.confirmActivate');
    if (!window.confirm(confirmMsg)) return;
    
    try {
      const res = await volunteersAPI.toggleActive(id);
      const successMsg = currentlyActive ? t('admin.vol.toastDeactivateSuccess') : t('admin.vol.toastActivateSuccess');
      toast.success(successMsg);
      
      if (res.data.reassignmentSummary?.length > 0) {
        res.data.reassignmentSummary.forEach((msg: string) => toast.info(msg, { duration: 5000 }));
      }

      setVolunteers(prev => prev.map(v => v._id === id ? { ...v, active: !currentlyActive } : v));
      if (selectedVolunteer?._id === id) {
        setSelectedVolunteer({ ...selectedVolunteer, active: !currentlyActive });
      }
    } catch (err) {
      const errorMsg = currentlyActive ? t('admin.vol.toastDeactivateError') : t('admin.vol.toastActivateError');
      toast.error(errorMsg);
    }
  };

  return (
    <div className="min-h-screen pb-20 md:pb-8 bg-gray-50/50">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#1E3A8A] rounded-xl flex items-center justify-center text-white shadow-lg">
              <Users className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">{t('admin.vol.title')}</h1>
          </div>
          <p className="text-gray-500 font-medium ml-[52px]">{t('admin.vol.subtitle')}</p>
        </motion.div>


        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: t('nav.volunteers'), value: volunteers.length, icon: Users, color: 'blue' },
            { label: t('vol.stat.active'), value: totalActiveTasks, icon: Activity, color: 'teal' },
            { label: t('vol.stat.totalTasks'), value: totalDone, icon: TrendingUp, color: 'orange' },
            { label: t('admin.vol.stat.avgRating'), value: avgRating, icon: Star, color: 'purple', star: true },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1">{s.label}</p>
                  <div className="flex items-center gap-1">
                    {s.star && <Star className="w-4 h-4 text-orange-500 fill-orange-500" />}
                    <p className="text-3xl font-black text-gray-900">{s.value}</p>
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-${s.color}-50 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <s.icon className={`w-6 h-6 text-${s.color}-600`} />
                </div>
              </div>
              <div className={`absolute bottom-0 left-0 w-full h-1 bg-${s.color}-400/20`} />
            </div>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200 mb-6 shadow-sm flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('volunteers.filters.search')}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/10 text-sm font-medium"
            />
          </div>
          <div className="flex gap-3">
            {/* Rating Filter */}
            <div className="relative min-w-[140px]">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/10 text-sm font-black text-gray-700 appearance-none transition-all cursor-pointer"
              >
                <option value="all">{t('admin.vol.filter.ratings')}</option>
                <option value="4plus">★ {t('admin.vol.filter.rating4')}</option>
                <option value="3plus">★ {t('admin.vol.filter.rating3')}</option>
                <option value="under3">★ {t('admin.vol.filter.ratingUnder3')}</option>
              </select>
            </div>

            {/* SortBy Filter */}
            <div className="relative min-w-[140px]">
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/10 text-sm font-black text-gray-700 appearance-none transition-all cursor-pointer"
              >
                <option value="newest">{t('admin.vol.filter.sort')} ({t('admin.vol.filter.sortNewest')})</option>
                <option value="rating-high">{t('admin.vol.filter.sortRatingHigh')}</option>
                <option value="rating-low">{t('admin.vol.filter.sortRatingLow')}</option>
                <option value="name">{t('admin.vol.filter.sortName')}</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 border-l border-gray-100 pl-4 h-10">
            <input 
              type="checkbox" 
              id="show-inactive"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="w-4 h-4 text-[#1E3A8A] rounded border-gray-300 focus:ring-[#1E3A8A]"
            />
            <label htmlFor="show-inactive" className="text-sm font-black text-gray-700 cursor-pointer select-none">{t('admin.vol.filter.showInactive')}</label>
          </div>
        </div>

        {/* Volunteer Cards */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400 border-2 border-dashed border-gray-200 rounded-3xl bg-white/50">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-10 h-10 border-4 border-[#1E3A8A] border-t-transparent rounded-full mb-4" />
            <p className="font-bold uppercase tracking-widest text-xs">{t('admin.vol.loading')}</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredVolunteers.map((volunteer, index) => (
              <motion.div
                key={volunteer._id || volunteer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                 onClick={() => setSelectedVolunteer(volunteer)}
                 className={`rounded-2xl p-5 border transition-all cursor-pointer group ${
                   volunteer.active === false 
                    ? 'bg-gray-50/50 border-gray-200 grayscale-[0.5]' 
                    : 'bg-white border-gray-200 hover:border-[#1E3A8A]/30 hover:shadow-lg hover:shadow-blue-900/5'
                 }`}
               >
                <div className="flex flex-col lg:flex-row gap-5">
                  {/* Left: Info */}
                  <div className="flex-1 flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1E3A8A] to-[#14B8A6] flex items-center justify-center text-white text-lg font-black shrink-0 group-hover:scale-105 transition-transform shadow-lg shadow-blue-900/20">
                      {getInitials(volunteer)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-black text-gray-900 mb-0.5 group-hover:text-[#1E3A8A] transition-colors">
                        {volunteer.firstName} {volunteer.lastName}
                      </h3>
                      <p className="text-sm text-gray-400 mb-3 font-medium">{volunteer.email}</p>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {(volunteer.skills || []).slice(0, 4).map((skill: string) => (
                          <span key={skill} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md text-[11px] font-bold ring-1 ring-indigo-200">
                            {skill}
                          </span>
                        ))}
                        {(volunteer.skills || []).length > 4 && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-md text-[11px] font-bold">
                            +{volunteer.skills.length - 4} {t('admin.vol.more')}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs text-gray-500 font-semibold">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {volunteer.location || volunteer.city || t('admin.vol.defaultLocation')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                          {volunteer.rating || '5.0'}
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />
                          {volunteer.actionsCompleted || 0} tasks
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {volunteer.hoursContributed || 0} hrs
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Mini stats */}
                  <div className="flex lg:flex-col gap-3 items-start lg:items-end justify-start lg:justify-center shrink-0">
                    <div className="bg-gradient-to-br from-[#1E3A8A] to-[#14B8A6] rounded-xl px-4 py-3 text-white text-center min-w-[100px]">
                      <p className="text-[10px] text-white/70 uppercase tracking-widest font-black mb-0.5">{t('admin.vol.performance')}</p>
                      <p className="text-xl font-black">{volunteer.rating || '5.0'}/5.0</p>
                      <p className="text-[10px] text-white/70">Based on {volunteer.actionsCompleted || 0} tasks</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${volunteer.active === false ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`} />
                      <span className={`text-xs font-black uppercase tracking-widest ${volunteer.active === false ? 'text-red-600' : 'text-gray-500'}`}>
                        {volunteer.active !== false ? t('admin.vol.active') : t('admin.vol.inactive')}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {filteredVolunteers.length === 0 && !loading && (
              <div className="text-center py-20 text-gray-300 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="font-bold uppercase tracking-widest text-xs">No volunteers found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Slide-over Detail Modal ── */}
      <AnimatePresence>
        {selectedVolunteer && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedVolunteer(null)}
              className="fixed inset-0 bg-gray-900/40 backdrop-blur-[2px] z-[100]"
            />

            {/* Panel */}
            <motion.div
              key={selectedVolunteer._id || selectedVolunteer.id || 'vol-modal'}
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-lg bg-white shadow-2xl z-[110] overflow-y-auto"
              style={{ pointerEvents: 'auto' }}
            >
              {/* Hero Header */}
              <div className="h-52 bg-gradient-to-br from-[#1E3A8A] to-[#14B8A6] relative overflow-hidden flex items-end p-8">
                <div className="absolute top-4 right-4 flex gap-2 z-20">
                  <button
                    onClick={() => handleToggleActive(selectedVolunteer, selectedVolunteer.active !== false)}
                    className={`p-2.5 rounded-xl backdrop-blur-md transition-all active:scale-95 border group/del ${
                      selectedVolunteer.active !== false 
                        ? 'bg-red-500/20 hover:bg-red-500/30 text-red-100 border-red-500/30' 
                        : 'bg-green-500/20 hover:bg-green-500/30 text-green-100 border-green-500/30'
                    }`}
                    title={selectedVolunteer.active !== false ? t('admin.vol.deactivate') : t('admin.vol.reactivate')}
                  >
                    {selectedVolunteer.active !== false 
                      ? <Trash2 className="w-5 h-5 group-hover/del:scale-110 transition-transform" />
                      : <UserCheck className="w-5 h-5 group-hover/del:scale-110 transition-transform" />
                    }
                  </button>
                  <button
                    onClick={() => setSelectedVolunteer(null)}
                    className="p-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl backdrop-blur-md transition-all active:scale-95"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <Users className="absolute -top-10 -right-10 w-64 h-64 text-white/5 pointer-events-none" />
                <div className="relative z-10 text-white flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-2xl font-black border border-white/20">
                    {getInitials(selectedVolunteer)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight leading-tight">
                      {selectedVolunteer.firstName} {selectedVolunteer.lastName}
                    </h2>
                    <p className="text-white/70 text-xs font-medium mt-0.5">{selectedVolunteer.email}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="text-[10px] font-black bg-white/20 px-2 py-1 rounded-md uppercase tracking-widest">
                        {selectedVolunteer.active !== false ? t('admin.vol.active') : t('admin.vol.inactive')}
                      </span>
                      <span className="text-[10px] font-black bg-white/20 px-2 py-1 rounded-md uppercase tracking-widest">
                        ★ {selectedVolunteer.rating || '5.0'} {t('vol.card.rated')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="p-8 pb-20 space-y-8">

                {/* Performance Block */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: t('admin.vol.stats.done'), value: selectedVolunteer.actionsCompleted || 0, icon: CheckCircle2, color: 'green' },
                    { label: t('admin.vol.stats.active'), value: selectedVolunteer.actionsActive || 0, icon: Activity, color: 'blue' },
                    { label: t('admin.vol.stats.hours'), value: selectedVolunteer.hoursContributed || 0, icon: Clock, color: 'orange' },
                  ].map((s) => (
                    <div key={s.label} className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-center">
                      <s.icon className={`w-5 h-5 text-${s.color}-500 mx-auto mb-1`} />
                      <p className="text-2xl font-black text-gray-900">{s.value}</p>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Contact */}
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('admin.vol.contact')}</p>
                  <div className="bg-gray-50 rounded-2xl border border-gray-100 divide-y divide-gray-100 overflow-hidden">
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-[#1E3A8A]" />
                        <span className="text-sm font-bold text-gray-900">{selectedVolunteer.email}</span>
                      </div>
                    </div>
                    {selectedVolunteer.city && (
                      <div className="flex items-center gap-3 p-4">
                        <MapPin className="w-4 h-4 text-teal-500" />
                        <span className="text-sm font-bold text-gray-900">{selectedVolunteer.city}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Skills */}
                {(selectedVolunteer.skills || []).length > 0 && (
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('admin.vol.skills')}</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedVolunteer.skills.map((skill: string) => (
                        <span key={skill} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-black ring-1 ring-indigo-200">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rating */}
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('admin.vol.rating')}</p>
                  <div className="p-5 bg-gradient-to-br from-[#1E3A8A] to-[#14B8A6] rounded-2xl text-white flex items-center justify-between">
                    <div>
                      <p className="text-4xl font-black">{selectedVolunteer.rating || '5.0'}</p>
                      <p className="text-white/70 text-xs font-medium">{t('admin.vol.rating.outOf')}</p>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-6 h-6 ${(selectedVolunteer.rating || 5) >= star ? 'text-yellow-300 fill-yellow-300' : 'text-white/20'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Member since */}
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('admin.vol.membership')}</p>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <Calendar className="w-4 h-4 text-[#1E3A8A]" />
                    <div>
                      <p className="text-sm font-black text-gray-900">
                        {selectedVolunteer.joinedDate
                          ? new Date(selectedVolunteer.joinedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                          : t('needs.unassigned')}
                      </p>
                      <p className="text-[10px] text-gray-400 font-medium">{t('admin.vol.memberSince')}</p>
                    </div>
                  </div>
                </div>

                {/* Capabilities */}
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('admin.vol.capabilities')}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className={`p-4 rounded-2xl border flex items-center gap-3 ${selectedVolunteer.canDeliver ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-100'}`}>
                      <Briefcase className={`w-5 h-5 ${selectedVolunteer.canDeliver ? 'text-green-600' : 'text-gray-400'}`} />
                      <div>
                        <p className="text-xs font-black text-gray-900">{t('admin.vol.delivery')}</p>
                        <p className="text-[10px] text-gray-500">{selectedVolunteer.canDeliver ? t('vol.stat.active') : t('admin.vol.inactive')}</p>
                      </div>
                    </div>
                    <div className={`p-4 rounded-2xl border flex items-center gap-3 ${selectedVolunteer.active !== false ? 'bg-teal-50 border-teal-100' : 'bg-gray-50 border-gray-100'}`}>
                      <ShieldCheck className={`w-5 h-5 ${selectedVolunteer.active !== false ? 'text-teal-600' : 'text-gray-400'}`} />
                      <div>
                        <p className="text-xs font-black text-gray-900">{t('admin.vol.account')}</p>
                        <p className="text-[10px] text-gray-500">{selectedVolunteer.active !== false ? t('admin.vol.active') : t('admin.vol.inactive')}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleToggleActive(selectedVolunteer, selectedVolunteer.active !== false)}
                    className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 transition-colors font-black ${
                      selectedVolunteer.active !== false
                       ? 'bg-red-50 hover:bg-red-100 text-red-600'
                       : 'bg-green-50 hover:bg-green-100 text-green-600'
                    }`}
                  >
                    {selectedVolunteer.active !== false ? (
                      <>
                        <Trash2 className="w-5 h-5" />
                        {t('admin.vol.deactivate')}
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-5 h-5" />
                        {t('admin.vol.reactivate')}
                      </>
                    )}
                  </button>
                  <p className="text-center text-[10px] text-gray-400 mt-3 font-medium uppercase tracking-widest">
                    {selectedVolunteer.active !== false 
                     ? t('admin.vol.deactivateWarn')
                     : t('admin.vol.reactivateWarn')}
                  </p>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
