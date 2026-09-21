import Header from './Header';
import Footer from './Footer';
import { company, companyAddress, supportMailto } from '../company';

const sections = [
  ['1. Consent to Privacy Policy', <>By accessing and using our Site and Services, you acknowledge that you have read and agree to this Privacy Policy.</>],
  ['2. Information Collection and Personally Identifiable Information', <><p>We collect registration data, including email address, password, first name, last name, phone number, and payment details.</p><p className="mt-5">We collect usage data, including information about your browser, network, or device.</p><p className="mt-5">We collect marketing data related to communication and other interaction campaigns.</p><p className="mt-5">Legal bases include contract performance, legitimate interests, and compliance with legal obligations such as accounting and tax requirements.</p><p className="mt-5">You may request access to, correction of, or deletion of your data, restrict processing, or object to processing, especially marketing. We will honor such requests unless an overriding legal obligation applies.</p><p className="mt-5">We ensure processing through GDPR compliant data processors, such as hosting providers and payment processors. We may also be legally required to disclose information to authorities.</p></>],
  ['3. Information Use', <>We use information for processing payment transactions, customizing services, ads, and recommendations, contacting you and responding to requests, conducting research and improving services, preventing fraud, and ensuring security.</>],
  ['4. Information Sharing and Disclosure', <>We will not disclose your personally identifiable information except when required by law, to our service providers, in connection with corporate transactions, or with your explicit consent or at your direction.<p className="mt-5">We may share aggregate, anonymous information with partners, advertisers, or content distributors.</p></>],
  ['5. Changing or Deleting Your Information', <>You may review, update, correct, or delete your personal information by contacting us. We may retain your data for legally required recordkeeping purposes.</>],
  ['6. Use of Cookies and Similar Technologies', <><p>The merchant uses cookies, web beacons, device fingerprinting, and similar technologies for functionality, analytics, personalization, and advertising.</p><p className="mt-5">Types of cookies used include strictly necessary cookies, performance cookies, functional cookies, and targeting or advertising cookies.</p><p className="mt-5">Cookies help improve navigation, remember preferences, and display relevant ads. You can manage cookies in your browser settings. Blocking cookies may affect site functionality.</p><p className="mt-5">We may use Google Analytics and Facebook Pixel for tracking and marketing.</p></>],
  ['7. Behavioral Advertising and Online Privacy', <><p>We may use cookies and online identifiers for behavioral advertising. We follow industry standards like Network Advertising Initiative.</p><p className="mt-5">You can manage cookies via browser settings, but some site functions may not work if cookies are disabled.</p></>],
  ['8. Changes and Updates', <>We may periodically update this Privacy Policy. We will notify you by posting the modified terms on site. Your continued use implies agreement.</>],
  ['9. Contact', <>Questions, comments, and requests regarding this Privacy Policy are welcomed and should be addressed to {company.legalName}, {companyAddress}, or by email at <a href={supportMailto} className="font-bold text-coral">{company.supportEmail}</a>.</>],
];

export default function Privacy() {
  return (
    <div className="min-h-screen bg-cream text-ink">
      <Header />
      <main>
        <section className="shell py-10 md:py-16">
          <div className="mx-auto max-w-[900px] border-t-4 border-coral bg-white p-6 shadow-[0_20px_50px_rgba(23,27,25,0.08)] md:p-12">
            <div className="border-b border-ink/15 pb-8">
              <span className="eyebrow text-coral">PRIVACY POLICY</span>
              <h1 className="mt-4 text-3xl font-bold md:text-4xl">Privacy Policy</h1>
              <p className="mt-4 max-w-xl leading-7 text-ink/60">How {company.legalName} collects, uses, protects, and manages information when you use our Site and Services.</p>
              <p className="mt-5 text-sm text-ink/50">Last updated: September, 2026</p>
              <div className="mt-6 border-l-4 border-coral bg-cream p-5 text-sm leading-7 text-ink/65"><strong className="block text-ink">Controller details</strong><span className="block">{company.legalName}</span>{company.addressLines.map(line => <span className="block" key={line}>{line}</span>)}<a href={supportMailto} className="mt-2 inline-block font-bold text-coral">{company.supportEmail}</a></div>
            </div>
            <div className="divide-y divide-ink/15">{sections.map(([heading, content]) => <section key={heading} className="py-8"><h3 className="text-lg font-bold">{heading}</h3><div className="mt-4 leading-7 text-ink/65">{content}</div></section>)}</div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
