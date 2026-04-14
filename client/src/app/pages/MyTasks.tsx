import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MapPin, Clock, CheckCircle, Shield, Search } from 'lucide-react';
import { toast } from 'sonner';
import { actionsAPI } from '../services/api';

export default function MyTasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all actions for this volunteer (status filter handled by component filtering)
    actionsAPI.getAll()
      .then(res => setTasks(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-700 border-green-200';
      case 'PENDING_VERIFICATION': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'ASSIGNED': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-[#F97316]';
      case 'medium': return 'bg-[#14B8A6]';
      default: return 'bg-gray-400';
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      // Volunteers mark as PENDING_VERIFICATION instead of COMPLETED
      const apiStatus = newStatus === 'in-progress' ? 'ASSIGNED' : 'PENDING_VERIFICATION';
      await actionsAPI.updateStatus(taskId, apiStatus);
      setTasks(prev => prev.map(t =>
        (t._id === taskId) ? { ...t, status: apiStatus } : t
      ));
      toast.success(newStatus === 'completed' ? 'Task submitted for verification!' : 'Task status updated!');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const pendingTasks = tasks.filter(t => t.status === 'CREATED');
  const inProgressTasks = tasks.filter(t => t.status === 'ASSIGNED');
  const verificationTasks = tasks.filter(t => t.status === 'PENDING_VERIFICATION');
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED');

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Loading your tasks...</div>;

  return (
    <div className="min-h-screen pb-20 md:pb-8">
      <div className="p-6 md:p-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl text-gray-900 mb-2">My Tasks</h1>
          <p className="text-gray-600">Track and manage your accepted tasks</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Pending', value: pendingTasks.length, color: 'gray' },
            { label: 'In Progress', value: inProgressTasks.length, color: 'blue' },
            { label: 'Reviewing', value: verificationTasks.length, color: 'orange' },
            { label: 'Completed', value: completedTasks.length, color: 'green' },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm relative overflow-hidden group">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 relative z-10">{stat.label}</p>
              <p className="text-2xl font-black text-gray-900 relative z-10">{stat.value}</p>
              <div className={`absolute bottom-0 left-0 w-full h-1 bg-${stat.color}-400/20`} />
            </motion.div>
          ))}
        </div>

        <div className="space-y-6">
          {/* In Progress */}
          {inProgressTasks.length > 0 && (
            <div>
              <h2 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2 uppercase tracking-widest">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                Active Assignments
              </h2>
              <div className="space-y-4">
                {inProgressTasks.map((task, index) => (
                  <motion.div key={task._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-black text-gray-900 tracking-tight">{task.title}</h3>
                          <span className={`w-3 h-3 rounded-full ${getUrgencyColor(task.urgency)} shadow-lg shadow-current/20`} />
                        </div>
                        <div className="flex items-center text-sm font-bold text-gray-500 mb-2">
                          <MapPin className="w-4 h-4 mr-1 text-blue-500" />
                          {task.recipientId?.city || 'Unknown location'}
                        </div>
                        {task.dueDate && (
                          <div className="flex items-center text-xs font-medium text-gray-400">
                            <Clock className="w-3.5 h-3.5 mr-1" />
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter border ${getStatusColor(task.status)}`}>In Progress</span>
                    </div>

                    {task.aiMatchReason && (
                      <div className="text-xs font-bold text-blue-800 mb-4 p-3 bg-blue-50 rounded-xl border border-blue-100 flex gap-2">
                         <span className="opacity-50">🤖</span>
                         {task.aiMatchReason}
                      </div>
                    )}

                    <button
                      onClick={() => handleStatusChange(task._id, 'completed')}
                      className="w-full py-3.5 bg-[#1E3A8A] text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-[#1E3A8A]/90 transition-all shadow-xl shadow-blue-900/10 active:scale-95 flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Mark as Completed
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Verification */}
          {verificationTasks.length > 0 && (
            <div>
              <h2 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2 uppercase tracking-widest">
                <Shield className="w-4 h-4 text-orange-500" />
                Submitted for Review
              </h2>
              <div className="space-y-4">
                {verificationTasks.map((task, index) => (
                  <motion.div key={task._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
                    className="bg-orange-50/30 rounded-2xl p-6 border border-orange-100 italic">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-black text-gray-400 tracking-tight">{task.title}</h3>
                          <Clock className="w-4 h-4 text-orange-400 animate-spin-slow" />
                        </div>
                        <p className="text-xs font-bold text-orange-700/60">Waiting for Admin to cross-verify this case...</p>
                      </div>
                      <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter border ${getStatusColor(task.status)}`}>Under Review</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Pending */}
          {pendingTasks.length > 0 && (
            <div>
              <h2 className="text-lg text-gray-900 mb-4">Pending</h2>
              <div className="space-y-4">
                {pendingTasks.map((task, index) => (
                  <motion.div key={task._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl p-6 border border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg text-gray-900">{task.title}</h3>
                          <span className={`w-3 h-3 rounded-full ${getUrgencyColor(task.urgency)}`} />
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-1" />
                          {task.recipientId?.city || 'Unknown location'}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-lg text-xs border ${getStatusColor(task.status)}`}>Pending</span>
                    </div>
                    <button
                      onClick={() => handleStatusChange(task._id, 'in-progress')}
                      className="w-full px-4 py-2 bg-[#1E3A8A] text-white rounded-lg hover:bg-[#1E3A8A]/90 transition-colors"
                    >
                      Start Task
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Completed */}
          {completedTasks.length > 0 && (
            <div>
              <h2 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Completed
              </h2>
              <div className="space-y-4">
                {completedTasks.map((task, index) => (
                  <motion.div key={task._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl p-6 border border-gray-200 opacity-75">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg text-gray-900">{task.title}</h3>
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-1" />
                          {task.recipientId?.city || 'Unknown location'}
                        </div>
                        {task.completedAt && (
                          <div className="flex items-center text-sm text-gray-600 mt-1">
                            <Clock className="w-4 h-4 mr-1" />
                            Completed: {new Date(task.completedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-lg text-xs border ${getStatusColor(task.status)}`}>Completed</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {tasks.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
              <p className="text-gray-500 text-lg mb-2">No tasks assigned yet</p>
              <p className="text-gray-400 text-sm">Check Available Tasks to accept new assignments</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
