import { useEffect, lazy, Suspense } from 'react';
import { getToken, getUser } from './services/auth';
import { fetchDashboard, hasActivePlan } from './services/account';
import Page, { Notice } from './components/Page';
import AdminLiveClasses from './components/AdminLiveClasses';
import{useState}from'react';import{company}from'./company';import Header from'./components/Header';import Hero from'./components/Hero';import Courses from'./components/Courses';import Coaching from'./components/Coaching';import About from'./components/About';import Footer from'./components/Footer';import VideoModal from'./components/VideoModal';import Unsubscribe from'./components/Unsubscribe';import Pricing from'./components/Pricing';import Login from'./components/Login';import Signup from'./components/Signup';import Imprint from'./components/Imprint';import Library from'./components/Library';import Terms from'./components/Terms';import Privacy from'./components/Privacy';import Profile from'./components/Profile';
const Checkout = lazy(() => import('./components/Checkout'));
function Home(){const[video,setVideo]=useState(false),[sent,setSent]=useState(false);function submit(e){e.preventDefault();window.location.assign('/signup?email='+encodeURIComponent(new FormData(e.currentTarget).get('email')))}return <><Header/><main><Hero play={()=>setVideo(true)}/><Courses play={()=>setVideo(true)}/><Coaching play={()=>setVideo(true)}/><About/><section id="join" className="bg-coral px-4 py-16 md:px-[6vw]"><div className="mx-auto grid max-w-[1180px] gap-8 lg:grid-cols-2 lg:items-center"><div><span className="eyebrow">START YOUR FITNESS JOURNEY</span><h2 className="display mt-5 text-5xl md:text-5xl">READY TO BUILD A <em className="text-white not-italic">HEALTHIER YOU? </em></h2></div><form onSubmit={submit}><label htmlFor="email" className="mb-3 block font-bold">Get course access and updates</label><div className="flex flex-col gap-2 sm:flex-row"><input id="email" name="email" type="email" autoComplete="email" placeholder="Enter your email address" required className="min-h-12 flex-1 px-4"/><button className="bg-ink px-5 py-4 font-bold text-cream">GET STARTED ↗</button></div></form></div></section></main><Footer/><VideoModal open={video} onClose={()=>setVideo(false)}/>{sent&&<div role="status" className="fixed bottom-5 right-5 z-[90] bg-ink px-5 py-4 font-bold text-cream">WELCOME TO {company.siteName.toUpperCase()} — CHECK YOUR INBOX.</div>}</>}

function Redirect({ to }) { useEffect(() => { window.location.replace(to); }, [to]); return <Page title="Redirecting"><Notice>Redirecting...</Notice></Page>; }
export default function App({ pathname }) {
 const path = (pathname || window.location.pathname).replace(/\/+$/, '') || '/';
 const [token, setToken] = useState(null);
 const [sessionReady, setSessionReady] = useState(false);
 const [account, setAccount] = useState(null);
 const [error, setError] = useState('');
 const [attempt, setAttempt] = useState(0);
 const admin = !!token && getUser()?.is_admin === true;
 useEffect(() => { const changed = () => { setToken(getToken()); setSessionReady(true); }; changed(); window.addEventListener('authchange', changed); window.addEventListener('storage', changed); window.addEventListener('focus', changed); const timer = setInterval(changed, 30000); return () => { window.removeEventListener('authchange', changed); window.removeEventListener('storage', changed); window.removeEventListener('focus', changed); clearInterval(timer); }; }, []);
 useEffect(() => { let active = true; if (token && !admin && path === '/library') { setError(''); fetchDashboard().then(data => { if(active) setAccount(data); }).catch(e => { if(active) setError(e.message); }); } return () => { active = false; }; }, [token, admin, path, attempt]);
 if (!sessionReady && ['/login','/signup','/checkout','/library','/profile','/live-classes'].includes(path)) return <Page title="Loading"><Notice>Checking your session...</Notice></Page>;
 if (admin && ['/login','/signup','/pricing','/checkout','/library'].includes(path)) return <Redirect to="/live-classes/"/>;
 if (token && ['/login','/signup'].includes(path)) return <Redirect to="/library/"/>;
 if (!token && ['/profile','/live-classes'].includes(path)) return <Redirect to="/login/"/>;
 if (path === '/live-classes' && !admin) return <Redirect to="/library/"/>;
 if (path === '/library') {
  if (!token) return <Redirect to="/pricing/"/>;
  if (error) return <Page title="Library"><Notice error>{error}</Notice><button className="btn" onClick={() => setAttempt(attempt+1)}>Retry</button></Page>;
  if (!account) return <Page title="Library"><Notice>Checking your membership...</Notice></Page>;
  if (!hasActivePlan(account)) return <Redirect to="/pricing/"/>;
 }
 const routes = {'/':Home, '/pricing':Pricing, '/login':Login, '/signup':Signup, '/profile':Profile, '/checkout':Checkout, '/library':Library, '/live-classes':AdminLiveClasses, '/unsubscribe':Unsubscribe, '/imprint':Imprint, '/privacy':Privacy, '/privacy-policy':Privacy, '/terms':Terms, '/terms-conditions':Terms};
 const Component = routes[path];
 return Component ? <Suspense fallback={<Page title="Loading"><Notice>Loading page...</Notice></Page>}><Component/></Suspense> : <Page title="Page not found"><p>This page does not exist.</p><a className="btn mt-6" href="/">Back home</a></Page>;
}
