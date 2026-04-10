import React, { useEffect, useState } from 'react'

const fmtMK = (val) => {
  const n = Number(val)
  if (val == null || val === '' || Number.isNaN(n)) return ''
  return `MK ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function ProductDetails({ id, onBack, onBuy, presenter }){
  const [p, setP] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(()=>{
    let mounted = true
    async function load(){
      if(!id) return
      setLoading(true)
      setError(null)
      try{
        const r = await presenter.getProductById(id)
        if(mounted) setP(r)
      }catch(e){
        console.error('Failed to load product', e)
        if(mounted) setError(e.message || 'Failed to load product')
      }finally{
        if(mounted) setLoading(false)
      }
    }
    load()
    return ()=>{ mounted = false }
  },[id, presenter])

  if(loading) return <div>Loading product...</div>
  if(error) return (
    <div>
      <button onClick={onBack}>Back</button>
      <h3>Error</h3>
      <p>{error}</p>
    </div>
  )
  if(!p) return (
    <div>
      <button onClick={onBack}>Back</button>
      <p>Product not found.</p>
    </div>
  )

  return (
    <div className="product-details">
      <button onClick={onBack}>Back</button>
      <div className="product-details-layout">
        <div className="product-details-left">
          <h2>{p.name}</h2>
          <p>Category: {p.category}</p>
          <div className="product-description-box">
            <p>{p.description}</p>
          </div>
          {p.discount_percent > 0 ? (
            <div>
              <p style={{ textDecoration: 'line-through', color: 'var(--danger)', margin: 0 }}>Original: {fmtMK(p.original_price)}</p>
              <p style={{ fontWeight: 'bold', color: 'var(--success)', margin: '4px 0 0' }}>Now: {fmtMK(p.price)} <span style={{ color: 'var(--success)' }}>({p.discount_percent}% off)</span></p>
            </div>
          ) : (
            <p style={{ fontWeight: 'bold', color: 'var(--success)' }}>Price: {fmtMK(p.price)}</p>
          )}
          <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              className="buy-like-btn"
              onClick={(e) => onBuy && onBuy(p, { sourceEl: e.currentTarget, imageUrl: p.image_url })}
            >
              Buy
            </button>
          </div>
        </div>
        <div className="product-details-right">
          {p.image_url && <img src={p.image_url} alt={p.name} style={{maxWidth:320, width: '100%', borderRadius: '12px'}} />}
        </div>
      </div>
    </div>
  )
}
