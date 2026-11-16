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
    cta: { label: 'Explore Monographs', href: '#projects' },
    stackLabel: 'Core stack',
    educationLabel: 'Education',
    experienceLabel: 'Experience',
    locationLabel: 'Location',
  },
  projects: {
    id: 'projects',
    eyebrow: 'Selected works',
    heading: 'Four systems, bound as monographs',
    lede: 'Each volume opens on a working model of the system: an architecture you can trace or a product state you can change. The notes beside it say what was hard and what I decided.',
    railLabel: 'Volumes',
    railHint: 'Index',
    pillsLabel: 'Jump to a volume',
    sections: {
      problem: 'Problem & Context',
      decisions: 'Architecture & Key Decisions',
      stack: 'Stack',
      links: 'Repository & Demo',
    },
    syntheticTag: 'synthetic',
    opensInNewTab: 'opens in a new tab',
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
    bringToCentre: 'Bring to centre',
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
