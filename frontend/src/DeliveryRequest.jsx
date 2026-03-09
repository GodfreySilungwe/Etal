import React, { useState } from 'react'

export default function DeliveryRequest({ presenter }){
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [orderDetails, setOrderDetails] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e){
    e.preventDefault()
    if(!address || !phone || !orderDetails) return alert('Please fill all fields')
    setLoading(true)
    try{
      await presenter.createDelivery({ delivery_address: address, phone, order_details: orderDetails })
      alert('Delivery request submitted')
      setAddress(''); setPhone(''); setOrderDetails('')
    }catch(err){
      console.error(err)
      alert('Submission failed')
    }finally{ setLoading(false) }
  }

  return (
    <div>
      <h2>Request Delivery</h2>
      <form onSubmit={submit} style={{maxWidth:480}}>
        <input placeholder="Delivery address" value={address} onChange={(e)=>setAddress(e.target.value)} />
        <input placeholder="Phone contact" value={phone} onChange={(e)=>setPhone(e.target.value)} />
        <textarea placeholder="Order details" value={orderDetails} onChange={(e)=>setOrderDetails(e.target.value)} />
        <button type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit'}</button>
      </form>
    </div>
  )
}
