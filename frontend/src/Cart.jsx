import React from 'react'

export default function Cart({ items, onRemove, onCheckoutNavigate, presenter }){
  const total = items.reduce((s,i)=>s + (Number(i.price)||0), 0)

  function goToCheckout(){
    if(items.length===0) return alert('Your cart is empty')
    onCheckoutNavigate && onCheckoutNavigate()
  }

  return (
    <div>
      <h2>Cart</h2>
      {items.length===0 && <p>Your cart is empty</p>}
      <ul>
        {items.map((it, idx)=> (
          <li key={idx}>{it.name} - {it.price} <button onClick={()=>onRemove(idx)}>Remove</button></li>
        ))}
      </ul>
      <p>Total: {total}</p>
      <button onClick={goToCheckout} disabled={items.length===0}>Checkout</button>
    </div>
  )
}
