import React, { useEffect, useState } from 'react'
import NewsletterSubscription from './NewsletterSubscription'
import ProductCard from './ProductCard'

function Home({ presenter, onSelect, onAddToCart, onAddToCartOnly, onRequestInstallation, onRequestDelivery, setView }) {
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [cats, prods] = await Promise.all([
          presenter.getCategories(),
          presenter.getProducts()
        ])
        setCategories(cats)
        setProducts(prods)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [presenter])

  const productsByCategory = categories.reduce((acc, cat) => {
    acc[cat.id] = products.filter(p => p.category_id === cat.id)
    return acc
  }, {})

  return (
    <div className="home-container">
      {/* Hero Section */}
      <div className="hero-section-modern">
        <div className="hero-overlay"></div>
        <div className="hero-content-modern">
          <div className="hero-badge">Premium Quality Electronics</div>
          <h1 className="hero-title">ETAL Shop</h1>
          <p className="hero-subtitle">Your Trusted Partner for Quality Electronics - Opposite Central Hospital, Lilongwe</p>
          <div className="hero-buttons">
            <button className="hero-btn-primary" onClick={() => document.querySelector('.products-section')?.scrollIntoView({ behavior: 'smooth' })}>
              Shop Now
            </button>
            <button className="hero-btn-secondary" onClick={() => setView('services')}>
              Our Services
            </button>
          </div>
        </div>
      </div>

      {/* Features Cards */}
      <div className="features-grid">
        <div className="feature-card">
          <div className="feature-icon">🚚</div>
          <h3>Free Delivery</h3>
          <p>On orders above MK 50,000 within Lilongwe City</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🔧</div>
          <h3>Professional Installation</h3>
          <p>Expert installation by certified technicians</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">💳</div>
          <h3>Flexible Payment</h3>
          <p>Cash, Card, or Mobile Money accepted</p>
        </div>
      </div>

      {/* Products Section */}
      <div className="products-section">
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading products...</p>
          </div>
        ) : (() => {
          const categoryCards = categories
            .filter(cat => productsByCategory[cat.id] && productsByCategory[cat.id].length > 0)
            .map(cat => (
              <div key={cat.id} className="category-section">
                <div className="category-header">
                  <h2 className="category-title-modern">{cat.name}</h2>
                </div>
                <div className="grid">
                  {productsByCategory[cat.id].map(p => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      onSelect={onSelect}
                      onBuy={onAddToCart}
                      onAddToCart={onAddToCartOnly}
                    />
                  ))}
                </div>
              </div>
            ))

          if (categoryCards.length > 0) {
            return categoryCards
          }

          return (
            <div className="category-section">
              <div className="category-header">
                <h2 className="category-title-modern">All Products</h2>
              </div>
              <div className="grid">
                {products.map(p => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onSelect={onSelect}
                    onBuy={onAddToCart}
                    onAddToCart={onAddToCartOnly}
                  />
                ))}
              </div>
            </div>
          )
        })()}
      </div>

      {/* Newsletter Section */}
      <div className="newsletter-section-modern">
        <div className="newsletter-content">
          <div className="newsletter-header">
            <span className="newsletter-icon">📧</span>
            <h2>Subscribe to Our Newsletter</h2>
            <p>Stay updated with the latest products and exclusive offers!</p>
          </div>
          <div className="help-desk-card">
            <div className="help-desk-icon">📞</div>
            <div className="help-desk-info">
              <p className="help-desk-title">24/7 Customer Support</p>
              <p className="help-desk-phone">Call or WhatsApp: <strong>+265 995 718 815</strong></p>
            </div>
          </div>
          <NewsletterSubscription presenter={presenter} />
        </div>
      </div>
    </div>
  )
}

export default Home