import { ICONS } from './icons'

const PALETTE = {
  k: '#151227',
  y: '#ffd23f',
  Y: '#d9a400',
  w: '#f6f5fb',
  b: '#4f5bd5',
  g: '#3ddc97',
  p: '#ff6fae',
  r: '#9a98b5',
  d: '#0d0b1a',
}

export default function PixelIcon({ name, size = 36 }) {
  const grid = ICONS[name]
  if (!grid) return null
  const cols = grid[0].length
  const rects = []
  grid.forEach((row, y) => {
    for (let x = 0; x < row.length; x += 1) {
      const fill = PALETTE[row[x]]
      if (fill) rects.push(<rect key={`${x}-${y}`} x={x} y={y} width="1.02" height="1.02" fill={fill} />)
    }
  })
  return (
    <svg
      width={size}
      height={(size * grid.length) / cols}
      viewBox={`0 0 ${cols} ${grid.length}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {rects}
    </svg>
  )
}
