export const company = {
  brandName: 'TrainWellAcademy',
  brandShortName: 'TrainWell',
  siteName: 'TrainWellAcademy.net',
  legalName: 'DEKO 2026 LTD',
  addressLines: [
    'Town of SANDANSKI, 12 "NADEJDA" STREET',
    'BLAGOEVGRAD REGION, 2800',
    'REPUBLIC OF BULGARIA',
  ],
  taxNumber: 'BG 208889087',
  supportEmail: 'support@trainwellacademy.net',
  governingLawCountry: 'Bulgaria',
  year: '2026',
};

export const supportMailto = `mailto:${company.supportEmail}`;
export const companyAddress = company.addressLines.join(', ');
