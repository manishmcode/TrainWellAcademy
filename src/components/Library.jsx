import { request, post } from '../services/api';
import { API_ROOT } from '../config/apiBase';
import { safeUrl } from '../services/urls';
import { ArrowUpRight, BookOpen, CalendarDays, Play, Radio, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { company } from '../company';
import { courses } from '../data';
import Footer from './Footer';
import Header from './Header';

export default function Library() {
 const [view,setView]=useState('library'),[activeTrackId,setActiveTrackId]=useState(''),[categoryQuery,setCategoryQuery]=useState('');
 const [rows,setRows]=useState([]),[liveClasses,setLiveClasses]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[joining,setJoining]=useState(null),[joinUrl,setJoinUrl]=useState('');
 async function load(){setLoading(true);setError('');try{const [library,classes]=await Promise.all([request('/library'),request('/classes')]);if(!Array.isArray(library)||!Array.isArray(classes))throw new Error('Invalid library response.');setRows(library);setLiveClasses(classes);}catch(e){setError(e.message);}finally{setLoading(false);}}
 useEffect(()=>{load();},[]);
 const tracks=rows.map(row=>({id:row.title,name:row.title,count:row.cards.length}));
 const activeTrack=tracks.find(t=>t.id===activeTrackId)||tracks[0]||{name:'Library'};
 const filteredTracks=tracks.filter(t=>t.name.toLowerCase().includes(categoryQuery.toLowerCase()));
 const modules=(rows.find(row=>row.title===activeTrack.name)?.cards||[]).map((card,index)=>({...card,id:index}));
 async function join(session){setJoining(session.id);setError('');setJoinUrl('');try{const data=await post('/classes/'+session.id+'/join');if(!data.join_path?.startsWith('/classes/'))throw new Error('Invalid class join link.');setJoinUrl(API_ROOT+data.join_path);}catch(e){setError(e.message);}finally{setJoining(null);}}
  return (
    <div className="min-h-screen bg-cream text-ink">
      <Header />
      <main className="library-page shell py-8 md:py-12">{loading && <p role="status">Loading your library...</p>}{error && <p role="alert" className="my-4 bg-white p-4">{error} <button onClick={load}>Retry</button></p>}{joinUrl && <p role="status" className="my-4 bg-white p-4"><a className="btn" href={joinUrl} target="_blank" rel="noopener noreferrer">Open live class</a> Join links expire after one minute.</p>}{!loading && !rows.length && view === "library" && <p className="my-4">No content is available for your plan yet.</p>}
        <div className="inline-flex rounded-full border border-ink/10 bg-white p-1.5 shadow-[0_10px_30px_rgba(23,27,25,0.07)]">
          <button onClick={() => setView('library')} className={`flex items-center gap-2 rounded-full px-5 py-3 text-xs font-bold tracking-[.04em] transition sm:px-7 ${view === 'library' ? 'bg-ink text-cream' : 'text-ink/50 hover:text-ink'}`}><BookOpen size={15} className={view === 'library' ? 'text-coral' : ''} />COURSE LIBRARY</button>
          <button onClick={() => setView('live')} className={`flex items-center gap-2 rounded-full px-5 py-3 text-xs font-bold tracking-[.04em] transition sm:px-7 ${view === 'live' ? 'bg-ink text-cream' : 'text-ink/50 hover:text-ink'}`}><Radio size={15} className={view === 'live' ? 'text-coral' : ''} />LIVE CLASSES</button>
        </div>

        {view === 'library' ? (
          <div className="library-browser-layout mt-8 items-start gap-7">
            <aside className="rounded-3xl border border-ink/10 bg-white p-4 shadow-[0_14px_40px_rgba(23,27,25,0.06)] lg:sticky lg:top-[102px]">
              <div className="flex items-center justify-between px-2 pb-4 pt-1"><h2 className="text-xs font-bold tracking-[.14em]">CATEGORIES</h2><span className="rounded-full bg-cream px-2.5 py-1 text-[10px] font-bold text-ink/50">{tracks.length}</span></div>
              <label className="flex h-11 items-center gap-2 rounded-xl border border-ink/10 bg-cream px-3 focus-within:border-coral">
                <Search size={15} className="shrink-0 text-ink/35" /><input aria-label="Filter categories" value={categoryQuery} onChange={(event) => setCategoryQuery(event.target.value)} className="min-w-0 w-full bg-transparent text-xs outline-none placeholder:text-ink/35" placeholder="Filter categories..." />
              </label>
              <nav className="mt-2 space-y-1" aria-label="Program categories">
                {filteredTracks.map((track) => (
                  <button key={track.id} onClick={() => setActiveTrackId(track.id)} className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3.5 text-left text-xs font-bold transition ${activeTrack.id === track.id ? 'bg-ink text-cream shadow-[0_8px_20px_rgba(23,27,25,0.16)]' : 'text-ink/65 hover:bg-cream hover:text-ink'}`}>
                    <span className="leading-5">{track.name}</span><span className={`grid min-w-7 place-items-center rounded-full px-2 py-1 text-[9px] ${activeTrack.id === track.id ? 'bg-cream/15 text-cream' : 'bg-cream text-ink/45'}`}>{track.count}</span>
                  </button>
                ))}
              </nav>
              {filteredTracks.length === 0 && <p className="px-3 py-8 text-center text-xs text-ink/40">No categories found.</p>}
            </aside>

            <div className="min-w-0">
                <section className="library-module-grid gap-5" aria-label={`${activeTrack.name} modules`}>
                  {modules.map((module, index) => (
                    <article key={module.id} className="group overflow-hidden rounded-2xl border border-ink/10 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(23,27,25,0.1)]">
                      <a href={safeUrl(module.link)} target="_blank" rel="noopener noreferrer" className="relative block h-40 overflow-hidden bg-ink"><img className="opacity-90 transition duration-500 group-hover:scale-105" src={module.image} alt="" loading="lazy" /><span className="absolute left-3 top-3 rounded-full bg-ink/80 px-2.5 py-1.5 text-[9px] font-bold tracking-[.08em] text-cream backdrop-blur">MODULE {String(index + 1).padStart(2, '0')}</span><span className="absolute inset-0 grid place-items-center opacity-0 transition group-hover:opacity-100"><i className="grid size-12 place-items-center rounded-full bg-coral text-ink not-italic"><Play size={15} fill="currentColor" /></i></span></a>
                      <div className="flex min-h-[164px] flex-col p-5">
                        <div className="flex items-center gap-2 text-[10px] font-bold tracking-[.08em] text-coral"><Play size={11} fill="currentColor" />RESOURCE <span className="text-ink/30">•</span><span className="text-ink/40">{module.length}</span></div>
                        <h2 className="mt-3 text-sm font-bold leading-6">{module.title}</h2>
                        <a href={safeUrl(module.link)} target="_blank" rel="noopener noreferrer" className="mt-auto flex items-center justify-between border-t border-ink/10 pt-4 text-[10px] font-bold text-ink/50 transition hover:text-coral">OPEN RESOURCE <span className="grid size-8 place-items-center rounded-full bg-cream text-coral"><ArrowUpRight size={14} /></span></a>
                      </div>
                    </article>
                  ))}
                </section>
            </div>
          </div>
        ) : (
          <section className="mt-8 rounded-3xl border border-ink/10 bg-white p-6 shadow-[0_14px_40px_rgba(23,27,25,0.06)] md:p-8">
            <div className="flex flex-col justify-between gap-4 border-b border-ink/10 pb-6 sm:flex-row sm:items-end"><div><span className="text-xs font-bold tracking-[.12em] text-coral">TRAIN TOGETHER</span><h1 className="mt-2 text-3xl font-bold">Upcoming live classes</h1><p className="mt-2 text-sm text-ink/45">Real-time sessions with {company.siteName} coaches.</p></div><CalendarDays className="text-coral" size={32} /></div>
            <div className="mt-6 grid gap-5 md:grid-cols-3">{!loading && !liveClasses.length && <p>No live classes are available for your plan yet.</p>}{liveClasses.map((session, index) => {const ended=new Date(session.end_date)<=new Date(),upcoming=new Date(session.class_date)>new Date();return <article key={session.id} className="overflow-hidden rounded-2xl border border-ink/10"><div className="h-44"><img src={session.image || courses[index % courses.length]?.image} alt="" /></div><div className="p-5"><span className="text-[10px] font-bold tracking-[.1em] text-coral">{new Date(session.class_date).toLocaleString()}</span><h2 className="mt-2 font-bold">{session.name}</h2><p className="mt-2 text-xs text-ink/45">Ends: {new Date(session.end_date).toLocaleString()} ({session.timezone})</p><button className="mt-5 flex w-full items-center justify-between border-t border-ink/10 pt-4 text-[10px] font-bold" disabled={ended||upcoming||joining!==null} onClick={()=>join(session)}>{ended?'Class ended':upcoming?'Not started':joining===session.id?'Preparing...':'Join class'}<ArrowUpRight size={14}/></button></div></article>;})}</div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
