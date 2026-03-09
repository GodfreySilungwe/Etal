import React, { useState } from 'react'

export default function Checkout({ presenter, cart = [], onComplete }){
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const total = (cart || []).reduce((s,i)=>s + (Number(i.price)||0), 0)

  async function submit(e){
    e.preventDefault()
    if(!name || !phone) return alert('Please provide name and phone')
    setLoading(true)
    try{
      await presenter.createInvoice({ customer_name: name, phone, email, product_details: JSON.stringify(cart) })
      alert('Invoice requested successfully')
      onComplete && onComplete()
    }catch(err){
      console.error(err)
      alert('Failed to submit invoice')
    }finally{ setLoading(false) }
  }

  return (
    <div>
      <h2>Checkout</h2>
      <div style={{maxWidth:640}}>
        <h3>Order Summary</h3>
        <ul>
          {(cart||[]).map((it, i)=> <li key={i}>{it.name} - {it.price}</li>)}
        </ul>
        <p><strong>Total: {total}</strong></p>

        <h3>Customer Details</h3>
        <form onSubmit={submit}>
          <input placeholder="Full name" value={name} onChange={(e)=>setName(e.target.value)} />
          <input placeholder="Phone" value={phone} onChange={(e)=>setPhone(e.target.value)} />
          <input placeholder="Email (optional)" value={email} onChange={(e)=>setEmail(e.target.value)} />
          <button type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Request Invoice'}</button>
        </form>
      </div>
    </div>
  )
}
