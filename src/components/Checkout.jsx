import { Country } from 'country-state-city';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { fetchPlans, post } from '../services/api';
import { getToken, getUser, saveAuthSession } from '../services/auth';
import { fetchDashboard } from '../services/account';
import { normalizeIban, paymentOutcome, validateIban, createPaymentSession, submitPayment, verifyPayment } from '../services/checkout';
import { safeUrl } from '../services/urls';
import { readPendingPayment, savePendingPayment, clearPendingPayment } from '../services/paymentRecovery';
import { formatMoney } from '../config/money';
import { ArrowRight, Check, LockKeyhole, ShieldCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { company } from '../company';
import Footer from './Footer';
import Header from './Header';

const fieldClass = 'mt-2 block h-11 w-full border border-ink/15 bg-cream px-3 text-sm outline-none transition placeholder:text-ink/35 focus:border-coral focus:ring-2 focus:ring-coral/15';

export default function Checkout() {
  const [completed,setCompleted]=useState(false),[plans,setPlans]=useState([]),[planId,setPlanId]=useState(''),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState(''),[status,setStatus]=useState(''),[country,setCountry]=useState('IN'),[account,setAccount]=useState(null),[member,setMember]=useState(()=>!!getToken()),[verificationUrl,setVerificationUrl]=useState('');
  const session=useRef(null),submitted=useRef(false),locked=useRef(false);
  const selected=plans.find(plan=>String(plan.id)===String(planId));
  async function load(){setLoading(true);setError('');try{const pending=readPendingPayment(getUser());if(pending){session.current=pending.sessionToken;submitted.current=true;setStatus('An earlier payment needs verification. Check its status before placing another order.');}const rows=await fetchPlans();setPlans(rows);const stored=String(pending?.planId||sessionStorage.getItem('trainwellacademy_checkout_plan_id')||'');setPlanId(String(rows.find(p=>String(p.id)===stored)?.id||rows[0]?.id||''));if(getToken()){const data=await fetchDashboard();setAccount(data);if(data.country)setCountry(data.country);}}catch(e){setError(e.message);}finally{setLoading(false);}}
  useEffect(()=>{load();},[]);
  useEffect(()=>{const token=import.meta.env.VITE_IPINFO_TOKEN;if(!token||getToken())return;const controller=new AbortController();fetch('https://api.ipinfo.io/lite/me?token='+encodeURIComponent(token),{signal:controller.signal}).then(r=>r.json()).then(data=>{if(Country.getCountryByCode(data.country_code))setCountry(data.country_code);}).catch(()=>{});return()=>controller.abort();},[]);
  async function checkPayment(){
    const result=await verifyPayment(session.current);
    const outcome=paymentOutcome(result);
    if(outcome==='failed')throw new Error(result.message||'Payment was declined. Contact support before attempting another order.');
    if(outcome==='complete'){clearPendingPayment();setCompleted(true);sessionStorage.removeItem('trainwellacademy_checkout_plan_id');window.location.assign('/profile/');}
    else{setStatus('Your payment is pending. Check its status again before placing another order.');setVerificationUrl(safeUrl(result.verificationUrl)||'');}
  }
  async function submit(event){
    event.preventDefault();if(locked.current)return;locked.current=true;setBusy(true);setError('');
    const v=Object.fromEntries(new FormData(event.currentTarget));
    try{
      if(submitted.current){await checkPayment();return;}
      if(!selected)throw new Error('Choose an available plan.');
      if(!getToken() && v.password!==v.confirmPassword)throw new Error('Passwords do not match.');
      const phone=parsePhoneNumberFromString(v.phone,country);if(!phone?.isValid())throw new Error('Enter a valid phone number for your country.');
      const iban=normalizeIban(v.iban);
      setStatus('Checking bank details...');const validation=await validateIban(iban);if(!validation.valid)throw new Error(validation.message||'Invalid IBAN.');
      if(!getToken()){
        if(v.password!==v.confirmPassword)throw new Error('Passwords do not match.');
        setStatus('Creating your account...');const auth=await post('/auth/signup',{name:v.firstName.trim()+' '+v.lastName.trim(),email:v.email.trim(),password:v.password,plan_id:Number(selected.id),user_meta:{first_name:v.firstName.trim(),last_name:v.lastName.trim(),phone:phone.number,country}},{auth:false});saveAuthSession(auth);setMember(true);
      }
      if(!session.current){setStatus('Creating payment session...');const created=await createPaymentSession({plan_id:Number(selected.id),plan_name:selected.name,amount:Number(selected.price),first_name:v.firstName.trim(),last_name:v.lastName.trim(),email:getUser()?.email||v.email.trim(),country,address:v.street,city:v.city,postal_code:v.postcode,phone:phone.number});if(!created.sessionToken)throw new Error('Invalid payment session.');session.current=created.sessionToken;}
      savePendingPayment(getUser(),session.current,selected.id);
      setStatus('Submitting payment...');submitted.current=true;
      const result=await submitPayment({session_token:session.current,iban,iban_holder_name:v.ibanHolder.trim()});
      if(result.sessionToken){session.current=result.sessionToken;savePendingPayment(getUser(),session.current,selected.id);}
      if(paymentOutcome(result)==='failed')throw new Error(result.message||'Payment declined. Contact support before retrying.');
      setVerificationUrl(safeUrl(result.verificationUrl)||'');setStatus('Verifying payment...');await checkPayment();
    }catch(e){setError(e.message);setStatus(submitted.current?'Check payment status before attempting another order.':'');}finally{locked.current=false;setBusy(false);}
  }

  return (
    <div className="min-h-screen bg-cream text-ink">
      <Header />
      <main className="bg-cream pb-24">
        <section className="shell py-10 md:py-16">{error && <p role="alert" className="mb-5 border-l-4 border-red-600 bg-white p-4">{error} {!selected && <button onClick={load}>Retry loading plans</button>}</p>}{status && <p role="status" className="mb-5 bg-white p-4">{status}</p>}{loading && <p role="status">Loading checkout...</p>}{!loading && !plans.length && <p>No active plans are available.</p>}{verificationUrl && <a href={verificationUrl} target="_blank" rel="noopener noreferrer" className="btn mb-5">Complete bank verification</a>}
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
              <form key={account?.email || "guest"} onSubmit={submit} className="border-t-4 border-coral bg-white p-6 shadow-[0_20px_50px_rgba(23,27,25,0.08)] md:p-10">
                <fieldset disabled={busy || loading || !selected || submitted.current}><div className="flex items-start justify-between gap-6 border-b border-ink/15 pb-7">
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
                    <label className="text-[10px] font-bold tracking-[.16em] text-ink/55">EMAIL *<input className={fieldClass} type="email" name="email" defaultValue={account?.email || getUser()?.email} readOnly={member} autoComplete="email" placeholder="you@example.com" required /></label>
                    {!member && <><label className="text-xs font-bold">PASSWORD *<input className={fieldClass} type="password" name="password" autoComplete="new-password" minLength="8" required/></label><label className="text-xs font-bold">CONFIRM PASSWORD *<input className={fieldClass} type="password" name="confirmPassword" autoComplete="new-password" minLength="8" required/></label></>}
                    <label className="text-[10px] font-bold tracking-[.16em] text-ink/55">FIRST NAME *<input className={fieldClass} name="firstName" defaultValue={account?.firstname || ""} autoComplete="given-name" placeholder="First name" required /></label>
                    <label className="text-[10px] font-bold tracking-[.16em] text-ink/55">LAST NAME *<input className={fieldClass} name="lastName" defaultValue={account?.lastname || ""} autoComplete="family-name" placeholder="Last name" required /></label>
                    <label className="text-[10px] font-bold tracking-[.16em] text-ink/55 sm:col-span-2">PHONE NUMBER<input className={fieldClass} type="tel" name="phone" defaultValue={account?.phone || ""} autoComplete="tel" placeholder="Phone number" required /></label>
                  </div>
                </fieldset>

                <fieldset className="mt-9 border-t border-ink/15 pt-7">
                  <legend className="text-lg font-bold">Your Billing Details</legend>
                  <div className="mt-5 grid gap-5 sm:grid-cols-2">
                    <label className="text-[10px] font-bold tracking-[.16em] text-ink/55 sm:col-span-2">STREET ADDRESS *<input className={fieldClass} name="street" defaultValue={account?.address || ""} autoComplete="street-address" placeholder="Street, house no." required /></label>
                    <label className="text-[10px] font-bold tracking-[.16em] text-ink/55">TOWN / CITY *<input className={fieldClass} name="city" defaultValue={account?.city || ""} autoComplete="address-level2" placeholder="City" required /></label>
                    <label className="text-[10px] font-bold tracking-[.16em] text-ink/55">POSTCODE / ZIP *<input className={fieldClass} name="postcode" defaultValue={account?.postal_code || ""} autoComplete="postal-code" placeholder="Postal code" required /></label>
                    <label className="text-[10px] font-bold tracking-[.16em] text-ink/55 sm:col-span-2">COUNTRY<select className={fieldClass} name="country" value={country} onChange={e=>setCountry(e.target.value)}>{Country.getAllCountries().map(c=><option key={c.isoCode} value={c.isoCode}>{c.name}</option>)}</select></label>
                  </div>
                </fieldset>

                <fieldset className="mt-9 border-t border-ink/15 pt-7">
                  <legend className="text-lg font-bold">SEPA Direct Debit Information</legend><label className="mt-4 block text-xs font-bold">Account holder name<input className={fieldClass} name="ibanHolder" minLength="2" autoComplete="name" required/></label>
                  <div className="mt-5 border border-ink/15 bg-cream p-4 text-xs leading-5 text-ink/60"><p><strong className="text-ink">SEPA Direct Debit</strong></p><p className="mt-2">By confirming this payment, you authorize {company.siteName} to send instructions to your bank to debit your account. You are entitled to a refund under the terms of your agreement with your bank.</p><label className="mt-4 block text-[10px] font-bold tracking-[.16em] text-ink/55">IBAN *<input className={fieldClass} name="iban" placeholder="IBAN" pattern="[A-Za-z0-9 ]{10,}" required /></label></div>
                </fieldset>

                <div className="mt-7 flex items-start gap-3 border border-ink/15 bg-cream p-4 text-xs leading-5 text-ink/60"><ShieldCheck className="mt-0.5 shrink-0 text-coral" size={17} /><p>Payment information is encrypted and secure. No card or bank details are stored on this device.</p></div>
                <label className="mt-5 flex items-start gap-3 text-xs leading-5 text-ink/65"><input className="mt-1 size-4 shrink-0 accent-coral" type="checkbox" required /><span>By proceeding with this payment, I confirm that I have read and agree to the <a href="/terms/" className="font-bold text-coral">Terms and Conditions</a> and <a href="/privacy/" className="font-bold text-coral">Privacy Policy</a>.</span></label>
                </fieldset><button disabled={busy || loading || (!selected && !submitted.current)} className="btn group mt-6 w-full justify-center gap-3 bg-coral text-ink hover:bg-ink hover:text-cream" type="submit"><span>{busy ? 'PROCESSING...' : submitted.current ? 'CHECK PAYMENT STATUS' : 'COMPLETE YOUR ORDER NOW'}</span><ArrowRight size={17} className="transition-transform group-hover:translate-x-1" /></button>
              </form>

              <aside className="bg-ink p-6 text-cream shadow-[0_18px_35px_rgba(23,27,25,0.2)] lg:sticky lg:top-24">
                <span className="eyebrow text-coral">TRAINWELL MEMBERSHIP</span>
                <h2 className="mt-4 text-2xl font-bold">{selected?.name || 'Membership plan'}</h2>
                <p className="mt-1 text-sm text-cream/55">Billed every month</p>
                <div className="my-7 border-y border-cream/15 py-5 text-sm"><div className="flex justify-between py-2 text-cream/60"><span>Subtotal</span><span>{selected ? formatMoney(selected.price, selected.currency) : '—'}</span></div><div className="flex justify-between py-2 text-cream/60"><span>VAT</span><span>Included</span></div><div className="mt-3 flex justify-between border-t border-cream/15 pt-4 font-bold"><span>Total</span><span className="text-coral">{selected ? formatMoney(selected.price, selected.currency) : '—'}</span></div></div>
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
