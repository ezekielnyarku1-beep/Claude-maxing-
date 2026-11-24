export const passwordHint = 'Use at least 8 characters, with a letter and a number.'

export function isEmail(value) {
  return /^\S+@\S+\.\S+$/.test(value.trim())
}

export function checkNewPassword(password, confirm) {
  if (password.length < 8) throw new Error('Your password must have at least 8 characters.')
  if (!/[A-Za-z]/.test(password)) throw new Error('Your password needs at least one letter.')
  if (!/[0-9]/.test(password)) throw new Error('Your password needs at least one number.')
  if (password !== confirm) throw new Error('The two passwords do not match.')
}
