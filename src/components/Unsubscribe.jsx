import { post } from '../services/api';
import { ArrowLeft, ArrowRight, Check, LockKeyhole, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { useState } from 'react';
import { company } from '../company';
import Footer from './Footer';
import Header from './Header';

const inputClass = 'mt-2 block h-12 w-full min-w-0 border-b-2 border-ink/20 bg-transparent px-0 text-sm outline-none transition placeholder:text-ink/30 focus:border-coral';

export default function Unsubscribe() {
  const [submitted, setSubmitted] = useState(false);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  async function submit(event) {
    event.preventDefault(); if (busy) return;
    const form = event.currentTarget, v = Object.fromEntries(new FormData(form));
    setBusy(true); setError('');
    try {
      const result = await post('/subscriptions/unsubscribe', { first_name: v.firstName.trim(), last_name: v.lastName.trim(), email: v.email.trim(), iban_last_5: v.iban, is_unsubscribe: true }, { auth: false, envelope: false });
      setMessage(result.message); form.reset(); setSubmitted(true);
    } catch(e) { setError(e.message); } finally { setBusy(false); }
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-cream text-ink">
      <Header />

      <main className="bg-cream pb-24">
        <section className="relative overflow-hidden bg-ink text-cream">
          <div className="shell relative z-10 pb-32 pt-20 md:pb-40 md:pt-28">
            <span className="eyebrow text-coral">
              <LockKeyhole size={14} className="mr-2 inline text-coral" /> SUBSCRIPTION CANCELLATION
            </span>
            <h1 className="display mt-7 max-w-4xl text-[clamp(4rem,6vw,8.5rem)]">
              WE’RE SORRY TO<br /><em className="not-italic text-coral">SEE YOU GO.</em>
            </h1>
            <p className="mt-8 max-w-lg text-base leading-7 text-cream/60">
              To cancel your subscription, enter your details and the last five digits of your IBAN. Your request will be submitted to {company.siteName} support for processing.
            </p>
          </div>
          <div className="pointer-events-none absolute -right-24 -top-40 size-[34rem] rounded-full border border-coral/15" aria-hidden="true" />
          <div className="pointer-events-none absolute -right-4 -top-20 size-72 rounded-full border border-coral/15" aria-hidden="true" />
        </section>

        <section className="shell relative z-20 -mt-20 pb-4 md:-mt-28 md:pb-8">
          <div className="mx-auto max-w-[1040px] border border-ink/10 border-t-4 border-t-coral bg-white shadow-[0_20px_50px_rgba(23,27,25,0.1)]">
            {submitted ? (
              <div className="px-6 py-14 text-center sm:px-12 md:py-16" role="status">
                <div className="mx-auto grid size-14 place-items-center rounded-full bg-coral/15 text-coral"><Check size={27} strokeWidth={2.5} /></div>
                <span className="eyebrow mt-7 block text-coral">REQUEST RECEIVED</span>
                <h2 className="mt-3 text-3xl font-bold sm:text-4xl">We’ll take it from here</h2>
                <p className="mx-auto mt-4 max-w-md leading-7 text-ink/60">{message || "Your cancellation request has been received."}</p>
                <div className="mx-auto mt-7 flex max-w-md items-start gap-3 rounded-lg border border-ink/10 bg-white p-4 text-left text-sm leading-6 text-ink/60">
                  <Mail className="mt-0.5 shrink-0 text-coral" size={18} />
                  <p>Contact support if you need help with your cancellation request.</p>
                </div>
                <a href="/" className="btn group mt-8 gap-3">
                  Back to {company.brandShortName} <ArrowRight className="transition-transform group-hover:translate-x-1" size={17} />
                </a>
              </div>
            ) : (
              <div className="p-6 sm:p-9 md:px-12 md:py-10">
                <div className="flex items-center gap-4">
                  <span className="grid size-11 shrink-0 place-items-center bg-coral/15 text-coral"><UserRound size={21} /></span>
                  <div>
                    <h2 className="text-2xl font-bold">Unsubscribe</h2>
                    <p className="mt-0.5 text-sm text-ink/55">Fill in your account details to cancel.</p>
                  </div>
                </div>

                <form method="post" onSubmit={submit} className="mt-7">{error && <p role="alert" className="text-red-700">{error}</p>}<fieldset disabled={busy}>
                  <div className="grid min-w-0 gap-5 sm:grid-cols-2">
                    <label className="min-w-0 text-[11px] font-bold tracking-[.16em] text-[#8f7769]">FIRST NAME <span className="text-[#c65432]">*</span><input className={inputClass} name="firstName" autoComplete="given-name" placeholder="First name" required /></label>
                    <label className="min-w-0 text-[11px] font-bold tracking-[.16em] text-[#8f7769]">LAST NAME <span className="text-[#c65432]">*</span><input className={inputClass} name="lastName" autoComplete="family-name" placeholder="Last name" required /></label>
                  </div>
                  <label className="mt-5 block min-w-0 text-[11px] font-bold tracking-[.16em] text-[#8f7769]">EMAIL <span className="text-[#c65432]">*</span><input className={inputClass} type="email" name="email" autoComplete="email" placeholder="you@example.com" required /></label>
                  <label className="mt-5 block min-w-0 text-[11px] font-bold tracking-[.16em] text-[#8f7769]">LAST 5 DIGITS OF IBAN <span className="text-[#c65432]">*</span><input className={inputClass} name="iban" inputMode="numeric" pattern="[0-9]{5}" maxLength="5" placeholder="e.g. 12345" required /></label>

                  <div className="mt-5 flex items-start gap-3 border border-ink/15 bg-cream p-4 text-xs leading-5 text-ink/60">
                    <ShieldCheck className="mt-0.5 shrink-0 text-coral" size={16} />
                    <p>We use these details only to verify your membership and process the cancellation request.</p>
                  </div>

                  <label className="mt-4 flex cursor-pointer items-start gap-3 border border-ink/15 bg-cream p-4 text-sm leading-6">
                    <input className="mt-1 size-4 shrink-0 accent-coral" type="checkbox" required />
                    <span>I confirm that I want to cancel my subscription. Accordingly, no further billing will be made.</span>
                  </label>

                  <button className="text-white btn group mt-5 w-full gap-3 bg-coral text-ink hover:bg-ink hover:text-cream" type="submit">
                    <span>Send Request</span><span className="grid size-6 place-items-center text-ink"><ArrowRight className="transition-transform group-hover:translate-x-0.5 text-white" size={14} /></span>
                  </button>
                {busy && <p role="status">Submitting request...</p>}</fieldset></form>

                <a href="/" className="mt-5 flex items-center justify-center gap-2 text-sm text-ink/45 transition hover:text-coral"><ArrowLeft size={14} /> Cancel, keep me subscribed</a>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
