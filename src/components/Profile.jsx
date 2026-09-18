import { Check, CreditCard, FileText, KeyRound, LogOut, Save, UserRound } from 'lucide-react';
import { useState } from 'react';
import Footer from './Footer';
import Header from './Header';

const tabs = [
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'subscriptions', label: 'My subscriptions', icon: FileText },
  { id: 'account', label: 'Account Details', icon: UserRound },
  { id: 'password', label: 'Change Password', icon: KeyRound },
];

const inputClass = 'mt-2 block h-12 w-full min-w-0 border-b-2 border-ink/20 bg-transparent px-0 text-sm text-ink outline-none transition placeholder:text-ink/30 focus:border-coral';
const labelClass = 'block min-w-0 text-[11px] font-bold tracking-[.16em] text-ink/55';

function PanelHeader({ eyebrow, title, number }) {
  return <header className="flex items-end justify-between gap-4 border-b border-ink/15 pb-6"><div><p className="text-xs font-bold tracking-[.17em] text-coral">{eyebrow}</p><h2 className="mt-2 text-3xl font-bold tracking-[-.025em] text-ink sm:text-[36px]">{title}</h2></div><span className="pb-1 text-sm font-bold text-coral/20">{number}</span></header>;
}

export default function Profile() {
  const [activeTab, setActiveTab] = useState('account');
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ firstName: 'sampleuser', lastName: '', displayName: 'sampleuser', email: 'sampleuser@gmail.com' });
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [passwordStatus, setPasswordStatus] = useState('');

  function updateField(event) {
    setSaved(false);
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function saveProfile(event) {
    event.preventDefault();
    setSaved(true);
  }

  function updatePassword(event) {
    setPasswordStatus('');
    setPasswords((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function savePassword(event) {
    event.preventDefault();
    if (passwords.next !== passwords.confirm) {
      setPasswordStatus('Passwords do not match.');
      return;
    }
    setPasswords({ current: '', next: '', confirm: '' });
    setPasswordStatus('Password updated successfully.');
  }

  return (
    <div className="min-h-screen bg-cream text-ink">
      <Header />
      <main className="bg-cream px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
        <div className="mx-auto grid w-full max-w-[1216px] items-start gap-7 lg:grid-cols-[270px_minmax(0,1fr)]">
          <aside className="overflow-hidden border border-ink/15 bg-white shadow-[0_14px_34px_rgba(23,27,25,0.06)]">
            <div className="flex min-h-[198px] flex-col items-center justify-center bg-ink px-5 py-7 text-center">
              <div className="grid size-[72px] place-items-center bg-coral text-2xl font-bold text-ink shadow-[0_12px_28px_rgba(240,100,59,0.2)]">S</div>
              <h1 className="mt-5 text-lg font-bold text-cream">sampleuser</h1>
              <p className="mt-1 text-xs text-cream/55">sampleuser@gmail.com</p>
            </div>

            <div className="p-3.5">
              <nav className="space-y-1.5" aria-label="Profile settings">
                {tabs.map(({ id, label, icon: Icon }) => (
                  <button key={id} type="button" onClick={() => setActiveTab(id)} aria-current={activeTab === id ? 'page' : undefined} className={`flex min-h-12 w-full items-center gap-3 px-3.5 text-left text-[13px] font-bold transition ${activeTab === id ? 'bg-coral text-white shadow-[0_9px_20px_rgba(240,100,59,0.18)]' : 'text-ink hover:bg-cream hover:text-coral'}`}>
                    <Icon size={18} strokeWidth={2} />
                    <span>{label}</span>
                  </button>
                ))}
              </nav>
              <a href="/login" className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 border border-ink/15 text-[13px] font-bold text-ink/55 transition hover:border-coral hover:text-coral"><LogOut size={17} /> Log Out</a>
            </div>
          </aside>

          <section className="min-h-[590px] border border-ink/15 bg-white px-5 py-9 shadow-[0_14px_34px_rgba(23,27,25,0.05)] sm:px-8 lg:px-12 lg:py-12">
            {activeTab === 'account' ? (
              <form onSubmit={saveProfile}>
                <PanelHeader eyebrow="PROFILE INFORMATION" title="Account Details" number="03" />

                <div className="mt-7 grid gap-5 sm:grid-cols-2">
                  <label className={labelClass}>FIRST NAME<input className={inputClass} name="firstName" value={form.firstName} onChange={updateField} autoComplete="given-name" placeholder="First name" /></label>
                  <label className={labelClass}>LAST NAME<input className={inputClass} name="lastName" value={form.lastName} onChange={updateField} autoComplete="family-name" placeholder="Last name" /></label>
                  <label className={`${labelClass} sm:col-span-2`}>DISPLAY NAME<input className={inputClass} name="displayName" value={form.displayName} onChange={updateField} autoComplete="nickname" placeholder="Display name" required /></label>
                  <label className={`${labelClass} sm:col-span-2`}>EMAIL / USERNAME<input className={inputClass} name="email" type="email" value={form.email} onChange={updateField} autoComplete="email" placeholder="you@example.com" required /></label>
                </div>

                <div className="mt-6 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
                  {saved && <span role="status" className="flex items-center justify-center gap-1.5 text-xs font-bold text-ink/60 sm:mr-2"><Check size={14} className="text-coral" /> Changes saved successfully.</span>}
                  <button type="submit" className="inline-flex min-h-12 items-center justify-center gap-2 bg-ink px-6 text-xs font-bold text-cream shadow-[0_12px_26px_rgba(23,27,25,0.18)] transition hover:bg-coral hover:text-ink"><Save size={15} /> Save Changes</button>
                </div>
              </form>
            ) : activeTab === 'payments' ? (
              <div>
                <PanelHeader eyebrow="ACCOUNT ACTIVITY" title="Payments" number="01" />
                <div className="mt-7 overflow-x-auto">
                  <table className="w-full min-w-[650px] border-collapse text-left text-xs">
                    <thead className="text-[10px] uppercase tracking-[.14em] text-ink/50"><tr className="border-b border-ink/15"><th className="pb-5 font-bold">Payments</th><th className="pb-5 font-bold">Date</th><th className="pb-5 font-bold">Status</th><th className="pb-5 text-right font-bold">Total</th></tr></thead>
                    <tbody><tr className="border-b border-ink/15"><td className="py-6 font-bold">manual_3_2_1785240644102</td><td className="py-6 font-bold">28/07/2026</td><td className="py-6"><span className="inline-flex items-center gap-2 bg-coral/15 px-3 py-2 text-[10px] font-bold tracking-[.1em] text-coral"><i className="size-1.5 bg-coral not-italic" />PAID</span></td><td className="py-6 text-right font-bold">EUR 99</td></tr></tbody>
                  </table>
                </div>
              </div>
            ) : activeTab === 'subscriptions' ? (
              <div>
                <PanelHeader eyebrow="CURRENT PLAN" title="My subscriptions" number="02" />
                <div className="mt-8 grid gap-8">
                  <div><span className="text-[10px] font-bold text-coral">01</span><h3 className="mt-2 text-sm font-bold">Premium</h3></div>
                  <dl className="text-xs">
                    <div className="flex items-center justify-between gap-5 border-b border-ink/15 pb-4"><dt className="text-ink/55">Auto-Renewal</dt><dd><span className="inline-flex items-center gap-2 bg-coral/15 px-3 py-2 text-[10px] font-bold tracking-[.08em] text-coral"><i className="size-1.5 bg-coral not-italic" />ACTIVE</span></dd></div>
                    <div className="flex justify-between gap-5 border-b border-ink/15 py-4"><dt className="text-ink/55">Start Date</dt><dd className="font-bold">28/08/2026</dd></div>
                    <div className="flex justify-between gap-5 border-b border-ink/15 py-4"><dt className="text-ink/55">Next Billing Date</dt><dd className="font-bold">28/09/2026</dd></div>
                    <div className="flex justify-between gap-5 border-b border-ink/15 py-4"><dt className="text-ink/55">Payment Type</dt><dd className="text-right font-bold">Monthly Recurring</dd></div>
                    <div className="flex justify-between gap-5 border-b border-ink/15 py-4"><dt className="text-ink/55">Payment</dt><dd className="font-bold">Paid</dd></div>
                    <div className="flex justify-between gap-5 border-b border-ink/15 py-4"><dt className="text-ink/55">Reference</dt><dd className="break-all text-right font-bold">manual_3_2_1785240644102</dd></div>
                    <div className="flex justify-between gap-5 pt-4"><dt className="font-bold">Recurring Amount</dt><dd className="font-bold">EUR 99/month</dd></div>
                  </dl>
                </div>
              </div>
            ) : (
              <form onSubmit={savePassword}>
                <PanelHeader eyebrow="ACCOUNT SECURITY" title="Change Password" number="04" />
                <div className="mt-7 space-y-5">
                  <label className={labelClass}>CURRENT PASSWORD<input className={inputClass} type="password" name="current" value={passwords.current} onChange={updatePassword} placeholder="Current password" autoComplete="current-password" required /></label>
                  <label className={labelClass}>NEW PASSWORD<input className={inputClass} type="password" name="next" value={passwords.next} onChange={updatePassword} placeholder="New password" autoComplete="new-password" minLength={8} required /></label>
                  <label className={labelClass}>CONFIRM NEW PASSWORD<input className={inputClass} type="password" name="confirm" value={passwords.confirm} onChange={updatePassword} placeholder="Confirm new password" autoComplete="new-password" minLength={8} required /></label>
                </div>
                <div className="mt-6 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
                  {passwordStatus && <span role="status" className={`text-center text-xs font-bold sm:mr-2 ${passwordStatus.startsWith('Password updated') ? 'text-ink/60' : 'text-coral'}`}>{passwordStatus}</span>}
                  <button type="submit" className="inline-flex min-h-12 items-center justify-center gap-2 bg-ink px-6 text-xs font-bold text-cream shadow-[0_12px_26px_rgba(23,27,25,0.18)] transition hover:bg-coral hover:text-ink"><KeyRound size={15} /> Update Password</button>
                </div>
              </form>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
