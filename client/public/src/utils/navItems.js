// Mirrors the actual navigation menu embedded in the original site's pages
// (verified against news.html, not the stale header.html/footer.html template files).
// labelKey references the i18n dictionary (nav.*) so the menu renders in
// whichever language is active.
export const NAV_ITEMS = [
  { type: 'home', to: '/' },
  {
    labelKey: 'nav.about',
    children: [
      { labelKey: 'nav.introduction', to: '/about/introduction' },
      { labelKey: 'nav.history', to: '/about/history' },
      { labelKey: 'nav.objectives', to: '/about/objectives' },
      { labelKey: 'nav.organization', to: '/about/organization' },
      { labelKey: 'nav.managementCommittee', to: '/staff?type=administrative' },
    ],
  },
  { labelKey: 'nav.services', to: '/services' },
  { labelKey: 'nav.staff', to: '/staff' },
  {
    labelKey: 'nav.newsAndNotices',
    children: [
      { labelKey: 'nav.notice', to: '/news/notice' },
      { labelKey: 'nav.pressRelease', to: '/news/press_release' },
      { labelKey: 'nav.tenderNotice', to: '/news/tender_notice' },
      { labelKey: 'nav.news', to: '/news/news' },
      { labelKey: 'nav.events', to: '/news/event' },
    ],
  },
  {
    labelKey: 'nav.downloadCenter',
    children: [
      { labelKey: 'nav.forms', to: '/downloads/form' },
      { labelKey: 'nav.policy', to: '/downloads/policy' },
      { labelKey: 'nav.actionPlan', to: '/downloads/action_plan' },
      { labelKey: 'nav.budgetProgram', to: '/downloads/budget_program' },
      { labelKey: 'nav.annualReport', to: '/downloads/annual_report' },
      { labelKey: 'nav.otherReport', to: '/downloads/other_report' },
      { labelKey: 'nav.unicodeDownload', to: '/downloads/unicode_download' },
      { labelKey: 'nav.otherDownload', to: '/downloads/other' },
    ],
  },
  {
    labelKey: 'nav.mediaCenter',
    children: [
      { labelKey: 'nav.photoGallery', to: '/gallery/photo' },
      { labelKey: 'nav.videoGallery', to: '/gallery/video' },
    ],
  },
  { labelKey: 'nav.contact', to: '/contact' },
  { labelKey: 'nav.faq', to: '/faqs' },
];
