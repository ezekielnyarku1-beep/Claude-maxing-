const shortDate = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', timeZone: 'UTC' })
const dateWithYear = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
const dateTime = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })

const fromDateString = value => new Date(`${value}T00:00:00Z`)

export const formatShortDate = value => shortDate.format(fromDateString(value))
export const formatDateWithYear = value => dateWithYear.format(fromDateString(value))
export const formatDateTime = value => dateTime.format(new Date(value))
