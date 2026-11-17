import type { ArchitectureDiagram } from '../types.ts'

// OrderDi. One Hono application on Cloudflare Workers, with CockroachDB
// behind Drizzle ORM. The sales aggregation is ordinary SQL over the order
// tables, not a separate analytics product.
export const orderDiEdgeDiagram: ArchitectureDiagram = {
  id: 'orderdi-edge',
  title: 'Request path at the edge',
  summary:
    'Every request from the browser is answered by a Hono app running on Cloudflare Workers. Orders are written through Drizzle ORM to CockroachDB, and the sales report reads the same tables back as daily totals.',
  ariaSummary:
    'Architecture diagram of OrderDi. The staff browser sends HTTPS requests to the Cloudflare edge, where the Workers runtime calls a Hono router. The router writes orders through Drizzle ORM to CockroachDB, and asks a sales aggregation step for daily totals, which reads the same database through Drizzle.',
  grid: { cols: 4, rows: 2 },
  nodes: [
    {
      id: 'browser',
      label: 'Staff browser',
      tech: 'Tailwind CSS UI',
      icon: { kind: 'glyph', id: 'browser' },
      input: 'Staff working the floor plan, the counter, the menu and the reports.',
      output: 'HTTPS requests to the edge.',
      decision: 'OrderDi is a web app, so a restaurant needs a browser and nothing installed.',
      position: { col: 1, row: 1 },
    },
    {
      id: 'edge',
      label: 'Cloudflare edge',
      tech: 'Workers runtime',
      icon: { kind: 'tech', id: 'cloudflare-workers' },
      input: 'HTTPS requests from the restaurant.',
      output: 'A fetch call into the Hono application.',
      decision: 'Deployed on Workers, so there is no server to keep running and requests are handled close to the user.',
      position: { col: 2, row: 1 },
    },
    {
      id: 'hono',
      label: 'Hono router',
      tech: 'Hono 4, TypeScript',
      icon: { kind: 'tech', id: 'hono' },
      input: 'Fetch calls from the Workers runtime.',
      output: 'Typed queries for orders, bills and the menu, and requests for sales totals.',
      decision: 'Hono is written for edge runtimes, and its routes share TypeScript types with the database schema.',
      position: { col: 3, row: 1 },
    },
    {
      id: 'sales',
      label: 'Sales aggregation',
      tech: 'Daily totals',
      icon: { kind: 'glyph', id: 'sales-chart' },
      input: 'A date range from the report page.',
      output: 'Sales, bill counts and best sellers for that range.',
      decision: 'Totals are summed from the order tables themselves, so the report always agrees with the bills.',
      position: { col: 2, row: 2 },
    },
    {
      id: 'drizzle',
      label: 'Drizzle ORM',
      tech: 'Typed schema',
      icon: { kind: 'tech', id: 'drizzle-orm' },
      input: 'Queries from the router and from the sales aggregation.',
      output: 'SQL for CockroachDB.',
      decision: 'Menus, tables, bills and order items are described once in TypeScript, and the compiler checks every query against that schema.',
      position: { col: 3, row: 2 },
    },
    {
      id: 'cockroach',
      label: 'CockroachDB',
      tech: 'PostgreSQL wire',
      icon: { kind: 'tech', id: 'cockroachdb' },
      input: 'SQL from Drizzle ORM.',
      output: 'Rows for orders, bills, menu items and tables.',
      decision: 'It speaks the PostgreSQL wire protocol, so the data stays relational and transactional on a distributed database.',
      position: { col: 4, row: 2 },
    },
  ],
  edges: [
    { id: 'request', from: 'browser', to: 'edge', label: 'HTTPS / JSON', route: { from: 'right', to: 'left' } },
    { id: 'fetch', from: 'edge', to: 'hono', label: 'Worker fetch', route: { from: 'right', to: 'left' } },
    {
      id: 'query',
      from: 'hono',
      to: 'drizzle',
      label: 'Typed query',
      route: { from: 'bottom', to: 'top', fromAt: 0.65, toAt: 0.65 },
    },
    {
      id: 'report',
      from: 'hono',
      to: 'sales',
      label: 'Sales report',
      route: { from: 'bottom', to: 'top', fromAt: 0.3 },
    },
    { id: 'totals', from: 'sales', to: 'drizzle', label: 'Sum by day', route: { from: 'right', to: 'left' } },
    { id: 'sql', from: 'drizzle', to: 'cockroach', label: 'SQL', route: { from: 'right', to: 'left' } },
  ],
  flows: [
    {
      id: 'order-write',
      label: 'Order write',
      description:
        'An order placed in the browser travels through the edge and the router, and Drizzle writes it to CockroachDB.',
      edgeIds: ['request', 'fetch', 'query', 'sql'],
    },
    {
      id: 'sales-query',
      label: 'Sales query',
      description: 'The report page asks for a date range, and the totals are summed from the same order tables.',
      edgeIds: ['request', 'fetch', 'report', 'totals', 'sql'],
    },
  ],
}
