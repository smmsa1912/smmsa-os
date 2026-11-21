export default function LinkArrow({ forward = false }) {
  return (
    <svg className="inline-arrow" width="1em" height="1em" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" focusable="false">
      <path d={forward ? 'M5 12h14m-7-7 7 7-7 7' : 'M7 17 17 7M7 7h10v10'} />
    </svg>
  )
}
