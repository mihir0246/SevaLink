import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend, LineChart, Line, AreaChart, Area 
} from 'recharts';
import { FileDown, Calendar, Filter, Download, TrendingUp, Users, Activity, CheckCircle, Loader2, ChevronDown } from 'lucide-react';
import { reportsAPI } from '../services/api';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { toast } from 'sonner';

const COLORS = ['#1E3A8A', '#14B8A6', '#F97316', '#8B5CF6', '#6B7280', '#EC4899'];

const RANGES = [
  { id: 'all', label: 'All Time' },
  { id: '1day', label: 'Last 24 Hours' },
  { id: '2days', label: 'Last 48 Hours' },
  { id: 'week', label: 'Last Week' },
  { id: 'month', label: 'Last Month' },
  { id: 'year', label: 'Last Year' },
];

export default function Reports() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [timeRange, setTimeRange] = useState<string>('all');

  useEffect(() => {
    fetchStats();
  }, [timeRange]);

  const fetchStats = () => {
    setLoading(true);
    reportsAPI.getSummary({ timeRange })
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch reports:', err);
        toast.error('Could not refresh data');
        setLoading(false);
      });
  };

  const handleExportCSV = () => {
    if (!data) return;

    try {
      // Build CSV content
      let csv = 'Category,Value,Label\n';
      
      // Status
      if(data.needsByStatus) data.needsByStatus.forEach((s: any) => csv += `Status,${s.value},${s.name}\n`);
      // Urgency
      if(data.needsByUrgency) data.needsByUrgency.forEach((s: any) => csv += `Urgency,${s.value},${s.name}\n`);
      // Area
      if(data.areaImpact) data.areaImpact.forEach((s: any) => csv += `Area,${s.count},${s.area}\n`);
      
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `SevaLink_Impact_Report_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('CSV Exported Successfully');
    } catch (err) {
      console.error('CSV Export Error:', err);
      toast.error('Failed to export CSV');
    }
  };

  const handleGenerateAIPDF = async () => {
    if (!data) return;
    setPdfLoading(true);

    try {
      const aiRes = await reportsAPI.getAISummary();
      const aiSummary = aiRes.data.summary;

      const doc = new jsPDF() as any;
      
      // Header
      doc.setFillColor(30, 58, 138); // #1E3A8A
      doc.rect(0, 0, 210, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.text('SevaLink Strategic Report', 15, 25);
      doc.setFontSize(10);
      doc.text(`Confidential | ${new Date().toLocaleDateString()} | AI-Powered Analysis`, 15, 33);

      // AI Summary Section
      doc.setTextColor(30, 58, 138);
      doc.setFontSize(16);
      doc.text('Strategic Executive Summary', 15, 55);
      
      doc.setTextColor(60, 60, 60);
      doc.setFontSize(11);
      const splitText = doc.splitTextToSize(aiSummary, 180);
      doc.text(splitText, 15, 65);

      const nextY = 65 + (splitText.length * 5) + 15;

      // Data Tables
      doc.setTextColor(30, 58, 138);
      doc.setFontSize(16);
      doc.text('Key Performance Indicators', 15, nextY);

      // Key Metrics Table
      doc.autoTable({
        startY: nextY + 5,
        head: [['Metric', 'Value']],
        body: [
          ['Total Volunteers', data.volunteerSummary?.total || 0],
          ['Active Field Units', data.volunteerSummary?.active || 0],
          ['Impact Regions', data.areaImpact?.length || 0],
          ['Successfully Resolved', data.needsByStatus?.find((s: any) => s.name === 'completed')?.value || 0],
        ],
        theme: 'striped',
        headStyles: { fillColor: [30, 58, 138] }
      });

      // Urgency Table
      if (data.needsByUrgency && data.needsByUrgency.length > 0) {
        doc.autoTable({
          startY: doc.lastAutoTable.finalY + 15,
          head: [['Priority Level', 'Reported Needs']],
          body: data.needsByUrgency.map((u: any) => [u.name ? u.name.toUpperCase() : 'UNKNOWN', u.value || 0]),
          theme: 'grid',
          headStyles: { fillColor: [20, 184, 166] }
        });
      }

      doc.save(`SevaLink_AI_Insights_${Date.now()}.pdf`);
      toast.success('AI Report Generated');
    } catch (err: any) {
      console.error('PDF Generation failed:', err);
      const msg = err.response?.data?.msg || err.message || 'AI Generation Error';
      toast.error(msg);
    } finally {
      setPdfLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-[#1E3A8A] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 md:pb-8 bg-gray-50/50">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Impact Reports</h1>
            <p className="text-gray-600 font-medium">Measuring community aid and volunteer efficiency</p>
          </motion.div>
          
          <div className="flex items-center gap-3">
            <div className="relative group">
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="appearance-none pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 transition-all cursor-pointer shadow-sm"
              >
                {RANGES.map(r => (
                  <option key={r.id} value={r.id}>{r.label}</option>
                ))}
              </select>
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none transition-transform group-hover:translate-y-[calc(-50%+1px)]" />
            </div>

            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm active:scale-95"
            >
              <FileDown className="w-4 h-4 text-emerald-600" />
              Export CSV
            </button>
          </div>
        </div>

        {/* High Level Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {(() => {
            const resolved = data?.needsByStatus?.find((s: any) => s.name === 'completed')?.value || 0;
            const total = data?.needsByStatus?.reduce((acc: number, curr: any) => acc + curr.value, 0) || 0;
            const rate = total > 0 ? Math.round((resolved / total) * 100) : 0;

            return [
              { label: 'Total Volunteers', value: data?.volunteerSummary?.total || 0, sub: 'Registered users', color: 'blue', icon: Users },
              { label: 'Active Field Units', value: data?.volunteerSummary?.active || 0, sub: 'Live participation', color: 'teal', icon: Activity },
              { label: 'Needs Resolved', value: resolved, sub: 'Success cases', color: 'orange', icon: CheckCircle },
              { label: 'Resolution Rate', value: `${rate}%`, sub: 'Avg vs total', color: 'purple', icon: TrendingUp },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-${stat.color}-50 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-1 font-semibold">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold text-gray-900 tracking-tight">{stat.value}</h3>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.sub}</span>
                </div>
                {/* Highlight bar */}
                <div className={`absolute bottom-0 left-0 w-full h-1 bg-${stat.color}-500/10`} />
              </motion.div>
            ));
          })()}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Main Trend Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#1E3A8A]" />
              Fulfillment Trend Analysis
            </h3>
            <div className="h-[300px]">
              {data?.trends ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.trends}>
                    <defs>
                      <linearGradient id="colorNeeds" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1E3A8A" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#1E3A8A" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend verticalAlign="top" align="right" height={36} iconType="circle" />
                    <Area type="monotone" dataKey="needs" name="New Needs" stroke="#1E3A8A" strokeWidth={3} fillOpacity={1} fill="url(#colorNeeds)" />
                    <Area type="monotone" dataKey="fulfilled" name="Fulfilled" stroke="#14B8A6" strokeWidth={3} fillOpacity={0} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm italic font-medium">Generating trend insights...</div>
              )}
            </div>
          </motion.div>

          {/* Urgency breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-6">Priority Distribution</h3>
            <div className="h-[300px]">
              {data?.needsByUrgency ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.needsByUrgency}
                      cx="50%"
                      cy="45%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {data?.needsByUrgency?.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={['#EF4444', '#F97316', '#14B8A6', '#1E3A8A'][index % 4]} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend verticalAlign="bottom" height={40} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm italic font-medium">Categorizing needs...</div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Bottom Panel - Area Impact */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-6 underline decoration-[#1E3A8A]/10 decoration-4 underline-offset-8">Geographical Impact Analysis</h3>
            <div className="h-[300px]">
              {data?.areaImpact ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.areaImpact} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="area" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#1E293B', fontWeight: 600 }} width={120} />
                    <Tooltip cursor={{ fill: '#F8FAFC' }} />
                    <Bar dataKey="count" fill="#1E3A8A" radius={[0, 8, 8, 0]} barSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm italic font-medium">Mapping regional data...</div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#1E3A8A] p-8 rounded-[2rem] text-white flex flex-col justify-center relative overflow-hidden shadow-2xl shadow-blue-900/40 ring-4 ring-white"
          >
            <div className="relative z-10">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
                <Download className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-black mb-3 leading-tight">Generate AI Intelligence</h2>
              <p className="text-blue-100 text-sm mb-8 leading-relaxed font-medium">
                Draft a semantic performance review using Gemini 1.5 Flash. Includes bottleneck analysis and regional demand forecasting.
              </p>
              <button 
                onClick={handleGenerateAIPDF}
                disabled={pdfLoading}
                className="w-full py-4.5 bg-white text-[#1E3A8A] rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group active:scale-[0.98] shadow-xl text-lg"
              >
                {pdfLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Activity className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                )}
                {pdfLoading ? 'Analyzing...' : 'Generate AI PDF'}
              </button>
            </div>
            {/* Abstract Background Design */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl opacity-40 animate-pulse" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-[#14B8A6]/20 rounded-full blur-3xl opacity-40" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
