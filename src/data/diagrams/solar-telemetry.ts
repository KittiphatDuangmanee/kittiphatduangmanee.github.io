import type { ArchitectureDiagram } from '../types.ts'
import { diagramLabels } from './labels.ts'

// VOL. I. An abstracted view of the alarm pipeline. Every figure below is
// synthetic and chosen to be internally consistent (120 strings read every
// 5 minutes is 34,560 rows a day). No production data, site names, hostnames
// or endpoints appear here.
export const solarTelemetryDiagram: ArchitectureDiagram = {
  id: 'solar-telemetry',
  title: 'Telemetry and alarm pipeline',
  ariaSummary:
    'Architecture diagram. A plant data source is polled by a FastAPI ingestion scheduler. An anomaly evaluator checks each batch, writes history to TimescaleDB and the latest state to Redis, and raises alarms through a dispatcher to LINE and email. A dashboard API reads both stores for the React dashboard.',
  notice: 'Abstracted architecture · synthetic data',
  hint: 'Hover or tap a node to trace it',
  labels: diagramLabels,
  grid: { wide: { cols: 5, rows: 3 }, narrow: { cols: 3, rows: 4 } },
  inspectorArea: { col: 1, row: 2, colSpan: 2, rowSpan: 2 },
  defaultNodeId: 'evaluator',
  nodes: [
    {
      id: 'source',
      label: 'Plant data source',
      kind: 'source',
      tech: 'Readings feed',
      description: 'String level current and voltage readings from the plant side. Read only for this pipeline.',
      metrics: [
        { label: 'Strings reporting', value: '120' },
        { label: 'Reading interval', value: '5 min' },
      ],
      position: { wide: { col: 1, row: 1 }, narrow: { col: 1, row: 1 } },
    },
    {
      id: 'scheduler',
      label: 'Ingestion scheduler',
      kind: 'service',
      tech: 'FastAPI',
      description: 'A scheduled job pulls new readings on a fixed interval. Ingestion never waits for a page view.',
      metrics: [
        { label: 'Poll interval', value: '5 min' },
        { label: 'Batches per day', value: '288' },
      ],
      position: { wide: { col: 2, row: 1 }, narrow: { col: 2, row: 1 } },
    },
    {
      id: 'evaluator',
      label: 'Anomaly evaluator',
      kind: 'service',
      tech: 'Python',
      description: 'Checks every string for current and voltage deviation, then marks it normal, warning or alarm.',
      metrics: [
        { label: 'Deviation limits', value: 'I 15 %, V 10 %' },
        { label: 'Strings in alarm', value: '3 of 120' },
      ],
      position: { wide: { col: 3, row: 1 }, narrow: { col: 2, row: 2 } },
    },
    {
      id: 'timescale',
      label: 'TimescaleDB',
      kind: 'datastore',
      tech: 'Hypertables',
      description: 'Keeps reading history and the event log. Time partitioned, so chart queries stay cheap.',
      metrics: [
        { label: 'Rows per day', value: '34,560' },
        { label: 'Holds', value: 'history, event log' },
      ],
      position: { wide: { col: 3, row: 2 }, narrow: { col: 1, row: 2 } },
    },
    {
      id: 'redis',
      label: 'Redis',
      kind: 'cache',
      tech: 'State cache',
      description: 'Latest status per string, installed list per site, and the chart series for today.',
      metrics: [
        { label: 'Key families', value: '3' },
        { label: 'Status read', value: 'under 1 s' },
      ],
      position: { wide: { col: 4, row: 2 }, narrow: { col: 2, row: 3 } },
    },
    {
      id: 'dispatcher',
      label: 'Alert dispatcher',
      kind: 'service',
      tech: 'FastAPI',
      description: 'Turns a string entering alarm into a notification, so nobody has to watch a screen.',
      metrics: [
        { label: 'Alerts today', value: '4' },
        { label: 'Channels', value: '2' },
      ],
      position: { wide: { col: 4, row: 1 }, narrow: { col: 3, row: 2 } },
    },
    {
      id: 'line',
      label: 'LINE',
      kind: 'channel',
      tech: 'Messaging',
      description: 'The first notice lands in the chat app the operations team already has open.',
      metrics: [{ label: 'Delivery', value: 'push message' }],
      position: { wide: { col: 5, row: 1 }, narrow: { col: 3, row: 1 } },
    },
    {
      id: 'email',
      label: 'Email',
      kind: 'channel',
      tech: 'SMTP',
      description: 'A written record of the same alarm for people outside the chat group.',
      metrics: [{ label: 'Delivery', value: 'summary mail' }],
      position: { wide: { col: 5, row: 2 }, narrow: { col: 3, row: 3 } },
    },
    {
      id: 'api',
      label: 'Dashboard API',
      kind: 'service',
      tech: 'FastAPI',
      description: 'Serves the dashboard: live status from Redis, history and events from TimescaleDB.',
      metrics: [
        { label: 'Live reads', value: 'Redis' },
        { label: 'History reads', value: 'TimescaleDB' },
      ],
      position: { wide: { col: 3, row: 3 }, narrow: { col: 1, row: 3 } },
    },
    {
      id: 'dashboard',
      label: 'Monitoring dashboard',
      kind: 'client',
      tech: 'React',
      description: 'Site overview, a status tile per string, generation charts and alarm history.',
      metrics: [
        { label: 'Views', value: 'site, string, events' },
        { label: 'Refresh', value: 'every 5 min' },
      ],
      position: { wide: { col: 4, row: 3 }, narrow: { col: 1, row: 4 } },
    },
  ],
  groups: [],
  edges: [
    { id: 'source-scheduler', from: 'source', to: 'scheduler', kind: 'read', label: 'poll readings' },
    { id: 'scheduler-evaluator', from: 'scheduler', to: 'evaluator', kind: 'event', label: 'new batch' },
    { id: 'evaluator-timescale', from: 'evaluator', to: 'timescale', kind: 'write', label: 'history and events' },
    { id: 'evaluator-redis', from: 'evaluator', to: 'redis', kind: 'write', label: 'latest status' },
    { id: 'evaluator-dispatcher', from: 'evaluator', to: 'dispatcher', kind: 'alert', label: 'string in alarm' },
    { id: 'dispatcher-line', from: 'dispatcher', to: 'line', kind: 'alert', label: 'LINE message' },
    { id: 'dispatcher-email', from: 'dispatcher', to: 'email', kind: 'alert', label: 'email' },
    { id: 'timescale-api', from: 'timescale', to: 'api', kind: 'read', label: 'history, event log' },
    { id: 'redis-api', from: 'redis', to: 'api', kind: 'read', label: 'live status' },
    { id: 'api-dashboard', from: 'api', to: 'dashboard', kind: 'request', label: 'JSON for charts and tiles' },
  ],
  flows: [
    {
      id: 'ingest',
      label: 'Ingest',
      description: 'Readings are polled, evaluated, then written to both stores.',
      edgeIds: ['source-scheduler', 'scheduler-evaluator', 'evaluator-timescale', 'evaluator-redis'],
    },
    {
      id: 'alarm',
      label: 'Alarm fan-out',
      description: 'A string in alarm becomes a LINE message and an email.',
      edgeIds: ['scheduler-evaluator', 'evaluator-dispatcher', 'dispatcher-line', 'dispatcher-email'],
    },
    {
      id: 'serve',
      label: 'Serve',
      description: 'The dashboard reads live state from Redis and history from TimescaleDB.',
      edgeIds: ['timescale-api', 'redis-api', 'api-dashboard'],
    },
  ],
}
