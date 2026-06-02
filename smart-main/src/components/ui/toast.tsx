"use client"

// Sonner-based toast - see sonner.tsx instead
// import {
//   Toast,
//   ToastClose,
//   ToastDescription,
//   ToastProvider,
//   ToastTitle,
//   ToastViewport,
// } from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"

export function Toaster() {
  const { toast } = useToast()

  return null // Sonner-based, handled by SonnerToaster
}
