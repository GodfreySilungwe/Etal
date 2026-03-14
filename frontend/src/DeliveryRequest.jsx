import React, { useEffect, useState } from 'react'

export default function DeliveryRequest({ presenter, requestContext }){
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [orderDetails, setOrderDetails] = useState('')
  const [productPrice, setProductPrice] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (requestContext && requestContext.product) {
      setOrderDetails(`Product: ${requestContext.product.name || requestContext.product}`)
      if (requestContext.price) setProductPrice(requestContext.price)
    }
  }, [requestContext])

  async function submit(e){
    e.preventDefault()
    if(!address || !phone || !orderDetails) return alert('Please fill all fields')
    setLoading(true)
    try{
      await presenter.createDelivery({ delivery_address: address, phone, order_details: orderDetails, product_id: requestContext?.product?.id, product_price: productPrice })
      alert('Delivery request submitted')
      setAddress(''); setPhone(''); setOrderDetails(''); setProductPrice('')
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
        {productPrice && <p style={{ margin: '8px 0' }}>Delivery fee: <strong>MK {Number(productPrice).toFixed(2)}</strong></p>}
        <button type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit'}</button>
      </form>
    </div>
  )
}
