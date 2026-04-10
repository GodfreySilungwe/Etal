import React, { useState } from 'react'

const fmtMK = (val) => {
  const n = Number(val)
  if (val == null || val === '' || Number.isNaN(n)) return ''
  return `MK ${n.toFixed(2)}`
}

export default function Checkout({ presenter, cart = [], onComplete, onRequestQuote }){
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [methodUsed, setMethodUsed] = useState('National Bank Transfer')
  const [transactionReference, setTransactionReference] = useState('')
  const [loading, setLoading] = useState(false)

  const total = (cart || []).reduce((s,i)=>{
    let price = Number(i.price)||0
    if (i.installation_selected) price += Number(i.installation_price)||0
    if (i.delivery_selected) price += Number(i.delivery_price)||0
    return s + (price * (i.quantity || 1))
  }, 0)

  async function submit(e){
    e.preventDefault()
    if(!name || !phone || !methodUsed || !transactionReference) return alert('Please provide all required fields')
    setLoading(true)
    try{
      await presenter.createPaymentReference({
        customer_name: name,
        phone,
        method_used: methodUsed,
        transaction_reference: transactionReference,
        product_details: JSON.stringify(cart)
      })
      alert('Transaction reference submitted successfully')
      onComplete && onComplete()
    }catch(err){
      console.error(err)
      const serverMsg = err?.response?.data?.error
      const status = err?.response?.status
      const hint = status === 404 ? ' (backend route may not be loaded; restart backend server)' : ''
      alert(`Failed to submit transaction reference${serverMsg ? `: ${serverMsg}` : ''}${hint}`)
    }finally{ setLoading(false) }
  }

  return (
    <div>
      <h2>Send Transaction Reference</h2>
      <div style={{maxWidth:640}}>
        <h3>Order Summary</h3>
        <ul>
          {(cart||[]).map((it, i)=> {
            const basePrice = Number(it.price)||0
            const itemTotal = (basePrice + (it.installation_selected ? Number(it.installation_price)||0 : 0) + (it.delivery_selected ? Number(it.delivery_price)||0 : 0)) * (it.quantity || 1)
            const quantity = it.quantity || 1
            return (
              <li key={i}>
                {it.name} (Qty: {quantity}) - {fmtMK(basePrice)}
                {itemTotal !== (basePrice * quantity) && ` = ${fmtMK(itemTotal)}`}
              </li>
            )
          })}
        </ul>
        <p><strong>Total: {fmtMK(total)}</strong></p>

        <h3>Reference Details</h3>
        <form onSubmit={submit}>
          <input placeholder="Full name" value={name} onChange={(e)=>setName(e.target.value)} />
          <input placeholder="Phone" value={phone} onChange={(e)=>setPhone(e.target.value)} />
          <select value={methodUsed} onChange={(e) => setMethodUsed(e.target.value)}>
            <option value="National Bank Transfer">National Bank Transfer</option>
            <option value="Airtel Money">Airtel Money</option>
            <option value="TNM Mpamba">TNM Mpamba</option>
          </select>
          <input
            placeholder="Transaction Reference"
            value={transactionReference}
            onChange={(e) => setTransactionReference(e.target.value)}
          />
          <button className="buy-like-btn" type="submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Send Transaction Reference'}
          </button>
          <button className="buy-like-btn" type="button" onClick={() => onRequestQuote && onRequestQuote()}>
            Request a Quote
          </button>
        </form>
      </div>
    </div>
  )
}
