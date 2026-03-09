import React, { useState } from 'react'

export default function InstallationRequest({ presenter }){
  const [location, setLocation] = useState('')
  const [date, setDate] = useState('')
  const [product, setProduct] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e){
    e.preventDefault()
    if(!location || !date || !product) return alert('Please fill all fields')
    setLoading(true)
    try{
      await presenter.createInstallation({ customer_location: location, preferred_date: date, product })
      alert('Installation request submitted')
      setLocation(''); setDate(''); setProduct('')
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
        <button type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit'}</button>
      </form>
    </div>
  )
}
