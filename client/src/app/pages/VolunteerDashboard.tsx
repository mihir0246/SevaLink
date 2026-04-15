import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Star, Award, Clock, TrendingUp, Calendar } from 'lucide-react';
import { volunteersAPI, actionsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const StatCard = ({ label, value, icon: Icon }: any) => (
  <motion.div whileHover={{ y: -4 }} className="bg-white rounded-xl p-4 border border-gray-200">
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs text-gray-600">{label}</span>
      <Icon className="w-4 h-4 text-[#1E3A8A]" />
    </div>
    <p className="text-2xl text-gray-900">{value ?? '--'}</p>
  </motion.div>
);

const getDynamicBadges = (stats: any) => {
  const badges = [];
  const completed = stats?.actionsCompleted || 0;
  const rating = stats?.rating || 0;
  const hours = stats?.hoursContributed || 0;

  if (completed >= 1) badges.push({ name: 'First Mission', icon: '🚀', earned: stats?.joinedDate || new Date() });
  if (completed >= 5) badges.push({ name: 'Reliable Aid', icon: '🤝', earned: new Date() });
  if (completed >= 20) badges.push({ name: 'Local Hero', icon: '🦸', earned: new Date() });
  if (rating >= 4.8) badges.push({ name: 'Top Rated', icon: '⭐', earned: new Date() });
  if (hours >= 10) badges.push({ name: 'Dedicated', icon: '⏱️', earned: new Date() });

  // Minimal baseline for new users
  if (badges.length === 0) {
    badges.push({ name: 'Novice', icon: '🌱', earned: stats?.joinedDate || new Date() });
  }

  return badges;
};

const AVAILABILITY = [
  { day: 'Monday', slots: ['9AM-12PM', '2PM-5PM'] },
  { day: 'Wednesday', slots: ['10AM-1PM'] },
  { day: 'Friday', slots: ['3PM-7PM'] },
  { day: 'Saturday', slots: ['9AM-5PM'] },
];

export default function VolunteerDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [myActions, setMyActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    volunteersAPI.getMe()
      .then(res => {
        setProfile(res.data);
      })
      .catch(() => {
        setProfile(user);
      });

    actionsAPI.getAll({ status: 'ASSIGNED', volunteerId: user._id || user.id })
      .then(res => setMyActions(res.data.slice(0, 5)))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ASSIGNED': return 'bg-[#14B8A6] text-white';
      case 'COMPLETED': return 'bg-green-500 text-white';
      default: return 'bg-gray-200 text-gray-700';
    }
  };

  const getUrgencyBorder = (urgency: string) => {
    switch (urgency) {
      case 'high': case 'critical': return 'border-[#F97316]';
      case 'medium': return 'border-[#14B8A6]';
      default: return 'border-gray-300';
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Loading profile...</div>;

  const name = profile ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim() : 'Volunteer';
  const email = profile?.email || '';
  const avatar = name.split(' ').map((n: string) => n[0] || '').join('').toUpperCase() || 'V';
  const skills: string[] = profile?.skills || [];
  const totalTasks = profile?.actionsCompleted || 0;
  const hours = profile?.hoursContributed || 0;
  const rating = profile?.rating || 5.0;
  const impactScore = totalTasks * 26;

  return (
    <div className="min-h-screen pb-20 md:pb-8">
      <div className="p-6 md:p-8">
        {/* Profile Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#1E3A8A] to-[#14B8A6] flex items-center justify-center text-white text-3xl">
              {avatar}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl text-gray-900 mb-2">{name}</h1>
              <p className="text-gray-600 mb-4">{email}</p>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill: string) => (
                  <span key={skill} className="px-3 py-1 bg-[#1E3A8A]/10 text-[#1E3A8A] rounded-full text-sm">{skill}</span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Star className="w-5 h-5 text-[#F97316] fill-[#F97316] mr-1" />
                  <span className="text-2xl text-gray-900">{rating}</span>
                </div>
                <p className="text-xs text-gray-600">Rating</p>
              </div>
              <div className="text-center">
                <p className="text-2xl text-gray-900 mb-1">{impactScore}</p>
                <p className="text-xs text-gray-600">Impact Score</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Tasks" value={totalTasks} icon={Award} />
          <StatCard label="Hours Contributed" value={hours} icon={Clock} />
          <StatCard label="Active Tasks" value={myActions.length} icon={TrendingUp} />
          <StatCard label="Available Hours" value={profile?.availableHours ?? 10} icon={Calendar} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Assigned Tasks from DB */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl p-6 border border-gray-200">
              <h2 className="text-xl text-gray-900 mb-6">Assigned Tasks</h2>
              <div className="space-y-4">
                {myActions.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-8">No tasks assigned yet</p>
                )}
                {myActions.map(task => (
                  <motion.div key={task._id} whileHover={{ x: 4 }}
                    className={`p-4 rounded-xl border-l-4 bg-gray-50 ${getUrgencyBorder(task.urgency)}`}>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-sm text-gray-900 flex-1">{task.title}</h3>
                      <span className={`px-2 py-1 rounded-md text-xs ${getStatusColor(task.status)}`}>
                        {task.status === 'ASSIGNED' ? 'In Progress' : task.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      {task.recipientId ? `→ ${task.recipientId.firstName} ${task.recipientId.lastName} (${task.recipientId.city})` : task.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Availability */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-6 border border-gray-200">
              <h2 className="text-xl text-gray-900 mb-6">Availability</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {AVAILABILITY.map(day => (
                  <div key={day.day} className="p-4 bg-gray-50 rounded-xl">
                    <h3 className="text-sm text-gray-900 mb-2">{day.day}</h3>
                    <div className="space-y-1">
                      {day.slots.map(slot => (
                        <div key={slot} className="px-2 py-1 bg-[#1E3A8A]/10 text-[#1E3A8A] rounded text-xs">{slot}</div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column — Badges */}
          <div>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl p-6 border border-gray-200 sticky top-8">
              <h2 className="text-xl text-gray-900 mb-6">Achievements</h2>
              <div className="grid grid-cols-2 gap-4">
                {getDynamicBadges(profile).map(badge => (
                  <motion.div key={badge.name} whileHover={{ scale: 1.05 }}
                    className="bg-gradient-to-br from-[#1E3A8A] to-[#14B8A6] rounded-xl p-4 text-white">
                    <div className="text-3xl mb-2">{badge.icon}</div>
                    <h4 className="text-sm font-bold mb-1">{badge.name}</h4>
                    <p className="text-[10px] text-white/80 uppercase font-black">UNLOCKED</p>
                  </motion.div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-gradient-to-r from-[#F97316]/10 to-[#14B8A6]/10 rounded-xl">
                <h3 className="text-sm text-gray-900 mb-2">Next Milestone</h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-600">50 Tasks</span>
                  <span className="text-xs text-gray-600">{totalTasks}/50</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((totalTasks / 50) * 100, 100)}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="bg-gradient-to-r from-[#F97316] to-[#14B8A6] h-2 rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
