import Header from './Header';
import Footer from './Footer';

const sections = [
  ['1. Service', <>We provide online courses and educational materials through our platform. The Service is provided 'as is' and 'as available' without any warranties of any kind. We reserve the right to modify, suspend, or discontinue the Service at any time without notice.</>],
  ['2. User Agreement', <>By accessing or using the Service, you agree to be bound by these Terms and our Privacy Policy. If you disagree with any part of the terms, then you may not access the Service. You must provide accurate and complete information when creating an account.</>],
  ['3. Your License', <>We grant you a limited, non-exclusive, non-transferable, and revocable license to access and use the Service for your personal, non-commercial educational purposes. You may not copy, modify, distribute, sell, or lease any part of our Services or included software.</>],
  ['4. Support Services', <>Support is provided primarily via email and our dedicated support portal. You can contact Zenaria Ltd at <a href="mailto:support@learntechlive.net" className="font-bold text-coral">support@learntechlive.net</a>. We strive to respond to all inquiries within 24-48 business hours.</>],
  ['5. Fees and Payment', <>Certain aspects of the Service may be provided for a fee or other charge. If you elect to use paid aspects of the Service, you agree to the pricing and payment terms. We may add new services for additional fees and charges, or amend fees and charges for existing services, at any time in our sole discretion.</>],
  ['6. Cancellation', <>You may cancel your subscription at any time. Cancellation will take effect at the end of your current billing cycle. You will continue to have access to the Service through the end of your billing period.</>],
  ['7. Refund Policy', <><p>All courses and educational content offered through this website are delivered digitally and access is typically granted immediately upon purchase. By completing a purchase, you acknowledge that immediate access affects your eligibility for a refund as described below.</p><p className="mt-5">You may request a refund within 14 days of your initial purchase, provided that you have not substantially accessed or completed the course materials. Requests are assessed on a case-by-case basis and are not automatically guaranteed.</p><p className="mt-5">Refund requests must be submitted in writing to <a href="mailto:support@learntechlive.net" className="font-bold text-coral">support@learntechlive.net</a>, including your order number and the reason for the request. We aim to respond to all refund requests within 5 business days.</p><p className="mt-5">We may decline a refund request where a substantial portion of the course has been accessed or downloaded, where the request is made outside the eligible period, where the purchase was subject to a promotional or discounted rate explicitly marked as non-refundable, or where there is evidence of misuse, content sharing, or a violation of these Terms.</p><p className="mt-5">Approved refunds will be issued to the original payment method within a reasonable timeframe, subject to the processing times of the relevant payment provider. Upon approval, access to the course materials will be revoked.</p><p className="mt-5">Recurring subscription charges may be cancelled at any time to prevent future billing; cancellation does not itself entitle you to a refund of charges already incurred, except as set out above.</p></>],
  ['8. Right to Terminate', <>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</>],
  ['9. Your Responsibilities', <>You are responsible for all activities that occur under your account. You agree not to share your account credentials with third parties, use the Service for any illegal or unauthorized purpose, attempt to hack, destabilize, or adapt the Service, or transmit any worms, viruses, or destructive code.</>],
  ['10. Suspension/Discontinuation', <>We reserve the right at any time to modify or discontinue, temporarily or permanently, the Service or any part thereof with or without notice.</>],
  ['11. Dispute Resolution', <><p>If you have a complaint or dispute regarding a purchase, charge, or your use of the services, you agree to first contact us at <a href="mailto:support@learntechlive.net" className="font-bold text-coral">support@learntechlive.net</a> so that we may attempt to resolve the matter directly. We aim to acknowledge complaints within 24 hours and to reach a resolution within 5 business days.</p><p className="mt-5">We encourage you to raise any billing concern with us directly before contacting your card issuer or payment provider, as doing so allows us to resolve the matter more quickly than a formal chargeback process.</p><p className="mt-5">If a dispute cannot be resolved directly between you and the Company within a reasonable timeframe, either party may refer the matter to an independent mediation or alternative dispute resolution service before pursuing formal legal proceedings.</p></>],
  ['12. Governing Law', <>These Terms, and any dispute or claim arising out of or in connection with them or the services provided through this website, shall be governed by and construed in accordance with the laws of Cyprus, without regard to its conflict of law provisions. The courts of Cyprus shall have exclusive jurisdiction to settle any such dispute, save as otherwise provided in the Dispute Resolution clause above.</>],
  ['13. Copyright', <>All content, features, and functionality are and will remain the exclusive property of the Academy and its licensors. Our trademarks and trade dress may not be used in connection with any product or service without our prior written consent.</>],
  ['14. Links to Other Websites', <>Our Service may contain links to third-party web sites or services that are not owned or controlled by us. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third party web sites or services.</>],
  ['15. Trademarks', <>The company name, logo, and related names, product names, service names, designs, and slogans are trademarks of the Company or its affiliates or licensors.</>],
  ['16. Force Majeure', <>We shall not be liable for any failure or delay in performance under these Terms resulting from acts beyond our reasonable control, including war, terrorism, riots, embargoes, fire, floods, accidents, strikes, or shortages of transportation, fuel, energy, labor, or materials.</>],
  ['17. Disclaimer of Warranties', <>Your use of the Service is at your sole risk. The Service is provided on an AS IS and AS AVAILABLE basis. The Service is provided without warranties of any kind, whether express or implied.</>],
  ['18. Age Restriction', <>The Service is intended only for access and use by individuals at least eighteen (18) years old. By accessing or using any of the Company, you warrant and represent that you are at least eighteen (18) years of age.</>],
  ['19. General Provisions', <>These Terms shall be governed and construed in accordance with the laws of Cyprus, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.</>],
];

export default function Terms() {
  return (
    <div className="min-h-screen bg-cream text-ink">
      <Header />
      <main>
        <section className="shell py-10 md:py-16">
          <div className="mx-auto max-w-[900px] border-t-4 border-coral bg-white p-6 shadow-[0_20px_50px_rgba(23,27,25,0.08)] md:p-12">
            <div className="border-b border-ink/15 pb-8">
              <span className="eyebrow text-coral">TERMS AND CONDITIONS</span>
              <h1 className="mt-4 text-3xl font-bold md:text-4xl">Terms of Use</h1>
              <p className="mt-4 max-w-xl leading-7 text-ink/60">The rules and responsibilities that help keep the TrainWellAcademy.net learning experience clear, fair, and useful.</p>
              <span className="mt-5 block text-sm text-ink/50">Last updated: September, 2026</span>
              <div className="mt-6 border-l-4 border-coral bg-cream p-5 text-sm leading-7 text-ink/65">
                <strong className="block text-ink">Controller details</strong>
                <span className="block">Zenaria Ltd</span>
                <span className="block">Str A15 Stadiou</span>
                <span className="block">2867 Oikos</span>
                <span className="block">Nicosia, Cyprus</span>
                <a href="mailto:support@learntechlive.net" className="mt-2 inline-block font-bold text-coral">support@learntechlive.net</a>
              </div>
              <div className="mt-8 border-t border-ink/15 pt-8">
                <p className="mt-5 leading-7 text-ink/65">Please read these Terms and Conditions carefully before using our website and services operated by Zenaria Ltd, located at Str A15 Stadiou, 2867 Oikos, Nicosia, Cyprus.</p>
                <p className="mt-5 leading-7 text-ink/65">These Terms apply to all visitors, users, and others who access or use the Service. By accessing or using the Service you agree to be bound by these Terms. If you disagree with any part of the terms then you may not access the Service.</p>
              </div>
            </div>
            <div className="divide-y divide-ink/15">
              {sections.map(([heading, content]) => <section key={heading} className="py-8 first:pt-8"><h3 className="text-lg font-bold">{heading}</h3><div className="mt-4 leading-7 text-ink/65">{content}</div></section>)}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
