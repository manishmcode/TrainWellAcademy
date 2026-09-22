import { useEffect, useState } from 'react';
import { Globe, Menu, UserRound, X } from 'lucide-react';
import { company } from '../company';
import {
  getSelectedTranslationLanguage,
  switchGoogleTranslateLanguage,
} from '../services/googleTranslate';
import { getToken } from '../services/auth';
import BrandLogo from './BrandLogo';

export default function Header() {
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState(getSelectedTranslationLanguage);
  const [loggedIn, setLoggedIn] = useState(() => Boolean(getToken()));

  useEffect(() => {
    setLanguage(getSelectedTranslationLanguage());
  }, []);

  useEffect(() => {
    const syncAuth = () => setLoggedIn(Boolean(getToken()));

    syncAuth();
    window.addEventListener('authchange', syncAuth);
    window.addEventListener('storage', syncAuth);

    return () => {
      window.removeEventListener('authchange', syncAuth);
      window.removeEventListener('storage', syncAuth);
    };
  }, []);

  async function handleLanguageChange(event) {
    const selectedLanguage = event.target.value;
    const activeLanguage = await switchGoogleTranslateLanguage(selectedLanguage);
    setLanguage(activeLanguage);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-ink/15 bg-cream/95 backdrop-blur">
      <div className="shell flex h-[78px] items-center">
        <a href="/" aria-label={`${company.siteName} homepage`}>
          <BrandLogo compact />
        </a>

        <nav
          aria-label="Primary navigation"
          className={`${open ? 'flex' : 'hidden'} absolute inset-x-0 top-[78px] flex-col gap-6 border-b border-ink/15 bg-cream p-8 md:static md:ml-auto md:flex md:flex-row md:items-center md:border-0 md:bg-transparent md:p-0`}
        >
          <a href="/" onClick={() => setOpen(false)}>Home</a>
          <a href="/pricing" onClick={() => setOpen(false)}>Pricing</a>
          <a href="/library" onClick={() => setOpen(false)}>Library</a>
          <a href="/unsubscribe" onClick={() => setOpen(false)}>Unsubscribe</a>
        </nav>

        <label
          className="ml-auto flex items-center gap-2 border-l border-ink/15 pl-3 text-sm md:ml-5 md:pl-5"
          aria-label="Choose language"
        >
          <Globe size={16} />
          <select
            className="cursor-pointer bg-transparent text-sm outline-none"
            value={language}
            onChange={handleLanguageChange}
          >
            <option value="en">EN</option>
            <option value="sv">SV</option>
            <option value="es">ES</option>
            <option value="de">DE</option>
          </select>
        </label>

        {loggedIn ? (
          <a
            href="/profile"
            className="ml-3 grid size-10 shrink-0 place-items-center rounded-full border border-ink/15 text-ink transition hover:border-coral hover:bg-coral hover:text-ink"
            aria-label="Open profile"
          >
            <UserRound size={19} />
          </a>
        ) : (
          <a href="/login" className="btn ml-3 hidden md:inline-flex">LOGIN</a>
        )}

        <button
          onClick={() => setOpen(!open)}
          className="ml-3 md:hidden"
          aria-label="Toggle navigation"
          aria-expanded={open}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  );
}
