import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MapPin, Clock, Award, CheckCircle, Star, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { actionsAPI, volunteersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function VolunteerTaskList() {
  const { user } = useAuth();
  const [availableTasks, setAvailableTasks] = useState<any[]>([]);
  const [volunteerStats, setVolunteerStats] = useState({ rating: 0, actionsCompleted: 0, active: true });
  const [acceptedTasks, setAcceptedTasks] = useState<string[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load open (CREATED) actions — available for volunteers to take
    actionsAPI.getAll({ status: 'CREATED' })
      .then(res => setAvailableTasks(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));

    // Load volunteer's own stats
    if (!user) return;

    volunteersAPI.getMe()
      .then(res => {
        const me = res.data;
        if (me) setVolunteerStats({ 
          rating: me.rating, 
          actionsCompleted: me.actionsCompleted,
          active: me.active !== false
        });
      })
      .catch(() => {});
  }, [user]);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-[#F97316]';
      case 'medium': return 'bg-[#14B8A6]';
      default: return 'bg-gray-400';
    }
  };

  const handleAccept = async (taskId: string, taskTitle: string) => {
    try {
      await actionsAPI.updateStatus(taskId, 'ASSIGNED');
      setAcceptedTasks([...acceptedTasks, taskId]);
      setAvailableTasks(prev => prev.filter(t => t._id !== taskId));
      toast.success('Task Accepted!', { description: `You've accepted: ${taskTitle}`, duration: 3000 });
    } catch {
      toast.error('Failed to accept task. Please try again.');
    }
  };

  const filteredTasks = availableTasks.filter(task => {
    if (filter === 'all') return true;
    return task.urgency === filter;
  });

  return (
    <div className="min-h-screen pb-20 md:pb-8">
      <div className="p-6 md:p-8">
        {!volunteerStats.active && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 p-6 bg-red-50 border border-red-100 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-600">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-red-900 tracking-tight">Account Restricted</h3>
                <p className="text-red-700 text-sm font-medium">Your account is currently inactive. You cannot view or accept new tasks until reactivated by an admin.</p>
              </div>
            </div>
            <button className="px-6 py-2.5 bg-red-600 text-white rounded-xl text-sm font-black shadow-lg shadow-red-200 opacity-50 cursor-not-allowed">
              Actions Locked
            </button>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl text-gray-900 mb-2">Available Tasks</h1>
          <p className="text-gray-600">Find tasks that match your skills and make a difference</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Available</p>
            <p className="text-2xl text-gray-900">{availableTasks.length}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Accepted Today</p>
            <p className="text-2xl text-gray-900">{acceptedTasks.length}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Tasks Completed</p>
            <p className="text-2xl text-gray-900">{volunteerStats.actionsCompleted}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Rating</p>
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 text-[#F97316] fill-[#F97316]" />
              <p className="text-2xl text-gray-900">{volunteerStats.rating || '--'}</p>
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'all', label: 'All Tasks', activeClass: 'bg-[#1E3A8A] text-white' },
            { key: 'critical', label: 'Critical', activeClass: 'bg-red-500 text-white' },
            { key: 'high', label: 'High Priority', activeClass: 'bg-[#F97316] text-white' },
            { key: 'medium', label: 'Medium', activeClass: 'bg-[#14B8A6] text-white' },
          ].map(btn => (
            <button key={btn.key} onClick={() => setFilter(btn.key)}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${filter === btn.key ? btn.activeClass : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'}`}>
              {btn.label}
            </button>
          ))}
        </div>

        {/* Task List */}
        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading available tasks...</div>
        ) : !volunteerStats.active ? (
          <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-red-100">
            <ShieldCheck className="w-16 h-16 mx-auto mb-4 text-red-200" />
            <h2 className="text-xl font-black mb-2 uppercase tracking-tight text-red-400">Restricted Access</h2>
            <p className="text-gray-400 font-medium max-w-sm mx-auto uppercase tracking-widest text-[10px]">Your account has been marked as inactive by the administration. Please contact your coordinator for details.</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
            <p className="text-gray-500 text-lg mb-2">No tasks available right now</p>
            <p className="text-gray-400 text-sm">Check back soon or ask an admin to run AI matching</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredTasks.map((task, index) => {
              const isAccepted = acceptedTasks.includes(task._id);
              return (
                <motion.div key={task._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-gray-300 transition-all">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`w-1 h-16 rounded-full ${getUrgencyColor(task.urgency)}`} />
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg text-gray-900">{task.title}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs text-white ${getUrgencyColor(task.urgency)}`}>
                              {task.urgency?.charAt(0).toUpperCase() + task.urgency?.slice(1)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {task.recipientId?.city || 'Unknown location'}
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {task.category || 'General'}
                            </div>
                            {task.aiMatchScore && (
                              <div className="flex items-center">
                                <Award className="w-4 h-4 mr-1 text-[#F97316]" />
                                {task.aiMatchScore}% AI Match
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      {task.aiMatchReason && (
                        <p className="text-xs text-gray-500 italic ml-4">🤖 {task.aiMatchReason}</p>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      {isAccepted ? (
                        <div className="px-6 py-3 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-2">
                          <CheckCircle className="w-5 h-5" />
                          Accepted
                        </div>
                      ) : (
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          onClick={() => handleAccept(task._id, task.title)}
                          className="px-6 py-3 bg-[#1E3A8A] text-white rounded-xl hover:bg-[#1E3A8A]/90 transition-colors">
                          Accept Task
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
