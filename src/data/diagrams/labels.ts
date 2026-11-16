import type { ArchitectureDiagram } from '../types.ts'

// Words shared by every architecture diagram.
export const diagramLabels: ArchitectureDiagram['labels'] = {
  flows: 'Trace a flow',
  kinds: {
    source: 'Source',
    service: 'Service',
    gateway: 'Gateway',
    registry: 'Registry',
    datastore: 'Datastore',
    cache: 'Cache',
    broker: 'Broker',
    client: 'Client',
    channel: 'Channel',
    external: 'External',
  },
}
