import React from "react"

const fmtMK = (val) => {
  const n = Number(val)
  if (val == null || val === '' || Number.isNaN(n)) return ''
  return `MWK ${n.toLocaleString()}`
}

export default function ProductCard({ product, onSelect, onAddToCart }) {
  return (
    <div className="product-card" onClick={() => onSelect(product.id)}>
      <div className="card-top">
        <h3>{product.name}</h3>
        <p>{product.description?.slice(0, 30)}...</p>
      </div>

      {/* IMAGE */}
      <div className="card-image">
        {product.image_url && (
          <img src={product.image_url} alt={product.name} />
        )}
      </div>

      {/* BOTTOM */}
      <div className="card-bottom">
        {product.discount_percent > 0 ? (
          <>
            <p className="old-price">{fmtMK(product.original_price)}</p>
            <p className="new-price">
              {fmtMK(product.price)} ({product.discount_percent}% off)
            </p>
          </>
        ) : (
          <p className="new-price">{fmtMK(product.price)}</p>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation()
            onAddToCart(product)
          }}
        >
          Buy
        </button>
      </div>
    </div>
  )
}