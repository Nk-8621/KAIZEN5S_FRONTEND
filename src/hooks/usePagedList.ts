import { useCallback, useState } from "react"
import { DEFAULT_PAGE_SIZE, type PagedRequest, type PagedResult } from "@/types/common"
import { useAsyncData } from "@/hooks/useAsyncData"

/**
 * Wraps useAsyncData with page-number state, for the paged list screens every module has.
 * The caller supplies a fetcher that takes the current PagedRequest and any other filters
 * (via the `deps` array, which should include those filter values so changing a filter resets
 * data and refetches).
 */
export function usePagedList<T>(fetcher: (paging: PagedRequest) => Promise<PagedResult<T>>, deps: React.DependencyList) {
  const [page, setPage] = useState(1)
  const paging: PagedRequest = { page, pageSize: DEFAULT_PAGE_SIZE }

  const { data, isLoading, error, reload } = useAsyncData(() => fetcher(paging), [page, ...deps])

  const changePage = useCallback((newPage: number) => setPage(newPage), [])

  return { result: data, isLoading, error, reload, page, setPage: changePage }
}
