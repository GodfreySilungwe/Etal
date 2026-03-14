import React from 'react'

export default function Cart({ items, onRemove, onCheckoutNavigate, presenter }){
  const total = items.reduce((s,i)=>s + (Number(i.price)||0), 0)
  const totalBefore = items.reduce((s,i)=>{
    const before = i.discount_percent > 0 ? (Number(i.original_price)||0) : (Number(i.price)||0)
    return s + before
  }, 0)
  const totalSavings = totalBefore - total

  function goToCheckout(){
    if(items.length===0) return alert('Your cart is empty')
    onCheckoutNavigate && onCheckoutNavigate()
  }

  return (
    <div>
      <h2>Cart</h2>
      {items.length===0 && <p>Your cart is empty</p>}
      <ul>
        {items.map((it, idx)=> {
          const savings = it.discount_percent > 0 ? (Number(it.original_price) || 0) - (Number(it.price) || 0) : 0
          return (
            <li key={idx} style={{ marginBottom: 8 }}>
              {it.name} - 
              {it.discount_percent > 0 ? (
                <>
                  <del style={{ color: 'var(--danger)' }}>${Number(it.original_price).toFixed(2)}</del> 
                  <span style={{ fontWeight: 'bold', color: 'var(--success)' }}> ${Number(it.price).toFixed(2)} <span style={{ color: 'var(--success)' }}>({it.discount_percent}% off)</span></span>
                </>
              ) : (
                `$${Number(it.price).toFixed(2)}`
              )}
              {savings > 0 && <span style={{ color: 'var(--success)', marginLeft: 8 }}> (Saved: ${savings.toFixed(2)})</span>}
              <button onClick={()=>onRemove(idx)} style={{ marginLeft: 8 }}>Remove</button>
            </li>
          )
        })}
      </ul>
      {totalBefore !== total ? (
        <>
          <p style={{ color: 'var(--danger)', fontWeight: 'bold' }}>Total before discounts: ${totalBefore.toFixed(2)}</p>
          <p style={{ color: 'var(--success)', fontWeight: 'bold' }}>Total after discounts: ${total.toFixed(2)}</p>
          <p style={{ color: 'var(--success)', fontWeight: 'bold' }}>You save: ${totalSavings.toFixed(2)}</p>
        </>
      ) : (
        <p style={{ fontWeight: 'bold', color: 'var(--success)' }}>Total: ${total.toFixed(2)}</p>
      )}
      <button onClick={goToCheckout} disabled={items.length===0}>Checkout</button>
    </div>
  )
}
