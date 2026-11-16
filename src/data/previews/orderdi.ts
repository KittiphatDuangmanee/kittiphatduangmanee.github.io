import type { OrderBoardPreview } from '../types.ts'

// VOL. II. An interactive recreation of the OrderDi workflow with sample
// data. It is a preview of how the product behaves, not a screenshot.
export const orderDiPreview: OrderBoardPreview = {
  notice: 'Interactive preview · sample data',
  hint: 'Pick a table, then move its order forward',
  currencySymbol: '฿',
  views: [
    { id: 'tables', label: 'Tables' },
    { id: 'menu', label: 'Menu' },
    { id: 'sales', label: 'Sales' },
  ],
  stages: [
    { id: 'ordered', label: 'Ordered' },
    { id: 'cooking', label: 'Cooking' },
    { id: 'served', label: 'Served' },
    { id: 'paid', label: 'Paid' },
  ],
  tables: [
    {
      id: 't1',
      label: 'T1',
      guests: 2,
      stage: 'cooking',
      lines: [
        { itemId: 'krapao', quantity: 2 },
        { itemId: 'tea', quantity: 2 },
      ],
    },
    {
      id: 't2',
      label: 'T2',
      guests: 4,
      stage: 'served',
      lines: [
        { itemId: 'tomyum', quantity: 1 },
        { itemId: 'curry', quantity: 2 },
        { itemId: 'somtum', quantity: 1 },
        { itemId: 'tea', quantity: 4 },
      ],
    },
    {
      id: 't3',
      label: 'T3',
      guests: 3,
      stage: 'ordered',
      lines: [
        { itemId: 'somtum', quantity: 2 },
        { itemId: 'krapao', quantity: 1 },
        { itemId: 'mango', quantity: 3 },
      ],
    },
    {
      id: 't4',
      label: 'T4',
      guests: 2,
      stage: 'paid',
      lines: [
        { itemId: 'curry', quantity: 1 },
        { itemId: 'tomyum', quantity: 1 },
        { itemId: 'mango', quantity: 2 },
      ],
    },
  ],
  menu: [
    { id: 'krapao', name: 'Pad Kra Pao', category: 'Mains', price: 89, available: true },
    { id: 'tomyum', name: 'Tom Yum Goong', category: 'Mains', price: 159, available: true },
    { id: 'curry', name: 'Green Curry', category: 'Mains', price: 129, available: true },
    { id: 'somtum', name: 'Som Tum', category: 'Starters', price: 79, available: true },
    { id: 'mango', name: 'Mango Sticky Rice', category: 'Desserts', price: 99, available: false },
    { id: 'tea', name: 'Thai Iced Tea', category: 'Drinks', price: 45, available: true },
  ],
  sales: {
    todayLabel: 'Today',
    todayBase: 6240,
    days: [
      { day: 'Mon', total: 7120 },
      { day: 'Tue', total: 6480 },
      { day: 'Wed', total: 8050 },
      { day: 'Thu', total: 7390 },
      { day: 'Fri', total: 9860 },
      { day: 'Sat', total: 11240 },
    ],
  },
  labels: {
    viewSwitcher: 'OrderDi views',
    tableList: 'Tables',
    guests: 'guests',
    bill: 'Live bill',
    subtotal: 'Total',
    advance: 'Move order to',
    settled: 'Bill settled',
    available: 'On the menu',
    unavailable: 'Sold out',
    toggleAvailability: 'Toggle availability of',
    salesHeading: 'Sales this week',
    salesCaption: 'Settle a bill on the Tables view and today grows.',
    tablesOpen: 'Open tables',
    averageBill: 'Average bill',
  },
}
