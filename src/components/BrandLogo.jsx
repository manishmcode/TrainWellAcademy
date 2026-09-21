import { Dumbbell } from 'lucide-react';
import { company } from '../company';

export default function BrandLogo({ inverse = false, compact = false }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className={`grid size-10 shrink-0 place-items-center ${inverse ? 'bg-coral text-ink' : 'bg-ink text-coral'}`} aria-hidden="true">
        <Dumbbell size={21} strokeWidth={2.5} />
      </span>
      <span className={`${compact ? 'hidden sm:inline' : 'inline'} whitespace-nowrap text-lg font-bold tracking-[-.035em]`}>
        <span className={inverse ? 'text-cream' : 'text-ink'}>{company.brandShortName}</span><span className="text-coral">Academy</span>
      </span>
    </span>
  );
}
