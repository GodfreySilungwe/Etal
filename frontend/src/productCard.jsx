import React from "react"

const fmtMK = (val) => {
  const n = Number(val)
  if (val == null || val === '' || Number.isNaN(n)) return ''
  return `MWK ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function ProductCard({
  product,
  onSelect,
  onBuy,
  onAddToCart,
  showAction = true,
  extraContent = null
}) {
  const stock = Number(product.stock ?? 0)
  const stockClass = stock <= 0 ? 'stock-line stock-out' : stock <= 5 ? 'stock-line stock-low' : 'stock-line stock-in'
  const hasDiscount = Number(product.discount_percent) > 0
  const oldPrice = Number(product.original_price) || 0
  const newPrice = Number(product.price) || 0
  const savedAmount = Math.max(oldPrice - newPrice, 0)

  const handleSelect = (e) => {
    if (e.target.tagName === 'BUTTON') return;
    if (onSelect) onSelect(product.id)
  }

  const handleBuy = (e) => {
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()
    if (onBuy) onBuy(product, { sourceEl: e.currentTarget.closest('.product-card'), imageUrl: product.image_url })
  }

  const handleAddToCart = (e) => {
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()
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
        {hasDiscount ? (
          <>
            <p className="discount-compact">
              <span className="discount-percent">{product.discount_percent}% off</span>
              <span className="price-old-inline">Old: {fmtMK(product.original_price)}</span>
              <span className="price-now-inline">Now: {fmtMK(product.price)}</span>
              <span className="saved-inline"><span className="savings-icon" aria-hidden="true">🎉</span> Saved: {fmtMK(savedAmount)}</span>
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
          <div className="card-buttons">
            <button type="button" onClick={handleBuy} className="buy-button">
              Buy
            </button>
            <button type="button" onClick={handleAddToCart} className="add-to-cart-button">
              Add to Cart
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
