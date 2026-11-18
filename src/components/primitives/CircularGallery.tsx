import { motion, useMotionValue, useTransform, type MotionValue, type PanInfo } from 'framer-motion'
import { useEffect, useRef, type MouseEvent, type ReactNode } from 'react'

import { useElementSize } from '../../hooks/useElementSize.ts'
import type { Ring } from '../../hooks/useRing.ts'
import { cn } from '../../lib/cn.ts'
import { wrap } from '../../lib/wrap.ts'
import { ring as ringSpec, ringPose } from '../../styles/tokens.ts'

export interface GalleryCardState {
  index: number
  /** True for the card facing the reader. */
  front: boolean
  /** Opens the front card, or turns a side card to the front. Ignores the click that ends a drag. */
  onClick: (event: MouseEvent) => void
}

interface CircularGalleryProps<T> {
  items: readonly T[]
  getKey: (item: T) => string
  ring: Ring
  /** Card height in px for a card width. */
  cardHeight: (width: number) => number
  maxCardWidth: number
  /** The front card was clicked. */
  onOpen: (index: number) => void
  onDraggingChange?: (dragging: boolean) => void
  /** The card's content, normally one button that calls `state.onClick`. */
  renderCard: (item: T, state: GalleryCardState) => ReactNode
  className?: string
}

/**
 * Cards on a 3D ring seen from outside. The front card faces the reader,
 * its neighbours curve away to either side and fade, and the rest wait out
 * of sight behind the ring. Drag turns the ring under the pointer; on
 * release it settles on the nearest card.
 *
 * Every card is posed from the ring's one position value, so turning never
 * re-renders React. There is no shared 3D context: the stage's perspective
 * and each card's zIndex decide which card is in front, so cards never cut
 * through each other. Below lg the stage runs to the screen edges, so the
 * side cards reach them; it clips sideways, so the page never scrolls.
 */
export function CircularGallery<T>({
  items,
  getKey,
  ring,
  cardHeight,
  maxCardWidth,
  onOpen,
  onDraggingChange,
  renderCard,
  className,
}: CircularGalleryProps<T>) {
  const stageRef = useRef<HTMLDivElement>(null)
  const dragStart = useRef(0)
  const dragged = useRef(false)
  const { width: stageWidth } = useElementSize(stageRef)

  const share = stageWidth >= ringSpec.wideFrom ? ringSpec.cardShare.wide : ringSpec.cardShare.narrow
  const width = Math.round(Math.min(stageWidth * share, maxCardWidth))
  const height = Math.round(cardHeight(width))
  const measured = width > 0
  const pxPerStep = Math.max(1, width * ringSpec.dragStep)

  // The card width as a motion value, so the poses follow a resize without
  // waiting for every card to render again.
  const cardWidth = useMotionValue(width)
  useEffect(() => cardWidth.set(width), [cardWidth, width])

  const canTurn = items.length > 1

  const onPanStart = () => {
    if (!canTurn) return
    dragged.current = true
    dragStart.current = ring.grab()
    onDraggingChange?.(true)
  }

  const onPan = (_event: PointerEvent, info: PanInfo) => {
    if (!canTurn || ring.reduced) return
    ring.position.set(dragStart.current - info.offset.x / pxPerStep)
  }

  const onPanEnd = (_event: PointerEvent, info: PanInfo) => {
    if (!canTurn) return
    ring.release(dragStart.current, info.offset.x, info.velocity.x, pxPerStep)
    onDraggingChange?.(false)
    // The click that ends a drag is dispatched after this handler.
    window.setTimeout(() => {
      dragged.current = false
    }, 0)
  }

  const onCardClick = (event: MouseEvent, index: number) => {
    // A keyboard activation has detail 0 and is never the tail of a drag.
    if (dragged.current && event.detail !== 0) return
    if (index === ring.active) onOpen(index)
    else ring.goTo(index)
  }

  return (
    <motion.div
      ref={stageRef}
      className={cn(
        'relative -mx-5 touch-pan-y select-none overflow-x-clip sm:-mx-8 lg:mx-0',
        canTurn && 'cursor-grab active:cursor-grabbing',
        className,
      )}
      style={{
        height: measured ? height + ringSpec.stagePad * 2 : undefined,
        perspective: width * ringSpec.perspective,
        opacity: ring.fade,
      }}
      onPanStart={onPanStart}
      onPan={onPan}
      onPanEnd={onPanEnd}
    >
      {/* Holds the stage open until its width is known. */}
      {measured ? null : <div className="aspect-[2/1] w-full" />}
      {measured
        ? items.map((item, index) => {
            const offset = wrap(index - ring.active, items.length)
            return (
              <RingCard
                key={getKey(item)}
                item={item}
                index={index}
                count={items.length}
                position={ring.position}
                cardWidth={cardWidth}
                width={width}
                height={height}
                front={offset === 0}
                reachable={Math.abs(offset) <= 1}
                onCardClick={onCardClick}
                renderCard={renderCard}
              />
            )
          })
        : null}
    </motion.div>
  )
}

interface RingCardProps<T> {
  item: T
  index: number
  count: number
  position: MotionValue<number>
  cardWidth: MotionValue<number>
  width: number
  height: number
  front: boolean
  /** The front card and its two neighbours. The rest are hidden and inert. */
  reachable: boolean
  onCardClick: (event: MouseEvent, index: number) => void
  renderCard: (item: T, state: GalleryCardState) => ReactNode
}

function RingCard<T>({
  item,
  index,
  count,
  position,
  cardWidth,
  width,
  height,
  front,
  reachable,
  onCardClick,
  renderCard,
}: RingCardProps<T>) {
  const pose = useTransform(() => ringPose(wrap(index - position.get(), count), count, cardWidth.get()))
  const x = useTransform(pose, (value) => value.x)
  const z = useTransform(pose, (value) => value.z)
  const rotateY = useTransform(pose, (value) => value.rotateY)
  const opacity = useTransform(pose, (value) => value.opacity)
  const zIndex = useTransform(pose, (value) => value.zIndex)

  return (
    <motion.div
      className="absolute left-1/2 top-1/2"
      style={{ width, height, marginLeft: -width / 2, marginTop: -height / 2, x, z, rotateY, opacity, zIndex }}
      inert={!reachable}
      aria-hidden={reachable ? undefined : true}
    >
      {renderCard(item, { index, front, onClick: (event) => onCardClick(event, index) })}
    </motion.div>
  )
}
