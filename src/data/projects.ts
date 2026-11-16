import { salonMeshDiagram } from './diagrams/salon-mesh.ts'
import { solarTelemetryDiagram } from './diagrams/solar-telemetry.ts'
import { orderDiPreview } from './previews/orderdi.ts'
import { realWorldXpPreview } from './previews/realworld-xp.ts'
import { monographThemes } from './themes.ts'
import type { ProjectVolume } from './types.ts'

export const projects: readonly ProjectVolume[] = [
  {
    id: 'vol-1',
    anchor: 'volume-1',
    volume: { numeral: 'I', label: 'VOL. I' },
    title: 'Solar String Monitoring Alarm System',
    shortTitle: 'Solar Alarm System',
    subtitle: 'String level anomaly detection for solar plants',
    context: {
      role: 'Application Design Intern',
      organisation: 'SCG Cleanergy',
      period: 'Nov 2025 to Mar 2026',
    },
    domainBadge: 'Telemetry · Alerting',
    summary:
      'A monitoring dashboard and alarm pipeline that watches a solar plant one string at a time and tells the operator when one drifts.',
    problem: [
      'A solar plant loses output one string at a time, and a plant level total hides it: a single weak string disappears inside the site figure. Operators needed to see which string drifted and when, and to hear about it without watching a screen.',
      'Built during a five month internship. What is shown here is an abstracted architecture with synthetic figures. No production data, screens, site names or hostnames are reproduced.',
    ],
    decisions: [
      {
        heading: 'Ingest on a schedule, evaluate on arrival',
        body: 'A FastAPI job pulls plant readings on a fixed interval and runs the deviation check as each batch lands. Alarms are raised by the pipeline, not by someone opening a page.',
      },
      {
        heading: 'Two stores, two jobs',
        body: 'TimescaleDB hypertables keep reading history and the event log. Redis keeps only what the dashboard asks for constantly: the latest status per string, the installed list per site, and the chart series for today.',
      },
      {
        heading: 'Thresholds on deviation',
        body: 'Each string is checked for current and voltage deviation and sorted into normal, warning or alarm, which is what the status tiles on the dashboard show.',
      },
      {
        heading: 'Alerts leave the dashboard',
        body: 'A string entering alarm becomes a LINE message and an email, so the first notice arrives where the operator already is.',
      },
    ],
    stack: ['FastAPI', 'React', 'TimescaleDB', 'Redis', 'Anomaly Detection', 'LINE / Email Alerting'],
    quickMetric: { label: 'Ingest cadence', value: '5 min', synthetic: true },
    links: [],
    linkNote: 'Internship work under NDA. Source code and screens are not public.',
    theme: monographThemes['vol-1'],
    visual: {
      kind: 'solar-architecture',
      diagram: solarTelemetryDiagram,
      strings: {
        label: 'Strings',
        states: [
          { id: 'normal', label: 'normal', count: 113 },
          { id: 'warning', label: 'warning', count: 4 },
          { id: 'alarm', label: 'alarm', count: 3 },
        ],
      },
    },
  },
  {
    id: 'vol-2',
    anchor: 'volume-2',
    volume: { numeral: 'II', label: 'VOL. II' },
    title: 'OrderDi',
    shortTitle: 'OrderDi',
    subtitle: 'Restaurant order management platform',
    context: { role: 'Full-stack build' },
    domainBadge: 'Edge · Point of sale',
    summary:
      'An order workflow for restaurants that runs at the edge: staff edit the menu, track every open bill, and read the day in one sales view.',
    problem: [
      'A small restaurant runs on three questions: what is on the menu right now, what does each table owe, and how did today go. Paper tickets and a spreadsheet answer them late.',
      'OrderDi puts all three in one place: real time menu editing, live bill tracking per table, and daily sales analytics.',
    ],
    decisions: [
      {
        heading: 'Run on the edge',
        body: 'The API is a Hono 4 application on Cloudflare Workers, so there is no server to keep warm and requests are answered close to the restaurant.',
      },
      {
        heading: 'One typed path from table to query',
        body: 'TypeScript end to end, with Drizzle ORM describing the schema once. A change to a menu item is checked by the compiler from the form to the SQL.',
      },
      {
        heading: 'Distributed SQL behind it',
        body: 'CockroachDB speaks the PostgreSQL wire protocol, so orders and bills stay relational and transactional while the database scales out.',
      },
      {
        heading: 'A bill is live state',
        body: 'The bill for each table updates as orders are added and served, and the same order data feeds the daily sales view, so the two can never disagree.',
      },
    ],
    stack: ['Hono 4', 'TypeScript', 'Tailwind CSS', 'Drizzle ORM', 'CockroachDB / PostgreSQL', 'Cloudflare Workers'],
    quickMetric: { label: 'Runtime', value: 'Cloudflare Workers', synthetic: false },
    links: [],
    linkNote: 'Private repository.',
    theme: monographThemes['vol-2'],
    visual: { kind: 'order-board', preview: orderDiPreview },
  },
  {
    id: 'vol-3',
    anchor: 'volume-3',
    volume: { numeral: 'III', label: 'VOL. III' },
    title: 'Salon Booking Microservices Platform',
    shortTitle: 'Salon Booking',
    subtitle: 'Distributed booking and payments',
    context: { role: 'Full-stack build' },
    domainBadge: 'Microservices · Events',
    summary:
      'A salon booking product split into eight Spring Boot services behind one gateway, with payments confirmed through RabbitMQ events.',
    problem: [
      'Booking a salon touches accounts, salons, services, schedules, payments, notifications and reviews. In one application those concerns grow into each other, and a slow payment provider can stall the whole request.',
      'This build separates them: each concern is a service with its own database, found through a registry and reached through one gateway.',
    ],
    decisions: [
      {
        heading: 'One door in',
        body: 'Spring Cloud Gateway is the only public entry. It validates the Keycloak JWT, then routes by path to a service name, so clients never learn a service address.',
      },
      {
        heading: 'Discovery over configuration',
        body: 'Services register with Eureka on start. The gateway and the Feign clients resolve each other by name, which is what lets a service move or scale without a config change.',
      },
      {
        heading: 'A database per service',
        body: 'Eight services, eight schemas. A service reads another through a Feign call, never through a shared table, so each schema can change on its own.',
      },
      {
        heading: 'Payment is an event',
        body: 'The payment service creates a Stripe or Razorpay link. When the payment succeeds it publishes to RabbitMQ: one queue confirms the booking, another notifies the customer and the salon. Neither blocks the payment response.',
      },
    ],
    stack: [
      'Java Spring Boot',
      'Spring Cloud Gateway',
      'Eureka Discovery',
      'PostgreSQL',
      'MySQL',
      'Redis',
      'RabbitMQ',
      'Stripe / Razorpay',
      'React',
    ],
    quickMetric: { label: 'Topology', value: '8 services, 1 gateway', synthetic: false },
    links: [
      {
        label: 'Backend repository',
        href: 'https://github.com/KittiphatDuangmanee/BackendSalonBooking-SpringBoot-',
        kind: 'repo',
      },
      {
        label: 'Frontend repository',
        href: 'https://github.com/KittiphatDuangmanee/FrontEndSalonBooking-React-',
        kind: 'repo',
      },
    ],
    theme: monographThemes['vol-3'],
    visual: { kind: 'microservices', diagram: salonMeshDiagram },
  },
  {
    id: 'vol-4',
    anchor: 'volume-4',
    volume: { numeral: 'IV', label: 'VOL. IV' },
    title: 'RealWorld_XP',
    shortTitle: 'RealWorld_XP',
    subtitle: 'Gamified activity and lifestyle tracker',
    context: { role: 'Team project', period: 'Aug 2025 to Oct 2025' },
    domainBadge: 'ML · Gamification',
    summary:
      'A web application that classifies a lifestyle from a short survey with TabNet, then turns healthy days into XP, levels and streaks.',
    problem: [
      'Habit trackers ask for effort every day and give little back. The idea here was to make a day of real activity pay out like a game: answer a short survey, get a lifestyle class, earn XP for it.',
      'The classifier is a TabNet model, a deep learning architecture built for tabular data, trained on the Half a Million Lifestyle dataset from Kaggle.',
    ],
    decisions: [
      {
        heading: 'Deep learning that fits a table',
        body: 'Survey answers are rows and columns, not images or text. TabNet learns from tabular features directly and attends to a few of them at each step.',
      },
      {
        heading: 'The model behind an API',
        body: 'FastAPI serves the trained model. The Angular client posts survey answers and receives a class and its probabilities, so the model can be retrained without shipping a new front end.',
      },
      {
        heading: 'XP as the feedback loop',
        body: 'Activity earns XP, XP fills a level bar, and a daily check-in extends a streak that persists between sessions.',
      },
    ],
    stack: ['Python', 'FastAPI', 'TabNet Deep Learning', 'Angular'],
    quickMetric: { label: 'Model', value: 'TabNet', synthetic: false },
    links: [],
    linkNote: 'Team repository, not public.',
    theme: monographThemes['vol-4'],
    visual: { kind: 'xp-tracker', preview: realWorldXpPreview },
  },
]
