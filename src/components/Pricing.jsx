import { fetchPlans } from '../services/api';
import { ArrowRight, Check, Crown, Dumbbell, LoaderCircle, Sparkles, X } from 'lucide-react';
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

const planPresentation = {
  basic: { order: 0, label: 'Build a steady habit', icon: Dumbbell },
  premium: { order: 1, label: 'Your full fitness system', icon: Crown },
  standard: { order: 2, label: 'Train with intention', icon: Sparkles },
};

const planKey = (plan) => String(plan.name || '').trim().toLowerCase();

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
          <p className="mb-6 font-display text-3xl uppercase text-ink md:text-4xl">Choose your membership plan</p>
          {error && <p role="alert" className="bg-white p-4">{error}</p>}
          {loading && <div role="status" className="grid min-h-80 place-items-center bg-white p-8"><div className="text-center"><div className="flex items-center justify-center gap-3 text-sm font-bold text-ink/70"><LoaderCircle className="animate-spin text-coral" size={24} />Loading plans…</div><div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2"><h2 className="font-display text-xl uppercase text-ink">Basic</h2><h2 className="font-display text-xl uppercase text-ink">Premium</h2><h2 className="font-display text-xl uppercase text-ink">Standard</h2></div></div></div>}
          {!loading && !error && !plans.length && <p className="bg-white p-4">No plans are currently available.</p>}
          {!loading && !error && <div className="grid gap-5 lg:grid-cols-3">
            {[...plans].sort((a, b) => {
              const aOrder = planPresentation[planKey(a)]?.order ?? Number.MAX_SAFE_INTEGER;
              const bOrder = planPresentation[planKey(b)]?.order ?? Number.MAX_SAFE_INTEGER;
              return aOrder - bOrder;
            }).map((plan, index) => {
              const key = planKey(plan);
              const presentation = planPresentation[key];
              const Icon = presentation?.icon ?? [Dumbbell, Crown, Sparkles][index % 3];
              const featured = key === 'premium';
              const features = Array.from(new Map((plan.features || []).map(feature => [feature.name, feature])).values())
                .sort((a, b) => Number(Boolean(b.is_included)) - Number(Boolean(a.is_included)));
              return (
                <article key={plan.id} className={`relative flex flex-col border p-6 shadow-[0_16px_35px_rgba(23,27,25,0.08)] transition md:p-8 ${featured ? 'border-coral bg-coral text-ink lg:-mt-5 lg:mb-5' : 'border-ink/10 bg-white'}`}>
                  {featured && <span className="absolute right-5 top-5 bg-ink px-3 py-1 text-[10px] font-bold tracking-[.12em] text-cream">MOST POPULAR</span>}
                  <div className={`grid size-12 place-items-center ${featured ? 'bg-ink text-coral' : 'bg-coral/15 text-coral'}`}><Icon size={22} /></div>
                  {presentation?.label && <span className={`eyebrow mt-8 text-[10px] ${featured ? 'text-ink/60' : 'text-coral'}`}>{presentation.label}</span>}
                  <h2 className="mt-3 font-display text-4xl uppercase">{plan.name}</h2>
                  <div className="mt-8 flex items-end gap-2 border-b border-current/15 pb-7"><span className="font-display text-6xl">{formatPrice(plan.price, plan.currency)}</span><span className="pb-2 text-xs opacity-60">/ month</span></div>
                  <ul className="my-7 flex-1 space-y-4 text-sm">
                    {features.map((feature) => <li key={feature.name} className={`flex gap-3 ${feature.is_included ? '' : 'opacity-45'}`}>{feature.is_included ? <Check className={`shrink-0 ${featured ? 'text-ink' : 'text-coral'}`} size={17} /> : <X className="shrink-0 text-ink" size={17} />}{feature.name}</li>)}
                  </ul>
                  <button onClick={() => { sessionStorage.setItem("trainwellacademy_checkout_plan_id", String(plan.id)); window.location.assign("/checkout/"); }} className={`btn group w-full justify-between ${featured ? 'border border-ink bg-ink hover:bg-transparent hover:text-ink' : 'border border-ink/25 bg-transparent text-ink hover:bg-coral hover:text-ink'}`}>
                    <span>CHOOSE {plan.name.toUpperCase()}</span><ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                  </button>
                </article>
              );
            })}
          </div>}
          <div className="mt-10 flex flex-col justify-between gap-4 border-t border-ink/15 pt-6 text-sm text-ink/60 md:flex-row"><p>Review your selected plan at checkout. Request cancellation anytime.</p><h2 className="font-bold text-ink"><a href="/unsubscribe" className="transition hover:text-coral">Need to cancel a membership? <span className="text-coral">→</span></a></h2></div>
        </section>
      </main>
      <Footer />
    </>
  );
}
