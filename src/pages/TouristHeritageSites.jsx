import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Info, Loader2, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { siteService } from '../services/heritageService';
import { dashboardApi, notificationApi } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function TouristHeritageSites() {
    const [sites, setSites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [unreadCount, setUnreadCount] = useState(0);
    const [latestNotif, setLatestNotif] = useState(null);

    const fetchAll = async () => {
        try {
            const siteRes = await siteService.getAll();
            // Safety: Ensure data is an array
            setSites(Array.isArray(siteRes.data) ? siteRes.data : []);

            const dashRes = await dashboardApi.getStats();
            setUnreadCount(dashRes.data.unreadNotifications);
            
            const notifRes = await notificationApi.getUnread();
            if (notifRes.data?.length > 0) setLatestNotif(notifRes.data[0]);
        } catch (err) {
            console.error("Ledger Sync Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAll(); }, []);

    const filtered = sites.filter(s => 
        (s.name?.toLowerCase().includes(searchTerm.toLowerCase())) || 
        (s.location?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-[#FFFDF7]">
            <Loader2 className="animate-spin text-[#FF6D00] mb-4" size={48} />
            <p className="font-black uppercase tracking-widest text-[#1A237E]">Accessing National Archives...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#FFFDF7]">
            <Navbar 
                unreadNotifications={unreadCount} 
                latestNotification={latestNotif}
                userName={localStorage.getItem('name')} 
                userRole={localStorage.getItem('role')}
            />
            
            <main className="max-w-7xl mx-auto px-8 pt-44 pb-20">
                <header className="mb-16">
                    <span className="text-[10px] font-black text-[#FF6D00] uppercase tracking-[0.5em] mb-4 block">National Registry</span>
                    <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-10 text-[#1A237E]">Site <br/>Inventory.</h1>
                    <div className="max-w-xl relative">
                        <input type="text" placeholder="Locate node..." className="w-full bg-white shadow-2xl rounded-full px-10 py-5 text-sm font-bold outline-none border-2 border-transparent focus:border-[#FF6D00] transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                    </div>
                </header>

                {filtered.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {filtered.map((site, i) => (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} key={site.siteId} className="group bg-white rounded-[3rem] overflow-hidden shadow-xl border border-white hover:shadow-2xl transition-all">
                                <div className="h-64 relative bg-slate-100">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                    <span className="absolute top-6 right-6 bg-[#FF6D00] text-white text-[8px] font-black px-3 py-1.5 rounded-full uppercase shadow-lg">{site.status}</span>
                                    <div className="absolute bottom-6 left-6 text-white">
                                        <p className="flex items-center gap-1 text-[9px] font-black uppercase opacity-70"><MapPin size={10} className="text-[#FF6D00]"/> {site.location}</p>
                                        <h3 className="text-2xl font-black uppercase tracking-tighter mt-1">{site.name}</h3>
                                    </div>
                                </div>
                                <div className="p-8 flex justify-between items-center">
                                    <p className="text-xs font-medium text-slate-400 line-clamp-1">{site.description}</p>
                                    <Link to={`/tourist/sites/${site.siteId}`} className="bg-[#F8F9FF] p-3 rounded-2xl text-[#1A237E] hover:bg-[#FF6D00] hover:text-white transition-all"><Info size={18}/></Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="py-24 text-center bg-white rounded-[4rem] border-2 border-dashed border-slate-100">
                        <ShieldAlert size={48} className="mx-auto text-slate-200 mb-4" />
                        <p className="text-slate-400 font-black uppercase text-xs tracking-widest">No matching heritage logs found. Check your database.</p>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}