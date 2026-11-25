import { HttpError } from './errors.js'

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const datePattern = /^\d{4}-\d{2}-\d{2}$/
const teamKeyPattern = /^[A-Z][A-Z0-9]{1,9}$/
const colorPattern = /^#[0-9a-f]{6}$/i
const leadingBlankLines = /^(?:[ \t]*\r?\n)+/

export function readBody(request) {
  const body = request.body
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    throw new HttpError(400, 'Send the data as a JSON object.')
  }
  return body
}

export function readText(value, label, { max, allowEmpty = false, keepSpaces = false }) {
  if (typeof value !== 'string') throw new HttpError(400, `${label} must be text.`)
  const trimmed = value.trim()
  if (!allowEmpty && !trimmed) throw new HttpError(400, `${label} cannot be empty.`)
  const text = keepSpaces && trimmed ? value.replace(leadingBlankLines, '').trimEnd() : trimmed
  if (text.length > max) throw new HttpError(400, `${label} can be at most ${max} characters.`)
  return text
}

export function readChoice(value, label, choices) {
  if (!choices.includes(value)) throw new HttpError(400, `${label} must be one of: ${choices.join(', ')}.`)
  return value
}

export function isId(value) {
  return typeof value === 'string' && uuidPattern.test(value)
}

export function readId(value, label) {
  if (!isId(value)) throw new HttpError(400, `${label} is not valid.`)
  return value
}

export function readOptionalId(value, label) {
  return value === null ? null : readId(value, label)
}

export function readIdList(value, label, { max = 20 } = {}) {
  if (!Array.isArray(value) || value.length > max || !value.every(isId)) {
    throw new HttpError(400, `${label} must be a list of up to ${max} valid IDs.`)
  }
  return [...new Set(value)]
}

export function readOptionalDate(value, label) {
  if (value === null) return null
  const date = typeof value === 'string' && datePattern.test(value) ? new Date(`${value}T00:00:00Z`) : null
  if (!date || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new HttpError(400, `${label} must be a date written as YYYY-MM-DD.`)
  }
  return date
}

export function readTeamKey(value) {
  if (typeof value !== 'string' || !teamKeyPattern.test(value)) {
    throw new HttpError(400, 'Team key must be 2 to 10 capital letters or numbers, starting with a letter.')
  }
  return value
}

export function readColor(value) {
  if (typeof value !== 'string' || !colorPattern.test(value)) {
    throw new HttpError(400, 'Color must be written like #1a2b3c.')
  }
  return value.toLowerCase()
}

export function readChoiceList(value, label, choices) {
  if (!Array.isArray(value) || !value.every(item => choices.includes(item))) {
    throw new HttpError(400, `${label} must be a list using only: ${choices.join(', ')}.`)
  }
  return [...new Set(value)]
}

export function readBoolean(value, label) {
  if (typeof value !== 'boolean') throw new HttpError(400, `${label} must be true or false.`)
  return value
}
