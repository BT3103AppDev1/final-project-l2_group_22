import { afterEach, vi } from 'vitest'

if (!window.scrollTo) {
  window.scrollTo = vi.fn()
}

afterEach(() => {
  vi.clearAllMocks()
  vi.restoreAllMocks()
})
