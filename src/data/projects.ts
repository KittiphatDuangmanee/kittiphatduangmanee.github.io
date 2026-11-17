import { orderDiEdgeDiagram } from './diagrams/orderdi-edge.ts'
import { solarTelemetryDiagram } from './diagrams/solar-telemetry.ts'
import type { Project, ProjectScreen } from './types.ts'

/**
 * One screen as the asset pipeline writes it: screen-N.webp is the whole
 * frame, screen-N-card.webp the crop the carousel shows.
 */
function screen(
  project: Project['id'],
  number: number,
  title: string,
  caption: string,
  alt: string,
  size: { card: [number, number]; full: [number, number] },
): ProjectScreen {
  const base = `images/projects/${project}/screen-${number}`
  return {
    id: `${project}-${number}`,
    title,
    caption,
    card: { src: `${base}-card.webp`, width: size.card[0], height: size.card[1], alt },
    full: { src: `${base}.webp`, width: size.full[0], height: size.full[1], alt },
  }
}

// Captured from the deployed application at 1440 by 900, device scale 2.
const orderDiCapture = { card: [1440, 900], full: [2880, 1800] } satisfies Parameters<typeof screen>[5]

// Frames exported at 2x from the Solar_Monitoring Figma file (1440 by 1024),
// with synthetic data. The asset pipeline covers the company logo.
const solarFrame = { card: [1440, 900], full: [2880, 2048] } satisfies Parameters<typeof screen>[5]

export const projects: readonly Project[] = [
  {
    id: 'solar',
    anchor: 'project-solar',
    title: 'Solar String Monitoring Alarm System',
    badge: ['SCG Cleanergy', 'Application Design Intern'],
    context: {
      role: 'Application Design Intern',
      organisation: 'SCG Cleanergy',
      period: 'Nov 2025 to Mar 2026',
    },
    summary:
      'Monitors a solar plant one string at a time. Every five minutes it collects current and voltage, compares each string with its threshold, and marks it normal, warning or alarm. A string in alarm reaches the operators by LINE and email, so nobody has to watch the dashboard.',
    stack: [
      { id: 'python', label: 'Python' },
      { id: 'fastapi', label: 'FastAPI' },
      { id: 'react', label: 'React' },
      { id: 'timescaledb', label: 'TimescaleDB' },
      { id: 'redis', label: 'Redis' },
      { id: 'line-messaging-api', label: 'LINE Messaging API' },
      { id: 'smtp', label: 'SMTP' },
    ],
    screens: [
      screen(
        'solar',
        1,
        'Plant overview',
        'Site health, the number of strings in alarm, and a list of active alarms that filters by site, inverter, string and error type.',
        'Solar monitoring dashboard: a site health ring, 64 active string alarms, a site status ring, and a table of active alarms.',
        solarFrame,
      ),
      screen(
        'solar',
        2,
        'String status grid',
        'Every string of a site as a tile, grouped by inverter and coloured normal, warning or alarm.',
        'String status grid for Site A: counts of alarm, warning and normal strings above numbered tiles for each inverter, coloured red, orange or green.',
        solarFrame,
      ),
      screen(
        'solar',
        3,
        'String performance',
        'Output of each string hour by hour for one inverter. A string that lags its neighbours shows up in a different colour from the rest of its column.',
        'Performance heatmap: strings PV01 to PV18 down the side and the hours of the day across, each cell coloured by output.',
        solarFrame,
      ),
      screen(
        'solar',
        4,
        'String detail',
        'One string on its own: its alarm and warning faults with start time and state, and its performance ratio day by day.',
        'Detail page for string PV01: three device broken faults with start times, above a line chart of the daily and 15 day average performance ratio.',
        solarFrame,
      ),
      screen(
        'solar',
        5,
        'Event history',
        'Past faults counted by type and by inverter state, above a table of every event that filters like the alarm list.',
        'Event history: bar charts of faults by type and by inverter state, above a table of past warnings.',
        solarFrame,
      ),
    ],
    note: 'Internal enterprise system. Screens are shown with synthetic data.',
    detail: {
      overview: [
        'A solar plant loses output one string at a time, and the plant total hides it: one weak string disappears inside the site figure. Operators needed to see which string drifted and when, and to be told without watching a screen.',
        'The system reads current and voltage for every string every five minutes, checks each reading against its threshold, keeps the history, and sends an alarm by LINE and email. I built it during my internship at SCG Cleanergy, from November 2025 to March 2026.',
      ],
      contributions: [
        'Built the scheduled ingestion in FastAPI. A job collects current and voltage for every string at a fixed five minute interval.',
        'Wrote the anomaly rules that compare each string against dynamic thresholds and classify it as normal, warning or alarm.',
        'Split storage in two. TimescaleDB hypertables hold the history for time range queries, and Redis caches the latest state so the dashboard reads it in under a second.',
        'Added alerts through the LINE Messaging API and SMTP email, so operators hear about an alarm without watching a screen.',
        'Designed the monitoring dashboard in Figma and built it in React, down to string level diagnostics.',
      ],
      diagram: solarTelemetryDiagram,
    },
  },
  {
    id: 'orderdi',
    anchor: 'project-orderdi',
    title: 'OrderDi',
    subtitle: 'Restaurant order and POS platform',
    badge: ['Full-stack web application', 'Live in production'],
    context: { role: 'Full-stack build' },
    summary:
      'A point of sale for restaurants that runs in the browser. Staff open tables from a floor plan, ring up orders at the counter and keep the menu current, and the report page totals the sales as bills close. It is deployed on Cloudflare Workers, so there is no server to look after.',
    stack: [
      { id: 'hono', label: 'Hono' },
      { id: 'typescript', label: 'TypeScript' },
      { id: 'tailwind-css', label: 'Tailwind CSS' },
      { id: 'drizzle-orm', label: 'Drizzle ORM' },
      { id: 'cockroachdb', label: 'CockroachDB' },
      { id: 'cloudflare-workers', label: 'Cloudflare Workers' },
    ],
    screens: [
      screen(
        'orderdi',
        1,
        'Table floor plan',
        'Tables grouped by zone, each with its status and seats. The plan updates on its own as tables open and close.',
        'OrderDi table floor plan in Thai: 21 tables in two zones, each marked free with four seats, under zone and status filters.',
        orderDiCapture,
      ),
      screen(
        'orderdi',
        2,
        'Counter sale',
        'The point of sale screen. The menu sits on the left by category, and the order, its total and the takeaway or dine-in switch on the right.',
        'OrderDi counter sale screen in Thai: a grid of dishes with photos and prices beside an empty order panel showing a total of zero baht.',
        orderDiCapture,
      ),
      screen(
        'orderdi',
        3,
        'Menu management',
        'Every dish has a price, a cost, an availability switch and its own option groups, such as spice level and toppings.',
        'OrderDi menu management in Thai: a list of dishes with availability switches beside the detail panel of one dish with its price, cost and options.',
        orderDiCapture,
      ),
      screen(
        'orderdi',
        4,
        'Sales report',
        'Seven days of sales: revenue, gross profit and closed bills, the split between PromptPay and cash, and the best selling dishes.',
        'OrderDi sales report in Thai: summary figures, a payment method split, a daily sales bar chart and a best sellers list.',
        orderDiCapture,
      ),
    ],
    live: { label: 'Visit live app', href: 'https://orderdi.apps.sv-academy.org', kind: 'demo' },
    detail: {
      overview: [
        'A small restaurant runs on three questions: what is on the menu right now, what does each table owe, and how did today go. Paper tickets and a spreadsheet answer them late.',
        'OrderDi answers them from one web app. A table is opened from the floor plan, its orders build the bill, and every closed bill lands in the sales report. The whole application runs on Cloudflare Workers with CockroachDB behind it.',
      ],
      contributions: [
        'Built the order and POS web app with Hono 4, TypeScript and Tailwind CSS, and deployed it on Cloudflare Workers so it is served from the edge.',
        'Modelled menus, tables, live bills and order items as one typed relational schema in Drizzle ORM. The database is CockroachDB, which speaks the PostgreSQL wire protocol.',
        'Implemented the table ordering flow, menu management, and daily sales totals that update as bills are paid.',
      ],
      diagram: orderDiEdgeDiagram,
    },
  },
]
