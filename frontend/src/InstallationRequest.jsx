import React, { useEffect, useState } from 'react'

export default function InstallationRequest({ presenter, requestContext }){
  const [location, setLocation] = useState('')
  const [date, setDate] = useState('')
  const [product, setProduct] = useState('')
  const [productPrice, setProductPrice] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (requestContext && requestContext.product) {
      setProduct(requestContext.product.name || requestContext.product)
      if (requestContext.price) setProductPrice(requestContext.price)
    }
  }, [requestContext])

  async function submit(e){
    e.preventDefault()
    if(!location || !date || !product) return alert('Please fill all fields')
    setLoading(true)
    try{
      const rawId = requestContext?.product?.id
      const numericProductId = typeof rawId === 'number'
        ? rawId
        : (typeof rawId === 'string' && /^\d+$/.test(rawId) ? Number(rawId) : null)

      await presenter.createInstallation({
        customer_location: location,
        preferred_date: date,
        product,
        product_id: numericProductId,
        product_price: productPrice
      })
      alert('Installation request submitted')
      setLocation(''); setDate(''); setProduct(''); setProductPrice('')
    }catch(err){
      console.error(err)
      const msg = err?.response?.data?.error || err?.message || 'Submission failed'
      alert(`Submission failed: ${msg}`)
    }finally{ setLoading(false) }
  }

  return (
    <div>
      <h2>Request Installation / Service</h2>
      <form onSubmit={submit} style={{maxWidth:480}}>
        <input placeholder="Customer location" value={location} onChange={(e)=>setLocation(e.target.value)} />
        <input type="date" value={date} onChange={(e)=>setDate(e.target.value)} />
        <input placeholder="Service or product name" value={product} onChange={(e)=>setProduct(e.target.value)} />
        {productPrice && <p style={{ margin: '8px 0' }}>Service fee: <strong>MK {Number(productPrice).toFixed(2)}</strong></p>}
        <button type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit'}</button>
      </form>
    </div>
  )
}
