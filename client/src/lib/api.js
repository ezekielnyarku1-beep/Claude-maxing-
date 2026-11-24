const apiUrl = import.meta.env.VITE_API_URL

async function request(method, path, body) {
  if (!apiUrl) {
    throw new Error('VITE_API_URL is not set. Copy client/.env.example to client/.env and restart the client.')
  }

  let response
  try {
    response = await fetch(`${apiUrl}${path}`, {
      method,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new Error("Can't reach the server. Check that it is running, then try again.")
  }

  const data = await response.json().catch(() => null)
  if (!response.ok) {
    const error = new Error(data?.error ?? `The server answered with an error (${response.status}). Try again.`)
    error.status = response.status
    throw error
  }
  return data
}

function toQueryString(filters) {
  const params = new URLSearchParams(Object.entries(filters).filter(([, value]) => value))
  return params.size ? `?${params}` : ''
}

const encode = encodeURIComponent

export const getMe = () => request('GET', '/api/me')
export const getTeams = () => request('GET', '/api/teams')
export const getTeam = key => request('GET', `/api/teams/${encode(key)}`)
export const getProjects = filters => request('GET', `/api/projects${toQueryString(filters)}`)
export const getProject = id => request('GET', `/api/projects/${encode(id)}`)
export const getIssues = filters => request('GET', `/api/issues${toQueryString(filters)}`)
export const getIssue = identifier => request('GET', `/api/issues/${encode(identifier)}`)
export const createIssue = fields => request('POST', '/api/issues', fields)
export const updateIssue = (identifier, changes) => request('PATCH', `/api/issues/${encode(identifier)}`, changes)
export const addComment = (identifier, body) => request('POST', `/api/issues/${encode(identifier)}/comments`, { body })
export const getLabels = () => request('GET', '/api/labels')
