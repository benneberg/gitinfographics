/**
 * Iframe-safe and browser-safe haptic feedback utility.
 * Triggers subtle vibration for touch interactions on supported devices.
 */
export function triggerHaptic(duration: number = 12): void {
  try {
    if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
      navigator.vibrate?.(duration);
    }
  } catch {
    // Safe no-op in restricted iframes or unsupported environments
  }
}
