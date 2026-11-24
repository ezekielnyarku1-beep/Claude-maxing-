import { createContext, useContext } from 'react'

export const ShellContext = createContext(null)

export const useShell = () => useContext(ShellContext)
