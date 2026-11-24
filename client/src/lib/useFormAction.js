import { useState } from 'react'

export function useFormAction() {
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function run(action) {
    if (busy) return
    setError('')
    setBusy(true)
    try {
      await action()
    } catch (problem) {
      setError(problem.message || 'Something went wrong. Try again.')
    } finally {
      setBusy(false)
    }
  }

  return { error, busy, run }
}
