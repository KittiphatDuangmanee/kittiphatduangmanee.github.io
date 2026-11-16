import type { ArchitectureDiagram, ArchitectureNode, GridPos } from '../types.ts'
import { diagramLabels } from './labels.ts'

// VOL. III. The topology in the public repository: one gateway, one Eureka
// registry, eight Spring Boot services that each own a MySQL database, and
// RabbitMQ carrying payment events to the booking and notification services.

interface ServiceSpec {
  id: string
  label: string
  route: string
  database: string
  description: string
  wide: GridPos
  narrow: GridPos
}

const services: readonly ServiceSpec[] = [
  {
    id: 'user',
    label: 'User',
    route: '/api/users',
    database: 'userdb',
    description: 'Accounts and roles. Signs users up against Keycloak and keeps the profile.',
    wide: { col: 1, row: 2 },
    narrow: { col: 1, row: 2 },
  },
  {
    id: 'salon',
    label: 'Salon',
    route: '/api/salons',
    database: 'salondb',
    description: 'Salon profiles and ownership. Other services ask it who owns a salon.',
    wide: { col: 2, row: 2 },
    narrow: { col: 2, row: 2 },
  },
  {
    id: 'category',
    label: 'Category',
    route: '/api/categories',
    database: 'categorydb',
    description: 'The categories a salon files its services under.',
    wide: { col: 3, row: 2 },
    narrow: { col: 1, row: 3 },
  },
  {
    id: 'offering',
    label: 'Offering',
    route: '/api/service-offering',
    database: 'servicesdb',
    description: 'The bookable services of a salon, with price and duration.',
    wide: { col: 4, row: 2 },
    narrow: { col: 1, row: 4 },
  },
  {
    id: 'review',
    label: 'Review',
    route: '/api/reviews',
    database: 'reviewdb',
    description: 'Ratings and written reviews for a salon.',
    wide: { col: 1, row: 3 },
    narrow: { col: 1, row: 5 },
  },
  {
    id: 'notification',
    label: 'Notification',
    route: '/api/notifications',
    database: 'notificationdb',
    description: 'Consumes notification-queue and stores a notice for the customer and the salon.',
    wide: { col: 2, row: 3 },
    narrow: { col: 2, row: 3 },
  },
  {
    id: 'booking',
    label: 'Booking',
    route: '/api/bookings',
    database: 'bookingdb',
    description: 'Asks payment for a link through Feign, then confirms when the event arrives on booking-queue.',
    wide: { col: 3, row: 3 },
    narrow: { col: 2, row: 4 },
  },
  {
    id: 'payment',
    label: 'Payment',
    route: '/api/payments',
    database: 'paymentdb',
    description: 'Creates a Stripe or Razorpay link. On success it publishes to both queues.',
    wide: { col: 4, row: 3 },
    narrow: { col: 2, row: 5 },
  },
]

const serviceNodes: readonly ArchitectureNode[] = services.map((service) => ({
  id: service.id,
  label: service.label,
  kind: 'service',
  tech: 'Spring Boot',
  description: service.description,
  metrics: [
    { label: 'Gateway route', value: service.route },
    { label: 'Database', value: service.database },
  ],
  position: { wide: service.wide, narrow: service.narrow },
}))

export const salonMeshDiagram: ArchitectureDiagram = {
  id: 'salon-mesh',
  title: 'Service topology and booking flow',
  ariaSummary:
    'Architecture diagram. A React client calls a Spring Cloud Gateway, which validates tokens with Keycloak and routes to eight Spring Boot services registered with Eureka: user, salon, category, offering, review, notification, booking and payment. Each service owns a MySQL database. The payment service calls Stripe or Razorpay and publishes events to RabbitMQ, which the booking and notification services consume.',
  notice: 'Topology from the public repository',
  hint: 'Hover or tap a service to trace it',
  labels: diagramLabels,
  grid: { wide: { cols: 6, rows: 4 }, narrow: { cols: 3, rows: 6 } },
  inspectorArea: { col: 5, row: 1, colSpan: 2, rowSpan: 3 },
  defaultNodeId: 'payment',
  nodes: [
    {
      id: 'client',
      label: 'Web client',
      kind: 'client',
      tech: 'React',
      description: 'Customer and salon owner screens. Every call goes through the gateway.',
      metrics: [{ label: 'Talks to', value: 'gateway only' }],
      position: { wide: { col: 1, row: 1 }, narrow: { col: 1, row: 1 } },
    },
    {
      id: 'gateway',
      label: 'API Gateway',
      kind: 'gateway',
      tech: 'Spring Cloud',
      description: 'The only entry point. Validates the JWT, then routes by path to a service name.',
      metrics: [
        { label: 'Routes', value: '8' },
        { label: 'Target scheme', value: 'lb://SERVICE-NAME' },
      ],
      position: { wide: { col: 2, row: 1 }, narrow: { col: 2, row: 1 } },
    },
    {
      id: 'keycloak',
      label: 'Keycloak',
      kind: 'external',
      tech: 'Identity',
      description: 'Issues tokens. The gateway verifies each one and maps realm roles to authorities.',
      metrics: [{ label: 'Token', value: 'JWT, roles in claims' }],
      position: { wide: { col: 3, row: 1 }, narrow: { col: 3, row: 1 } },
    },
    ...serviceNodes,
    {
      id: 'eureka',
      label: 'Eureka',
      kind: 'registry',
      tech: 'Discovery',
      description: 'Services register on start. The gateway and Feign clients look them up by name.',
      metrics: [{ label: 'Registered apps', value: '9' }],
      position: { wide: { col: 4, row: 1 }, narrow: { col: 3, row: 2 } },
    },
    {
      id: 'providers',
      label: 'Stripe / Razorpay',
      kind: 'external',
      tech: 'Payments',
      description: 'Two providers behind one payment service, chosen by the payment method.',
      metrics: [{ label: 'Integration', value: 'hosted payment link' }],
      position: { wide: { col: 5, row: 4 }, narrow: { col: 2, row: 6 } },
    },
    {
      id: 'rabbit',
      label: 'RabbitMQ',
      kind: 'broker',
      tech: 'Broker',
      description: 'Decouples payment from what follows. A slow notification never delays a payment.',
      metrics: [{ label: 'Queues', value: 'booking-queue, notification-queue' }],
      position: { wide: { col: 3, row: 4 }, narrow: { col: 3, row: 4 } },
    },
    {
      id: 'mysql',
      label: 'MySQL',
      kind: 'datastore',
      tech: 'Per service',
      description: 'Each service owns its schema. Services read each other through Feign, never a shared table.',
      metrics: [{ label: 'Databases', value: '8' }],
      position: { wide: { col: 1, row: 4 }, narrow: { col: 1, row: 6 } },
    },
  ],
  groups: [
    {
      id: 'services',
      label: 'Spring Boot services',
      labelAt: { wide: 0.45, narrow: 0.06 },
      nodeIds: services.map((service) => service.id),
    },
  ],
  edges: [
    { id: 'client-gateway', from: 'client', to: 'gateway', kind: 'request', label: 'HTTPS, bearer token' },
    { id: 'gateway-keycloak', from: 'gateway', to: 'keycloak', kind: 'request', label: 'verify JWT' },
    { id: 'gateway-services', from: 'gateway', to: 'services', kind: 'request', label: 'route by path' },
    { id: 'services-eureka', from: 'services', to: 'eureka', kind: 'discovery', label: 'register and look up' },
    { id: 'services-mysql', from: 'services', to: 'mysql', kind: 'write', label: 'own schema each' },
    { id: 'booking-payment', from: 'booking', to: 'payment', kind: 'request', label: 'create payment link (Feign)' },
    { id: 'payment-providers', from: 'payment', to: 'providers', kind: 'request', label: 'hosted checkout' },
    { id: 'payment-rabbit', from: 'payment', to: 'rabbit', kind: 'event', label: 'payment succeeded' },
    { id: 'rabbit-booking', from: 'rabbit', to: 'booking', kind: 'event', label: 'booking-queue' },
    { id: 'rabbit-notification', from: 'rabbit', to: 'notification', kind: 'event', label: 'notification-queue' },
  ],
  flows: [
    {
      id: 'request',
      label: 'Request path',
      description: 'Client to gateway, token check, then routing to a service by name.',
      edgeIds: ['client-gateway', 'gateway-keycloak', 'gateway-services', 'services-eureka'],
    },
    {
      id: 'pay',
      label: 'Book and pay',
      description: 'Booking asks payment for a link. Payment hands the customer to Stripe or Razorpay.',
      edgeIds: ['client-gateway', 'gateway-services', 'booking-payment', 'payment-providers'],
    },
    {
      id: 'events',
      label: 'After payment',
      description: 'One payment event confirms the booking and notifies both sides, asynchronously.',
      edgeIds: ['payment-rabbit', 'rabbit-booking', 'rabbit-notification'],
    },
  ],
}
