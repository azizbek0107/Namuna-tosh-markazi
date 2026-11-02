import { ArrowUpRight } from "lucide-react";
import { orderUrl } from "./Navbar/navigation";

export default function OrderButton({ className = "", onClick }) {
  return (
    <a
      className={`gold-button ${className}`}
      href={orderUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
    >
      Buyurtma berish <ArrowUpRight size={17} aria-hidden="true" />
      <span className="sr-only"> (Telegram, yangi oynada ochiladi)</span>
    </a>
  );
}
