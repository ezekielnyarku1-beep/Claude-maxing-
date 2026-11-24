import { forgetAccessToken, getAccessToken } from './auth.js'

const apiUrl = import.meta.env.VITE_API_URL

function failure(message, status) {
  const error = new Error(message)
  error.status = status
  return error
}

async function request(method, path, body) {
  if (!apiUrl) {
    throw new Error('VITE_API_URL is not set. Copy client/.env.example to client/.env and restart the client.')
  }

  let response
  try {
    const token = await getAccessToken()
    if (!token) throw failure('Sign in to continue.', 401)
    response = await fetch(`${apiUrl}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body !== undefined && { 'Content-Type': 'application/json' }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch (error) {
    if (error.status) throw error
    throw new Error("Can't reach the server. Check that it is running, then try again.", { cause: error })
  }

  const data = await response.json().catch(() => null)
  if (response.status === 401) forgetAccessToken()
  if (!response.ok) {
    throw failure(data?.error ?? `The server answered with an error (${response.status}). Try again.`, response.status)
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
export const createLabel = fields => request('POST', '/api/labels', fields)
export const updateLabel = (id, fields) => request('PATCH', `/api/labels/${encode(id)}`, fields)
export const createProject = fields => request('POST', '/api/projects', fields)
export const updateProject = (id, fields) => request('PATCH', `/api/projects/${encode(id)}`, fields)
export const createTeam = fields => request('POST', '/api/teams', fields)
export const renameTeam = (key, name) => request('PATCH', `/api/teams/${encode(key)}`, { name })
export const addTeamMember = (key, userId) => request('POST', `/api/teams/${encode(key)}/members`, { userId })
export const removeTeamMember = (key, userId) => request('DELETE', `/api/teams/${encode(key)}/members/${encode(userId)}`)
export const getUsers = () => request('GET', '/api/users')
export const updateUserRole = (id, role) => request('PATCH', `/api/users/${encode(id)}`, { role })
export const getWorkspace = () => request('GET', '/api/workspace')
export const updateWorkspace = name => request('PATCH', '/api/workspace', { name })
