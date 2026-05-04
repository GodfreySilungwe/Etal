import React, { useEffect, useState } from 'react'

const fmtMK = (val) => {
  const n = Number(val)
  if (val == null || val === '' || Number.isNaN(n)) return ''
  return `MK ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function ProductDetails({ id, onBack, onBuy, onAddToCart, presenter }) {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      if (!id) return
      setLoading(true)
      setError(null)
      try {
        const r = await presenter.getProductById(id)
        if (mounted) setProduct(r)
      } catch (e) {
        console.error('Failed to load product', e)
        if (mounted) setError(e.message || 'Failed to load product')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [id, presenter])

  if (loading) return (
    <div className="details-loading">
      <div className="spinner"></div>
      <p>Loading product details...</p>
    </div>
  )
  
  if (error) return (
    <div className="details-error">
      <button onClick={onBack} className="back-btn-modern">← Back</button>
      <h3>Error Loading Product</h3>
      <p>{error}</p>
    </div>
  )
  
  if (!product) return (
    <div className="details-not-found">
      <button onClick={onBack} className="back-btn-modern">← Back</button>
      <p>Product not found.</p>
    </div>
  )

  const hasDiscount = Number(product.discount_percent) > 0
  const stock = Number(product.stock ?? 0)
  const stockClass = stock <= 0 ? 'out-of-stock' : stock <= 5 ? 'low-stock' : 'in-stock'

  return (
    <div className="product-details-modern">
      <button onClick={onBack} className="back-btn-modern">← Back to Products</button>
      
      <div className="details-layout">
        <div className="details-left">
          <div className="details-badge">{product.category || 'Electronics'}</div>
          <h1 className="details-title">{product.name}</h1>
          
          <div className="details-description-box">
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>
          
          <div className="details-price-section">
            {hasDiscount ? (
              <>
                <div className="price-row">
                  <span className="price-label">Original Price:</span>
                  <span className="old-price-details">{fmtMK(product.original_price)}</span>
                </div>
                <div className="price-row highlight">
                  <span className="price-label">Discounted Price:</span>
                  <span className="new-price-details">{fmtMK(product.price)}</span>
                  <span className="discount-percent-details">({product.discount_percent}% OFF)</span>
                </div>
                <div className="savings-details">
                  🎉 You save: {fmtMK(Math.max(Number(product.original_price) - Number(product.price), 0))}
                </div>
              </>
            ) : (
              <div className="price-row">
                <span className="price-label">Price:</span>
                <span className="new-price-details">{fmtMK(product.price)}</span>
              </div>
            )}
          </div>
          
          <div className={`stock-status-details ${stockClass}`}>
            {stock <= 0 ? '❌ Out of Stock' : stock <= 5 ? `⚠️ Low Stock: Only ${stock} left` : `✓ In Stock: ${stock} units`}
          </div>
          
          <div className="details-actions">
            <button
              className="buy-btn-details"
              onClick={(e) => onBuy && onBuy(product, { sourceEl: e.currentTarget, imageUrl: product.image_url })}
              disabled={stock <= 0}
            >
              Buy Now
            </button>
            <button
              className="cart-btn-details"
              onClick={(e) => onAddToCart && onAddToCart(product, { sourceEl: e.currentTarget, imageUrl: product.image_url })}
              disabled={stock <= 0}
            >
              Add to Cart
            </button>
          </div>
        </div>
        
        <div className="details-right">
          {product.image_url && (
            <div className="product-image-container">
              <img src={product.image_url} alt={product.name} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}