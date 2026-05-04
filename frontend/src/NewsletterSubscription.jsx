import React, { useState } from 'react'

export default function NewsletterSubscription({ presenter }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null)

  async function subscribe(e) {
    e.preventDefault()
    if (!email || !email.includes('@')) {
      setStatus({ type: 'invalid', message: 'Please enter a valid email address' })
      setTimeout(() => setStatus(null), 3000)
      return
    }
    setLoading(true)
    setStatus(null)
    try {
      await presenter.subscribeNewsletter(email)
      setStatus({ type: 'success', message: 'Subscribed successfully! Thank you.' })
      setEmail('')
    } catch (err) {
      console.error(err)
      setStatus({ type: 'error', message: 'Failed to subscribe. Please try again.' })
    } finally {
      setLoading(false)
      setTimeout(() => setStatus(null), 3000)
    }
  }

  return (
    <div className="newsletter-wrapper">
      <form onSubmit={subscribe} className="newsletter-form-modern">
        <div className="newsletter-input-group">
          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="newsletter-input-modern"
            required
          />
          <button type="submit" disabled={loading} className="newsletter-btn-modern">
            {loading ? 'Subscribing...' : 'Subscribe →'}
          </button>
        </div>
        {status && (
          <div className={`newsletter-status status-${status.type}`}>
            {status.message}
          </div>
        )}
      </form>
    </div>
  )
}