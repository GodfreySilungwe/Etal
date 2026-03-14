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
      await presenter.createInstallation({
        customer_location: location,
        preferred_date: date,
        product,
        product_id: requestContext?.product?.id,
        product_price: productPrice
      })
      alert('Installation request submitted')
      setLocation(''); setDate(''); setProduct(''); setProductPrice('')
    }catch(err){
      console.error(err)
      alert('Submission failed')
    }finally{ setLoading(false) }
  }

  return (
    <div>
      <h2>Request Installation</h2>
      <form onSubmit={submit} style={{maxWidth:480}}>
        <input placeholder="Customer location" value={location} onChange={(e)=>setLocation(e.target.value)} />
        <input type="date" value={date} onChange={(e)=>setDate(e.target.value)} />
        <input placeholder="Product purchased (name or id)" value={product} onChange={(e)=>setProduct(e.target.value)} />
        {productPrice && <p style={{ margin: '8px 0' }}>Installation fee: <strong>MK {Number(productPrice).toFixed(2)}</strong></p>}
        <button type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit'}</button>
      </form>
    </div>
  )
}
