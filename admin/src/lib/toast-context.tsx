"use client"

import type React from "react"
import { createContext, useContext, useState, useReducer, useCallback } from "react"
import {
  Toast as UIToast,
  ToastClose,
  ToastDescription,
  ToastTitle,
  ToastViewport,
  ToastProvider as UIToastProvider,
} from "@/components/ui/toast"

// Define the shape of a toast
export interface ToastProps {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: "default" | "destructive"
}

// Define the shape of the toast context
interface ToastContextType {
  toasts: ToastProps[]
  toast: (props: Omit<ToastProps, "id">) => string
  dismiss: (id: string) => void
  dismissAll: () => void
}

// Create the context with a default value
const ToastContext = createContext<ToastContextType | undefined>(undefined)

// Provider component that wraps the application
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  // Add a new toast
  const toast = useCallback(({ title, description, action, variant = "default" }: Omit<ToastProps, "id">) => {
    const id = Math.random().toString(36).substring(2, 9)

    setToasts((prev) => [...prev, { id, title, description, action, variant }])

    // Auto-dismiss after 5 seconds for non-destructive toasts
    if (variant !== "destructive") {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 5000)
    }

    return id
  }, [])

  // Dismiss a specific toast
  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  // Dismiss all toasts
  const dismissAll = useCallback(() => {
    setToasts([])
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss, dismissAll }}>
      {children}
      <UIToastProvider>
        {toasts.map(({ id, title, description, action, variant }) => (
          <UIToast key={id} variant={variant}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
            {action}
            <ToastClose onClick={() => dismiss(id)} />
          </UIToast>
        ))}
        <ToastViewport />
      </UIToastProvider>
    </ToastContext.Provider>
  )
}

// Custom hook to use the toast context
export function useToast() {
  const context = useContext(ToastContext)

  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider")
  }

  return context
}
