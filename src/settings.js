const APPLICATION_VARIABLES = {

  // General Info
  APP_NAME:"FBLA Chapter",
  APP_LINK:"https://ameyalabs-fbla.web.app",
  CHAPTER_WEBSITE:"https://fblachapterwebsite.com/",
  LANDING_PAGE_DESCRIPTION: "Short chapter description or promotional text here.",
  DEFAULT_PASSWORD:"FBLAChapter123",

  // Membership
  // EXCLUDE_FEATURES codes -> COMP_EVENTS, (more coming soon)
  MEMBERSHIPS: [
    {
      TYPE: 'GENERAL',
      PRICE: '20',
      EXCLUDE_FEATURES: ['COMP_EVENTS'],
    },
    {
      TYPE: 'PREMIUM',
      PRICE: '35',
      EXCLUDE_FEATURES: [],
    },
  ],

  // Socials (leave blank if chapter doesn't have one)
  CHAPTER_INSTAGRAM_URL: "https://www.instagram.com/",
  CHAPTER_TWITTER_URL: "https://twitter.com/",
  CHAPTER_FACEBOOK_URL: "https://www.facebook.com/",
  CHAPTER_YOUTUBE_URL: "https://www.youtube.com/channel/",
  CHAPTER_CONTACT_EMAIL: "fblachapter@gmail.com",

  // Platform Coloring
  NAV_BAR_COLOR:"#495867",

  CARD_HEADER_COLOR:"#577399",
  CARD_HEADER_TEXT_COLOR:"white",
  CARD_BACKGROUND_COLOR: "#F7F7FF",

  TABLE_HEADER_COLOR:"#BDD5EA",

  NEW_MEETING_ROW_COLOR: "#dfe7ed",
  NEW_MEETING_ROW_TEXT_COLOR: "white",
  MEETING_IN_ATTENDANCE_COLOR: "#198754",

  CALENDAR_EVENT_COLOR: "#FE5F55",
  CALENDAR_MEETING_COLOR: "green",

  // Help Information
  SUPPORT_EMAIL:"ameyalabs.help@gmail.com",
  SUPPORT_EMAIL_SUBJECT:"Technical Support for FBLA Chapter App",
  GENERAL_EMAIL:"fblachapter@gmail.com",
  GENERAL_EMAIL_SUBJECT:"General Support for FBLA Chapter App",

  // Version
  VERSION:"202209.07.22.13",

}

export default APPLICATION_VARIABLES;
