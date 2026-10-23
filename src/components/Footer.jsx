import { Link } from 'react-router-dom';
import { company } from '../company';
import { useEffect, useState } from 'react';
import { getCachedLibraryAccess, getToken } from '../services/auth';
import BrandLogo from './BrandLogo';

export default function Footer() {
  const [libraryAccess, setLibraryAccess] = useState(() => getCachedLibraryAccess());
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(getToken()));

  useEffect(() => {
    const updateSession = () => {
      setIsAuthenticated(Boolean(getToken()));
      setLibraryAccess(getCachedLibraryAccess());
    };
    const updateLibraryAccess = () => setLibraryAccess(getCachedLibraryAccess());
    window.addEventListener('authchange', updateSession);
    window.addEventListener('storage', updateSession);
    window.addEventListener('libraryaccesschange', updateLibraryAccess);
    return () => {
      window.removeEventListener('authchange', updateSession);
      window.removeEventListener('storage', updateSession);
      window.removeEventListener('libraryaccesschange', updateLibraryAccess);
    };
  }, []);

  return (
    <footer className="border-t border-ink/10 bg-cream py-14 text-ink md:py-16">
      <div className="shell">
        <div className="grid gap-12 md:grid-cols-[1.35fr_.8fr_.9fr_1.2fr] md:gap-10">
          <div>
            <Link to="/" className="inline-flex" aria-label={`${company.siteName} homepage`}><BrandLogo /></Link>
            <p className="mt-6 max-w-xs leading-7 text-ink/60">Build a stronger routine with clear guidance, flexible programs, and coaching that keeps you moving forward.</p>
            <div className="mt-6 flex items-center gap-2" aria-label="Accepted payment methods">
              <img className="h-10 w-16 rounded-md border border-ink/10 bg-white object-contain p-2 shadow-sm" src="/assets/visa-160.webp" width="160" height="65" alt="Visa payment" />
              <img className="h-10 w-16 rounded-md border border-ink/10 bg-white object-contain p-2 shadow-sm" src="/assets/mastercard-128.webp" width="128" height="95" alt="Mastercard payment" />
              <img className="h-10 w-16 rounded-md border border-ink/10 bg-white object-contain p-2 shadow-sm" src="/assets/sepa-128.webp" width="128" height="66" alt="SEPA direct debit" />
            </div>
          </div>
          <nav className="flex flex-col gap-3 text-sm" aria-label="Quick links">
            <b className="mb-2 text-xs tracking-[.14em] text-coral">QUICK LINKS</b>
            <Link to="/" className="transition hover:text-coral">Home</Link><Link to="/library/" className="transition hover:text-coral">Library</Link>{(!isAuthenticated || libraryAccess === false) && <Link to="/pricing/" className="transition hover:text-coral">Pricing</Link>}<Link to="/unsubscribe/" className="transition hover:text-coral">Unsubscribe</Link>
          </nav>
          <nav className="flex flex-col gap-3 text-sm" aria-label="Legal links">
            <b className="mb-2 text-xs tracking-[.14em] text-coral">LEGAL</b>
            <Link to="/privacy/" className="transition hover:text-coral">Privacy Policy</Link><Link to="/terms/" className="transition hover:text-coral">Terms &amp; Conditions</Link><Link to="/imprint/" className="transition hover:text-coral">Imprint</Link>
          </nav>
          <div className="text-sm leading-7">
            <b className="mb-2 block text-xs tracking-[.14em] text-coral">COMPANY DETAILS</b>
            <address className="not-italic text-ink/65">
              <strong className="text-ink">{company.legalName}</strong><br />
              {company.addressLines.map(line => <span key={line}>{line.replace(' REGION,', ',')}<br /></span>)}
              <a href={`mailto:${company.supportEmail}`} className="transition hover:text-coral">Email: {company.supportEmail}</a>
            </address>
          </div>
        </div>
        <div className="mt-12 border-t border-ink/10 pt-5 text-xs text-ink/45"><p>© {company.year} {company.siteName}. All rights reserved.</p></div>
      </div>
    </footer>
  );
}
