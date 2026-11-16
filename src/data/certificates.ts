import type { CertificateItem } from './types.ts'

// Titles, issuers and dates are written exactly as each document states them.
// Previews and PDFs are produced by scripts/assets/build_assets.py.
export const certificates: readonly CertificateItem[] = [
  {
    id: 'aws-cloud-practitioner-essentials',
    title: 'AWS Cloud Practitioner Essentials',
    issuer: 'AWS Training & Certification',
    kind: 'Course completion certificate',
    issued: { year: 2026, label: '3 Nov 2026' },
    summary:
      'Foundation course from AWS on cloud concepts, core services, security, architecture and pricing.',
    preview: {
      thumb: {
        src: 'images/certificates/aws-cloud-practitioner-essentials-thumb.webp',
        width: 900,
        height: 696,
        alt: 'AWS Training and Certification completion certificate for AWS Cloud Practitioner Essentials, awarded to Kittiphat Duangmanee',
      },
      full: {
        src: 'images/certificates/aws-cloud-practitioner-essentials.webp',
        width: 1800,
        height: 1391,
        alt: 'AWS Training and Certification completion certificate for AWS Cloud Practitioner Essentials, awarded to Kittiphat Duangmanee, completed 3 November 2026',
      },
    },
    document: {
      href: 'certificates/aws-cloud-practitioner-essentials.pdf',
      label: 'Open / Download PDF',
    },
  },
  {
    id: 'depa-security-engineer',
    title: 'Security Engineer Training Program',
    issuer: 'depa with ARIT',
    kind: 'Training certificate · 60 hours',
    issued: { year: 2025, label: '14 Nov 2025' },
    summary:
      'A 60 hour program for new graduates, certified under the depa Digital Skill Roadmap: network security, security frameworks, Linux administration, threat hunting, cloud security, SIEM and incident response.',
    preview: {
      thumb: {
        src: 'images/certificates/depa-security-engineer-thumb.webp',
        width: 900,
        height: 636,
        alt: 'Certificate from depa and ARIT, in Thai, for completing the Security Engineer training program',
      },
      full: {
        src: 'images/certificates/depa-security-engineer.webp',
        width: 1800,
        height: 1273,
        alt: 'Certificate from depa and ARIT, in Thai, for completing the 60 hour Security Engineer training program, awarded 14 November 2025',
      },
    },
    document: {
      href: 'certificates/depa-security-engineer.pdf',
      label: 'Open / Download PDF',
    },
  },
  {
    id: 'arit-security-engineer',
    title: 'Security Engineer Program, Selected Participant',
    issuer: 'ARIT Co., Ltd.',
    kind: 'Selection certificate',
    issued: { year: 2025, label: '14 Nov 2025' },
    summary:
      'Selected to join the Security Engineer program for new graduates entering industry, held 3 to 14 November 2025.',
    preview: {
      thumb: {
        src: 'images/certificates/arit-security-engineer-thumb.webp',
        width: 900,
        height: 636,
        alt: 'Certificate from ARIT, in Thai, for selection into the Security Engineer program',
      },
      full: {
        src: 'images/certificates/arit-security-engineer.webp',
        width: 1800,
        height: 1273,
        alt: 'Certificate from ARIT, in Thai, for selection into the 60 hour Security Engineer program, awarded 14 November 2025',
      },
    },
    document: {
      href: 'certificates/arit-security-engineer.pdf',
      label: 'Open / Download PDF',
    },
  },
  {
    id: 'its-cybersecurity',
    title: 'IT Specialist: Cybersecurity',
    issuer: 'Certiport, a Pearson VUE business',
    kind: 'Exam based certification',
    issued: { year: 2025, label: '27 Nov 2025' },
    summary:
      'Proctored exam covering security principles, securing the network, securing endpoint devices, vulnerability assessment and risk management, and incident management. Valid for five years.',
    preview: {
      thumb: {
        src: 'images/certificates/its-cybersecurity-thumb.webp',
        width: 900,
        height: 696,
        alt: 'Information Technology Specialist certificate in Cybersecurity from Certiport, awarded to Kittiphat Duangmanee',
      },
      full: {
        src: 'images/certificates/its-cybersecurity.webp',
        width: 1800,
        height: 1391,
        alt: 'Information Technology Specialist certificate in Cybersecurity from Certiport, awarded to Kittiphat Duangmanee on 27 November 2025',
      },
    },
    document: {
      href: 'certificates/its-cybersecurity.pdf',
      label: 'Open / Download PDF',
    },
  },
]
