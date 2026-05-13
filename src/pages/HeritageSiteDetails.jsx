import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, MapPin } from 'lucide-react';
import { siteService } from '../services/heritageService';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PreservationLedger from '../components/PreservationLedger';

export default function HeritageSiteDetails() {
    const { siteId } = useParams();
    const [site, setSite] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchDetails = async () => {
        try {
            const res = await siteService.getById(siteId);
            setSite(res.data);
        } catch (err) {
            console.error("Site Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDetails(); }, [siteId]);

    if (loading || !site) return (
        <div className="h-screen bg-[#FFFDF7] flex items-center justify-center font-black uppercase tracking-[0.5em] text-[#FF6D00]">
            <Loader2 className="animate-spin mr-4" /> Loading Site Data...
        </div>
    );

    const statusColor = site.status === 'OPEN' ? 'bg-emerald-500' :
        site.status === 'CLOSED_FOR_MAINTENANCE' ? 'bg-amber-500' : 'bg-rose-500';

    return (
        <div className="min-h-screen bg-[#FFFDF7] pb-20">
            <Navbar />
            <main className="max-w-6xl mx-auto px-8 pt-44">
                <div className="bg-white rounded-[4rem] p-10 md:p-20 shadow-3xl border border-white mb-10">
                    <header className="mb-12 border-b border-slate-50 pb-12">
                        <div className="flex items-center gap-3 mb-6">
                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm text-white ${statusColor}`}>
                                {site.status?.replace(/_/g, ' ')}
                            </span>
                            <span className="text-slate-300 font-bold text-[10px] uppercase tracking-widest">Site #{site.siteId}</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-[#1A237E]">{site.name}</h1>
                        <p className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-xs mt-6">
                            <MapPin size={14} className="text-[#FF6D00]" /> {site.location}
                        </p>
                        <p className="text-slate-500 font-medium text-lg mt-8 leading-relaxed max-w-3xl">{site.description}</p>
                    </header>

                    <PreservationLedger 
                        siteId={site.siteId} 
                        activities={site.preservationActivities} 
                        onUpdate={fetchDetails} 
                        siteStatus={site.status} 
                    />
                </div>
            </main>
            <Footer />
        </div>
    );
}