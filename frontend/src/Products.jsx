import React, { useEffect, useState } from 'react'
import ProductCard from './ProductCard'

export default function Products({ presenter, onSelect, onAddToCart, onRequestInstallation, onRequestDelivery }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [mobileEmail, setMobileEmail] = useState('')
  const [mobileSubscribeStatus, setMobileSubscribeStatus] = useState('')

  async function load() {
    setLoading(true)
    try {
      const res = await presenter.getProducts({ search, category_id: category || undefined })
      setItems(res)
    } catch (e) {
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  async function mobileSubscribe() {
    if (!mobileEmail || !mobileEmail.includes('@')) {
      setMobileSubscribeStatus('invalid')
      setTimeout(() => setMobileSubscribeStatus(''), 3000)
      return
    }
    try {
      await presenter.subscribeNewsletter(mobileEmail)
      setMobileSubscribeStatus('success')
      setMobileEmail('')
      setTimeout(() => setMobileSubscribeStatus(''), 3000)
    } catch (e) {
      setMobileSubscribeStatus('error')
      setTimeout(() => setMobileSubscribeStatus(''), 3000)
    }
  }

  useEffect(() => {
    presenter.getCategories().then(setCategories).catch(() => setCategories([]))
    
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const t = setTimeout(load, 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category])

  return (
    <div>
      <div className="filters" style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input placeholder="Search products" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {Array.isArray(categories)
            ? categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))
            : null}
        </select>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid">
          {items.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onSelect={onSelect}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      )}

      {/* Mobile Subscribe Form */}
      <div className="mobile-subscribe">
        <h3>Stay Updated</h3>
        <p>Get notified about new products and special offers</p>
        <div className="mobile-subscribe-form">
          <input
            type="email"
            placeholder="Enter your email address"
            value={mobileEmail}
            onChange={(e) => setMobileEmail(e.target.value)}
            className="mobile-subscribe-input"
          />
          <button onClick={mobileSubscribe} className="mobile-subscribe-btn">
            Subscribe
          </button>
        </div>
        {mobileSubscribeStatus && (
          <span className={`mobile-subscribe-status status-${mobileSubscribeStatus}`}>
            {mobileSubscribeStatus === 'success' ? 'Subscribed!' :
             mobileSubscribeStatus === 'invalid' ? 'Invalid email' :
             mobileSubscribeStatus === 'error' ? 'Failed to subscribe' : ''}
          </span>
        )}
      </div>
    </div>
  )
}
