import Footer from './Footer';
import Header from './Header';
import { company, supportMailto } from '../company';
export default function Imprint() {
  return (
       
    <main className="min-h-screen bg-cream text-ink">
        <Header />
      <section className="shell py-10 md:py-16">
        <div className="grid gap-8 border-t-4 border-coral bg-white p-6 shadow-[0_20px_50px_rgba(23,27,25,0.08)] md:grid-cols-[.8fr_1.2fr] md:p-12">
          <div>
            <span className="eyebrow text-coral">IMPRINT</span>
            <h1 className="display mt-5 text-4xl md:text-5xl">THE DETAILS<br /><em className="not-italic text-coral">BEHIND TRAINWELL.</em></h1>
            <p className="mt-5 text-xl font-bold">Company and legal information</p>
            <p className="mt-5 max-w-sm leading-7 text-ink/60">Company information and legal details for the {company.siteName} fitness learning platform.</p>
          </div>
          <div className="grid gap-8 text-sm leading-7 text-ink/65 sm:grid-cols-2">
            <div>
              <h2 className="mb-3 font-bold text-ink">Company</h2>
              <p>{company.legalName}</p>
              {company.addressLines.map(line => <p key={line}>{line}</p>)}
              <p>Director: KONSTANTINOS GEORGIOS KORDENIS</p>
              <p className="mt-3">Tax number: {company.taxNumber}</p>
            </div>
            <div>
              <h2 className="mb-3 font-bold text-ink">Contact</h2>
              <p>Email: <a className="font-bold text-coral" href={supportMailto}>{company.supportEmail}</a></p>
            </div>
            <div className="border-t border-ink/15 pt-6 sm:col-span-2">
              <h2 className="mb-3 font-bold text-ink">Content Responsibility</h2>
              <p>Responsible for the content on this website: {company.legalName}, {company.addressLines.join(', ')}.</p>
            </div>
            <div className="border-t border-ink/15 pt-6 sm:col-span-2">
              <h2 className="mb-3 font-bold text-ink">Dispute Resolution</h2>
              <p>The European Commission provides a platform for online dispute resolution. We are neither obliged nor willing to participate in dispute resolution proceedings before a consumer arbitration board.</p>
            </div>
          </div>
        </div>
        <a href="/" className="btn mt-8">BACK TO TRAINWELL ↗</a>
      </section>
         <Footer />
    </main>
  );
}
