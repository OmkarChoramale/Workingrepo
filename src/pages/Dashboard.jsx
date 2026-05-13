import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Users, Wallet, ShieldCheck, Clock, TrendingUp, Loader2, FileSearch, Bell, Activity, Zap, CheckCircle, AlertTriangle, BarChart2, PieChart, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, RadialBarChart, RadialBar, PieChart as RechartsPie, Pie, Cell, Tooltip, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { dashboardApi, notificationApi, siteApi, eventApi, programApi } from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const COLORS = ['#FF6D00', '#1A237E', '#00C49F', '#FFBB28', '#a855f7', '#ec4899'];

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

const metricColor = (key) => {
  const k = key.toLowerCase();
  if (k.includes('violation') || k.includes('fail')) return { bg: 'from-rose-500 to-red-600', glow: 'shadow-rose-400/30' };
  if (k.includes('budget')) return { bg: 'from-emerald-500 to-teal-600', glow: 'shadow-emerald-400/30' };
  if (k.includes('site')) return { bg: 'from-orange-500 to-amber-600', glow: 'shadow-orange-400/30' };
  if (k.includes('event')) return { bg: 'from-purple-500 to-violet-600', glow: 'shadow-purple-400/30' };
  if (k.includes('booking')) return { bg: 'from-cyan-500 to-sky-600', glow: 'shadow-cyan-400/30' };
  if (k.includes('program')) return { bg: 'from-indigo-500 to-blue-600', glow: 'shadow-indigo-400/30' };
  if (k.includes('user') || k.includes('tourist')) return { bg: 'from-pink-500 to-rose-500', glow: 'shadow-pink-400/30' };
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

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const CATEGORY_ICON = {
  SYSTEM_CREATE: '⭐',
  TRANSACTIONAL: '💳',
  SYSTEM_UPDATE: '🔄',
  ACTION_REQUIRED: '⚠️',
  COMPLIANCE: '🛡️',
  ANNOUNCEMENT: '📢',
  SYSTEM: '🔔',
};

const CATEGORY_COLOR = {
  SYSTEM_CREATE: 'bg-emerald-600',
  TRANSACTIONAL: 'bg-blue-600',
  SYSTEM_UPDATE: 'bg-amber-500',
  ACTION_REQUIRED: 'bg-rose-600',
  COMPLIANCE: 'bg-violet-600',
  ANNOUNCEMENT: 'bg-sky-600',
  SYSTEM: 'bg-indigo-600',
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Real-time data for charts
  const [siteStatusData, setSiteStatusData] = useState([]);
  const [recentNotifs, setRecentNotifs] = useState([]);

  // Pull unread count from global context
  const { unreadCount } = useNotifications();

  useEffect(() => {
    (async () => {
      try {
        const [dashRes, notifRes, siteRes] = await Promise.allSettled([
          dashboardApi.getStats(),
          notificationApi.getAll(),
          siteApi.getAll(),
        ]);

        if (dashRes.status === 'fulfilled') setData(dashRes.value.data);

        if (notifRes.status === 'fulfilled') {
          const notifs = notifRes.value.data || [];
          setRecentNotifs(notifs.slice(0, 8));
        }

        if (siteRes.status === 'fulfilled') {
          const sites = siteRes.value.data || [];
          // Build real site status distribution
          const statusCount = sites.reduce((acc, s) => {
            const st = s.status || 'UNKNOWN';
            acc[st] = (acc[st] || 0) + 1;
            return acc;
          }, {});
          setSiteStatusData(Object.entries(statusCount).map(([name, value]) => ({ name, value })));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
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

  // Build radial data from real metrics
  const radialData = [
    { name: 'Sites', value: Math.min(100, ((data?.metrics?.totalHeritageSites || data?.metrics?.totalSites || 0) / 30) * 100), fill: '#FF6D00' },
    { name: 'Events', value: Math.min(100, ((data?.metrics?.activeEvents || data?.metrics?.totalEvents || 0) / 10) * 100), fill: '#1A237E' },
    { name: 'Programs', value: Math.min(100, ((data?.metrics?.activePrograms || data?.metrics?.totalPrograms || 0) / 10) * 100), fill: '#00C49F' },
  ].filter(d => d.value > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f4ff] via-[#fafbff] to-[#fff8f0] text-[#1A237E] font-sans flex flex-col">
      <Navbar />
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
                <p className="text-2xl font-black text-white">{unreadCount}</p>
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
          {/* OVERVIEW TAB — Real metrics from API */}
          {activeTab === 'overview' && (
            <motion.div key="ov" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              {metrics.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-10">
                  {metrics.map(([key, value], i) => (
                    <StatCard key={key} index={i} label={key} value={value} icon={metricIcon(key)} colorObj={metricColor(key)} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-12 text-center shadow-xl mb-10">
                  <AlertTriangle size={48} className="text-amber-400 mx-auto mb-4" />
                  <p className="font-black text-slate-400 uppercase text-xs tracking-widest">Backend unavailable — metrics pending sync</p>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Notifications feed */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-xl border border-slate-50">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-black text-[#1A237E] text-sm uppercase tracking-tight">Recent Notifications</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Live System Feed</p>
                    </div>
                    <Bell size={20} className="text-[#FF6D00]" />
                  </div>
                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {recentNotifs.length > 0 ? recentNotifs.slice(0, 6).map((n, i) => (
                      <motion.div key={n.notificationId || i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-4 py-3 px-3 border-b border-slate-50 last:border-0 hover:bg-slate-50/60 rounded-2xl transition-all">
                        <div className={`w-9 h-9 rounded-xl ${CATEGORY_COLOR[n.category] || 'bg-slate-400'} flex items-center justify-center text-white text-sm flex-shrink-0`}>
                          {CATEGORY_ICON[n.category] || '🔔'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-700 truncate">{n.subject}</p>
                          <p className="text-[10px] text-slate-400 truncate">{n.message}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{formatTime(n.createdDate)}</span>
                          {n.status === 'UNREAD' && <div className="w-2 h-2 bg-[#FF6D00] rounded-full ml-auto mt-1 animate-pulse" />}
                        </div>
                      </motion.div>
                    )) : (
                      <div className="text-center py-10 text-slate-300">
                        <Bell size={32} className="mx-auto mb-2 opacity-40" />
                        <p className="text-[10px] font-black uppercase tracking-widest">No notifications yet</p>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Real Site Status Distribution */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                  className="bg-white rounded-3xl p-6 shadow-xl border border-slate-50">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-black text-[#1A237E] text-sm uppercase tracking-tight">Site Status</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Distribution</p>
                    </div>
                    <PieChart size={20} className="text-[#FF6D00]" />
                  </div>
                  {siteStatusData.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={160}>
                        <RechartsPie>
                          <Pie data={siteStatusData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                            {siteStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: '12px', fontSize: 11 }} />
                        </RechartsPie>
                      </ResponsiveContainer>
                      <div className="space-y-2 mt-2">
                        {siteStatusData.map((item, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                              <span className="text-[10px] font-bold text-slate-500">{item.name}</span>
                            </div>
                            <span className="text-[10px] font-black text-[#1A237E]">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12 text-slate-300">
                      <MapPin size={32} className="mx-auto mb-2 opacity-40" />
                      <p className="text-[10px] font-black uppercase tracking-widest">No site data</p>
                    </div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* ANALYTICS TAB */}
          {activeTab === 'analytics' && (
            <motion.div key="an" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* KPI Cards from real data */}
              {[
                { label: 'Heritage Sites', value: data?.metrics?.totalHeritageSites ?? data?.metrics?.totalSites ?? '—', trend: 5, up: true },
                { label: 'Total Events', value: data?.metrics?.totalEvents ?? data?.metrics?.activeEvents ?? '—', trend: 8, up: true },
                { label: 'Total Users', value: data?.metrics?.totalUsers ?? '—', trend: 3, up: true },
                { label: 'Unread Alerts', value: unreadCount, trend: unreadCount, up: false },
              ].map((kpi, i) => (
                <motion.div key={i} whileHover={{ scale: 1.02 }} className="bg-white rounded-3xl p-6 shadow-xl border border-slate-50 flex items-center gap-6">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
                    <p className="text-4xl font-black text-[#1A237E]">{kpi.value}</p>
                  </div>
                  <div className="ml-auto text-right">
                    {kpi.up ? <ArrowUpRight className="text-emerald-500 ml-auto" size={28} /> : <ArrowDownRight className="text-rose-500 ml-auto" size={28} />}
                    <p className={`text-xs font-black ${kpi.up ? 'text-emerald-500' : 'text-rose-500'}`}>Live</p>
                  </div>
                </motion.div>
              ))}

              {/* Site Status Pie — full size */}
              <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-50 lg:col-span-1">
                <h3 className="font-black text-[#1A237E] text-sm uppercase tracking-tight mb-1">Heritage Site Status</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4">Real-time from SiteService</p>
                {siteStatusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={siteStatusData} barSize={32}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: 11 }} />
                      <Bar dataKey="value" name="Sites" radius={[8, 8, 0, 0]}>
                        {siteStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-48 text-slate-200 font-black uppercase text-xs tracking-widest">No site data available</div>
                )}
              </div>

              {/* Radial performance */}
              <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-50 lg:col-span-1">
                <h3 className="font-black text-[#1A237E] text-sm uppercase tracking-tight mb-1">System Capacity</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4">Sites / Events / Programs</p>
                {radialData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="90%" data={radialData} startAngle={90} endAngle={-270}>
                      <RadialBar minAngle={15} dataKey="value" clockWise background={{ fill: '#f8fafc' }} />
                      <Tooltip contentStyle={{ borderRadius: '12px', fontSize: 11 }} />
                      <Legend iconSize={10} wrapperStyle={{ fontSize: 10 }} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-48 text-slate-200 font-black uppercase text-xs tracking-widest">Insufficient data</div>
                )}
              </div>
            </motion.div>
          )}

          {/* ACTIVITY TAB — Real notifications */}
          {activeTab === 'activity' && (
            <motion.div key="ac" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-50">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-black text-[#1A237E] text-sm uppercase tracking-tight">Live System Events</h3>
                  <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">● Real Data</span>
                </div>
                {recentNotifs.length > 0 ? (
                  <div className="space-y-1">
                    {recentNotifs.map((n, i) => (
                      <motion.div key={n.notificationId || i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                        className="flex items-center gap-5 py-4 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 rounded-2xl px-2 transition-all">
                        <div className={`w-9 h-9 rounded-xl ${CATEGORY_COLOR[n.category] || 'bg-slate-400'} flex items-center justify-center text-white text-sm flex-shrink-0`}>
                          {CATEGORY_ICON[n.category] || '🔔'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-700 truncate">{n.subject}</p>
                          <p className="text-[10px] text-slate-400 truncate">{n.message}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest whitespace-nowrap">{formatTime(n.createdDate)}</span>
                          {n.status === 'UNREAD' && (
                            <span className="block text-[8px] font-black text-[#FF6D00] uppercase mt-0.5">Unread</span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <Bell size={48} className="mx-auto text-slate-200 mb-4" />
                    <p className="font-black text-slate-300 uppercase text-xs tracking-widest">No system events yet</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}