import { useEffect, lazy, Suspense, useState } from "react";
import {
  clearAuthSession,
  getCachedLibraryAccess,
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
            <a
              href="/signup"
              className="w-fit bg-ink px-5 py-4 font-bold text-cream"
            >
              GET STARTED ↗
            </a>
          </div>
        </section>
      </main>
      <Footer />
      <VideoModal open={video} onClose={() => setVideo(false)} />
    </>
  );
}

function Redirect({ to, onRedirect }) {
  useEffect(() => {
    if (onRedirect) onRedirect(to);
    else window.location.replace(to);
  }, [onRedirect, to]);
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
          <a href="/" className="btn mt-8 bg-ink text-cream hover:bg-coral">
            BACK HOME
          </a>
        </section>
      </main>
      <Footer />
    </div>
  );
}
export default function App({ pathname, onRedirect }) {
  const path =
    (pathname || window.location.pathname).replace(/\/+$/, "") || "/";
  const [token, setToken] = useState(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [libraryAccess, setLibraryAccess] = useState(false);
  const [libraryAccessReady, setLibraryAccessReady] = useState(false);
  const admin = !!token && getUser()?.is_admin === true;
  useEffect(() => {
    let active = true,
      expiryTimer;
    const changed = async () => {
      window.clearTimeout(expiryTimer);
      const nextToken = getToken();
      if (!active) return;
      setToken(nextToken);
      setSessionReady(true);
      if (!nextToken) {
        setLibraryAccess(false);
        setLibraryAccessReady(true);
        return;
      }
      const expiresAt = getTokenExpiry();
      if (expiresAt)
        expiryTimer = window.setTimeout(
          clearAuthSession,
          Math.max(0, expiresAt - Date.now()),
        );
      const cachedAccess = getCachedLibraryAccess();
      if (cachedAccess !== null) {
        setLibraryAccess(cachedAccess);
        setLibraryAccessReady(true);
        return;
      }
      setLibraryAccessReady(false);
      try {
        const dashboard = await fetchDashboard();
        if (!active) return;
        const hasAccess = hasActivePlan(dashboard);
        saveUser({ ...getUser(), ...dashboard });
        saveLibraryAccess(hasAccess);
        setLibraryAccess(hasAccess);
      } catch {
        if (!active) return;
        setLibraryAccess(false);
      } finally {
        if (active) setLibraryAccessReady(true);
      }
    };
    changed();
    window.addEventListener("authchange", changed);
    window.addEventListener("storage", changed);
    return () => {
      active = false;
      window.clearTimeout(expiryTimer);
      window.removeEventListener("authchange", changed);
      window.removeEventListener("storage", changed);
    };
  }, []);
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
  if (!token && ["/profile", "/live-classes"].includes(path))
    return <Redirect to="/login/" onRedirect={onRedirect} />;
  if (path === "/live-classes" && !admin)
    return <Redirect to="/library/" onRedirect={onRedirect} />;
  if (path === "/library") {
    if (!token) return <Redirect to="/pricing/" onRedirect={onRedirect} />;
    if (!libraryAccessReady)
      return (
        <Page title="Loading">
          <Notice>Checking your membership...</Notice>
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
