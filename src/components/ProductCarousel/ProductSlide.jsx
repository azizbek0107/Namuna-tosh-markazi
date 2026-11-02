import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ImageOff } from "lucide-react";
import OrderButton from "../OrderButton";

export default function ProductSlide({ product, index, count }) {
  const [failed, setFailed] = useState(false);
  return (
    <article
      className="product-slide"
      role="group"
      aria-roledescription="slayd"
      aria-label={`${index + 1} / ${count}: ${product.name}`}
    >
      <div className="product-image-frame">
        {failed ? (
          <div className="product-image-error" role="status">
            <ImageOff size={32} aria-hidden="true" />
            <p>Rasmni yuklab bo‘lmadi.</p>
          </div>
        ) : (
          <img
            src={product.image}
            alt={product.alt}
            width={index === 0 ? 1188 : 1024}
            height={index === 0 ? 1324 : 1536}
            fetchPriority={index === 0 ? "high" : "auto"}
            decoding="async"
            draggable="false"
            onError={() => setFailed(true)}
          />
        )}
      </div>
      <div className="product-slide-copy">
        <span className="product-edition">{product.edition}</span>
        <h2>{product.name}</h2>
        <p>{product.description}</p>
        <div className="product-slide-actions">
          <Link className="text-link" to="/products">
            Mahsulotlarni ko‘rish <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
          <OrderButton />
        </div>
      </div>
    </article>
  );
}
