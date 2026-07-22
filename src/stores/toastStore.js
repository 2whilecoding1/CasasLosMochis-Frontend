import { create } from 'zustand'

let nextId = 1

const useToastStore = create((set, get) => ({
  toasts: [],

  push: (type, message, duration = 4500) => {
    const id = nextId++
    set((state) => ({ toasts: [...state.toasts, { id, type, message }] }))
    if (duration > 0) {
      setTimeout(() => get().dismiss(id), duration)
    }
    return id
  },

  dismiss: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
  },
}))

// API simple para usar fuera de componentes React (servicios, interceptores, etc).
export const toast = {
  success: (message) => useToastStore.getState().push('success', message),
  error: (message) => useToastStore.getState().push('error', message),
  warning: (message) => useToastStore.getState().push('warning', message),
  info: (message) => useToastStore.getState().push('info', message),
}

export default useToastStore
