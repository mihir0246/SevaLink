import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Star, MapPin, Award, Clock, TrendingUp, CheckCircle, Sparkles } from 'lucide-react';
import { matchmakingAPI, volunteersAPI } from '../services/api';
import { toast } from 'sonner';

const VolunteerCard = ({ volunteer, onAssign }: any) => {
  const [isAssigning, setIsAssigning] = useState(false);

  const handleAssign = async () => {
    setIsAssigning(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    onAssign(volunteer);
    setIsAssigning(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-[#1E3A8A] transition-all"
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#1E3A8A] to-[#14B8A6] flex items-center justify-center text-white text-lg flex-shrink-0">
          {volunteer.name ? volunteer.name.split(' ').map((n: string) => n[0]).join('') : volunteer.avatar}
        </div>
        <div className="flex-1">
          <h3 className="text-lg text-gray-900 mb-1">{volunteer.name || `${volunteer.firstName} ${volunteer.lastName}`}</h3>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <div className="flex items-center">
              <Star className="w-4 h-4 text-[#F97316] fill-[#F97316] mr-1" />
              {volunteer.rating}
            </div>
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              {volunteer.distance || volunteer.city || 'Nearby'}
            </div>
          </div>
        </div>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-4 border-[#14B8A6] flex items-center justify-center mb-1">
            <span className="text-xl text-[#14B8A6]">{volunteer.matchScore || volunteer.aiMatchScore || '--'}%</span>
          </div>
          <p className="text-xs text-gray-600">Match</p>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-xs text-gray-600 mb-2">Skills</p>
        <div className="flex flex-wrap gap-2">
          {(volunteer.skills || []).map((skill: string) => (
            <span key={skill} className="px-2 py-1 bg-[#1E3A8A]/10 text-[#1E3A8A] rounded-md text-xs">
              {skill}
            </span>
          ))}
        </div>
      </div>

      {volunteer.reason && (
        <p className="text-xs text-gray-500 italic mb-3 bg-gray-50 rounded-lg px-3 py-2">
          🤖 "{volunteer.reason}"
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div className="flex items-center text-gray-600">
          <Award className="w-4 h-4 mr-2" />
          {volunteer.totalTasks || volunteer.actionsCompleted || 0} tasks
        </div>
        <div className="flex items-center text-gray-600">
          <Clock className="w-4 h-4 mr-2" />
          {volunteer.availableHours || volunteer.hoursContributed || 0}h
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleAssign}
        disabled={isAssigning}
        className={`w-full py-2.5 rounded-xl text-sm transition-all ${
          isAssigning ? 'bg-green-500 text-white' : 'bg-[#1E3A8A] text-white hover:bg-[#1E3A8A]/90'
        }`}
      >
        {isAssigning ? (
          <span className="flex items-center justify-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            Assigned!
          </span>
        ) : 'Assign Volunteer'}
      </motion.button>
    </motion.div>
  );
};

export default function Matchmaking() {
  const [selectedTask] = useState('Food Distribution - North District');
  const [sortBy, setSortBy] = useState('match');
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiRunning, setAiRunning] = useState(false);

  // Load all volunteers on mount
  useEffect(() => {
    volunteersAPI.getAll().then(res => setVolunteers(res.data)).catch(() => {});
  }, []);

  // Run Gemini AI batch assignment
  const handleAIAssign = async () => {
    setAiRunning(true);
    try {
      const res = await matchmakingAPI.assign();
      const { plan, actions, message } = res.data;
      toast.success(message || 'AI matchmaking complete!', {
        description: `${plan.numberOfCasesCreated} volunteer actions created`,
        duration: 5000,
      });
      // Refresh volunteers list to show updated counts
      const refreshed = await volunteersAPI.getAll();
      setVolunteers(refreshed.data);
    } catch (err: any) {
      toast.error('Matchmaking failed', {
        description: err.response?.data?.msg || 'Please ensure you are logged in as admin',
      });
    } finally {
      setAiRunning(false);
    }
  };

  const handleAssign = (volunteer: any) => {
    toast.success(`${volunteer.firstName || volunteer.name} has been assigned!`, {
      description: 'They will be notified immediately.',
      duration: 3000,
    });
  };

  const sortedVolunteers = [...volunteers].sort((a, b) => {
    switch (sortBy) {
      case 'match': return (b.matchScore || b.aiMatchScore || 0) - (a.matchScore || a.aiMatchScore || 0);
      case 'rating': return b.rating - a.rating;
      case 'tasks': return (b.actionsCompleted || 0) - (a.actionsCompleted || 0);
      default: return 0;
    }
  });

  return (
    <div className="min-h-screen pb-20 md:pb-8">
      <div className="p-6 md:p-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl text-gray-900 mb-2">Volunteer Matching</h1>
            <p className="text-gray-600">Find the best volunteers for your tasks</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAIAssign}
            disabled={aiRunning}
            className="flex items-center gap-2 bg-gradient-to-r from-[#1E3A8A] to-[#14B8A6] text-white px-6 py-3 rounded-xl text-sm disabled:opacity-60"
          >
            <Sparkles className="w-4 h-4" />
            {aiRunning ? 'Gemini AI Running...' : 'Run AI Auto-Assign'}
          </motion.button>
        </motion.div>

        {/* Task Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#1E3A8A] to-[#14B8A6] rounded-2xl p-6 text-white mb-8"
        >
          <h2 className="text-xl mb-2">Selected Task</h2>
          <p className="text-lg mb-4">{selectedTask}</p>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center"><MapPin className="w-4 h-4 mr-2" />North District</div>
            <div className="flex items-center"><Clock className="w-4 h-4 mr-2" />Due: Apr 12, 2026</div>
            <div className="px-3 py-1 bg-white/20 rounded-full">High Priority</div>
          </div>
        </motion.div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1E3A8A]"
            >
              <option value="match">Best Match</option>
              <option value="rating">Highest Rating</option>
              <option value="tasks">Most Experience</option>
            </select>
          </div>
          <div className="text-sm text-gray-600">Showing {sortedVolunteers.length} available volunteers</div>
        </div>

        {/* Volunteer Grid */}
        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading volunteers...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedVolunteers.map((volunteer, index) => (
              <motion.div key={volunteer._id || volunteer.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                <VolunteerCard volunteer={volunteer} onAssign={handleAssign} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
            <TrendingUp className="w-6 h-6 text-[#14B8A6] mx-auto mb-2" />
            <p className="text-2xl text-gray-900 mb-1">{volunteers.length}</p>
            <p className="text-xs text-gray-600">Available</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
            <Star className="w-6 h-6 text-[#F97316] mx-auto mb-2" />
            <p className="text-2xl text-gray-900 mb-1">
              {volunteers.length ? (volunteers.reduce((s, v) => s + (v.rating || 0), 0) / volunteers.length).toFixed(1) : '--'}
            </p>
            <p className="text-xs text-gray-600">Avg Rating</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
            <Award className="w-6 h-6 text-[#1E3A8A] mx-auto mb-2" />
            <p className="text-2xl text-gray-900 mb-1">
              {volunteers.reduce((s, v) => s + (v.actionsCompleted || 0), 0)}
            </p>
            <p className="text-xs text-gray-600">Total Tasks Done</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
            <Sparkles className="w-6 h-6 text-[#14B8A6] mx-auto mb-2" />
            <p className="text-2xl text-gray-900 mb-1">AI</p>
            <p className="text-xs text-gray-600">Gemini Powered</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
