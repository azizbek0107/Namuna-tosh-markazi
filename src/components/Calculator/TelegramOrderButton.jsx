import { Send } from 'lucide-react';
import { telegramChatUrl } from '../../utils/telegramUtils';

export default function TelegramOrderButton() {
  return <a className="catalog-telegram-button" href={telegramChatUrl} target="_blank" rel="noopener noreferrer"><Send size={16} aria-hidden="true" />Telegramni ochish<span className="sr-only"> (yangi oynada ochiladi)</span></a>;
}
