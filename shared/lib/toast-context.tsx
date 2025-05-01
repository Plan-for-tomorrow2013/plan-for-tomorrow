"use client"

import React from "react"
import { createContext, useContext, useState, useReducer, useCallback } from "react"
import {
  Toast as UIToast,
  ToastClose,
  ToastDescription,
  ToastTitle,
  ToastViewport,
  ToastProvider as UIToastProvider,
} from "@shared/components/ui/toast"

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

// Define the action type
interface ToastAction {
  type: 'ADD_TOAST' | 'REMOVE_TOAST';
  toast?: ToastProps; // Optional because it's only used in ADD_TOAST
  id?: string; // Optional because it's only used in REMOVE_TOAST
}

// Define the reducer function
const reducer = (state: { toasts: ToastProps[] }, action: ToastAction) => {
  switch (action.type) {
    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, action.toast!] }; // Use non-null assertion
    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter(toast => toast.id !== action.id) };
    default:
      return state;
  }
};

// Provider component that wraps the application
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { toasts: [] })

  // Add a new toast
  const toast = useCallback(({ title, description, action, variant = "default" }: Omit<ToastProps, "id">) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast: ToastProps = { id, title, description, action, variant }

    dispatch({ type: 'ADD_TOAST', toast: newToast })

    // Auto-dismiss after 5 seconds for non-destructive toasts
    if (variant !== "destructive") {
      setTimeout(() => {
        dispatch({ type: 'REMOVE_TOAST', id })
      }, 5000)
    }

    return id
  }, [])

  // Dismiss a specific toast
  const dismiss = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_TOAST', id })
  }, [])

  // Dismiss all toasts
  const dismissAll = useCallback(() => {
    state.toasts.forEach(toast => {
      dispatch({ type: 'REMOVE_TOAST', id: toast.id })
    })
  }, [state.toasts])

  return (
    <ToastContext.Provider value={{ toasts: state.toasts, toast, dismiss, dismissAll }}>
      {children}
      <UIToastProvider>
        {state.toasts.map(({ id, title, description, action, variant }) => (
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
