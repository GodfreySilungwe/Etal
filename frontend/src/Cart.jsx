import React from 'react'

const fmtMK = (val) => {
  const n = Number(val)
  if (val == null || val === '' || Number.isNaN(n)) return ''
  return `MK ${n.toFixed(2)}`
}

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
                  <del style={{ color: 'var(--danger)' }}>{fmtMK(it.original_price)}</del> 
                  <span style={{ fontWeight: 'bold', color: 'var(--success)' }}> {fmtMK(it.price)} <span style={{ color: 'var(--success)' }}>({it.discount_percent}% off)</span></span>
                </>
              ) : (
                `${fmtMK(it.price)}`
              )}
              {savings > 0 && <span style={{ color: 'var(--success)', marginLeft: 8 }}> (Saved: {fmtMK(savings)})</span>}
              <button onClick={()=>onRemove(idx)} style={{ marginLeft: 8 }}>Remove</button>
            </li>
          )
        })}
      </ul>
      {totalBefore !== total ? (
        <>
          <p style={{ color: 'var(--danger)', fontWeight: 'bold' }}>Total before discounts: {fmtMK(totalBefore)}</p>
          <p style={{ color: 'var(--success)', fontWeight: 'bold' }}>Total after discounts: {fmtMK(total)}</p>
          <p style={{ color: 'var(--success)', fontWeight: 'bold' }}>You save: {fmtMK(totalSavings)}</p>
        </>
      ) : (
        <p style={{ fontWeight: 'bold', color: 'var(--success)' }}>Total: {fmtMK(total)}</p>
      )}
      <button onClick={goToCheckout} disabled={items.length===0}>Checkout</button>
    </div>
  )
}
