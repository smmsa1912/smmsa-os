import { useOS } from '../store'
import { THEMES, WALLPAPERS } from '../wallpapers'

function handleRadioKeyDown(event) {
  const keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End']
  if (!keys.includes(event.key)) return

  const group = event.currentTarget.closest('[role="radiogroup"]')
  const radios = Array.from(group?.querySelectorAll('[role="radio"]') ?? [])
  const currentIndex = radios.indexOf(event.currentTarget)
  if (!radios.length || currentIndex < 0) return

  let nextIndex
  if (event.key === 'Home') nextIndex = 0
  else if (event.key === 'End') nextIndex = radios.length - 1
  else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (currentIndex + 1) % radios.length
  else nextIndex = (currentIndex - 1 + radios.length) % radios.length

  event.preventDefault()
  const nextRadio = radios[nextIndex]
  nextRadio.focus()
  nextRadio.click()
}

export default function Settings() {
  const theme = useOS((s) => s.theme)
  const setTheme = useOS((s) => s.setTheme)
  const wallpaper = useOS((s) => s.wallpaper)
  const setWallpaper = useOS((s) => s.setWallpaper)
  const sound = useOS((s) => s.sound)
  const toggleSound = useOS((s) => s.toggleSound)

  return (
    <article className="doc settings-doc">
      <h2>Settings</h2>
      <p className="hint">Make this desktop feel like yours.</p>
      <h3>Desktop theme</h3>
      <p className="hint theme-hint">Switch the whole desktop between the original pixel look and HD-2D glass surfaces.</p>
      <div className="theme-grid" role="radiogroup" aria-label="Desktop theme">
        {THEMES.map((item) => (
          <button
            key={item.id}
            type="button"
            role="radio"
            aria-checked={theme === item.id}
            tabIndex={theme === item.id ? 0 : -1}
            onKeyDown={handleRadioKeyDown}
            className={`theme-opt theme-opt-${item.id}${theme === item.id ? ' on' : ''}`}
            onClick={() => setTheme(item.id)}
          >
            <span className="theme-preview" aria-hidden="true"><span /><i /><b /></span>
            <strong>{item.label}{theme === item.id ? ' ✓' : ''}</strong>
            <small>{item.description}</small>
          </button>
        ))}
      </div>
      <h3>Wallpaper</h3>
      <div className="wp-grid" role="radiogroup" aria-label="Wallpaper">
        {WALLPAPERS.map((w) => (
          <button
            key={w.id}
            type="button"
            role="radio"
            aria-checked={wallpaper === w.id}
            tabIndex={wallpaper === w.id ? 0 : -1}
            onKeyDown={handleRadioKeyDown}
            className={`wp-opt${wallpaper === w.id ? ' on' : ''}`}
            onClick={() => setWallpaper(w.id)}
          >
            <span className="wp-swatch" data-wp={w.id} />
            <span className="wp-label">{w.label}{wallpaper === w.id ? ' ✓' : ''}</span>
          </button>
        ))}
      </div>
      <h3>Sound</h3>
      <button type="button" className="btn" role="switch" aria-checked={sound} onClick={toggleSound}>
        Sound effects: {sound ? 'ON' : 'OFF'}
      </button>
      <h3>Desktop icons</h3>
      <p>Drag icons to place them anywhere on the desktop. Your layout is saved automatically.</p>
      <p>Right-click an empty part of the desktop to arrange icons or change your wallpaper.</p>
      <p className="hint">Your choices are saved in this browser.</p>
    </article>
  )
}
