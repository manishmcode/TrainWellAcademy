export const company = {
  brandName: 'TrainWellAcademy',
  brandShortName: 'TrainWell',
  siteName: 'TrainWellAcademy.net',
  legalName: 'DEKO 2026 LTD',
  addressLines: [
    'Town of SANDANSKI, 12 NADEJDA STREET',
    'BLAGOEVGRAD,2800',
    'REPUBLIC OF BULGARIA',
  ],
  taxNumber: 'BG 208889087',
  supportEmail: 'support@trainwellacademy.net',
  governingLawCountry: 'Bulgaria',
  year: '2026',
};

export let supportMailto = `mailto:${company.supportEmail}`;
export let companyAddress = company.addressLines.join(', ');
// Called before the first browser render and before each static render.
export function applySiteConfig(config) {
  Object.assign(company, config.company, { siteName: config.website.name });
  supportMailto = `mailto:${company.supportEmail}`;
  companyAddress = company.addressLines.join(', ');
}
