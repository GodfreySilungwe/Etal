import React, { useEffect, useState } from 'react'

export default function ProductDetails({ id, onBack, onAddToCart, presenter }){
  const [p, setP] = useState(null)
  useEffect(()=>{
    if(!id) return; presenter.getProductById(id).then(r=>setP(r)).catch(()=>setP(null))
  },[id, presenter])
  if(!p) return <div>Loading...</div>
  return (
    <div>
      <button onClick={onBack}>Back</button>
      <h2>{p.name}</h2>
      <p>Category: {p.category}</p>
      <p>{p.description}</p>
      <p>Price: {p.price}</p>
      {p.image_url && <img src={p.image_url} alt={p.name} style={{maxWidth:320}} />}
      <div>
        <button onClick={()=>onAddToCart(p)}>Add to cart</button>
      </div>
    </div>
  )
}
