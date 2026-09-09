import { useCallback, useEffect, useState } from "react"
import { ApiError } from "@/api/client"

interface AsyncDataState<T> {
  data: T | null
  isLoading: boolean
  error: string | null
}

/**
 * Runs an async fetcher on mount (and whenever `deps` changes), tracking loading/error/data.
 * Every list/detail page in the app uses this one hook so the loading/error pattern stays
 * consistent (ANALYSIS.md §9's "shared loading/error/toast pattern").
 */
export function useAsyncData<T>(fetcher: () => Promise<T>, deps: React.DependencyList): AsyncDataState<T> & { reload: () => void } {
  const [state, setState] = useState<AsyncDataState<T>>({ data: null, isLoading: true, error: null })
  const [reloadToken, setReloadToken] = useState(0)

  const load = useCallback(() => {
    let isCancelled = false
    setState((previous) => ({ ...previous, isLoading: true, error: null }))

    fetcher()
      .then((data) => {
        if (!isCancelled) {
          setState({ data, isLoading: false, error: null })
        }
      })
      .catch((error: unknown) => {
        if (!isCancelled) {
          const message = error instanceof ApiError ? error.message : "Something went wrong. Please try again."
          setState({ data: null, isLoading: false, error: message })
        }
      })

    return () => {
      isCancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadToken])

  useEffect(() => {
    const cancel = load()
    return cancel
  }, [load])

  const reload = useCallback(() => setReloadToken((token) => token + 1), [])

  return { ...state, reload }
}
