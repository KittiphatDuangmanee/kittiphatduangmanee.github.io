// Interface copy: navigation, section headings, buttons and accessibility
// labels. Kept here so components contain structure and behaviour only.

export interface NavLink {
  label: string
  href: string
}

export const site = {
  nav: {
    ariaLabel: 'Primary',
    skipToContent: 'Skip to content',
    homeLabel: 'Back to top',
    links: [
      { label: 'Projects', href: '#projects' },
      { label: 'Certifications', href: '#certifications' },
      { label: 'Contact', href: '#contact' },
    ] as readonly NavLink[],
    githubLabel: 'GitHub profile, opens in a new tab',
  },
  hero: {
    cta: { label: 'View projects', href: '#projects' },
    stackLabel: 'Core stack',
    educationLabel: 'Education',
    experienceLabel: 'Experience',
    locationLabel: 'Location',
  },
  projects: {
    id: 'projects',
    heading: 'Projects',
    lede: 'A solar alarm system from my internship at SCG Cleanergy, and a restaurant POS that is live in production.',
    detailsCta: 'View project details and architecture',
    opensInNewTab: 'opens in a new tab',
    carousel: {
      regionLabel: 'screens',
      previous: 'Previous screen',
      next: 'Next screen',
      pause: 'Pause slideshow',
      play: 'Play slideshow',
      goTo: 'Show screen',
      zoom: 'View full size',
      bringToFront: 'Bring to front',
      counterSeparator: '/',
    },
    modal: {
      close: 'Close',
      stack: 'Tech stack',
      overview: 'Overview and problem',
      contributions: 'What I built',
      architecture: 'System architecture',
    },
    diagram: {
      flowsLabel: 'Flows',
      allFlows: 'All flows',
      reset: 'Reset',
      hint: 'Select a component to see what goes in, what comes out, and the decision behind it.',
      technology: 'Technology',
      input: 'Input',
      output: 'Output',
      decision: 'Key engineering decision',
      connectionsLabel: 'Connections',
      connects: 'to',
    },
  },
  certifications: {
    id: 'certifications',
    eyebrow: 'Certifications',
    heading: 'Training and certification, on file',
    lede: 'Four documents, labelled as what they are. Open any of them to read the original PDF.',
    hint: 'Swipe, drag, or use the arrows',
    regionLabel: 'Certificates carousel',
    previous: 'Previous certificate',
    next: 'Next certificate',
    goTo: 'Show certificate',
    inspect: 'Inspect certificate',
    bringToFront: 'Bring to front',
    counterSeparator: '/',
    lightbox: {
      close: 'Close',
      issuer: 'Issued by',
      issued: 'Issued',
    },
  },
  footer: {
    id: 'contact',
    eyebrow: 'Contact',
    heading: 'Write to me',
    lede: 'The fastest way to reach me is email. I read everything.',
    copy: 'Copy email',
    copied: 'Copied',
    copyFailed: 'Press Ctrl and C to copy',
    sendMail: 'Send an email',
    profilesLabel: 'Profiles',
    colophonLabel: 'Colophon',
    colophon: [
      'Set in Newsreader, Plus Jakarta Sans and JetBrains Mono.',
      'Built with React, TypeScript, Tailwind CSS and Framer Motion.',
      'Hosted as a static site on GitHub Pages.',
    ],
    copyrightHolder: 'Kittiphat Duangmanee',
  },
} as const
