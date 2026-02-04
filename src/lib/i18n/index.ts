import { ko, type Messages } from './messages/ko'

type MessageKey = string
type MessageParams = Record<string, string | number>

function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const keys = path.split('.')
  let current: unknown = obj

  for (const key of keys) {
    if (current === null || current === undefined) {
      return undefined
    }
    current = (current as Record<string, unknown>)[key]
  }

  return typeof current === 'string' ? current : undefined
}

function interpolate(template: string, params: MessageParams): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    return params[key]?.toString() ?? `{${key}}`
  })
}

export function t(key: MessageKey, params?: MessageParams): string {
  const message = getNestedValue(ko as unknown as Record<string, unknown>, key)

  if (!message) {
    console.warn(`Missing translation for key: ${key}`)
    return key
  }

  return params ? interpolate(message, params) : message
}

export { ko, type Messages }
