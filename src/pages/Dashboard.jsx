import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Users, Wallet, ShieldCheck, Clock, TrendingUp, Loader2, FileSearch, Bell, Activity, Zap, CheckCircle, AlertTriangle, BarChart2, PieChart, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, RadialBarChart, RadialBar, PieChart as RechartsPie, Pie, Cell, Tooltip, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { dashboardApi, notificationApi } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const COLORS = ['#FF6D00', '#1A237E', '#00C49F', '#FFBB28', '#a855f7', '#ec4899'];
const MONTHLY = [
  { m: 'Jan', bookings: 40, events: 24, visitors: 120 },
  { m: 'Feb', bookings: 55, events: 30, visitors: 180 },
  { m: 'Mar', bookings: 35, events: 18, visitors: 140 },
  { m: 'Apr', bookings: 70, events: 42, visitors: 220 },
  { m: 'May', bookings: 62, events: 36, visitors: 200 },
  { m: 'Jun', bookings: 90, events: 50, visitors: 310 },
];
const SITE_STATUS = [{ name: 'Active', value: 60 }, { name: 'Maintenance', value: 25 }, { name: 'Inactive', value: 15 }];
const RADIAL_DATA = [{ name: 'Compliance', value: 85, fill: '#00C49F' }, { name: 'Bookings', value: 70, fill: '#FF6D00' }, { name: 'Events', value: 92, fill: '#1A237E' }];

const metricIcon = (key) => {
  const k = key.toLowerCase();
  if (k.includes('site')) return <MapPin size={22} />;
  if (k.includes('event')) return <Calendar size={22} />;
  if (k.includes('budget')) return <Wallet size={22} />;
  if (k.includes('user')) return <Users size={22} />;
  if (k.includes('compliance') || k.includes('violation')) return <ShieldCheck size={22} />;
  if (k.includes('audit')) return <FileSearch size={22} />;
  if (k.includes('pending') || k.includes('upcoming')) return <Clock size={22} />;
  if (k.includes('booking')) return <CheckCircle size={22} />;
  if (k.includes('program')) return <Activity size={22} />;
  return <TrendingUp size={22} />;
};

const metricColor = (key, role) => {
  const k = key.toLowerCase();
  if (k.includes('violation') || k.includes('fail')) return { bg: 'from-rose-500 to-red-600', glow: 'shadow-rose-400/30' };
  if (k.includes('budget')) return { bg: 'from-emerald-500 to-teal-600', glow: 'shadow-emerald-400/30' };
  if (k.includes('site')) return { bg: 'from-orange-500 to-amber-600', glow: 'shadow-orange-400/30' };
  if (k.includes('event')) return { bg: 'from-purple-500 to-violet-600', glow: 'shadow-purple-400/30' };
  if (k.includes('booking')) return { bg: 'from-cyan-500 to-sky-600', glow: 'shadow-cyan-400/30' };
  if (role === 'ADMIN' || role === 'MANAGER') return { bg: 'from-indigo-600 to-blue-700', glow: 'shadow-indigo-400/30' };
  return { bg: 'from-[#FF6D00] to-orange-600', glow: 'shadow-orange-400/30' };
};

const StatCard = ({ label, value, icon, colorObj, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.08, type: 'spring', stiffness: 200 }}
    whileHover={{ y: -6, scale: 1.02 }}
    className={`relative bg-white rounded-3xl p-6 shadow-xl ${colorObj.glow} border border-white/60 overflow-hidden group cursor-pointer`}
  >
    <div className={`absolute -top-8 -right-8 w-32 h-32 rounded-full bg-gradient-to-br ${colorObj.bg} opacity-10 group-hover:opacity-20 transition-all duration-500 blur-2xl`} />
    <div className="relative">
      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colorObj.bg} flex items-center justify-center text-white shadow-lg mb-4`}>{icon}</div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label.replace(/([A-Z])/g, ' $1').trim()}</p>
      <p className="text-3xl font-black text-[#1A237E] tracking-tight">{value}</p>
    </div>
    <div className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r ${colorObj.bg} opacity-60`} />
  </motion.div>
);

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [latestNotif, setLatestNotif] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    (async () => {
      try {
        const [dashRes, notifRes] = await Promise.allSettled([dashboardApi.getStats(), notificationApi.getUnread()]);
        if (dashRes.status === 'fulfilled') setData(dashRes.value.data);
        if (notifRes.status === 'fulfilled' && notifRes.value.data?.length > 0) setLatestNotif(notifRes.value.data[0]);
      } catch (e) { console.error(e); } finally { setLoading(false); }
    })();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0a0e2e] to-[#1A237E]">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
        className="w-16 h-16 border-4 border-white/20 border-t-[#FF6D00] rounded-full mb-6" />
      <p className="text-white font-black uppercase text-xs tracking-[0.4em] animate-pulse">Synchronizing Intelligence...</p>
    </div>
  );

  const metrics = data?.metrics ? Object.entries(data.metrics) : [];
  const role = data?.role || localStorage.getItem('role') || 'TOURIST';
  const userName = data?.userName || localStorage.getItem('name') || 'User';
  const unread = data?.unreadNotifications || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f4ff] via-[#fafbff] to-[#fff8f0] text-[#1A237E] font-sans flex flex-col">
      <Navbar unreadNotifications={unread} latestNotification={latestNotif} />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 pt-28 pb-20">

        {/* Hero Banner */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="relative mb-10 rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#1A237E] via-[#283593] to-[#FF6D00] opacity-90" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1600&auto=format&fit=crop&q=60')] bg-cover bg-center mix-blend-overlay opacity-20" />
          <motion.div animate={{ x: [0, 30, 0], y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
            className="absolute top-6 right-20 w-40 h-40 rounded-full bg-white/10 blur-3xl" />
          <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-[#FF6D00] text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest animate-pulse">● Live</span>
                <span className="text-white/60 text-[9px] font-black uppercase tracking-[0.3em]">{role} Clearance</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none">
                Welcome,<br /><span className="text-[#FF6D00]">{userName}.</span>
              </h1>
              <p className="text-white/60 mt-3 font-medium text-sm">Your operational intelligence hub — real-time system metrics.</p>
            </div>
            <div className="flex gap-3">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center">
                <Bell size={20} className="text-[#FF6D00] mx-auto mb-1" />
                <p className="text-2xl font-black text-white">{unread}</p>
                <p className="text-[9px] text-white/50 uppercase tracking-widest">Alerts</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center">
                <Activity size={20} className="text-emerald-400 mx-auto mb-1" />
                <p className="text-2xl font-black text-white">{metrics.length}</p>
                <p className="text-[9px] text-white/50 uppercase tracking-widest">Metrics</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 w-fit">
          {['overview', 'analytics', 'activity'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === tab ? 'bg-[#1A237E] text-white shadow-lg shadow-indigo-300/30' : 'text-slate-400 hover:text-[#1A237E]'}`}>
              {tab}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div key="ov" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              {metrics.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-10">
                  {metrics.map(([key, value], i) => (
                    <StatCard key={key} index={i} label={key} value={value} icon={metricIcon(key)} colorObj={metricColor(key, role)} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-12 text-center shadow-xl mb-10">
                  <AlertTriangle size={48} className="text-amber-400 mx-auto mb-4" />
                  <p className="font-black text-slate-400 uppercase text-xs tracking-widest">Backend unavailable — metrics pending sync</p>
                </div>
              )}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-xl border border-slate-50">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-black text-[#1A237E] text-sm uppercase tracking-tight">Activity Overview</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Monthly Trend</p>
                    </div>
                    <BarChart2 size={20} className="text-[#FF6D00]" />
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={MONTHLY}>
                      <defs>
                        <linearGradient id="bg1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#FF6D00" stopOpacity={0.3}/><stop offset="95%" stopColor="#FF6D00" stopOpacity={0}/></linearGradient>
                        <linearGradient id="bg2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#1A237E" stopOpacity={0.3}/><stop offset="95%" stopColor="#1A237E" stopOpacity={0}/></linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="m" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', fontSize: 11 }} />
                      <Area type="monotone" dataKey="bookings" stroke="#FF6D00" strokeWidth={2} fill="url(#bg1)" name="Bookings" />
                      <Area type="monotone" dataKey="events" stroke="#1A237E" strokeWidth={2} fill="url(#bg2)" name="Events" />
                    </AreaChart>
                  </ResponsiveContainer>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                  className="bg-white rounded-3xl p-6 shadow-xl border border-slate-50">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-black text-[#1A237E] text-sm uppercase tracking-tight">Site Status</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Distribution</p>
                    </div>
                    <PieChart size={20} className="text-[#FF6D00]" />
                  </div>
                  <ResponsiveContainer width="100%" height={160}>
                    <RechartsPie>
                      <Pie data={SITE_STATUS} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                        {SITE_STATUS.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '12px', fontSize: 11 }} />
                    </RechartsPie>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-2">
                    {SITE_STATUS.map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i] }} />
                          <span className="text-[10px] font-bold text-slate-500">{item.name}</span>
                        </div>
                        <span className="text-[10px] font-black text-[#1A237E]">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div key="an" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-50">
                <h3 className="font-black text-[#1A237E] text-sm uppercase tracking-tight mb-1">Monthly Visitors</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6">Heritage Site Traffic</p>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={MONTHLY} barSize={22}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="m" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: 11 }} />
                    <Bar dataKey="visitors" name="Visitors" radius={[8, 8, 0, 0]}>
                      {MONTHLY.map((_, i) => <Cell key={i} fill={i % 2 === 0 ? '#FF6D00' : '#1A237E'} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-50">
                <h3 className="font-black text-[#1A237E] text-sm uppercase tracking-tight mb-1">Performance Scores</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4">System Health</p>
                <ResponsiveContainer width="100%" height={220}>
                  <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="90%" data={RADIAL_DATA} startAngle={90} endAngle={-270}>
                    <RadialBar minAngle={15} dataKey="value" clockWise background={{ fill: '#f8fafc' }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', fontSize: 11 }} />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: 10 }} />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
              {[
                { label: 'Site Activity Rate', value: data?.metrics?.siteActivityPct || '—', trend: 12 },
                { label: 'Active Events', value: data?.metrics?.activeEvents ?? '—', trend: 5 },
                { label: 'Total Bookings', value: data?.metrics?.totalBookings ?? '—', trend: -3 },
                { label: 'Unread Alerts', value: unread, trend: unread > 0 ? -1 : 0 },
              ].map((kpi, i) => (
                <motion.div key={i} whileHover={{ scale: 1.02 }} className="bg-white rounded-3xl p-6 shadow-xl border border-slate-50 flex items-center gap-6">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
                    <p className="text-3xl font-black text-[#1A237E]">{kpi.value}</p>
                  </div>
                  <div className="ml-auto text-right">
                    {kpi.trend >= 0 ? <ArrowUpRight className="text-emerald-500 ml-auto" size={28} /> : <ArrowDownRight className="text-rose-500 ml-auto" size={28} />}
                    <p className={`text-xs font-black ${kpi.trend >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{Math.abs(kpi.trend)}%</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'activity' && (
            <motion.div key="ac" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-50">
                <h3 className="font-black text-[#1A237E] text-sm uppercase tracking-tight mb-6">Recent System Events</h3>
                {[
                  { icon: '⭐', color: 'bg-amber-500', text: 'New Heritage Site registered: Hampi North', time: '2m ago' },
                  { icon: '👤', color: 'bg-blue-600', text: 'Tourist #4821 booked Ajanta Caves event', time: '15m ago' },
                  { icon: '✅', color: 'bg-emerald-600', text: 'Compliance audit completed for Site #12', time: '1h ago' },
                  { icon: '🔔', color: 'bg-[#FF6D00]', text: 'Broadcast notification sent to all users', time: '2h ago' },
                  { icon: '📊', color: 'bg-purple-600', text: 'Monthly report SITE generated', time: '3h ago' },
                  { icon: '🌐', color: 'bg-teal-600', text: 'Program "Heritage Trail 2026" activated', time: '5h ago' },
                ].map((ev, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                    className="flex items-center gap-5 py-4 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 rounded-2xl px-2 transition-all">
                    <div className={`w-9 h-9 rounded-xl ${ev.color} flex items-center justify-center text-white text-sm flex-shrink-0`}>{ev.icon}</div>
                    <p className="text-sm font-semibold text-slate-600 flex-1">{ev.text}</p>
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest whitespace-nowrap">{ev.time}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}