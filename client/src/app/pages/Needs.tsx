import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, User, Activity, Edit2, Trash2, ShieldCheck, Phone, X, ExternalLink, Globe, AlertTriangle, CheckCircle2, Clock, Tag } from 'lucide-react';
import { recipientsAPI, actionsAPI } from '../services/api';
import { toast } from 'sonner';
import { useLanguage } from '../context/LanguageContext';

export default function Needs() {
  const { t } = useLanguage();
  const [needs, setNeeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [selectedNeed, setSelectedNeed] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fetchNeeds = () => {
    setLoading(true);
    const params: any = {};
    if (typeFilter !== 'all') params.type = typeFilter;
    if (urgencyFilter !== 'all') params.urgency = urgencyFilter;
    if (searchQuery) params.search = searchQuery;
    recipientsAPI.getAll(params)
      .then(res => setNeeds(res.data))
      .catch(() => toast.error('Failed to load community needs'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNeeds();
  }, [typeFilter, urgencyFilter, searchQuery]);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency?.toLowerCase()) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-[#F97316]';
      case 'medium': return 'bg-[#14B8A6]';
      case 'low': return 'bg-teal-400';
      default: return 'bg-gray-400';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase">{t('needs.status.completed')}</span>;
      case 'pending-verification': return <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-[10px] font-black uppercase animate-pulse">{t('needs.status.pending')}</span>;
      case 'assigned': return <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black uppercase">{t('needs.status.assigned')}</span>;
      case 'in-progress': return <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-black uppercase">{t('needs.status.inprogress')}</span>;
      default: return <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-[10px] font-black uppercase">{t('needs.status.data')}</span>;
    }
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await recipientsAPI.delete(id);
      toast.success(t('needs.toast.removeSuccess'));
      setShowDeleteConfirm(false);
      fetchNeeds();
      if (selectedNeed?._id === id) setSelectedNeed(null);
    } catch (err) {
      toast.error(t('needs.toast.removeError'));
    }
  };

  const handleVerify = async (actionId: string) => {
    try {
      await actionsAPI.verify(actionId);
      toast.success(t('needs.toast.verifySuccess'));
      fetchNeeds();
      setSelectedNeed(null);
    } catch (err) {
      toast.error(t('needs.toast.verifyError'));
    }
  };

  const handleSaveEdit = async () => {
    try {
      await recipientsAPI.update(editForm._id, editForm);
      toast.success(t('needs.toast.updateSuccess'));
      setIsEditing(false);
      fetchNeeds();
      setSelectedNeed(editForm);
    } catch (err) {
      toast.error(t('needs.toast.updateError'));
    }
  };

  return (
    <div className="min-h-screen pb-20 md:pb-8 bg-gray-50/50">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#1E3A8A] rounded-xl flex items-center justify-center text-white shadow-lg">
              <Globe className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">{t('needs.title')}</h1>
          </div>
          <p className="text-gray-500 font-medium ml-[52px]">{t('needs.subtitle')}</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: t('dashboard.stats.totalNeeds'), value: needs.length, icon: Activity, color: 'blue' },
            { label: t('needs.stat.unassigned'), value: needs.filter(n => n.status === 'pending').length, icon: User, color: 'indigo' },
            { label: t('needs.stat.assigned'), value: needs.filter(n => n.assignedTo).length, icon: ShieldCheck, color: 'teal' },
            { label: t('needs.stat.critical'), value: needs.filter(n => n.urgency === 'critical').length, icon: AlertTriangle, color: 'red' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1">{s.label}</p>
                  <p className="text-3xl font-black text-gray-900">{s.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-${s.color}-50 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <s.icon className={`w-6 h-6 text-${s.color}-600`} />
                </div>
              </div>
              <div className={`absolute bottom-0 left-0 w-full h-1 bg-${s.color}-400/20`} />
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 mb-6 shadow-sm">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('needs.filter.search')}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/10 text-sm font-medium"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/10 text-sm font-bold text-gray-700"
            >
              <option value="all">{t('needs.filter.all')}</option>
              <option value="Food">Food</option>
              <option value="Medical">Medical</option>
              <option value="Shelter">Shelter</option>
              <option value="Education">Education</option>
            </select>

            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/10 text-sm font-bold text-gray-700"
            >
              <option value="all">{t('needs.filter.urgency')}</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400 border-2 border-dashed border-gray-200 rounded-3xl bg-white/50">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-10 h-10 border-4 border-[#1E3A8A] border-t-transparent rounded-full mb-4" />
            <p className="font-bold uppercase tracking-widest text-xs">Accessing community ledger...</p>
          </div>
        ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xl shadow-blue-900/5">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1E3A8A]/5 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('needs.table.person')}</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('needs.table.type')}</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('needs.table.urgency')}</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('needs.table.status')}</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('needs.table.assigned')}</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('needs.table.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 transition-all">
                {needs.map((need, idx) => (
                  <motion.tr
                    key={need._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    onClick={() => { setSelectedNeed(need); setIsEditing(false); setShowDeleteConfirm(false); }}
                    className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-white border border-gray-100 shadow-sm flex items-center justify-center text-[#1E3A8A] group-hover:bg-[#1E3A8A] group-hover:text-white transition-all">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{need?.firstName} {need?.lastName}</p>
                          <p className="text-[10px] font-black text-gray-400 tracking-tighter uppercase">{need?.householdId || `HH-${(need?._id || '').slice(-6)}`}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md text-[11px] font-bold ring-1 ring-indigo-200">
                        {need.needType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${getUrgencyColor(need.urgency)}`} />
                        <span className="text-xs font-bold text-gray-700 capitalize">{need.urgency}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(need.status)}
                    </td>
                    <td className="px-6 py-4">
                      {need?.assignedTo && typeof need.assignedTo === 'object' ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center text-[10px] text-white font-black">
                            {need.assignedTo.firstName?.[0] || 'V'}
                          </div>
                          <span className="text-xs font-bold text-gray-900">{need.assignedTo.firstName} {need.assignedTo.lastName}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-300 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedNeed(need); setIsEditing(true); setEditForm(need); }}
                          className="p-1.5 hover:bg-white rounded-md text-gray-400 hover:text-[#1E3A8A] shadow-none hover:shadow-sm"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(need._id, e)}
                          className="p-1.5 hover:bg-white rounded-md text-gray-400 hover:text-red-600 shadow-none hover:shadow-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {needs.length === 0 && (
              <div className="text-center py-20 text-gray-300 bg-white">
                <Globe className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="font-bold uppercase tracking-widest text-xs">No community needs logged</p>
              </div>
            )}
          </div>
        </div>
        )}
      </div>

      {/* Slide-over Detail Modal */}
      <AnimatePresence>
        {selectedNeed && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedNeed(null)}
              className="fixed inset-0 bg-gray-900/40 backdrop-blur-[2px] z-[60]"
            />
            <motion.div
              key={selectedNeed?._id || 'modal'}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-lg bg-white shadow-2xl z-[70] overflow-y-auto"
            >
              {isEditing ? (
                <div className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">{t('needs.modal.edit')}</h2>
                    <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-6 h-6" /></button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">{t('needs.modal.firstName')}</label>
                        <input value={editForm.firstName || ''} onChange={e => setEditForm({...editForm, firstName: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/10 text-sm font-bold" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">{t('needs.modal.lastName')}</label>
                        <input value={editForm.lastName || ''} onChange={e => setEditForm({...editForm, lastName: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/10 text-sm font-bold" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">City / Area</label>
                      <input value={editForm.city || ''} onChange={e => setEditForm({...editForm, city: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/10 text-sm font-bold" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Urgency</label>
                      <select value={editForm.urgency || 'low'} onChange={e => setEditForm({...editForm, urgency: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/10 text-sm font-bold">
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Requirement Category</label>
                      <select value={editForm.needType || 'Food'} onChange={e => setEditForm({...editForm, needType: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/10 text-sm font-bold">
                        <option value="Food">Food</option>
                        <option value="Medical">Medical</option>
                        <option value="Shelter">Shelter</option>
                        <option value="Education">Education</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Description / Specifics</label>
                      <textarea 
                        value={editForm.notes || ''} 
                        onChange={e => setEditForm({...editForm, notes: e.target.value})} 
                        rows={3}
                        placeholder="Additional details about the requirement..."
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/10 text-sm font-bold resize-none" 
                      />
                    </div>
                    <div className="space-y-1.5 pt-4">
                      <button onClick={handleSaveEdit} className="w-full py-4 bg-[#1E3A8A] text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-900/20 active:scale-95 transition-all">
                        {t('needs.modal.update')}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  {/* Hero Header */}
                  <div className="h-48 bg-[#1E3A8A] relative overflow-hidden flex items-end p-8">
                    <div className="absolute top-4 right-4 flex gap-2 z-20">
                       <button onClick={() => { setIsEditing(true); setEditForm(selectedNeed); }} className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-md transition-all active:scale-95"><Edit2 className="w-5 h-5" /></button>
                       <button onClick={() => setSelectedNeed(null)} className="p-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl backdrop-blur-md transition-all active:scale-95"><X className="w-5 h-5" /></button>
                    </div>
                    <Globe className="absolute -top-10 -right-10 w-64 h-64 text-white/5 pointer-events-none" />
                    <div className="relative z-10 text-white">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-3xl font-black tracking-tight">{selectedNeed?.firstName} {selectedNeed?.lastName}</h2>
                      </div>
                      <div className="flex gap-2">
                         <span className="text-xs font-black bg-white/20 px-2 py-1 rounded-md uppercase tracking-widest">
                           {selectedNeed?.householdId || `HH-${(selectedNeed?._id || '').slice(-6)}`}
                         </span>
                         <span className="text-xs font-black bg-white/20 px-2 py-1 rounded-md uppercase tracking-widest">{selectedNeed?.urgency} priority</span>
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-8 pb-20 space-y-8">
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Requirement</p>
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-indigo-500" />
                          <p className="text-base font-bold text-gray-900">{selectedNeed.needType}</p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Location</p>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-teal-500" />
                          <p className="text-base font-bold text-gray-900">{selectedNeed.city || 'Not Specified'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1 text-sm bg-gray-50 rounded-2xl p-4 border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Primary Contact</p>
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <Phone className="w-4 h-4 text-[#1E3A8A]" />
                            <span className="font-bold text-gray-900">{selectedNeed?.phone || 'No phone recorded'}</span>
                         </div>
                         <button 
                            onClick={() => selectedNeed?.phone && (window.location.href = `tel:${selectedNeed.phone}`)}
                            className="p-1 px-3 bg-white border border-gray-200 rounded-lg text-[10px] font-black hover:bg-gray-50 uppercase tracking-tighter active:scale-95 transition-all"
                          >
                            Call Now
                          </button>
                      </div>
                    </div>

                    {selectedNeed?.notes && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Description</p>
                        <div className="p-4 bg-indigo-50/30 border border-indigo-100 rounded-2xl">
                           <p className="text-sm text-gray-700 italic font-medium">{selectedNeed.notes}</p>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status & Progress</p>
                      <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-dashed border-gray-100">
                        {getStatusBadge(selectedNeed.status)}
                        <div className="flex items-center text-[10px] font-black text-gray-400 gap-1 uppercase">
                          <Clock className="w-3 h-3" />
                         Logged: {selectedNeed?.createdAt ? new Date(selectedNeed.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>

                      {selectedNeed.status === 'pending-verification' && (
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-5 bg-teal-50 border border-teal-200 rounded-2xl">
                          <div className="flex gap-4 items-start mb-4">
                            <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white shrink-0"><ShieldCheck className="w-6 h-6" /></div>
                            <div>
                               <p className="text-sm font-black text-teal-900 leading-tight">Volunteer has completed the task!</p>
                               <p className="text-xs text-teal-700 font-medium">Please cross-verify field reports before final closing.</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleVerify(selectedNeed.assignedAction)}
                            className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-teal-900/20 active:scale-95 transition-all"
                          >
                            Cross-Verify & Complete Case
                          </button>
                        </motion.div>
                      )}
                    </div>

                    {selectedNeed?.assignedTo && typeof selectedNeed.assignedTo === 'object' && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Assigned Volunteer</p>
                        <div className="p-4 bg-white border border-gray-200 rounded-2xl shadow-sm flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-black text-sm">{selectedNeed.assignedTo.firstName?.[0] || 'V'}</div>
                              <div>
                                 <p className="text-sm font-black text-gray-900">{selectedNeed.assignedTo.firstName} {selectedNeed.assignedTo.lastName}</p>
                                 <p className="text-[10px] font-medium text-gray-400">Deployed via Gemini AI SmartMatch</p>
                              </div>
                           </div>
                           <ExternalLink className="w-4 h-4 text-gray-300" />
                        </div>
                      </div>
                    )}

                    <div className="space-y-1 pt-4 border-t border-gray-100 relative z-30">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Internal Administration</p>
                      
                      {!showDeleteConfirm ? (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDeleteConfirm(true);
                          }}
                          className="flex items-center gap-2 text-xs font-black text-red-500 uppercase tracking-widest hover:bg-red-50 border border-transparent hover:border-red-100 p-3 rounded-xl transition-all active:scale-95 w-full"
                        >
                           <Trash2 className="w-4 h-4" />
                           Remove from Community Ledger
                        </button>
                      ) : (
                        <div className="bg-red-50 p-4 rounded-2xl border border-red-100 space-y-3 shadow-inner">
                           <p className="text-xs font-bold text-red-900 leading-relaxed">
                             Are you absolutely sure? This will permanently delete the record and all associated volunteer actions.
                           </p>
                           <div className="flex gap-2">
                             <button 
                               onClick={() => setShowDeleteConfirm(false)}
                               className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-50"
                             >
                               Cancel
                             </button>
                             <button 
                               onClick={(e) => {
                                 const id = selectedNeed?._id || selectedNeed?.id;
                                 if (id) handleDelete(id, e as any);
                               }}
                               className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-red-900/20 active:scale-95"
                             >
                               Confirm Delete
                             </button>
                           </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
