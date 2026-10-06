/**
 * Lets FullPageChrome ask MatchingPage to step back inside the multi-step flow
 * (details → type → result) before falling through to route history.
 */

type MatchingBackHandler = () => boolean

let handler: MatchingBackHandler | null = null

export function setMatchingBackHandler(next: MatchingBackHandler | null) {
  handler = next
}

/** @returns true if Matching handled back and chrome should not navigate away. */
export function tryMatchingBack(): boolean {
  return handler?.() ?? false
}
