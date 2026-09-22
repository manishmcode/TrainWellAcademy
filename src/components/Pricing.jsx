import { fetchPlans } from '../services/api';
import { ArrowRight, Check, Crown, Dumbbell, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import Header from './Header';
import Footer from './Footer';

function formatPrice(price, currency) {
  try {
    return new Intl.NumberFormat('en', { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(Number(price));
  } catch {
    return `${currency || ''} ${price}`.trim();
  }
}

export default function Pricing() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    fetchPlans()
      .then(setPlans)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Header />
      <main className="bg-cream pb-24">
        <section className="bg-ink px-4 py-20 text-cream md:py-28">
          <div className="shell relative overflow-hidden">
            <div className="relative z-10 max-w-3xl">
              <span className="eyebrow text-coral">MEMBERSHIP / FIND YOUR FIT</span>
              <h1 className="display mt-7 text-[clamp(4rem,6vw,8.5rem)]">A PLAN FOR<br /><em className="not-italic text-coral">REAL LIFE.</em></h1>
              <p className="mt-8 max-w-lg text-base leading-7 text-cream/60">Choose the level of support that fits your rhythm. Every plan gives you a clear next step and room to grow.</p>
            </div>
            <div className="absolute -right-24 -top-40 size-[34rem] rounded-full border border-coral/15" />
            <div className="absolute -right-4 -top-20 size-72 rounded-full border border-coral/15" />
          </div>
        </section>

        <section className="shell -mt-10 md:-mt-16">
          {error && <p role="alert" className="bg-white p-4">{error}</p>}
          {loading && <p className="bg-white p-4">Loading plans…</p>}
          {!loading && !error && !plans.length && <p className="bg-white p-4">No plans are currently available.</p>}
          <div className="grid gap-5 lg:grid-cols-3">
            {plans.map((plan, index) => {
              const Icon = [Dumbbell, Crown, Sparkles][index % 3];
              const featured = index === 1;
              const includedFeatures = (plan.features || []).filter(feature => feature.is_included);
              return (
                <article key={plan.id} className={`relative flex flex-col border p-6 shadow-[0_16px_35px_rgba(23,27,25,0.08)] transition md:p-8 ${featured ? 'border-coral bg-coral text-ink lg:-mt-5 lg:mb-5' : 'border-ink/10 bg-white'}`}>
                  {featured && <span className="absolute right-5 top-5 bg-ink px-3 py-1 text-[10px] font-bold tracking-[.12em] text-cream">MOST POPULAR</span>}
                  <div className={`grid size-12 place-items-center ${featured ? 'bg-ink text-coral' : 'bg-coral/15 text-coral'}`}><Icon size={22} /></div>
                  {plan.description && <span className={`eyebrow mt-8 whitespace-pre-line text-[10px] ${featured ? 'text-ink/60' : 'text-coral'}`}>{plan.description}</span>}
                  <h2 className="mt-3 font-display text-4xl uppercase">{plan.name}</h2>
                  <div className="mt-8 flex items-end gap-2 border-b border-current/15 pb-7"><span className="font-display text-6xl">{formatPrice(plan.price, plan.currency)}</span><span className="pb-2 text-xs opacity-60">/ month</span></div>
                  <ul className="my-7 flex-1 space-y-4 text-sm">
                    {includedFeatures.map((feature) => <li key={feature.name} className="flex gap-3"><Check className="shrink-0 text-coral" size={17} />{feature.name}</li>)}
                  </ul>
                  <button onClick={() => { sessionStorage.setItem("trainwellacademy_checkout_plan_id", String(plan.id)); window.location.assign("/checkout/"); }} className={`btn group w-full justify-between ${featured ? 'border border-ink bg-ink hover:bg-transparent hover:text-ink' : 'border border-ink/25 bg-transparent text-ink hover:bg-coral hover:text-ink'}`}>
                    <span>CHOOSE {plan.name.toUpperCase()}</span><ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                  </button>
                </article>
              );
            })}
          </div>
          <div className="mt-10 flex flex-col justify-between gap-4 border-t border-ink/15 pt-6 text-sm text-ink/60 md:flex-row"><p>Review your selected plan at checkout. Request cancellation anytime.</p><a href="/unsubscribe" className="font-bold text-ink transition hover:text-coral">Need to cancel a membership? <span className="text-coral">→</span></a></div>
        </section>
      </main>
      <Footer />
    </>
  );
}
