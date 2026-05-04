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
    <div className="product-card-modern" onClick={handleSelect}>
      {hasDiscount && <span className="discount-badge-modern">{product.discount_percent}% OFF</span>}
      
      <div className="card-image-modern">
        {product.image_url && (
          <img src={product.image_url} alt={product.name} />
        )}
      </div>

      <div className="card-content-modern">
        <h3 className="product-title-modern">{product.name}</h3>
        <p className="product-description-modern">{product.description?.slice(0, 60)}...</p>

        <div className="price-section-modern">
          {hasDiscount ? (
            <>
              <span className="old-price-modern">{fmtMK(product.original_price)}</span>
              <span className="new-price-modern">{fmtMK(product.price)}</span>
              <span className="saved-badge-modern">Save {fmtMK(savedAmount)}</span>
            </>
          ) : (
            <span className="new-price-modern">{fmtMK(product.price)}</span>
          )}
        </div>

        <div className={`stock-badge-modern ${stockClass}`}>
          {stock <= 0 ? 'Out of Stock' : `In Stock: ${stock}`}
        </div>

        {extraContent}

        {showAction && (
          <div className="card-buttons-modern">
            <button type="button" onClick={handleBuy} className="buy-btn-modern">
              Buy Now
            </button>
            <button type="button" onClick={handleAddToCart} className="cart-btn-modern">
              Add to Cart
            </button>
          </div>
        )}
      </div>
    </div>
  )
}