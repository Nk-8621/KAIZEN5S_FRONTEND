import * as React from "react"
import type { ToastActionElement, ToastProps } from "@/components/ui/toast"

const TOAST_LIMIT = 3
const TOAST_REMOVE_DELAY = 5000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

let toastCount = 0
function generateId(): string {
  toastCount = (toastCount + 1) % Number.MAX_SAFE_INTEGER
  return toastCount.toString()
}

type Action =
  | { type: "ADD_TOAST"; toast: ToasterToast }
  | { type: "UPDATE_TOAST"; toast: Partial<ToasterToast> }
  | { type: "DISMISS_TOAST"; toastId?: string }
  | { type: "REMOVE_TOAST"; toastId?: string }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

function scheduleToastRemoval(toastId: string) {
  if (toastTimeouts.has(toastId)) {
    return
  }
  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({ type: "REMOVE_TOAST", toastId })
  }, TOAST_REMOVE_DELAY)
  toastTimeouts.set(toastId, timeout)
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD_TOAST": {
      const toasts = [action.toast, ...state.toasts].slice(0, TOAST_LIMIT)
      return { ...state, toasts }
    }
    case "UPDATE_TOAST": {
      const toasts = state.toasts.map((t) => (t.id === action.toast.id ? { ...t, ...action.toast } : t))
      return { ...state, toasts }
    }
    case "DISMISS_TOAST": {
      const { toastId } = action
      if (toastId) {
        scheduleToastRemoval(toastId)
      } else {
        state.toasts.forEach((t) => scheduleToastRemoval(t.id))
      }

      const toasts = state.toasts.map((t) =>
        t.id === toastId || toastId === undefined ? { ...t, open: false } : t,
      )
      return { ...state, toasts }
    }
    case "REMOVE_TOAST": {
      if (action.toastId === undefined) {
        return { ...state, toasts: [] }
      }
      const toasts = state.toasts.filter((t) => t.id !== action.toastId)
      return { ...state, toasts }
    }
    default:
      return state
  }
}

const listeners: Array<(state: State) => void> = []
let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => listener(memoryState))
}

type Toast = Omit<ToasterToast, "id">

function toast(props: Toast) {
  const id = generateId()

  const update = (updatedProps: ToasterToast) => dispatch({ type: "UPDATE_TOAST", toast: { ...updatedProps, id } })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) {
          dismiss()
        }
      },
    },
  })

  return { id, dismiss, update }
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export { useToast, toast }
