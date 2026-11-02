import { create } from 'zustand'

interface ToastState { message: string; key: number; show: (message: string) => void }
export const useToast = create<ToastState>((set) => ({
  message: '',
  key: 0,
  show: (message) => set({ message, key: Date.now() }),
}))
