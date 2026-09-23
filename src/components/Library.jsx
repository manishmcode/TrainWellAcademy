import { request } from '../services/api';
import { safeUrl } from '../services/urls';
import { ArrowUpRight, BookOpen, LoaderCircle, Play, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import Footer from './Footer';
import Header from './Header';

const categoryOrder = [
  'Gymless Ab Toner',
  'Pilates Training',
  'Ultimate Home Workout Plan',
  'Kettlebell Training',
];

const libraryAssetVersion = '1222XZX';
const withLibraryAssetVersion = (url) => {
  if (!url || url.includes(libraryAssetVersion)) return url;
  return `${url}${url.includes('?') ? '&' : '?'}${libraryAssetVersion}`;
};

export default function Library() {
 const [activeTrackId,setActiveTrackId]=useState(''),[categoryQuery,setCategoryQuery]=useState('');
 const [rows,setRows]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState('');
 async function load(){setLoading(true);setError('');try{const library=await request('/library');if(!Array.isArray(library))throw new Error('Invalid library response.');setRows(library);}catch(e){setError(e.message);}finally{setLoading(false);}}
 function selectTrack(trackId){setActiveTrackId(trackId);window.scrollTo({top:0,behavior:'smooth'});}
 useEffect(()=>{load();},[]);
 const tracks=rows.map(row=>({id:row.title,name:row.title,count:row.cards.length})).sort((a,b)=>{
  const aRank = categoryOrder.indexOf(a.name);
  const bRank = categoryOrder.indexOf(b.name);
  if (aRank !== -1 || bRank !== -1) return (aRank === -1 ? categoryOrder.length : aRank) - (bRank === -1 ? categoryOrder.length : bRank);
  if (a.name === 'Fat Loss & Fitness Program') return 1;
  if (b.name === 'Fat Loss & Fitness Program') return -1;
  return 0;
 });
 const activeTrack=tracks.find(t=>t.id===activeTrackId)||tracks[0]||{name:'Library'};
 const filteredTracks=tracks.filter(t=>t.name.toLowerCase().includes(categoryQuery.toLowerCase()));
 const modules=(rows.find(row=>row.title===activeTrack.name)?.cards||[]).map((card,index)=>({
  ...card,
  id:index,
  image:withLibraryAssetVersion(card.image),
  link:withLibraryAssetVersion(card.link),
 }));
  return (
    <div className="min-h-screen bg-cream text-ink">
      <Header />
      <main className="library-page shell py-8 md:py-12">{error && <p role="alert" className="my-4 bg-white p-4">{error} <button onClick={load}>Retry</button></p>}{!loading && !rows.length && <p className="my-4">No content is available for your plan yet.</p>}
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-2 rounded-full border border-ink/10 bg-ink px-5 py-3 text-xs font-bold tracking-[.04em] text-cream shadow-[0_10px_30px_rgba(23,27,25,0.07)] sm:px-7"><BookOpen size={15} className="text-coral" />COURSE LIBRARY</span>
          <h1 className="font-display text-2xl uppercase tracking-[.04em] text-ink sm:text-3xl">{activeTrack.name}</h1>
        </div>

        <div className="library-browser-layout mt-8 items-start gap-7">
            <aside className="rounded-3xl border border-ink/10 bg-white p-4 shadow-[0_14px_40px_rgba(23,27,25,0.06)] lg:sticky lg:top-[102px]">
              <div className="flex items-center justify-between px-2 pb-4 pt-1"><h2 className="text-xs font-bold tracking-[.14em]">CATEGORIES</h2><span className="rounded-full bg-cream px-2.5 py-1 text-[10px] font-bold text-ink/50">{tracks.length}</span></div>
              <label className="flex h-11 items-center gap-2 rounded-xl border border-ink/10 bg-cream px-3 focus-within:border-coral">
                <Search size={15} className="shrink-0 text-ink/35" /><input aria-label="Filter categories" value={categoryQuery} onChange={(event) => setCategoryQuery(event.target.value)} className="min-w-0 w-full bg-transparent text-xs outline-none placeholder:text-ink/35" placeholder="Filter categories..." />
              </label>
              <nav className="mt-2 space-y-1" aria-label="Program categories">
                {filteredTracks.map((track) => (
                  <button key={track.id} onClick={() => selectTrack(track.id)} className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3.5 text-left text-xs font-bold transition ${activeTrack.id === track.id ? 'bg-ink text-cream shadow-[0_8px_20px_rgba(23,27,25,0.16)]' : 'text-ink/65 hover:bg-cream hover:text-ink'}`}>
                    <span className="leading-5">{track.name}</span><span className={`grid min-w-7 place-items-center rounded-full px-2 py-1 text-[9px] ${activeTrack.id === track.id ? 'bg-cream/15 text-cream' : 'bg-cream text-ink/45'}`}>{track.count}</span>
                  </button>
                ))}
              </nav>
              {!loading && filteredTracks.length === 0 && <p className="px-3 py-8 text-center text-xs text-ink/40">No categories found.</p>}
            </aside>

            <div className="min-w-0">
                {loading ? <div role="status" aria-label="Loading library" className="grid min-h-[300px] place-items-center gap-3 text-sm font-bold text-ink/50"><LoaderCircle size={30} className="animate-spin text-coral" /><span>Loading library...</span></div> : <section className="library-module-grid gap-5" aria-label={`${activeTrack.name} modules`}>
                  {modules.map((module, index) => (
                    <article key={module.id} className="group overflow-hidden rounded-2xl border border-ink/10 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(23,27,25,0.1)]">
                      <a href={safeUrl(module.link)} target="_blank" rel="noopener noreferrer" className="relative block aspect-video overflow-hidden bg-cream"><img className="object-contain opacity-90 transition duration-500 group-hover:scale-105" src={module.image} alt="" loading="lazy" /><span className="absolute left-3 top-3 rounded-full bg-ink/80 px-2.5 py-1.5 text-[9px] font-bold tracking-[.08em] text-cream backdrop-blur">MODULE {String(index + 1).padStart(2, '0')}</span><span className="absolute inset-0 grid place-items-center opacity-0 transition group-hover:opacity-100"><i className="grid size-12 place-items-center rounded-full bg-coral text-ink not-italic"><Play size={15} fill="currentColor" /></i></span></a>
                      <div className="flex min-h-[164px] flex-col p-5">
                        <div className="flex items-center gap-2 text-[10px] font-bold tracking-[.08em] text-coral"><Play size={11} fill="currentColor" />RESOURCE <span className="text-ink/30">•</span><span className="text-ink/40">{module.length}</span></div>
                        <h2 className="mt-3 text-sm font-bold leading-6">{module.title}</h2>
                        <a href={safeUrl(module.link)} target="_blank" rel="noopener noreferrer" className="mt-auto flex items-center justify-between border-t border-ink/10 pt-4 text-[10px] font-bold text-ink/50 transition hover:text-coral">OPEN RESOURCE <span className="grid size-8 place-items-center rounded-full bg-cream text-coral"><ArrowUpRight size={14} /></span></a>
                      </div>
                    </article>
                  ))}
                </section>}
            </div>
          </div>
      </main>
      <Footer />
    </div>
  );
}
