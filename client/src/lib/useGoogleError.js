import { useSearchParams } from 'react-router'

const googleError = 'Google sign-in could not be completed. If you created your account with a password, log in with your email and password instead.'

export function useGoogleError() {
  const [searchParams, setSearchParams] = useSearchParams()
  const failed = searchParams.has('error')

  function clear() {
    if (!failed) return
    const next = new URLSearchParams(searchParams)
    next.delete('error')
    next.delete('error_description')
    setSearchParams(next, { replace: true })
  }

  return { message: failed ? googleError : '', clear }
}
