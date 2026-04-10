import React, { useState } from 'react'

export default function QuoteRequest({ presenter, cart = [], onComplete }) {
  const [customerName, setCustomerName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [details, setDetails] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (!customerName || !phone) return alert('Please provide name and phone')
    setLoading(true)
    try {
      await presenter.createQuoteRequest({
        customer_name: customerName,
        phone,
        email,
        details: details || null,
        product_details: JSON.stringify(cart || [])
      })
      alert('Quote request submitted successfully')
      onComplete && onComplete()
    } catch (err) {
      console.error(err)
      const serverMsg = err?.response?.data?.error
      const status = err?.response?.status
      const hint = status === 404 ? ' (backend route may not be loaded; restart backend server)' : ''
      alert(`Failed to submit quote request${serverMsg ? `: ${serverMsg}` : ''}${hint}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2>Request a Quote</h2>
      <form onSubmit={submit} style={{ maxWidth: 560 }}>
        <input placeholder="Full name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
        <input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <input placeholder="Email (optional)" value={email} onChange={(e) => setEmail(e.target.value)} />
        <textarea placeholder="Details (optional)" value={details} onChange={(e) => setDetails(e.target.value)} />
        <button className="buy-like-btn" type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Quote Request'}
        </button>
      </form>
    </div>
  )
}
