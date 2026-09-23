import { Play } from 'lucide-react';
import { getCourseAccessPath } from '../services/auth';

export default function Hero() {
  return <section id="top" className="shell grid min-h-[700px] gap-x-10 gap-y-0 pt-14 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
    <div>
      <span className="eyebrow">8 FITNESS CATEGORIES / ON DEMAND</span>
      <h1 className="display my-10 text-[clamp(4.5rem,8vw,7.5rem)]">YOUR NEXT<br />LEVEL <em className="not-italic text-coral">STARTS<br />HERE.</em></h1>
      <p className="max-w-xl text-base leading-7 text-ink/65">Explore 74 on-demand lessons across Pilates, bodyweight training, home workouts, nutrition, kettlebells and more—at your own pace.</p>
      <div className="mt-8 flex flex-wrap gap-4"><a className="btn" href="#courses">EXPLORE COURSES ↗</a></div>
    </div>
    <div className="relative h-[570px] overflow-hidden bg-ink"><img src="/assets/home/hero-fitness.png" alt="Athlete preparing for a home workout" width="1100" height="570" fetchPriority="high" /><a href={getCourseAccessPath()} aria-label="Explore the featured fitness program" className="absolute left-1/2 top-1/2 grid size-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-coral text-cream"><Play fill="currentColor" /></a><div className="absolute bottom-5 left-5 bg-cream p-4 pr-16"><small className="font-bold">FEATURED PROGRAM</small><b className="block text-lg">Ultimate Home Workout Plan</b><small>10 practical on-demand lessons</small></div></div>
    <div className="col-span-full mt-6 grid grid-cols-1 border-t border-ink sm:grid-cols-3">
      <b className="py-6 text-4xl">8<small className="ml-2 text-xs font-normal">TRAINING CATEGORIES</small></b>
      <b className="border-y border-ink py-6 text-4xl sm:border-x sm:border-y-0 sm:px-6">74<small className="ml-2 text-xs font-normal">ON-DEMAND LESSONS</small></b>
      <b className="py-6 text-4xl sm:px-6">ANYTIME<small className="ml-2 text-xs font-normal">TRAIN AT YOUR PACE</small></b>
    </div>
  </section>;
}
