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
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 700, color: '#f5f5f5' }}>Request a Quote</h2>
        {onComplete && (
          <button 
            type="button"
            onClick={() => onComplete()}
            style={{ padding: '10px 16px', borderRadius: 8, border: 'none', background: '#6b7280', color: '#f5f5f5', cursor: 'pointer', fontWeight: 600, transition: 'background 0.2s', fontSize: '0.95rem' }}
            onMouseEnter={(e) => e.target.style.background = '#4b5563'}
            onMouseLeave={(e) => e.target.style.background = '#6b7280'}
          >
            ← Back
          </button>
        )}
      </div>
      <form onSubmit={submit} style={{ display: 'grid', gap: 16 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#e5e7eb', fontSize: '0.95rem' }}>Full Name *</label>
          <input 
            placeholder="Enter your full name" 
            value={customerName} 
            onChange={(e) => setCustomerName(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 8,
              border: '1px solid #374151',
              background: 'rgba(30, 30, 30, 0.8)',
              color: '#f5f5f5',
              fontSize: '0.95rem',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#c1000b'}
            onBlur={(e) => e.target.style.borderColor = '#374151'}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#e5e7eb', fontSize: '0.95rem' }}>Phone *</label>
          <input 
            placeholder="e.g., +265995718815 or 0995718815" 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 8,
              border: '1px solid #374151',
              background: 'rgba(30, 30, 30, 0.8)',
              color: '#f5f5f5',
              fontSize: '0.95rem',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#c1000b'}
            onBlur={(e) => e.target.style.borderColor = '#374151'}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#e5e7eb', fontSize: '0.95rem' }}>Email (optional)</label>
          <input 
            placeholder="your.email@example.com" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 8,
              border: '1px solid #374151',
              background: 'rgba(30, 30, 30, 0.8)',
              color: '#f5f5f5',
              fontSize: '0.95rem',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#c1000b'}
            onBlur={(e) => e.target.style.borderColor = '#374151'}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#e5e7eb', fontSize: '0.95rem' }}>Additional Details (optional)</label>
          <textarea 
            placeholder="Describe what you need in detail..." 
            value={details} 
            onChange={(e) => setDetails(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 8,
              border: '1px solid #374151',
              background: 'rgba(30, 30, 30, 0.8)',
              color: '#f5f5f5',
              fontSize: '0.95rem',
              boxSizing: 'border-box',
              minHeight: '120px',
              fontFamily: 'inherit',
              resize: 'vertical',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#c1000b'}
            onBlur={(e) => e.target.style.borderColor = '#374151'}
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          style={{
            padding: '12px 24px',
            borderRadius: 8,
            border: 'none',
            background: loading ? '#9ca3af' : '#c1000b',
            color: '#ffffff',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s, transform 0.1s',
            opacity: loading ? 0.7 : 1
          }}
          onMouseEnter={(e) => !loading && (e.target.style.background = '#a00009')}
          onMouseLeave={(e) => !loading && (e.target.style.background = '#c1000b')}
          onMouseDown={(e) => !loading && (e.target.style.transform = 'scale(0.98)')}
          onMouseUp={(e) => !loading && (e.target.style.transform = 'scale(1)')}
        >
          {loading ? '⏳ Submitting...' : '📋 Submit Quote Request'}
        </button>
      </form>
    </div>
  )
}
