import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, AlertCircle, Users, CheckCircle } from 'lucide-react';
import { actionsAPI, recipientsAPI, reportsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CATEGORY_COLORS: Record<string, string> = {
  Food: '#F97316', Medical: '#14B8A6', Shelter: '#1E3A8A', Education: '#8B5CF6', Other: '#6B7280'
};

const StatCard = ({ title, value, change, icon: Icon, trend }: any) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -4 }}
    className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-gray-300 transition-all">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-600 mb-1">{title}</p>
        <p className="text-3xl text-gray-900 mb-2">{typeof value === 'number' ? value.toLocaleString() : value}</p>
        {change && (
          <div className={`flex items-center text-sm ${trend === 'up' ? 'text-[#14B8A6]' : 'text-[#F97316]'}`}>
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>{change}</span>
          </div>
        )}
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${title.includes('Urgent') ? 'bg-[#F97316]/10' : 'bg-[#1E3A8A]/10'}`}>
        <Icon className={`w-6 h-6 ${title.includes('Urgent') ? 'text-[#F97316]' : 'text-[#1E3A8A]'}`} />
      </div>
    </div>
  </motion.div>
);

const ActivityItem = ({ activity }: any) => {
  const getColor = (urgency: string) => {
    switch (urgency) { case 'high': case 'critical': return 'bg-[#F97316]'; case 'medium': return 'bg-[#14B8A6]'; default: return 'bg-gray-400'; }
  };
  const vol = activity.volunteerId;
  const rec = activity.recipientId;
  const msg = vol && rec
    ? `${vol.firstName} ${vol.lastName} assigned to ${activity.title}`
    : activity.title;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className={`w-2 h-2 rounded-full mt-2 ${getColor(activity.urgency)}`} />
      <div className="flex-1">
        <p className="text-sm text-gray-900">{msg}</p>
        <p className="text-xs text-gray-500 mt-1">{new Date(activity._createdAt || activity.assignedAt).toLocaleString()}</p>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalActions: 0, created: 0, assigned: 0, completed: 0, urgent: 0, activeVolunteers: 0, needsByCategory: [] as any[] });
  const [recipientStats, setRecipientStats] = useState({ total: 0, pending: 0 });
  const [recentActions, setRecentActions] = useState<any[]>([]);
  const [needsByArea, setNeedsByArea] = useState<any[]>([]);
  const [liveTrends, setLiveTrends] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(user?.role === 'admin');

    actionsAPI.getStats().then(res => setStats(res.data)).catch(() => {});
    recipientsAPI.getStats().then(res => setRecipientStats(res.data)).catch(() => {});
    actionsAPI.getAll().then(res => {
      setRecentActions(res.data.slice(0, 5));
    }).catch(() => {});
    recipientsAPI.getAll().then(res => {
      const areaCounts: Record<string, number> = {};
      res.data.forEach((r: any) => {
        const area = r.city || 'Unknown';
        areaCounts[area] = (areaCounts[area] || 0) + 1;
      });
      setNeedsByArea(Object.entries(areaCounts).map(([area, count]) => ({ area, count })));
    }).catch(() => {});

    if (user?.role === 'admin') {
      reportsAPI.getSummary().then(res => setLiveTrends(res.data.trends || [])).catch(() => {});
    }
  }, [user]);

  const categoryData = stats.needsByCategory.length
    ? stats.needsByCategory.map((c: any) => ({ ...c, fill: CATEGORY_COLORS[c.name] || '#6B7280' }))
    : [{ name: 'No data', value: 1, fill: '#E5E7EB' }];

  return (
    <div className="min-h-screen pb-20 md:pb-8">
      <div className="p-6 md:p-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Track impact and manage community needs</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Needs" value={recipientStats.total} change="+from last month" trend="up" icon={AlertCircle} />
          <StatCard title="Urgent Tasks" value={stats.urgent} change="Requires attention" trend="down" icon={AlertCircle} />
          <StatCard title="Active Volunteers" value={stats.activeVolunteers} change="Available now" trend="up" icon={Users} />
          <StatCard title="Completed Tasks" value={stats.completed} change="Actions fulfilled" trend="up" icon={CheckCircle} />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 border border-gray-200">
            <h3 className="text-lg text-gray-900 mb-6">Needs by Area</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={needsByArea.length ? needsByArea : [{ area: 'No data', count: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="area" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px' }} />
                <Bar dataKey="count" fill="#1E3A8A" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 border border-gray-200">
            <h3 className="text-lg text-gray-900 mb-6">Needs by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" labelLine={false} label={(e) => e.name}
                  outerRadius={100} dataKey="value">
                  {categoryData.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px' }} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Trends — live from DB via Reports API */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 border border-gray-200 mb-8">
          <h3 className="text-lg text-gray-900 mb-6">Trends Over Time</h3>
          {isAdmin ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={liveTrends.length ? liveTrends : [{ month: 'No data', needs: 0, fulfilled: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px' }} />
                <Legend />
                <Line type="monotone" dataKey="needs" stroke="#F97316" strokeWidth={3} dot={{ fill: '#F97316', r: 4 }} />
                <Line type="monotone" dataKey="fulfilled" stroke="#14B8A6" strokeWidth={3} dot={{ fill: '#14B8A6', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-500">Trends are available only for admin users.</p>
          )}
        </motion.div>

        {/* Recent Activity */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="text-lg text-gray-900 mb-6">Recent Activity</h3>
          <div className="space-y-2">
            {recentActions.length > 0
              ? recentActions.map(a => <ActivityItem key={a._id} activity={a} />)
              : <p className="text-sm text-gray-500 text-center py-8">No recent activity. Run AI matchmaking to create assignments.</p>
            }
          </div>
        </motion.div>
      </div>
    </div>
  );
}
