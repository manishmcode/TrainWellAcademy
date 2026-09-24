import { post } from '../services/api';
import { saveAuthSession } from '../services/auth';
import { ArrowRight, Check, KeyRound, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { company } from '../company';
import Footer from './Footer';
import Header from './Header';

const inputClass = 'mt-2 block h-12 w-full border-b-2 border-ink/20 bg-transparent px-0 text-sm outline-none transition placeholder:text-ink/30 focus:border-coral';

export default function Signup() {
  const [created, setCreated] = useState(false);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [visible, setVisible] = useState(false);
  async function submit(event) {
    event.preventDefault(); if (busy) return;
    const v = Object.fromEntries(new FormData(event.currentTarget));
    setError(''); setBusy(true);
    try {
      if (v.password !== v.confirmPassword) throw new Error('Passwords do not match.');
      const result = await post('/auth/signup', { name: v.firstName.trim()+' '+v.lastName.trim(), email: v.email.trim(), password: v.password }, { auth: false });
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
            <div className="relative flex min-h-[560px] flex-col justify-between overflow-hidden px-6 py-12 md:px-14 md:py-16">
              <div className="relative z-10">
                <span className="eyebrow text-coral">START YOUR STRONGER CHAPTER</span>
                <h1 className="display mt-8 max-w-xl text-[clamp(4rem,6vw,8.5rem)]">CREATE YOUR<br /><em className="not-italic text-coral">ACCOUNT.</em></h1>
                <h2 className="mt-8 max-w-md font-display text-2xl uppercase leading-tight text-coral md:text-3xl">BUILD A ROUTINE THAT MOVES WITH YOU.</h2>
                <p className="mt-8 max-w-md text-base leading-7 text-cream/60">Get expert-led workouts, structured programs, and practical coaching designed to fit your goals and your schedule.</p>
              </div>
              <div className="relative z-10 mt-12 flex items-start gap-4 border border-cream/15 bg-cream/5 p-5 text-sm leading-6 text-cream/70"><span className="grid size-10 shrink-0 place-items-center bg-coral text-ink"><Check size={20} /></span><div><h3 className="font-bold text-cream">Start with a plan built for real life.</h3><p>Train at your pace, track every milestone, and adjust your routine as you grow.</p></div></div>
              <div className="absolute -bottom-40 -right-32 size-[32rem] rounded-full border border-coral/15" />
              <div className="absolute -bottom-16 right-4 size-64 rounded-full border border-coral/15" />
            </div>

            <div className="flex items-center bg-white px-6 py-12 text-ink md:px-14 md:py-16">
              <div className="w-full max-w-[510px]">
                {created ? (
                  <div role="status" className="border-t-4 border-coral py-5">
                    <div className="grid size-14 place-items-center bg-coral text-ink"><Check size={26} /></div>
                    <span className="eyebrow mt-7 block text-coral">ACCOUNT CREATED</span>
                    <h2 className="display mt-4 text-5xl md:text-6xl">WELCOME<br /><em className="not-italic text-coral">ABOARD.</em></h2>
                    <p className="mt-6 leading-7 text-ink/60">Your personalized {company.siteName} library is ready to explore.</p>
                    <a href="/#courses" className="btn mt-8 gap-3">OPEN MY LIBRARY <ArrowRight size={17} /></a>
                  </div>
                ) : (
                  <>
                    <div className="mb-10 border-b border-ink/15 pb-8">
                      <span className="grid size-12 place-items-center bg-coral/15 text-coral"><UserPlus size={22} /></span>
                      <h2 className="mt-8 text-4xl font-bold md:text-5xl">Set up your account</h2>
                      <p className="mt-3 text-sm leading-6 text-ink/55">Sign up to start learning with us.</p>
                    </div>
                    <form onSubmit={submit} className="space-y-6">{error && <p role="alert" className="text-red-700">{error}</p>}<fieldset disabled={busy} className="space-y-6">
                      <div className="grid gap-6 sm:grid-cols-2">
                        <label className="block text-[11px] font-bold tracking-[.16em] text-ink/55">FIRST NAME <span className="text-coral">*</span><input className={inputClass} name="firstName" autoComplete="given-name" placeholder="First name" required /></label>
                        <label className="block text-[11px] font-bold tracking-[.16em] text-ink/55">LAST NAME <span className="text-coral">*</span><input className={inputClass} name="lastName" autoComplete="family-name" placeholder="Last name" required /></label>
                      </div>
                      <label className="block text-[11px] font-bold tracking-[.16em] text-ink/55">EMAIL ADDRESS <span className="text-coral">*</span><input className={inputClass} type="email" name="email" autoComplete="email" placeholder="you@example.com" required /></label>
                      <label className="block text-[11px] font-bold tracking-[.16em] text-ink/55">PASSWORD <span className="text-coral">*</span><input className={inputClass} type={visible ? "text" : "password"} name="password" autoComplete="new-password" placeholder="Create a password" minLength="8" required /></label>
                      <label className="block">Confirm password<input className={inputClass} type={visible ? "text" : "password"} name="confirmPassword" autoComplete="new-password" required /></label><button type="button" onClick={() => setVisible(!visible)} className="text-sm font-bold">{visible ? "Hide passwords" : "Show passwords"}</button><button className="btn group w-full justify-center gap-3 bg-ink text-cream hover:bg-coral hover:text-ink" type="submit"><span>SIGN UP</span><KeyRound size={17} className="transition-transform group-hover:rotate-12" /></button>
                    {busy && <p role="status">Please wait...</p>}</fieldset></form>
                    <p className="mt-7 text-center text-sm text-ink/50">Already have an account? <a href="/login" className="font-bold text-coral hover:text-ink">Login</a></p>
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
