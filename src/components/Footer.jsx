import BrandLogo from './BrandLogo';

export default function Footer() {
  return (
    <footer className="border-t border-ink/10 bg-cream py-14 text-ink md:py-16">
      <div className="shell">
        <div className="grid gap-12 md:grid-cols-[1.35fr_.8fr_.9fr_1.2fr] md:gap-10">
          <div>
            <a href="/" className="inline-flex" aria-label="TrainWellAcademy.net homepage"><BrandLogo /></a>
            <p className="mt-6 max-w-xs leading-7 text-ink/60">Build a stronger routine with clear guidance, flexible programs, and coaching that keeps you moving forward.</p>
            <div className="mt-6 flex items-center gap-2" aria-label="Accepted payment methods">
              <img className="h-10 w-16 rounded-md border border-ink/10 bg-white object-contain p-2 shadow-sm" src="/assets/visa.webp" alt="Visa payment" />
              <img className="h-10 w-16 rounded-md border border-ink/10 bg-white object-contain p-2 shadow-sm" src="/assets/mastercard.webp" alt="Mastercard payment" />
              <img className="h-10 w-16 rounded-md border border-ink/10 bg-white object-contain p-2 shadow-sm" src="/assets/sepa.webp" alt="SEPA direct debit" />
            </div>
          </div>
          <nav className="flex flex-col gap-3 text-sm" aria-label="Quick links">
            <b className="mb-2 text-xs tracking-[.14em] text-coral">QUICK LINKS</b>
            <a href="/" className="transition hover:text-coral">Home</a><a href="/library" className="transition hover:text-coral">Library</a><a href="/pricing" className="transition hover:text-coral">Pricing</a><a href="/unsubscribe" className="transition hover:text-coral">Unsubscribe</a>
          </nav>
          <nav className="flex flex-col gap-3 text-sm" aria-label="Legal links">
            <b className="mb-2 text-xs tracking-[.14em] text-coral">LEGAL</b>
            <a href="/privacy" className="transition hover:text-coral">Privacy Policy</a><a href="/terms" className="transition hover:text-coral">Terms &amp; Conditions</a><a href="/imprint" className="transition hover:text-coral">Imprint</a>
          </nav>
          <div className="text-sm leading-7">
            <b className="mb-2 block text-xs tracking-[.14em] text-coral">COMPANY DETAILS</b>
            <address className="not-italic text-ink/65">
              <strong className="text-ink">DEKO 2026 LTD</strong><br />
              Town of SANDANSKI, 12 &quot;NADEJDA&quot; STREET<br />
              BLAGOEVGRAD REGION, 2800<br />
              REPUBLIC OF BULGARIA<br />
              <span className="font-bold text-ink">TAX NUMBER BG 208889087</span>
            </address>
          </div>
        </div>
        <div className="mt-12 border-t border-ink/10 pt-5 text-xs text-ink/45"><p>© 2026 TrainWellAcademy.net. All rights reserved.</p></div>
      </div>
    </footer>
  );
}
