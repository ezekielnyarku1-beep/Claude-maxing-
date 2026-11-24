const apiUrl = import.meta.env.VITE_API_URL

async function request(path) {
  if (!apiUrl) {
    throw new Error('VITE_API_URL is not set. Copy client/.env.example to client/.env and restart the client.')
  }

  let response
  try {
    response = await fetch(`${apiUrl}${path}`)
  } catch {
    throw new Error("Can't reach the server. Check that it is running, then try again.")
  }

  if (!response.ok) {
    throw new Error(`The server answered with an error (${response.status}). Try again.`)
  }
  return response.json()
}

export function getHealth() {
  return request('/api/health')
}
