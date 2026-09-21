import { ArrowRight, Check, LockKeyhole, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { company } from '../company';
import Footer from './Footer';
import Header from './Header';

const fieldClass = 'mt-2 block h-11 w-full border border-ink/15 bg-cream px-3 text-sm outline-none transition placeholder:text-ink/35 focus:border-coral focus:ring-2 focus:ring-coral/15';

export default function Checkout() {
  const [completed, setCompleted] = useState(false);

  function submit(event) {
    event.preventDefault();
    setCompleted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="min-h-screen bg-cream text-ink">
      <Header />
      <main className="bg-cream pb-24">
        <section className="shell py-10 md:py-16">
          {completed ? (
            <div className="mx-auto max-w-[760px] border-t-4 border-coral bg-white px-6 py-16 text-center shadow-[0_20px_50px_rgba(23,27,25,0.08)] md:px-12">
              <div className="mx-auto grid size-16 place-items-center bg-coral text-ink"><Check size={30} /></div>
              <span className="eyebrow mt-8 block text-coral">PAYMENT RECEIVED</span>
              <h1 className="display mt-5 text-5xl md:text-7xl">YOU’RE READY<br /><em className="not-italic text-coral">TO MOVE.</em></h1>
              <p className="mx-auto mt-6 max-w-md leading-7 text-ink/60">Your {company.siteName} membership is being prepared. We’ll send your access details to your email shortly.</p>
              <a href="/#courses" className="btn mt-8 gap-3">OPEN THE LIBRARY <ArrowRight size={17} /></a>
            </div>
          ) : (
            <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
              <form onSubmit={submit} className="border-t-4 border-coral bg-white p-6 shadow-[0_20px_50px_rgba(23,27,25,0.08)] md:p-10">
                <div className="flex items-start justify-between gap-6 border-b border-ink/15 pb-7">
                  <div>
                    <span className="eyebrow text-coral">SECURE CHECKOUT</span>
                    <h1 className="mt-4 text-3xl font-bold md:text-4xl">Complete Payment</h1>
                    <p className="mt-2 text-sm text-ink/55">Enter your billing details and confirm your plan.</p>
                  </div>
                  <LockKeyhole className="text-coral" size={26} />
                </div>

                <fieldset className="mt-8">
                  <legend className="text-lg font-bold">Your Information</legend>
                  <div className="mt-5 grid gap-5 sm:grid-cols-2">
                    <label className="text-[10px] font-bold tracking-[.16em] text-ink/55">EMAIL *<input className={fieldClass} type="email" name="email" autoComplete="email" placeholder="you@example.com" required /></label>
                    <label className="text-[10px] font-bold tracking-[.16em] text-ink/55 sm:col-span-2">PASSWORD *<input className={fieldClass} type="password" name="password" autoComplete="new-password" placeholder="Create a password" minLength="8" required /></label>
                    <label className="text-[10px] font-bold tracking-[.16em] text-ink/55">FIRST NAME *<input className={fieldClass} name="firstName" autoComplete="given-name" placeholder="First name" required /></label>
                    <label className="text-[10px] font-bold tracking-[.16em] text-ink/55">LAST NAME *<input className={fieldClass} name="lastName" autoComplete="family-name" placeholder="Last name" required /></label>
                    <label className="text-[10px] font-bold tracking-[.16em] text-ink/55 sm:col-span-2">PHONE NUMBER<input className={fieldClass} type="tel" name="phone" autoComplete="tel" placeholder="Phone number" /></label>
                  </div>
                </fieldset>

                <fieldset className="mt-9 border-t border-ink/15 pt-7">
                  <legend className="text-lg font-bold">Your Billing Details</legend>
                  <div className="mt-5 grid gap-5 sm:grid-cols-2">
                    <label className="text-[10px] font-bold tracking-[.16em] text-ink/55 sm:col-span-2">STREET ADDRESS *<input className={fieldClass} name="street" autoComplete="street-address" placeholder="Street, house no." required /></label>
                    <label className="text-[10px] font-bold tracking-[.16em] text-ink/55">TOWN / CITY *<input className={fieldClass} name="city" autoComplete="address-level2" placeholder="City" required /></label>
                    <label className="text-[10px] font-bold tracking-[.16em] text-ink/55">POSTCODE / ZIP *<input className={fieldClass} name="postcode" autoComplete="postal-code" placeholder="Postal code" required /></label>
                    <label className="text-[10px] font-bold tracking-[.16em] text-ink/55 sm:col-span-2">COUNTRY<select className={fieldClass} name="country" defaultValue="Germany"><option>Germany</option><option>United Kingdom</option><option>United States</option><option>India</option><option>Other</option></select></label>
                  </div>
                </fieldset>

                <fieldset className="mt-9 border-t border-ink/15 pt-7">
                  <legend className="text-lg font-bold">SEPA Direct Debit Information</legend>
                  <div className="mt-5 border border-ink/15 bg-cream p-4 text-xs leading-5 text-ink/60"><p><strong className="text-ink">SEPA Direct Debit</strong></p><p className="mt-2">By confirming this payment, you authorize {company.siteName} to send instructions to your bank to debit your account. You are entitled to a refund under the terms of your agreement with your bank.</p><label className="mt-4 block text-[10px] font-bold tracking-[.16em] text-ink/55">IBAN *<input className={fieldClass} name="iban" placeholder="IBAN" pattern="[A-Za-z0-9 ]{10,}" required /></label></div>
                </fieldset>

                <div className="mt-7 flex items-start gap-3 border border-ink/15 bg-cream p-4 text-xs leading-5 text-ink/60"><ShieldCheck className="mt-0.5 shrink-0 text-coral" size={17} /><p>Payment information is encrypted and secure. No card or bank details are stored on this device.</p></div>
                <label className="mt-5 flex items-start gap-3 text-xs leading-5 text-ink/65"><input className="mt-1 size-4 shrink-0 accent-coral" type="checkbox" required /><span>By proceeding with this payment, I confirm that I have read and agree to the <a href="#terms" className="font-bold text-coral">Terms and Conditions</a> and <a href="#terms" className="font-bold text-coral">Privacy Policy</a>.</span></label>
                <button className="btn group mt-6 w-full justify-center gap-3 bg-coral text-ink hover:bg-ink hover:text-cream" type="submit"><span>COMPLETE YOUR ORDER NOW</span><ArrowRight size={17} className="transition-transform group-hover:translate-x-1" /></button>
              </form>

              <aside className="bg-ink p-6 text-cream shadow-[0_18px_35px_rgba(23,27,25,0.2)] lg:sticky lg:top-24">
                <span className="eyebrow text-coral">TRAINWELL MEMBERSHIP</span>
                <h2 className="mt-4 text-2xl font-bold">Complete Plan</h2>
                <p className="mt-1 text-sm text-cream/55">Billed every month</p>
                <div className="my-7 border-y border-cream/15 py-5 text-sm"><div className="flex justify-between py-2 text-cream/60"><span>Subtotal</span><span>€24.00</span></div><div className="flex justify-between py-2 text-cream/60"><span>VAT</span><span>€0.00</span></div><div className="mt-3 flex justify-between border-t border-cream/15 pt-4 font-bold"><span>Total</span><span className="text-coral">€24.00</span></div></div>
                <div className="flex gap-3 border border-coral/25 bg-coral/10 p-3 text-xs leading-5 text-cream/65"><ShieldCheck className="mt-0.5 shrink-0 text-coral" size={16} /><p><strong className="block text-cream">Secure processing</strong>Encrypted, secure order processing.</p></div>
              </aside>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
