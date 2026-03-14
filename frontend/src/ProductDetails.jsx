import React, { useEffect, useState } from 'react'

export default function ProductDetails({ id, onBack, onAddToCart, presenter }){
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
    <div>
      <button onClick={onBack}>Back</button>
      <h2>{p.name}</h2>
      <p>Category: {p.category}</p>
      <p>{p.description}</p>
      {p.discount_percent > 0 ? (
        <div>
          <p style={{ textDecoration: 'line-through', color: 'var(--danger)', margin: 0 }}>Original: ${p.original_price}</p>
          <p style={{ fontWeight: 'bold', color: 'var(--success)', margin: '4px 0 0' }}>Now: ${p.price} <span style={{ color: 'var(--success)' }}>({p.discount_percent}% off)</span></p>
        </div>
      ) : (
        <p style={{ fontWeight: 'bold', color: 'var(--success)' }}>Price: ${p.price}</p>
      )}
      {p.image_url && <img src={p.image_url} alt={p.name} style={{maxWidth:320}} />}
      <div>
        <button onClick={()=>onAddToCart(p)}>Add to cart</button>
      </div>
    </div>
  )
}
