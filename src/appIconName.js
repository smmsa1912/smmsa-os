import { appMeta } from './appMeta.js'

export function appIconName(appId, trashCount = 0) {
  if (appId === 'bin') return trashCount > 0 ? 'trash-full' : 'trash-empty'
  return appMeta[appId]?.icon ?? 'note'
}
