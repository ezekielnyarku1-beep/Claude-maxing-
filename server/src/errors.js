export class HttpError extends Error {
  constructor(status, message, options) {
    super(message, options)
    this.status = status
  }
}

export function notFoundHandler(request, response) {
  response.status(404).json({ error: 'Not found.' })
}

export function errorHandler(error, request, response, _next) {
  if (error instanceof HttpError) {
    response.status(error.status).json({ error: error.message })
    return
  }
  if (error.type === 'entity.parse.failed') {
    response.status(400).json({ error: 'The request body is not valid JSON.' })
    return
  }
  if (error.type === 'entity.too.large') {
    response.status(413).json({ error: 'The request is too large.' })
    return
  }
  if (error.code === 'P2002') {
    response.status(409).json({ error: 'That value is already used. Choose another one.' })
    return
  }
  console.error(error)
  response.status(500).json({ error: 'Something went wrong on the server. Try again.' })
}
