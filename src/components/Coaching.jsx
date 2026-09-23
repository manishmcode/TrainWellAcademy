import { company } from '../company';
import { Play } from 'lucide-react';
import { getCourseAccessPath } from '../services/auth';

export default function Coaching() {
  const highlights = ['Pilates and mobility training', 'Bodyweight and core workouts', 'Nutrition and meal-planning guidance', 'Kettlebell and exercise guides'];

  return <section id="coaching" className="grid bg-ink text-cream lg:grid-cols-[.8fr_1.2fr]">
    <div className="p-8 md:p-16 lg:p-24">
      <span className="eyebrow">02 / EXPLORE THE LIBRARY</span>
      <h2 className="display my-7 text-5xl md:text-7xl">TRAIN YOUR WAY.<br /><em className="text-coral not-italic">ON YOUR TIME.</em></h2>
      <p className="leading-7 text-cream/70">Choose from on-demand lessons designed for home workouts, core strength, Pilates, nutrition and progressive kettlebell training.</p>
      <div className="my-8">{highlights.map((item, index) => <div key={item} className="grid grid-cols-[40px_1fr] border-t border-cream/20 py-4"><b className="text-coral">0{index + 1}</b><span>{item}</span></div>)}</div>
      <a className="inline-flex bg-coral px-5 py-4 text-sm font-bold text-cream" href={getCourseAccessPath()}>EXPLORE LIBRARY →</a>
    </div>
    <div className="relative min-h-[500px]"><img className="object-contain" src="/assets/home/coaching.png" alt={`Certified ${company.siteName} coach guiding a workout`} width="1100" height="900" loading="lazy" /><a href={getCourseAccessPath()} aria-label="Explore training programs" className="absolute left-1/2 top-1/2 grid size-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-coral text-cream"><Play fill="currentColor" /></a></div>
  </section>;
}
