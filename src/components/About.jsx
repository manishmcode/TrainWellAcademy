export default function About() {
  const steps = [
    ['01', 'Watch', '74 on-demand video lessons.'],
    ['02', 'Practice', 'Train at home, in the gym or anywhere.'],
    ['03', 'Progress', 'Build strength, mobility and healthy habits.'],
  ];

  return <section id="about" className="shell grid gap-12 py-24 lg:grid-cols-2 lg:items-center">
    <div className="relative h-[560px]"><img className="object-contain" src="/assets/home/about-wellness.png" alt="Fitness equipment for on-demand training" width="1000" height="800" loading="lazy" /><span className="absolute bottom-5 right-5 grid size-32 place-items-center rounded-full bg-coral text-center font-bold text-cream">8<br />CATEGORIES</span></div>
    <div><span className="eyebrow">03 / THE TRAINWELL METHOD</span><h2 className="display my-7 text-5xl md:text-7xl">YOUR COMPLETE <em className="text-coral not-italic">FITNESS LIBRARY.</em></h2><p className="text-base leading-7 text-ink/65">From Pilates and core training to nutrition, home workouts, kettlebells and individual exercise guides, find the lessons that fit your goals.</p><div className="mt-10 grid md:grid-cols-3">{steps.map(item => <article className="border-t border-ink py-5 pr-4" key={item[0]}><b className="text-coral">{item[0]}</b><h3 className="mt-3 text-lg font-bold">{item[1]}</h3><p className="mt-2 text-ink/60">{item[2]}</p></article>)}</div></div>
  </section>;
}
