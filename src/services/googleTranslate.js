const SOURCE_LANGUAGE = 'en';
const TRANSLATE_COOKIE = 'googtrans';
const COMBO_SELECTOR = '.goog-te-combo';
const TRANSLATE_ELEMENT_ID = 'google_translate_element';
const TRANSLATE_SCRIPT_ID = 'google-translate-script';
const TRANSLATION_STORAGE_KEY = 'trainwell_selected_language';

let translateLoader;
let bannerObserver;

export const TRANSLATION_LANGUAGES = ['en', 'sv', 'es', 'de'];

function hideGoogleTranslateBanner() {
  document.querySelectorAll('.skiptranslate').forEach((bannerContainer) => {
    if (bannerContainer.querySelector(':scope > iframe.skiptranslate')) {
      bannerContainer.style.setProperty('display', 'none', 'important');
    }
  });

  document.body?.style.setProperty('top', '0px', 'important');
}

function keepGoogleTranslateBannerHidden() {
  hideGoogleTranslateBanner();
  if (bannerObserver || !document.documentElement) return;

  bannerObserver = new MutationObserver(hideGoogleTranslateBanner);
  bannerObserver.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}

function initializeGoogleTranslate() {
  const element = document.getElementById(TRANSLATE_ELEMENT_ID);
  if (!element || !window.google?.translate?.TranslateElement || element.childElementCount) return;

  new window.google.translate.TranslateElement(
    {
      pageLanguage: SOURCE_LANGUAGE,
      includedLanguages: TRANSLATION_LANGUAGES.filter((language) => language !== SOURCE_LANGUAGE).join(','),
      autoDisplay: false,
    },
    TRANSLATE_ELEMENT_ID,
  );
  keepGoogleTranslateBannerHidden();
}

export function loadGoogleTranslate() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return Promise.resolve();

  initializeGoogleTranslate();
  if (window.google?.translate?.TranslateElement) return Promise.resolve();
  if (translateLoader) return translateLoader;

  translateLoader = new Promise((resolve, reject) => {
    window.googleTranslateElementInit = () => {
      initializeGoogleTranslate();
      keepGoogleTranslateBannerHidden();
      resolve();
    };

    const script = document.createElement('script');
    script.id = TRANSLATE_SCRIPT_ID;
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    script.onerror = () => reject(new Error('Google Translate could not be loaded.'));
    document.head.appendChild(script);
  });

  return translateLoader;
}

function getCookie(name) {
  if (typeof document === 'undefined') return '';

  const cookie = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${name}=`));

  return cookie ? decodeURIComponent(cookie.slice(name.length + 1)) : '';
}

function getCookieDomains() {
  if (typeof window === 'undefined') return [''];

  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  const parentDomains = parts
    .slice(1)
    .map((_, index) => parts.slice(index + 1).join('.'))
    .filter((domain) => domain.includes('.'));

  return [...new Set(['', hostname, `.${hostname}`, ...parentDomains, ...parentDomains.map((domain) => `.${domain}`)])];
}

function dispatchTranslateChange(combo, language) {
  combo.value = language;
  combo.dispatchEvent(new Event('change', { bubbles: true }));
}

function waitForTranslateCombo(attempts = 20, delay = 100) {
  return new Promise((resolve) => {
    const findCombo = (remaining) => {
      const combo = document.querySelector(COMBO_SELECTOR);
      if (combo || remaining === 0) {
        resolve(combo);
        return;
      }

      window.setTimeout(() => findCombo(remaining - 1), delay);
    };

    findCombo(attempts);
  });
}

export function getSelectedTranslationLanguage() {
  if (typeof window !== 'undefined') {
    const savedLanguage = window.localStorage.getItem(TRANSLATION_STORAGE_KEY);
    if (TRANSLATION_LANGUAGES.includes(savedLanguage)) return savedLanguage;
  }

  const value = getCookie(TRANSLATE_COOKIE);
  const match = value.match(/^\/([^/]+)\/([^/]+)$/);
  const target = match?.[2];

  return TRANSLATION_LANGUAGES.includes(target) ? target : SOURCE_LANGUAGE;
}

export function setGoogleTranslateCookie(targetLanguage) {
  document.cookie = `${TRANSLATE_COOKIE}=/${SOURCE_LANGUAGE}/${targetLanguage}; path=/; SameSite=Lax`;
}

export function clearGoogleTranslateCookie() {
  getCookieDomains().forEach((domain) => {
    const domainAttribute = domain ? `; domain=${domain}` : '';
    document.cookie = `${TRANSLATE_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domainAttribute}`;
  });
}

export async function switchGoogleTranslateLanguage(language) {
  const targetLanguage = TRANSLATION_LANGUAGES.includes(language) ? language : SOURCE_LANGUAGE;
  window.localStorage.setItem(TRANSLATION_STORAGE_KEY, targetLanguage);

  try {
    await (window.loadGoogleTranslate?.() ?? loadGoogleTranslate());
  } catch (error) {
    console.error(error);
  }
  keepGoogleTranslateBannerHidden();

  if (targetLanguage === SOURCE_LANGUAGE) {
    clearGoogleTranslateCookie();
    const combo = await waitForTranslateCombo();
    if (combo) dispatchTranslateChange(combo, '');
    window.location.reload();
    return SOURCE_LANGUAGE;
  }

  setGoogleTranslateCookie(targetLanguage);
  const combo = await waitForTranslateCombo();
  if (combo) dispatchTranslateChange(combo, targetLanguage);

  return targetLanguage;
}
