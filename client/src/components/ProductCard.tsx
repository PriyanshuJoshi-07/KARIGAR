import { Link } from "react-router-dom";
import type { Product } from "../services/api";
import { formatInr } from "../services/api";
import { Stars } from "./Stars";

export function ProductCard({ product }: { product: Product }) {
  const img = product.images.find((i) => i.isPrimary) || product.images[0];
  return (
    <Link to={`/product/${product.id}`} className="card group flex flex-col overflow-hidden p-0">
      <div className="aspect-[4/3] bg-clay-50">
        {img && <img src={img.url} alt={img.alt} className="h-full w-full object-cover" />}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="text-xs uppercase tracking-wide text-clay-500">{product.category.name}</p>
        <h3 className="font-display text-lg leading-snug group-hover:text-clay-700">{product.title}</h3>
        <p className="text-sm text-clay-600">{product.seller.user.name} · {product.originCity}</p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-semibold">{formatInr(product.basePrice)}</span>
          <Stars value={Math.round(product.rating)} />
        </div>
      </div>
    </Link>
  );
}
