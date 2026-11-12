import { useRef, useEffect } from 'react';
import { Check, Copy, Send } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { TELEGRAM_URL } from '../../config/contactConfig.js';
import useClipboard from '../../hooks/useClipboard.js';
import './TelegramOrderActions.css';

/**
 * TelegramOrderActions — shows the message preview with copy + open Telegram buttons.
 *
 * Workflow:
 *  1. Display generated order text in a read-only preview.
 *  2. "Matnni nusxalash" copies to clipboard.
 *  3. Show "Nusxalandi" only after successful copy.
 *  4. "Telegramni ochish" opens https://t.me/aura_200707.
 *  5. If clipboard fails, textarea is auto-selected for manual copy.
 *
 * IMPORTANT: Never shows "Buyurtma yuborildi" — the user sends manually.
 */
export default function TelegramOrderActions({ text, onCopied }) {
  const { copy, status, failedText } = useClipboard();
  const textareaRef = useRef(null);
  const reduced = useReducedMotion();

  const isCopied = status === 'copied';
  const isFailed = status === 'failed';

  // Auto-focus+select the textarea when clipboard fails
  useEffect(() => {
    if (isFailed && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isFailed]);

  async function handleCopy() {
    const ok = await copy(text);
    if (ok) onCopied?.();
  }

  return (
    <div className="toa-root">
      {/* Preview */}
      <label className="toa-preview-label">
        Tayyor buyurtma matni
        <textarea
          ref={textareaRef}
          className="toa-preview-textarea"
          aria-label="Tayyor buyurtma matni — nusxalash uchun"
          readOnly
          rows={12}
          value={text}
          spellCheck="false"
        />
      </label>

      {/* Buttons */}
      <div className="toa-buttons">
        <motion.button
          type="button"
          className={`toa-copy-btn${isCopied ? ' is-copied' : ''}`}
          onClick={handleCopy}
          whileTap={reduced ? {} : { scale: 0.97 }}
          aria-live="polite"
          aria-atomic="true"
        >
          {isCopied
            ? <><Check size={15} aria-hidden="true" /> Nusxalandi</>
            : <><Copy size={15} aria-hidden="true" /> Matnni nusxalash</>
          }
        </motion.button>

        <a
          className="toa-telegram-btn"
          href={text ? `${TELEGRAM_URL}?text=${encodeURIComponent(text)}` : TELEGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Telegramni ochish (yangi oynada)"
        >
          <Send size={15} aria-hidden="true" />
          Telegramni ochish
        </a>
      </div>

      {/* Status / instructions */}
      <p
        className={`toa-status${isCopied ? ' is-copied' : ''}${isFailed ? ' is-failed' : ''}`}
        role="status"
        aria-live="polite"
      >
        {isCopied
          ? "✓ Matn nusxalandi. Endi Telegramni ochib, xabarni suhbatga joylashtiring va o\u02BBzingiz yuboring."
          : isFailed
            ? "⚠ Avtomatik nusxalash ishlamadi. Yuqoridagi matnni belgilab, qo\u02BBlda nusxalang (Ctrl+C / Cmd+C)."
            : "Avval matnni nusxalang, so\u02BBng Telegram chatini oching va xabarni joylashtiring."
        }
      </p>
    </div>
  );
}
