import * as React from "react"

import { toast } from "sonner"

interface ToastActionElement<T> {
  label: React.ReactNode
  onClick: () => void
}

interface ToastAction {
  element: ToastActionElement<any>
}

interface ToastProps {
  id?: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastAction
  variant?: "default" | "destructive"
}

const ACTIONS = {
  OPEN: "OPEN",
  DISMISS: "DISMISS",
  DISMISS_ALL: "DISMISS_ALL",
} as const

type Action = typeof ACTIONS[keyof typeof ACTIONS]

const useToast = () => {
  return {
    toast,
  }
}

export { useToast, type ToastProps }

