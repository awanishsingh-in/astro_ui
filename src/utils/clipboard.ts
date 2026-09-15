/**
 * Copy text, with a fallback for contexts the async Clipboard API refuses.
 *
 * `navigator.clipboard.writeText` is the right call, but it is unavailable
 * over plain http and rejects inside iframes that were not granted
 * `clipboard-write` — previews, embeds, some in-app browsers. The hidden
 * textarea plus `execCommand` is deprecated and still the only thing that
 * works there, so it runs only after the modern path has actually failed.
 *
 * Returns whether the text reached the clipboard, so callers can report
 * honestly rather than claiming success.
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // Blocked — fall through to the legacy path.
  }

  try {
    const area = document.createElement('textarea')
    area.value = text
    area.setAttribute('readonly', '')
    // Off-screen but still focusable: `display:none` cannot be selected.
    area.style.cssText = 'position:fixed;top:0;left:-9999px;opacity:0'
    document.body.appendChild(area)
    area.select()
    area.setSelectionRange(0, area.value.length)
    const ok = document.execCommand('copy')
    document.body.removeChild(area)
    return ok
  } catch {
    return false
  }
}
