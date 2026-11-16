import type { ProfileData } from './types.ts'

export const profile: ProfileData = {
  name: {
    full: 'Kittiphat Duangmanee',
    nickname: 'Mark',
    display: 'Kittiphat Duangmanee (Mark)',
    monogram: 'KD',
  },
  role: 'Full-Stack Developer',
  bio: 'I build full-stack web applications and scalable backend services. My work runs from FastAPI and Spring Boot APIs to real-time monitoring dashboards with React and TypeScript.',
  focus: [
    'Full-Stack Systems',
    'Backend Microservices',
    'Time-Series Telemetry',
    'Cloud Architecture',
  ],
  education: {
    degree: 'B.Eng. in Computer Engineering',
    institution: 'Kasetsart University',
    year: 2026,
  },
  experience: {
    role: 'Application Design Intern',
    organisation: 'SCG Cleanergy',
    period: 'Nov 2025 to Mar 2026',
  },
  location: { place: 'Bangkok, Thailand', detail: 'Thailand (UTC+7)' },
  // Hands-on skills only. Tools that appear in a single project stay in that
  // project's own stack in projects.ts.
  stackGroups: [
    {
      id: 'backend',
      label: 'Backend',
      items: [
        { id: 'python', label: 'Python' },
        { id: 'fastapi', label: 'FastAPI' },
        { id: 'java', label: 'Java' },
        { id: 'spring-boot', label: 'Spring Boot' },
        { id: 'spring-cloud-gateway', label: 'Spring Cloud Gateway' },
        { id: 'rabbitmq', label: 'RabbitMQ' },
      ],
    },
    {
      id: 'frontend',
      label: 'Frontend',
      items: [
        { id: 'typescript', label: 'TypeScript' },
        { id: 'react', label: 'React' },
        { id: 'angular', label: 'Angular' },
        { id: 'tailwind-css', label: 'Tailwind CSS' },
      ],
    },
    {
      id: 'data',
      label: 'Databases & Cache',
      items: [
        { id: 'postgresql', label: 'PostgreSQL' },
        { id: 'timescaledb', label: 'TimescaleDB' },
        { id: 'mysql', label: 'MySQL' },
        { id: 'redis', label: 'Redis' },
      ],
    },
    {
      id: 'cloud',
      label: 'DevOps & Cloud',
      items: [
        { id: 'docker', label: 'Docker' },
        { id: 'aws', label: 'AWS' },
        { id: 'git', label: 'Git' },
      ],
    },
  ],
  avatar: {
    src: 'images/profile-avatar.webp',
    width: 560,
    height: 700,
    alt: 'Portrait of Kittiphat Duangmanee in a dark suit, white shirt and green tie',
  },
  email: 'phat6452@gmail.com',
  links: [
    { label: 'GitHub', href: 'https://github.com/KittiphatDuangmanee', kind: 'github' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/kittiphat-duangmanee-8410362b3/', kind: 'linkedin' },
    { label: 'LeetCode', href: 'https://leetcode.com/u/Mark_Phat/', kind: 'leetcode' },
  ],
}
