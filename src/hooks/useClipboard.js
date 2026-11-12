import { useState, useCallback, useRef } from 'react';

/**
 * useClipboard — copies text to the clipboard with a graceful fallback.
 *
 * Returns:
 *   copy(text)      — async function; resolves to true on success
 *   status          — 'idle' | 'copied' | 'failed'
 *   failedText      — text that could not be auto-copied (display for manual copy)
 *   copiedText      — the last successfully copied text
 *   reset()         — clears status back to 'idle'
 *
 * Privacy: text is never sent to any external service.
 */
export default function useClipboard() {
  const [status, setStatus] = useState('idle'); // 'idle' | 'copied' | 'failed'
  const [copiedText, setCopiedText] = useState('');
  const [failedText, setFailedText] = useState('');
  const timeoutRef = useRef(null);

  const copy = useCallback(async (text) => {
    if (!text) return false;
    clearTimeout(timeoutRef.current);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setFailedText('');
      setStatus('copied');
      // Auto-reset the "copied" indicator after 4 s so user can copy again
      timeoutRef.current = setTimeout(() => {
        setStatus(prev => prev === 'copied' ? 'idle' : prev);
      }, 4000);
      return true;
    } catch {
      // Clipboard API unavailable or denied — show the text for manual copying
      setFailedText(text);
      setCopiedText('');
      setStatus('failed');
      return false;
    }
  }, []);

  const reset = useCallback(() => {
    clearTimeout(timeoutRef.current);
    setStatus('idle');
    setCopiedText('');
    setFailedText('');
  }, []);

  return { copy, status, copiedText, failedText, reset };
}

