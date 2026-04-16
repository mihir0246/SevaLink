import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Zap, AlertTriangle, CheckCircle, Clock, Users, Target,
  MapPin, ChevronRight, Loader2, Activity, TrendingUp, Brain,
  ArrowRight, Flame, Shield, Heart, Package
} from 'lucide-react';
import { recipientsAPI, matchmakingAPI, volunteersAPI } from '../services/api';
import { toast } from 'sonner';
import { useLanguage } from '../context/LanguageContext';

const URGENCY_CONFIG_STYLES: Record<string, { color: string; bg: string; ring: string; icon: any; pulse: boolean }> = {
  critical: { color: 'text-red-600',   bg: 'bg-red-50',     ring: 'ring-red-200',   icon: Flame,   pulse: true },
  high:     { color: 'text-orange-600', bg: 'bg-orange-50',  ring: 'ring-orange-200', icon: AlertTriangle, pulse: false },
  medium:   { color: 'text-yellow-600', bg: 'bg-yellow-50',  ring: 'ring-yellow-200', icon: Activity, pulse: false },
  low:      { color: 'text-teal-600',   bg: 'bg-teal-50',    ring: 'ring-teal-200',   icon: Shield,  pulse: false },
};

function UrgencyBadge({ urgency }: { urgency: string }) {
  const { t } = useLanguage();
  const cfg = URGENCY_CONFIG_STYLES[urgency?.toLowerCase()] ?? URGENCY_CONFIG_STYLES.low;
  const label = t(`needs.urgency.${urgency?.toLowerCase() ?? 'low'}`);
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black ${cfg.color} ${cfg.bg} ring-1 ${cfg.ring}`}>
      {cfg.pulse && <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" /></span>}
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

const NEED_ICON: Record<string, any> = {
  Food: Package, Medical: Heart, Shelter: Shield, Education: Brain, Other: Activity
};

export default function SmartAssign() {
  const { t } = useLanguage();
  const [criticalNeeds, setCriticalNeeds] = useState<any[]>([]);
  const [stats, setStats] = useState({ pending: 0, assigned: 0, resolved: 0, volunteers: 0 });
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [lastPlan, setLastPlan] = useState<any>(null);
  const [selectedNeed, setSelectedNeed] = useState<string | null>(null);
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [needsRes, volRes] = await Promise.all([
        recipientsAPI.getAll({ limit: 100 }),
        volunteersAPI.getAll(),
      ]);

      const allNeeds: any[] = needsRes.data?.recipients || needsRes.data || [];
      const allVols: any[] = volRes.data || [];

      // Prioritise critical → high → medium
      const priority = ['critical', 'high', 'medium', 'low'];
      const sorted = [...allNeeds].sort((a, b) => {
        const ai = priority.indexOf(a.urgency?.toLowerCase() ?? 'low');
        const bi = priority.indexOf(b.urgency?.toLowerCase() ?? 'low');
        return ai - bi;
      });

      const pending = allNeeds.filter(n => n.status === 'pending').length;
      const assigned = allNeeds.filter(n => n.status === 'assigned').length;
      const resolved = allNeeds.filter(n => n.status === 'completed').length;

      setCriticalNeeds(sorted.slice(0, 8));
      setStats({ pending, assigned, resolved, volunteers: allVols.length });
    } catch (err) {
      toast.error('Could not load community needs');
    } finally {
      setLoading(false);
    }
  };

  const handleRunAI = async () => {
    setAssigning(true);
    try {
      const res = await matchmakingAPI.assign();
      const { plan, actions } = res.data;
      setLastPlan(plan);

      const newResolved = new Set(resolvedIds);
      actions.forEach((a: any) => {
        if (a.recipientId) newResolved.add(a.recipientId.toString());
      });
      setResolvedIds(newResolved);

      toast.success(`✅ ${t('smart.complete')}`);
      await fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.msg || 'AI matchmaking failed';
      toast.error(msg);
    } finally {
      setAssigning(false);
    }
  };

  const statCards = [
    { label: t('dashboard.stats.pending'),     value: stats.pending,    icon: Clock,        color: 'orange', desc: t('needs.status.pending') },
    { label: t('layout.myTasks'), value: stats.assigned,   icon: Target,       color: 'blue',   desc: t('needs.status.assigned') },
    { label: t('dashboard.stats.resolved'),          value: stats.resolved,   icon: CheckCircle,  color: 'teal',   desc: t('needs.status.completed') },
    { label: t('dashboard.stats.volunteers'),  value: stats.volunteers, icon: Users,        color: 'purple', desc: t('nav.volunteers') },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-[#1E3A8A] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 pb-24 md:pb-10">
      <div className="max-w-7xl mx-auto p-6 md:p-8">

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center justify-between mb-10 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#1E3A8A] flex items-center justify-center shadow-lg shadow-blue-900/30">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">{t('smart.title')}</h1>
            </div>
            <p className="text-gray-500 font-medium ml-[52px]">{t('smart.subtitle')}</p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRunAI}
            disabled={assigning}
            className="relative flex items-center justify-center gap-3 px-8 py-4 bg-[#1E3A8A] text-white rounded-2xl font-black text-lg shadow-2xl shadow-blue-900/40 hover:bg-[#1E3A8A]/90 transition-all disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden group min-w-[260px]"
          >
            {/* animated shimmer */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            {assigning ? (
              <><Loader2 className="w-6 h-6 animate-spin" /> {t('smart.running')}</>
            ) : (
              <><Brain className="w-6 h-6" /> {t('smart.run')} <ArrowRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" /></>
            )}
          </motion.button>
        </motion.div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {statCards.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group`}>
              <div className={`w-11 h-11 rounded-xl bg-${s.color}-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <s.icon className={`w-6 h-6 text-${s.color}-600`} />
              </div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">{s.desc}</p>
              <p className="text-4xl font-black text-gray-900 tracking-tight">{s.value}</p>
              <p className="text-sm text-gray-500 font-semibold mt-0.5">{s.label}</p>
              <div className={`absolute bottom-0 left-0 w-full h-1 bg-${s.color}-400/20`} />
            </motion.div>
          ))}
        </div>

        {/* ── Last AI Run Banner ── */}
        <AnimatePresence>
          {lastPlan && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="mb-8 bg-gradient-to-r from-teal-500 to-emerald-600 rounded-2xl p-5 text-white flex items-center gap-4 shadow-lg">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-7 h-7" />
              </div>
              <div>
                <p className="font-black text-lg">{t('smart.complete')}</p>
                <p className="text-teal-100 text-sm font-medium">{lastPlan.geminiSummary}</p>
              </div>
              <button onClick={() => setLastPlan(null)} className="ml-auto text-white/70 hover:text-white text-2xl font-light leading-none">&times;</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Priority Needs – Left 2 cols */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                {t('smart.priority')}
              </h2>
              <button onClick={fetchData} className="text-sm text-[#1E3A8A] font-semibold hover:underline flex items-center gap-1">
                <Activity className="w-4 h-4" /> {t('needs.filter.all')}
              </button>
            </div>

            <div className="space-y-3">
              <AnimatePresence>
                {criticalNeeds.map((need, idx) => {
                  const isResolved = resolvedIds.has(need._id?.toString());
                  const NeedIcon = NEED_ICON[need.needType] ?? Activity;
                  const cfg = URGENCY_CONFIG_STYLES[need.urgency?.toLowerCase()] ?? URGENCY_CONFIG_STYLES.low;
                  const isSelected = selectedNeed === need._id?.toString();

                  return (
                    <motion.div
                      key={need._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: isResolved ? 0.5 : 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, height: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => setSelectedNeed(isSelected ? null : need._id?.toString())}
                      className={`bg-white rounded-2xl border transition-all cursor-pointer group ${
                        isResolved ? 'border-teal-200 bg-teal-50/50' :
                        isSelected ? 'border-[#1E3A8A] shadow-lg shadow-blue-900/10 ring-1 ring-[#1E3A8A]/20' :
                        'border-gray-100 hover:border-gray-200 hover:shadow-md'
                      }`}
                    >
                      <div className="p-4 flex items-center gap-4">
                        {/* Rank */}
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 ${
                          idx < 3 ? 'bg-[#1E3A8A] text-white' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {isResolved ? <CheckCircle className="w-4 h-4 text-teal-500" /> : `#${idx + 1}`}
                        </div>

                        {/* Need Icon */}
                        <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                          <NeedIcon className={`w-5 h-5 ${cfg.color}`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-gray-900 text-sm truncate">
                              {need.firstName} {need.lastName}
                            </span>
                            <UrgencyBadge urgency={need.urgency} />
                            {isResolved && (
                              <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full ring-1 ring-teal-200">
                                ✓ {t('needs.status.assigned')}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {need.city || 'Unknown'}
                            </span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${cfg.bg} ${cfg.color}`}>
                              {need.needType}
                            </span>
                            {need.quantity && (
                              <span className="text-xs text-gray-400">{need.quantity}</span>
                            )}
                          </div>
                        </div>

                        <ChevronRight className={`w-4 h-4 text-gray-300 flex-shrink-0 transition-transform ${isSelected ? 'rotate-90' : 'group-hover:translate-x-0.5'}`} />
                      </div>

                      {/* Expanded detail */}
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden border-t border-gray-100"
                          >
                            <div className="px-4 py-3 bg-blue-50/50">
                              <p className="text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">{t('common.details')}</p>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                {need.notes && <div><span className="text-gray-400">{t('needs.form.notes')}:</span> <span className="text-gray-700 font-medium">{need.notes}</span></div>}
                                {need.area && <div><span className="text-gray-400">{t('map.filter.area')}:</span> <span className="text-gray-700 font-medium">{need.area}</span></div>}
                                <div><span className="text-gray-400">Status:</span> <span className="text-gray-700 font-medium capitalize">{need.status}</span></div>
                                {need.householdId && <div><span className="text-gray-400">Household ID:</span> <span className="text-gray-700 font-medium">{need.householdId}</span></div>}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {criticalNeeds.length === 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                  <CheckCircle className="w-16 h-16 text-teal-400 mx-auto mb-4" />
                  <p className="font-black text-xl text-gray-700">All Clear!</p>
                  <p className="text-gray-400 mt-1">No pending community needs at this time.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel */}
          <div className="space-y-6">

            {/* How it Works */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              className="bg-[#1E3A8A] rounded-2xl p-6 text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="w-6 h-6" />
                  <h3 className="font-black text-lg">{t('smart.how.title')}</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { step: '01', title: t('smart.how.step1.title'), desc: t('smart.how.step1.desc') },
                    { step: '02', title: t('smart.how.step2.title'), desc: t('smart.how.step2.desc') },
                    { step: '03', title: t('smart.how.step3.title'), desc: t('smart.how.step3.desc') },
                    { step: '04', title: t('smart.how.step4.title'), desc: t('smart.how.step4.desc') },
                  ].map(s => (
                    <div key={s.step} className="flex gap-3">
                      <span className="text-blue-300 font-black text-xs mt-0.5 flex-shrink-0">{s.step}</span>
                      <div>
                        <p className="font-bold text-sm">{s.title}</p>
                        <p className="text-blue-200 text-xs leading-relaxed">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
            </motion.div>

            {/* Impact Snapshot */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-teal-500" />
                {t('smart.impact.title')}
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Crisis Rate', value: criticalNeeds.filter(n => n.urgency?.toLowerCase() === 'critical').length + ' critical', color: 'bg-red-500' },
                  { label: 'Resolution', value: stats.resolved > 0 ? Math.round((stats.resolved / (stats.pending + stats.assigned + stats.resolved)) * 100) + '%' : '0%', color: 'bg-teal-500' },
                  { label: 'Volunteer Coverage', value: stats.volunteers + ' ready', color: 'bg-blue-500' },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${item.color}`} />
                      <span className="text-sm text-gray-600 font-medium">{item.label}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{item.value}</span>
                  </div>
                ))}

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400 font-medium text-center">
                    Data gathered from digitised community surveys via Gemini AI Vision
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-black text-gray-900 mb-4">{t('smart.quick.title')}</h3>
              <div className="space-y-2">
                {[
                  { label: t('nav.needs'),  href: '/admin/needs',      color: 'bg-blue-50   text-[#1E3A8A]', icon: Activity },
                  { label: t('nav.map'),      href: '/admin/map',        color: 'bg-teal-50   text-teal-700',  icon: MapPin },
                  { label: t('nav.reports'),    href: '/admin/reports',    color: 'bg-purple-50 text-purple-700', icon: TrendingUp },
                  { label: t('nav.surveys'),     href: '/admin/surveys',    color: 'bg-orange-50 text-orange-700', icon: Brain },
                ].map(a => (
                  <a key={a.label} href={a.href}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold ${a.color} hover:opacity-80 transition-opacity`}>
                    <a.icon className="w-4 h-4" />
                    {a.label}
                    <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
                  </a>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
