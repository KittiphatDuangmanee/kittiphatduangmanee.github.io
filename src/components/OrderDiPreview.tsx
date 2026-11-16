import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { useId, useMemo, useState } from 'react'

import type { OrderBoardPreview, OrderStage, OrderViewId } from '../data/types.ts'
import { cn } from '../lib/cn.ts'
import { duration, ease } from '../styles/tokens.ts'

interface OrderDiPreviewProps {
  preview: OrderBoardPreview
}

const stageDot: Record<OrderStage, string> = {
  ordered: 'bg-status-warn',
  cooking: 'bg-(--vol-accent)',
  served: 'bg-status-ok',
  paid: 'bg-(--cover-ink-2)',
}

/**
 * VOL. II visual: an interactive preview of the OrderDi workflow on sample
 * data. Three views share one state: move an order forward on Tables, switch
 * an item off on Menu, and watch a settled bill land in Sales.
 */
export function OrderDiPreview({ preview }: OrderDiPreviewProps) {
  const tabsId = useId()
  const [view, setView] = useState<OrderViewId>('tables')
  const [selectedTableId, setSelectedTableId] = useState(preview.tables[0].id)
  const [stages, setStages] = useState<Record<string, OrderStage>>(() =>
    Object.fromEntries(preview.tables.map((table) => [table.id, table.stage])),
  )
  const [availability, setAvailability] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(preview.menu.map((item) => [item.id, item.available])),
  )

  const menuById = useMemo(() => new Map(preview.menu.map((item) => [item.id, item])), [preview.menu])
  const money = (amount: number) => `${preview.currencySymbol}${amount.toLocaleString('en-US')}`
  const totalOf = (tableId: string) => {
    const table = preview.tables.find((candidate) => candidate.id === tableId)
    if (!table) return 0
    return table.lines.reduce((sum, line) => sum + (menuById.get(line.itemId)?.price ?? 0) * line.quantity, 0)
  }

  const stageOrder = preview.stages.map((stage) => stage.id)
  const stageLabel = (stage: OrderStage) => preview.stages.find((candidate) => candidate.id === stage)?.label ?? stage
  const selectedTable = preview.tables.find((table) => table.id === selectedTableId) ?? preview.tables[0]
  const selectedStage = stages[selectedTable.id]
  const nextStage = stageOrder[stageOrder.indexOf(selectedStage) + 1]

  const settledToday = preview.tables
    .filter((table) => stages[table.id] === 'paid')
    .reduce((sum, table) => sum + totalOf(table.id), 0)
  const today = preview.sales.todayBase + settledToday
  const salesDays = [...preview.sales.days, { day: preview.sales.todayLabel, total: today }]
  const peak = Math.max(...salesDays.map((day) => day.total))
  const openTables = preview.tables.filter((table) => stages[table.id] !== 'paid').length
  const averageBill = Math.round(
    preview.tables.reduce((sum, table) => sum + totalOf(table.id), 0) / preview.tables.length,
  )

  return (
    <div className="@container h-full text-(--cover-ink)">
      <div className="flex h-full min-h-0 flex-col gap-2.5 p-3">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <div className="min-w-0">
            <p className="font-mono text-micro font-medium uppercase tracking-wider text-(--vol-accent-ink)">
              {preview.notice}
            </p>
            <p className="font-mono text-micro text-(--cover-ink-2)">{preview.hint}</p>
          </div>
          <div
            role="tablist"
            aria-label={preview.labels.viewSwitcher}
            className="flex rounded-full border border-(--cover-line) bg-(--cover-fill) p-0.5"
          >
            {preview.views.map((candidate) => {
              const selected = candidate.id === view
              return (
                <button
                  key={candidate.id}
                  type="button"
                  role="tab"
                  id={`${tabsId}-tab-${candidate.id}`}
                  aria-selected={selected}
                  aria-controls={`${tabsId}-panel`}
                  onClick={() => setView(candidate.id)}
                  className={cn(
                    'relative min-h-8 rounded-full px-3.5 font-mono text-micro font-medium transition-colors duration-200 ease-monograph',
                    selected ? 'text-(--vol-cover)' : 'text-(--cover-ink-2) hover:text-(--cover-ink)',
                  )}
                >
                  {selected ? (
                    <motion.span
                      layoutId={`${tabsId}-pill`}
                      className="absolute inset-0 rounded-full bg-(--cover-ink)"
                      transition={{ duration: duration.state, ease }}
                    />
                  ) : null}
                  <span className="relative">{candidate.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div
          role="tabpanel"
          id={`${tabsId}-panel`}
          aria-labelledby={`${tabsId}-tab-${view}`}
          className="min-h-0 flex-1"
        >
          {view === 'tables' ? (
            <div className="grid h-full gap-2.5 @lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
              <ul aria-label={preview.labels.tableList} className="grid grid-cols-2 content-start gap-2">
                {preview.tables.map((table) => {
                  const selected = table.id === selectedTable.id
                  return (
                    <li key={table.id}>
                      <button
                        type="button"
                        aria-pressed={selected}
                        onClick={() => setSelectedTableId(table.id)}
                        className={cn(
                          'flex w-full flex-col gap-1 rounded-md border bg-(--vol-tint) px-3 py-2.5 text-left transition-colors duration-200 ease-monograph',
                          selected ? 'border-(--vol-accent)' : 'border-(--cover-line) hover:border-(--cover-line-strong)',
                        )}
                      >
                        <span className="flex items-baseline justify-between gap-2">
                          <span className="font-display text-lede leading-none">{table.label}</span>
                          <span className="font-mono text-micro text-(--cover-ink-2)">
                            {table.guests} {preview.labels.guests}
                          </span>
                        </span>
                        <span className="flex items-center gap-1.5 font-mono text-micro text-(--cover-ink-2)">
                          <span aria-hidden="true" className={cn('size-1.5 rounded-full', stageDot[stages[table.id]])} />
                          {stageLabel(stages[table.id])}
                        </span>
                        <span className="font-mono text-micro font-medium">{money(totalOf(table.id))}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>

              <section
                aria-label={`${preview.labels.bill}, ${selectedTable.label}`}
                className="flex min-h-0 flex-col rounded-md border border-(--cover-line) bg-(--vol-tint) px-3 py-2.5"
              >
                <header className="flex items-baseline justify-between gap-3">
                  <p className="font-mono text-micro uppercase tracking-wider text-(--cover-ink-2)">
                    {preview.labels.bill} · {selectedTable.label}
                  </p>
                  <span role="img" aria-label={stageLabel(selectedStage)} className="flex items-center gap-1">
                    {preview.stages.map((stage) => {
                      const reached = stageOrder.indexOf(stage.id) <= stageOrder.indexOf(selectedStage)
                      return (
                        <span
                          key={stage.id}
                          className={cn('h-1 w-5 rounded-full', reached ? 'bg-(--vol-accent)' : 'bg-(--cover-line)')}
                        />
                      )
                    })}
                  </span>
                </header>
                <ul className="mt-2 grid gap-1">
                  {selectedTable.lines.map((line) => {
                    const item = menuById.get(line.itemId)
                    if (!item) return null
                    return (
                      <li key={line.itemId} className="flex items-baseline justify-between gap-3 text-small">
                        <span className="min-w-0 truncate">
                          <span className="font-mono text-micro text-(--cover-ink-2)">{line.quantity} × </span>
                          {item.name}
                        </span>
                        <span className="shrink-0 font-mono text-micro">{money(item.price * line.quantity)}</span>
                      </li>
                    )
                  })}
                </ul>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-(--cover-line) pt-2">
                  <p className="flex items-baseline gap-2">
                    <span className="font-mono text-micro uppercase tracking-wider text-(--cover-ink-2)">
                      {preview.labels.subtotal}
                    </span>
                    <span className="font-display text-lede leading-none">{money(totalOf(selectedTable.id))}</span>
                  </p>
                  {nextStage ? (
                    <button
                      type="button"
                      onClick={() => setStages((current) => ({ ...current, [selectedTable.id]: nextStage }))}
                      className="min-h-9 rounded-full bg-(--cover-ink) px-3.5 font-mono text-micro font-medium text-(--vol-cover) transition-opacity duration-200 ease-monograph hover:opacity-85"
                    >
                      {preview.labels.advance} {stageLabel(nextStage)}
                    </button>
                  ) : (
                    <p className="flex min-h-9 items-center gap-1.5 font-mono text-micro text-status-ok">
                      <Check aria-hidden="true" className="size-3.5" />
                      {preview.labels.settled}
                    </p>
                  )}
                </div>
              </section>
            </div>
          ) : null}

          {view === 'menu' ? (
            <ul className="grid content-start gap-2 @lg:grid-cols-2">
              {preview.menu.map((item) => {
                const available = availability[item.id]
                return (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-md border border-(--cover-line) bg-(--vol-tint) px-3 py-2"
                  >
                    <span className="min-w-0">
                      <span className={cn('block truncate text-small', !available && 'text-(--cover-ink-2) line-through')}>
                        {item.name}
                      </span>
                      <span className="font-mono text-micro text-(--cover-ink-2)">
                        {item.category} · {money(item.price)}
                      </span>
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={available}
                      aria-label={`${preview.labels.toggleAvailability} ${item.name}`}
                      onClick={() => setAvailability((current) => ({ ...current, [item.id]: !current[item.id] }))}
                      className="flex min-h-9 shrink-0 items-center gap-2 font-mono text-micro text-(--cover-ink-2)"
                    >
                      <span className="w-[4.75rem] text-right">
                        {available ? preview.labels.available : preview.labels.unavailable}
                      </span>
                      <span
                        aria-hidden="true"
                        className={cn(
                          'flex h-5 w-9 items-center rounded-full border p-0.5 transition-colors duration-200 ease-monograph',
                          available ? 'justify-end border-(--vol-accent) bg-(--vol-accent-wash)' : 'justify-start border-(--cover-line-strong)',
                        )}
                      >
                        <motion.span
                          layout
                          transition={{ duration: duration.quick, ease }}
                          className={cn('size-3.5 rounded-full', available ? 'bg-(--vol-accent)' : 'bg-(--cover-ink-2)')}
                        />
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          ) : null}

          {view === 'sales' ? (
            <div className="grid h-full gap-2.5 @lg:grid-cols-[minmax(0,1.5fr)_minmax(0,0.7fr)]">
              <figure className="flex min-h-[168px] flex-col rounded-md border border-(--cover-line) bg-(--vol-tint) px-3 py-2.5">
                <figcaption className="font-mono text-micro uppercase tracking-wider text-(--cover-ink-2)">
                  {preview.labels.salesHeading}
                </figcaption>
                <ol className="mt-2 flex min-h-0 flex-1 items-end gap-2">
                  {salesDays.map((day, index) => {
                    const isToday = index === salesDays.length - 1
                    return (
                      <li key={day.day} className="flex h-full min-w-0 flex-1 flex-col justify-end gap-1 text-center">
                        <span className={cn('font-mono text-micro', isToday ? 'text-(--cover-ink)' : 'text-(--cover-ink-2)')}>
                          {(day.total / 1000).toFixed(1)}k
                        </span>
                        <motion.span
                          aria-hidden="true"
                          className={cn('block w-full origin-bottom rounded-t-sm', isToday ? 'bg-(--vol-accent)' : 'bg-(--cover-line-strong)')}
                          initial={false}
                          animate={{ height: `${Math.round((day.total / peak) * 62)}%` }}
                          transition={{ duration: duration.state, ease }}
                        />
                        <span className="font-mono text-micro text-(--cover-ink-2)">{day.day}</span>
                      </li>
                    )
                  })}
                </ol>
              </figure>
              <div className="grid content-start gap-2">
                <dl className="grid gap-2 @max-lg:grid-cols-3">
                  {[
                    { label: preview.sales.todayLabel, value: money(today) },
                    { label: preview.labels.tablesOpen, value: String(openTables) },
                    { label: preview.labels.averageBill, value: money(averageBill) },
                  ].map((entry) => (
                    <div key={entry.label} className="min-w-0 rounded-md border border-(--cover-line) bg-(--vol-tint) px-3 py-2">
                      <dt className="truncate font-mono text-micro uppercase tracking-wider text-(--cover-ink-2)">{entry.label}</dt>
                      <dd className="font-display text-lede leading-tight">{entry.value}</dd>
                    </div>
                  ))}
                </dl>
                <p className="font-mono text-micro text-(--cover-ink-2)">{preview.labels.salesCaption}</p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
