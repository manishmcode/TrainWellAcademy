import { Country } from 'country-state-city';
import { getCountryCallingCode, parsePhoneNumberFromString } from 'libphonenumber-js';
import { fetchPlans, post } from '../services/api';
import { getToken, getUser, saveAuthSession } from '../services/auth';
import { fetchDashboard } from '../services/account';
import { normalizeIban, paymentOutcome, validateIban, createPaymentSession, submitPayment, verifyPayment } from '../services/checkout';
import { safeUrl } from '../services/urls';
import { readPendingPayment, savePendingPayment, clearPendingPayment } from '../services/paymentRecovery';
import { formatMoney } from '../config/money';
import { ArrowRight, Check, ChevronDown, LockKeyhole, ShieldCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { company } from '../company';
import Footer from './Footer';
import Header from './Header';

const fieldClass = 'mt-2 block h-11 w-full border border-ink/15 bg-cream px-3 text-sm outline-none transition placeholder:text-ink/35 focus:border-coral focus:ring-2 focus:ring-coral/15';
const callingCode = countryCode => { try { return `+${getCountryCallingCode(countryCode)}`; } catch { return ''; } };

function PhoneCountryPicker({ country, onChange }) {
  const [open, setOpen] = useState(false), [query, setQuery] = useState('');
  const countries = Country.getAllCountries().filter(item => callingCode(item.isoCode));
  const selected = countries.find(item => item.isoCode === country) || countries[0];
  const matches = countries.filter(item => `${item.name} ${item.isoCode} ${callingCode(item.isoCode)}`.toLowerCase().includes(query.trim().toLowerCase()));
  const flag = code => `https://flagcdn.com/w40/${code.toLowerCase()}.png`;
  return <div className="relative w-40 shrink-0 sm:w-48">
    <button type="button" aria-label="Choose phone country" aria-expanded={open} onClick={() => setOpen(value => !value)} className="flex h-12 w-full items-center gap-2 border border-ink/20 bg-cream px-3 text-left text-sm font-bold text-ink outline-none transition hover:border-coral hover:bg-white focus:border-coral focus:ring-2 focus:ring-coral/15">
      <img src={flag(selected.isoCode)} width="20" height="15" alt="" className="h-3.5 w-5 object-cover" />
      <span className="min-w-0 flex-1 truncate">{selected.name}</span><span className="text-coral">{callingCode(selected.isoCode)}</span><ChevronDown aria-hidden="true" size={15} strokeWidth={2.5} className={`shrink-0 text-ink/55 transition-transform ${open?'rotate-180':''}`} />
    </button>
    {open && <div className="absolute z-30 mt-1 w-72 border border-ink/15 bg-white p-2 shadow-[0_12px_28px_rgba(23,27,25,0.16)]">
      <input autoFocus value={query} onChange={event => setQuery(event.target.value)} onKeyDown={event => { if (event.key === 'Escape') setOpen(false); }} className="h-10 w-full border border-ink/15 bg-cream px-3 text-sm outline-none focus:border-coral focus:ring-2 focus:ring-coral/15" placeholder="Search country or code" aria-label="Search phone country" />
      <div className="mt-2 max-h-56 overflow-y-auto">{matches.map(item => <button type="button" key={item.isoCode} onClick={() => { onChange(item.isoCode); setOpen(false); setQuery(''); }} className="flex w-full items-center gap-3 px-2 py-2 text-left text-sm hover:bg-cream focus:bg-cream focus:outline-none"><img src={flag(item.isoCode)} width="20" height="15" alt="" className="h-3.5 w-5 object-cover" /><span className="flex-1">{item.name}</span><span className="font-bold text-coral">{callingCode(item.isoCode)}</span></button>)}{!matches.length && <p className="px-2 py-3 text-sm text-ink/55">No country found.</p>}</div>
    </div>}
  </div>;
}

function BillingCountryPicker({ country, onChange }) {
  const [open, setOpen] = useState(false), [query, setQuery] = useState('');
  const countries = Country.getAllCountries();
  const selected = countries.find(item => item.isoCode === country) || countries[0];
  const matches = countries.filter(item => `${item.name} ${item.isoCode}`.toLowerCase().includes(query.trim().toLowerCase()));
  const flag = code => `https://flagcdn.com/w40/${code.toLowerCase()}.png`;
  return <div className="relative mt-2">
    <button type="button" aria-label="Choose billing country" aria-expanded={open} onClick={() => setOpen(value => !value)} className="flex h-11 w-full items-center gap-3 border border-ink/20 bg-cream px-3 text-left text-sm font-bold text-ink outline-none transition hover:border-coral hover:bg-white focus:border-coral focus:ring-2 focus:ring-coral/15">
      <img src={flag(selected.isoCode)} width="20" height="15" alt="" className="h-3.5 w-5 object-cover" /><span className="flex-1">{selected.name}</span><ChevronDown aria-hidden="true" size={16} strokeWidth={2.5} className={`text-ink/55 transition-transform ${open?'rotate-180':''}`} />
    </button>
    {open && <div className="absolute z-30 mt-1 w-full border border-ink/15 bg-white p-2 shadow-[0_12px_28px_rgba(23,27,25,0.16)]">
      <input autoFocus value={query} onChange={event => setQuery(event.target.value)} onKeyDown={event => { if (event.key === 'Escape') setOpen(false); }} className="h-10 w-full border border-ink/15 bg-cream px-3 text-sm outline-none focus:border-coral focus:ring-2 focus:ring-coral/15" placeholder="Search country" aria-label="Search billing country" />
      <div className="mt-2 max-h-56 overflow-y-auto">{matches.map(item => <button type="button" key={item.isoCode} onClick={() => { onChange(item.isoCode); setOpen(false); setQuery(''); }} className="flex w-full items-center gap-3 px-2 py-2 text-left text-sm hover:bg-cream focus:bg-cream focus:outline-none"><img src={flag(item.isoCode)} width="20" height="15" alt="" className="h-3.5 w-5 object-cover" /><span>{item.name}</span></button>)}{!matches.length && <p className="px-2 py-3 text-sm text-ink/55">No country found.</p>}</div>
    </div>}
  </div>;
}

export default function Checkout() {
  const [completed,setCompleted]=useState(false),[plans,setPlans]=useState([]),[planId,setPlanId]=useState(''),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState(''),[status,setStatus]=useState(''),[country,setCountry]=useState('IN'),[account,setAccount]=useState(null),[member,setMember]=useState(()=>!!getToken()),[verificationUrl,setVerificationUrl]=useState(''),[phoneError,setPhoneError]=useState('');
  const session=useRef(null),submitted=useRef(false),locked=useRef(false),phoneInput=useRef(null);
  const selected=plans.find(plan=>String(plan.id)===String(planId));
  function billingIdentity(values){
    const saved=getUser()||{};
    const nameParts=String(saved.name||'').trim().split(/\s+/).filter(Boolean);
    const firstName=String(member?(account?.firstname||saved.user_meta?.first_name||nameParts[0]||''):values.firstName||'').trim();
    const lastName=String(member?(account?.lastname||saved.user_meta?.last_name||nameParts.slice(1).join(' ')||''):values.lastName||'').trim();
    const email=String(member?(account?.email||saved.email||''):values.email||'').trim();
    return {firstName,lastName,email,accountHolder:[firstName,lastName].filter(Boolean).join(' ')||String(saved.name||'').trim()};
  }
  function validatePhone(value, countryCode=country){
    if(!String(value||'').trim()){setPhoneError('');return false;}
    if(/[^\d\s()+.-]/.test(String(value))){setPhoneError('Use numbers only, without letters.');return false;}
    if(String(value).replace(/\D/g,'').length < 4){setPhoneError('');return false;}
    const valid=parsePhoneNumberFromString(value,countryCode)?.isValid()===true;
    setPhoneError(valid?'':`Enter a valid ${Country.getCountryByCode(countryCode)?.name||'selected-country'} phone number.`);
    return valid;
  }
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
    event.preventDefault();if(locked.current)return;locked.current=true;setBusy(true);setError('');setPhoneError('');
    const v=Object.fromEntries(new FormData(event.currentTarget));
    try{
      if(submitted.current){await checkPayment();return;}
      if(!selected)throw new Error('Choose an available plan.');
      const phone=parsePhoneNumberFromString(v.phone,country);if(!phone?.isValid()){const message='Enter a valid phone number for the selected country.';setPhoneError(message);throw new Error(message);}
      const iban=normalizeIban(v.iban);
      setStatus('Checking bank details...');const validation=await validateIban(iban);if(!validation.valid)throw new Error(validation.message||'Invalid IBAN.');
      if(!getToken()){
        setStatus('Creating your account...');const auth=await post('/auth/signup',{name:v.firstName.trim()+' '+v.lastName.trim(),email:v.email.trim(),password:v.password,plan_id:Number(selected.id),user_meta:{first_name:v.firstName.trim(),last_name:v.lastName.trim(),phone:phone.number,country}},{auth:false});saveAuthSession(auth);setMember(true);
      }
      const identity=billingIdentity(v);
      if(!identity.firstName||!identity.lastName||!identity.email||!identity.accountHolder)throw new Error('Your account name and email are required.');
      if(!session.current){setStatus('Creating payment session...');const created=await createPaymentSession({plan_id:Number(selected.id),plan_name:selected.name,amount:Number(selected.price),first_name:identity.firstName,last_name:identity.lastName,email:identity.email,country,address:v.street,city:v.city,postal_code:v.postcode,phone:phone.number});if(!created.sessionToken)throw new Error('Invalid payment session.');session.current=created.sessionToken;}
      savePendingPayment(getUser(),session.current,selected.id);
      setStatus('Submitting payment...');submitted.current=true;
      const result=await submitPayment({session_token:session.current,iban,iban_holder_name:identity.accountHolder});
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
                    {!member && <label className="text-xs font-bold">PASSWORD *<input className={fieldClass} type="password" name="password" autoComplete="new-password" minLength="8" required/></label>}
                    <label className="text-[10px] font-bold tracking-[.16em] text-ink/55">FIRST NAME *<input className={fieldClass} name="firstName" defaultValue={account?.firstname || ""} autoComplete="given-name" placeholder="First name" required /></label>
                    <label className="text-[10px] font-bold tracking-[.16em] text-ink/55">LAST NAME *<input className={fieldClass} name="lastName" defaultValue={account?.lastname || ""} autoComplete="family-name" placeholder="Last name" required /></label>
                    <label className="text-[10px] font-bold tracking-[.16em] text-ink/55 sm:col-span-2">PHONE NUMBER *<div className="mt-2 flex gap-3"><PhoneCountryPicker country={country} onChange={code=>{setCountry(code);validatePhone(phoneInput.current?.value,code);}} /><input ref={phoneInput} className={`h-12 min-w-0 flex-1 border bg-white px-4 text-base font-medium tracking-[.04em] outline-none transition placeholder:font-normal placeholder:tracking-normal placeholder:text-ink/35 focus:ring-2 focus:ring-coral/15 ${phoneError?'border-red-600 focus:border-red-600':'border-ink/20 focus:border-coral'}`} type="tel" name="phone" defaultValue={account?.phone || ""} onChange={event=>validatePhone(event.target.value)} onBlur={event=>validatePhone(event.target.value)} autoComplete="tel-national" placeholder="Phone number" aria-invalid={Boolean(phoneError)} aria-describedby={phoneError?'phone-error':undefined} required /></div>{phoneError && <span id="phone-error" role="alert" className="mt-2 block normal-case tracking-normal text-xs font-normal text-red-700">{phoneError}</span>}</label>
                  </div>
                </fieldset>

                <fieldset className="mt-9 border-t border-ink/15 pt-7">
                  <legend className="text-lg font-bold">Your Billing Details</legend>
                  <div className="mt-5 grid gap-5 sm:grid-cols-2">
                    <label className="text-[10px] font-bold tracking-[.16em] text-ink/55 sm:col-span-2">STREET ADDRESS *<input className={fieldClass} name="street" defaultValue={account?.address || ""} autoComplete="street-address" placeholder="Street, house no." required /></label>
                    <label className="text-[10px] font-bold tracking-[.16em] text-ink/55">TOWN / CITY *<input className={fieldClass} name="city" defaultValue={account?.city || ""} autoComplete="address-level2" placeholder="City" required /></label>
                    <label className="text-[10px] font-bold tracking-[.16em] text-ink/55">POSTCODE / ZIP *<input className={fieldClass} name="postcode" defaultValue={account?.postal_code || ""} autoComplete="postal-code" placeholder="Postal code" required /></label>
                    <label className="text-[10px] font-bold tracking-[.16em] text-ink/55 sm:col-span-2">COUNTRY<input type="hidden" name="country" value={country} /><BillingCountryPicker country={country} onChange={code=>{setCountry(code);validatePhone(phoneInput.current?.value,code);}} /></label>
                  </div>
                </fieldset>

                <fieldset className="mt-9 border-t border-ink/15 pt-7">
                  <legend className="text-lg font-bold">SEPA Direct Debit Information</legend>
                  <div className="mt-5 border border-ink/15 bg-cream p-4 text-xs leading-5 text-ink/60"><p><strong className="text-ink">SEPA Direct Debit</strong></p><p className="mt-2">By confirming this payment, you authorize {company.siteName} to send instructions to your bank to debit your account. You are entitled to a refund under the terms of your agreement with your bank.</p><label className="mt-4 block text-[10px] font-bold tracking-[.16em] text-ink/55">IBAN *<input className={fieldClass} name="iban" placeholder="IBAN" pattern="[A-Za-z0-9 ]{10,}" required /></label></div>
                </fieldset>

                <div className="mt-7 flex items-start gap-3 border border-ink/15 bg-cream p-4 text-xs leading-5 text-ink/60"><ShieldCheck className="mt-0.5 shrink-0 text-coral" size={17} /><p>Payment information is encrypted and secure. No card or bank details are stored on this device.</p></div>
                <p className="mt-5 text-center text-[11px] leading-4 text-ink/55">Your personal data will be used to process your order, support your experience throughout this website, and for other purposes described in our <a href="/privacy/" className="font-bold text-coral hover:text-ink">Privacy Policy</a>.</p>
                <label className="mt-3 flex items-start gap-3 text-xs leading-5 text-ink/65"><input className="mt-1 size-4 shrink-0 accent-coral" type="checkbox" required /><span>By proceeding with this payment, I confirm that I have read and agree to the <a href="/terms/" className="font-bold text-coral">Terms and Conditions</a> and <a href="/privacy/" className="font-bold text-coral">Privacy Policy</a>.</span></label>
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
