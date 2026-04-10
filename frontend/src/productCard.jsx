import React from "react"

const fmtMK = (val) => {
  const n = Number(val)
  if (val == null || val === '' || Number.isNaN(n)) return ''
  return `MWK ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function ProductCard({
  product,
  onSelect,
  onAddToCart,
  onAction,
  actionLabel = 'Buy',
  showAction = true,
  extraContent = null
}) {
  const stock = Number(product.stock ?? 0)
  const stockClass = stock <= 0 ? 'stock-line stock-out' : stock <= 5 ? 'stock-line stock-low' : 'stock-line stock-in'

  const handleSelect = () => {
    if (onSelect) onSelect(product.id)
  }

  const handleAction = (e) => {
    e.stopPropagation()
    if (onAction) return onAction(product)
    if (onAddToCart) onAddToCart(product, { sourceEl: e.currentTarget.closest('.product-card'), imageUrl: product.image_url })
  }

  return (
    <div className="product-card" onClick={handleSelect}>
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
        <p className={stockClass}>
          {stock <= 0 ? 'Out of stock' : `Stock: ${stock}`}
        </p>

        {extraContent}

        {showAction && (
          <button onClick={handleAction}>
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  )
}
