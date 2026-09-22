import { post } from '../services/api';
import { saveAuthSession } from '../services/auth';
import { ArrowRight, Check, KeyRound, LogIn } from 'lucide-react';
import { useState } from 'react';
import { company } from '../company';
import Footer from './Footer';
import Header from './Header';

const inputClass = 'mt-2 block h-12 w-full border-b-2 border-ink/20 bg-transparent px-0 text-sm outline-none transition placeholder:text-ink/30 focus:border-coral';

export default function Login() {
  const [loggedIn, setLoggedIn] = useState(false);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [visible, setVisible] = useState(false);
  async function submit(event) {
    event.preventDefault(); if (busy) return;
    const v = Object.fromEntries(new FormData(event.currentTarget));
    setError(''); setBusy(true);
    try {
      const result = await post('/auth/login', { email: v.email.trim(), password: v.password }, { auth: false });
      saveAuthSession(result);
      window.location.assign(result.user.is_admin ? '/live-classes/' : '/library/');
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }

  return (
    <div className="min-h-screen bg-cream text-ink">
      <Header />
      <main className="bg-cream pb-24">
        <section className="shell py-10 md:py-16">
          <div className="grid overflow-hidden bg-ink text-cream lg:grid-cols-[.9fr_1.1fr]">
            <div className="relative flex min-h-[520px] flex-col justify-between overflow-hidden px-6 py-12 md:px-14 md:py-16">
              <div className="relative z-10">
                <span className="eyebrow text-coral">PICK UP WHERE YOU LEFT OFF</span>
                <h1 className="display mt-8 max-w-xl text-[clamp(4rem,6vw,8.5rem)]">WELCOME BACK TO<br /><em className="not-italic text-coral">YOUR STRONGER SELF.</em></h1>
                <p className="mt-8 max-w-md text-base leading-7 text-cream/60">Your workouts, coaching sessions, and progress are ready when you are. Sign in and keep building momentum.</p>
              </div>
              <div className="relative z-10 mt-12 flex items-start gap-4 border border-cream/15 bg-cream/5 p-5 text-sm leading-6 text-cream/70"><span className="grid size-10 shrink-0 place-items-center bg-coral text-ink"><Check size={20} /></span><p><strong className="block text-cream">Your progress stays with you.</strong>Continue your program, revisit saved sessions, and see how far you have come.</p></div>
              <div className="absolute -bottom-40 -right-32 size-[32rem] rounded-full border border-coral/15" />
              <div className="absolute -bottom-16 right-4 size-64 rounded-full border border-coral/15" />
            </div>

            <div className="flex items-center bg-white px-6 py-12 text-ink md:px-14 md:py-16 justify-center">
              <div className="w-full max-w-[510px]">
                {loggedIn ? (
                  <div role="status" className="border-t-4 border-coral py-5">
                    <div className="grid size-14 place-items-center bg-coral text-ink"><Check size={26} /></div>
                    <span className="eyebrow mt-7 block text-coral">WELCOME BACK</span>
                    <h2 className="display mt-4 text-5xl md:text-6xl">YOU’RE IN.</h2>
                    <p className="mt-6 leading-7 text-ink/60">Your {company.siteName} library is ready. We’ll take you back to your programs now.</p>
                    <a href="/#courses" className="btn mt-8 gap-3">OPEN MY LIBRARY <ArrowRight size={17} /></a>
                  </div>
                ) : (
                  <>
                    <div className="mb-10 border-b border-ink/15 pb-8">
                      <span className="grid size-12 place-items-center bg-coral/15 text-coral"><LogIn size={22} /></span>
                      <span className="eyebrow mt-8 block text-coral">MEMBER ACCESS</span>
                      <h2 className="mt-4 text-4xl font-bold md:text-5xl">Login to Your Account</h2>
                      <p className="mt-3 text-sm leading-6 text-ink/55">Welcome back! Please login to continue.</p>
                    </div>
                    <form onSubmit={submit} className="space-y-6">{error && <p role="alert" className="text-red-700">{error}</p>}<fieldset disabled={busy} className="space-y-6">
                      <label className="block text-[11px] font-bold tracking-[.16em] text-ink/55">EMAIL ADDRESS <span className="text-coral">*</span><input className={inputClass} type="email" name="email" autoComplete="email" placeholder="you@example.com" required /></label>
                      <label className="block text-[11px] font-bold tracking-[.16em] text-ink/55">PASSWORD <span className="text-coral">*</span><input className={inputClass} type={visible ? "text" : "password"} name="password" autoComplete="current-password" placeholder="Enter your password" required /></label>
                      <div className="flex items-center justify-between gap-4 text-sm"><label className="flex items-center gap-2 text-ink/60"><input type="checkbox" className="size-4 accent-coral" /> Remember me</label><a href={`mailto:${company.supportEmail}?subject=Password%20reset`} className="font-bold text-coral hover:text-ink">Forgot password?</a></div>
                      <button type="button" onClick={() => setVisible(!visible)} className="text-sm font-bold">{visible ? "Hide passwords" : "Show passwords"}</button><button className="btn group w-full justify-center gap-3 bg-ink text-cream hover:bg-coral hover:text-ink" type="submit"><span>LOGIN</span><KeyRound size={17} className="transition-transform group-hover:rotate-12" /></button>
                    {busy && <p role="status">Please wait...</p>}</fieldset></form>
                    <p className="mt-7 text-center text-sm text-ink/50">Don&apos;t have an account? <a href="/signup" className="font-bold text-coral hover:text-ink">Sign Up</a></p>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
