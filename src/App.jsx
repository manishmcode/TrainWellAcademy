import { Link, useNavigate } from 'react-router-dom';
import { useEffect, lazy, Suspense, useState } from "react";
import {
  clearAuthSession,
  consumeLoginRedirect,
  getToken,
  getTokenExpiry,
  getUser,
  saveLibraryAccess,
  saveUser,
} from "./services/auth";
import { fetchDashboard, hasActivePlan } from "./services/account";
import Page, { Notice } from "./components/Page";
import AdminLiveClasses from "./components/AdminLiveClasses";
import { company } from "./company";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Courses from "./components/Courses";
import Coaching from "./components/Coaching";
import About from "./components/About";
import Footer from "./components/Footer";
import VideoModal from "./components/VideoModal";
import Unsubscribe from "./components/Unsubscribe";
import Pricing from "./components/Pricing";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Imprint from "./components/Imprint";
import Library from "./components/Library";
import Terms from "./components/Terms";
import Privacy from "./components/Privacy";
import Profile from "./components/Profile";
const Checkout = lazy(() => import("./components/Checkout"));
function Home() {
  const [video, setVideo] = useState(false);
  return (
    <>
      <Header />
      <main>
        <Hero play={() => setVideo(true)} />
        <Courses play={() => setVideo(true)} />
        <Coaching play={() => setVideo(true)} />
        <About />
        <section id="join" className="bg-coral px-4 py-16 md:px-[6vw]">
          <div className="mx-auto grid max-w-[1180px] gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="eyebrow">START YOUR FITNESS JOURNEY</span>
              <h2 className="display mt-5 text-5xl md:text-5xl">
                READY TO BUILD A{" "}
                <em className="text-white not-italic">HEALTHIER YOU? </em>
              </h2>
            </div>
            <Link
              to="/signup/"
              className="w-fit bg-ink px-5 py-4 font-bold text-cream"
            >
              GET STARTED ↗
            </Link>
          </div>
        </section>
      </main>
      <Footer />
      <VideoModal open={video} onClose={() => setVideo(false)} />
    </>
  );
}

function Redirect({ to, onRedirect }) {
  const navigate = useNavigate();
  useEffect(() => {
    if (onRedirect) onRedirect(to);
    else navigate(to, { replace: true });
  }, [navigate, onRedirect, to]);
  return (
    <Page title="Redirecting">
      <Notice>Redirecting...</Notice>
    </Page>
  );
}
function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-cream text-ink">
      <Header />
      <main className="grid flex-1 place-items-center px-6 py-16 text-center">
        <section>
          <span className="font-display text-[clamp(5rem,12vw,9rem)] leading-none text-coral">
            404
          </span>
          <p className="eyebrow mt-3 text-coral">Page not found</p>
          <h1 className="mt-5 font-display text-4xl uppercase md:text-6xl">
            This page does not exist.
          </h1>
          <p className="mx-auto mt-5 max-w-md text-sm leading-6 text-ink/60">
            The link may be incorrect or the page may have moved.
          </p>
          <Link to="/" className="btn mt-8 bg-ink text-cream hover:bg-coral">
            BACK HOME
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}
export default function App({ pathname, onRedirect }) {
  const navigate = useNavigate();
  const path =
    (pathname || window.location.pathname).replace(/\/+$/, "") || "/";
  const [token, setToken] = useState(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [libraryAccess, setLibraryAccess] = useState(false);
  const [libraryAccessReady, setLibraryAccessReady] = useState(false);
  const [membershipError, setMembershipError] = useState('');
  const admin = !!token && getUser()?.is_admin === true;
  useEffect(() => {
    let active = true,
      expiryTimer, revision = 0;
    const changed = async (event) => {
      if (event?.type === 'storage' && event.key && !['trainwellacademy_token', 'trainwellacademy_user'].includes(event.key)) return;
      const requestRevision = ++revision;
      setMembershipError('');
      setLibraryAccessReady(false);
      window.clearTimeout(expiryTimer);
      const nextToken = getToken();
      if (consumeLoginRedirect()) navigate('/login/', { replace: true });
      if (!active) return;
      setToken(nextToken);
      setSessionReady(true);
      if (!nextToken) {
        setLibraryAccess(false);
        setLibraryAccessReady(true);
        return;
      }
      const expiresAt = getTokenExpiry();
      if (expiresAt) {
        const checkExpiry = () => {
          const remaining = expiresAt - Date.now();
          if (remaining <= 0) {
            if (localStorage.getItem('trainwellacademy_token') === nextToken)
              clearAuthSession({ reason: 'expired' });
          } else expiryTimer = window.setTimeout(checkExpiry, Math.min(remaining, 2147483647));
        };
        checkExpiry();
      }
      if (getUser()?.is_admin === true) {
        setLibraryAccessReady(true);
        return;
      }
      setLibraryAccessReady(false);
      try {
        const dashboard = await fetchDashboard({ cache: false });
        if (!active || revision !== requestRevision || getToken() !== nextToken) return;
        const hasAccess = hasActivePlan(dashboard);
        saveUser({ ...getUser(), ...dashboard });
        saveLibraryAccess(hasAccess);
        setLibraryAccess(hasAccess);
      } catch (error) {
        if (!active || revision !== requestRevision) return;
        setMembershipError(error.message || 'Unable to check your membership.');
        setLibraryAccess(false);
      } finally {
        if (active && revision === requestRevision) setLibraryAccessReady(true);
      }
    };
    window.addEventListener("authchange", changed);
    window.addEventListener("storage", changed);
    changed();
    return () => {
      active = false;
      window.clearTimeout(expiryTimer);
      window.removeEventListener("authchange", changed);
      window.removeEventListener("storage", changed);
    };
  }, [navigate]);
  // Do not evaluate route guards until local storage has restored the session.
  // `pathname` is always supplied by the client router, so using it as the
  // readiness condition caused valid profile and library visits to redirect
  // before the token and membership check had completed.
  if (
    !sessionReady &&
    [
      "/login",
      "/signup",
      "/checkout",
      "/library",
      "/profile",
      "/live-classes",
    ].includes(path)
  )
    return (
      <Page title="Loading">
        <Notice>Checking your session...</Notice>
      </Page>
    );
  if (
    admin &&
    ["/login", "/signup", "/pricing", "/checkout", "/library"].includes(path)
  )
    return <Redirect to="/live-classes/" onRedirect={onRedirect} />;
  if (token && ["/login", "/signup"].includes(path))
    return <Redirect to="/library/" onRedirect={onRedirect} />;
  if (!token && ["/profile", "/live-classes", "/library"].includes(path))
    return <Redirect to="/login/" onRedirect={onRedirect} />;
  if (path === "/live-classes" && !admin)
    return <Redirect to="/library/" onRedirect={onRedirect} />;
  if (path === "/library") {
    if (!libraryAccessReady)
      return (
        <Page title="Loading">
          <Notice>Checking your membership...</Notice>
        </Page>
      );
    if (membershipError) return (
      <Page title="Membership unavailable">
        <Notice error>{membershipError}</Notice>
        <button className="btn mt-5" onClick={() => window.dispatchEvent(new Event('authchange'))}>Try again</button>
      </Page>
    );
    if (!libraryAccess)
      return <Redirect to="/pricing/" onRedirect={onRedirect} />;
  }
  const routes = {
    "/": Home,
    "/pricing": Pricing,
    "/login": Login,
    "/signup": Signup,
    "/profile": Profile,
    "/live-classes": AdminLiveClasses,
    "/checkout": Checkout,
    "/library": Library,
    "/unsubscribe": Unsubscribe,
    "/imprint": Imprint,
    "/privacy": Privacy,
    "/privacy-policy": Privacy,
    "/terms": Terms,
    "/terms-conditions": Terms,
  };
  const Component = routes[path];
  return Component ? (
    <Suspense
      fallback={
        <Page title="Loading">
          <Notice>Loading page...</Notice>
        </Page>
      }
    >
      <Component />
    </Suspense>
  ) : (
    <NotFound />
  );
}
