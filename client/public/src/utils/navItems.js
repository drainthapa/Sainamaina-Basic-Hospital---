// Mirrors the actual navigation menu embedded in the original site's pages
// (verified against news.html, not the stale header.html/footer.html template files).
export const NAV_ITEMS = [
  { type: 'home', to: '/' },
  {
    label: 'हाम्रो बारेमा',
    children: [
      { label: 'परिचय', to: '/about/introduction' },
      { label: 'स्थापना इतिहास', to: '/about/history' },
      { label: 'उद्देश्य तथा लक्ष्य', to: '/about/objectives' },
      { label: 'संगठन संरचना', to: '/about/organization' },
      { label: 'व्यवस्थापन समिति', to: '/staff?type=administrative' },
    ],
  },
  { label: 'अस्पताल सेवाहरू', to: '/services' },
  { label: 'चिकित्सक तथा कर्मचारी', to: '/staff' },
  {
    label: 'सूचना तथा समाचार',
    children: [
      { label: 'सूचना', to: '/news/notice' },
      { label: 'प्रेस विज्ञप्ति', to: '/news/press_release' },
      { label: 'बोलपत्र सूचना', to: '/news/tender_notice' },
      { label: 'समाचार', to: '/news/news' },
      { label: 'कार्यक्रम तथा गतिविधि', to: '/news/event' },
    ],
  },
  {
    label: 'डाउनलोड केन्द्र',
    children: [
      { label: 'फारामहरू', to: '/downloads/form' },
      { label: 'नीति', to: '/downloads/policy' },
      { label: 'कार्यविधी / कार्ययोजना', to: '/downloads/action_plan' },
      { label: 'बजेट तथा कार्यक्रम', to: '/downloads/budget_program' },
      { label: 'बार्षिक प्रतिवेदन', to: '/downloads/annual_report' },
      { label: 'अन्य प्रतिवेदन', to: '/downloads/other_report' },
      { label: 'युनिकोड डाउनलोड्स', to: '/downloads/unicode_download' },
      { label: 'अन्य डाउनलोड्स', to: '/downloads/other' },
    ],
  },
  {
    label: 'मिडिया सेन्टर',
    children: [
      { label: 'तस्विर संग्रह', to: '/gallery/photo' },
      { label: 'वृत्त चित्र', to: '/gallery/video' },
    ],
  },
  { label: 'सम्पर्क', to: '/contact' },
  { label: 'FAQ', to: '/faqs' },
];
