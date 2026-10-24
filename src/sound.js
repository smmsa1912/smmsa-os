// Tiny square-wave beeps made with the Web Audio API, so there are no sound files to load.
const NOTES = {
  open: [440, 660],
  close: [660, 330],
  min: [330],
  on: [523, 659, 784],
}

let ctx

export function playSound(kind) {
  try {
    ctx ??= new (window.AudioContext || window.webkitAudioContext)()
    if (ctx.state === 'suspended') ctx.resume()
    const start = ctx.currentTime
    ;(NOTES[kind] ?? [440]).forEach((freq, i) => {
      const t = start + i * 0.07
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'square'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.04, t)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.06)
      osc.connect(gain).connect(ctx.destination)
      osc.start(t)
      osc.stop(t + 0.07)
    })
  } catch {
    // Audio can be blocked or unavailable; the OS just stays quiet.
  }
}
