import React, { useState } from 'react'

const fmtMK = (val) => {
  const n = Number(val)
  if (val == null || val === '' || Number.isNaN(n)) return ''
  return `MK ${n.toFixed(2)}`
}

export default function Checkout({ presenter, cart = [], onComplete }){
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const total = (cart || []).reduce((s,i)=>{
    let price = Number(i.price)||0
    if (i.installation_selected) price += Number(i.installation_price)||0
    if (i.delivery_selected) price += Number(i.delivery_price)||0
    return s + (price * (i.quantity || 1))
  }, 0)

  async function submit(e){
    e.preventDefault()
    if(!name || !phone) return alert('Please provide name and phone')
    setLoading(true)
    try{
      // Submit installation requests
      for (const item of cart) {
        if (item.installation_selected) {
          if (!item.installation_location || !item.installation_date) {
            alert(`Please fill in installation details for ${item.name}`)
            setLoading(false)
            return
          }
          // Submit installation request for each quantity
          const quantity = item.quantity || 1
          for (let i = 0; i < quantity; i++) {
            await presenter.createInstallation({
              customer_location: item.installation_location,
              preferred_date: item.installation_date,
              product: item.name,
              product_id: item.id,
              product_price: item.installation_price
            })
          }
        }
      }

      // Submit delivery requests
      for (const item of cart) {
        if (item.delivery_selected) {
          if (!item.delivery_address || !item.delivery_phone || !item.delivery_details) {
            alert(`Please fill in delivery details for ${item.name}`)
            setLoading(false)
            return
          }
          // Submit delivery request for each quantity
          const quantity = item.quantity || 1
          for (let i = 0; i < quantity; i++) {
            await presenter.createDelivery({
              delivery_address: item.delivery_address,
              phone: item.delivery_phone,
              order_details: item.delivery_details,
              product_id: item.id,
              product_price: item.delivery_price
            })
          }
        }
      }

      await presenter.createInvoice({ customer_name: name, phone, email, product_details: JSON.stringify(cart) })
      alert('Order submitted successfully')
      onComplete && onComplete()
    }catch(err){
      console.error(err)
      alert('Failed to submit order')
    }finally{ setLoading(false) }
  }

  return (
    <div>
      <h2>Checkout</h2>
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
                {it.installation_selected && ` + Installation (${fmtMK(it.installation_price)})`}
                {it.delivery_selected && ` + Delivery (${fmtMK(it.delivery_price)})`}
                {itemTotal !== (basePrice * quantity) && ` = ${fmtMK(itemTotal)}`}
              </li>
            )
          })}
        </ul>
        <p><strong>Total: {fmtMK(total)}</strong></p>

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
