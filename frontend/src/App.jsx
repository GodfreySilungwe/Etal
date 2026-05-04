import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Admin from './Admin'
import ProductDetails from './ProductDetails'
import Cart from './Cart'
import ProductPresenter from './presenters/ProductPresenter'
import AdminPresenter from './presenters/AdminPresenter'
import ErrorBoundary from './ErrorBoundary'
import Products from './Products'
import Services from './Services'
import InstallationRequest from './InstallationRequest'
import DeliveryRequest from './DeliveryRequest'
import AboutUs from './AboutUs'
import Checkout from './Checkout'
import ProductCard from './ProductCard'
import QuoteRequest from './QuoteRequest'
import Home from './HomePage'
import NewsletterSubscription from './NewsletterSubscription'
import './styles.css'

const LOGO_URL = 'https://etalbackendbusketfileuploads.s3.us-east-1.amazonaws.com/uploads/Log.png'

function decodeJWT(token) {
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload))
    return decoded
  } catch (e) {
    return null
  }
}

function Nav({ setView, cartCount, userRole, token }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const handleNavigation = (view) => {
    setView(view)
    setMenuOpen(false)
  }

  return (
    <nav className="nav">
      <div className="nav-left">
        <img
          src={LOGO_URL}
          alt="ETAL Logo"
          className="nav-logo"
          onClick={() => handleNavigation('home')}
        />
        <button
          type="button"
          className="nav-toggle mobile-only"
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(open => !open)}
        >
          <span className="nav-toggle-bar"></span>
          <span className="nav-toggle-bar"></span>
          <span className="nav-toggle-bar"></span>
        </button>
      </div>

      <div className={`nav-menu ${menuOpen ? 'open' : ''}`}>
        <button onClick={() => handleNavigation('home')}>Home</button>
        <button onClick={() => handleNavigation('products')}>Products</button>
        <button onClick={() => handleNavigation('services')}>Services</button>
        <button onClick={() => handleNavigation('about')}>About Us</button>
      </div>

      <div className="nav-actions">
        {!token && (
          <button className="auth-button" onClick={() => handleNavigation('admin')}>
            Login
          </button>
        )}
        {userRole === 'admin' && (
          <button className="auth-button" onClick={() => handleNavigation('admin')}>
            Admin
          </button>
        )}
        <button id="cart-nav-button" className="cart-button" onClick={() => handleNavigation('cart')}>
          🛒 Cart{cartCount ? ` (${cartCount})` : ''}
        </button>
      </div>
    </nav>
  )
}

export default function App() {
  const [view, setView] = useState('home')
  const [token, setToken] = useState(localStorage.getItem('etal_token') || null)
  const [userRole, setUserRole] = useState(null)
  const [selectedProductId, setSelectedProductId] = useState(null)
  const [cart, setCart] = useState(() => {
    const storedCart = JSON.parse(localStorage.getItem('etal_cart') || '[]')
    return storedCart.map(item => ({ ...item, quantity: item.quantity || 1 }))
  })
  const [requestContext, setRequestContext] = useState(null)
  const [presenter] = useState(() => new ProductPresenter())
  const [adminPresenter] = useState(() => new AdminPresenter())

  function requestInstallation(product, price) {
    setRequestContext({ product, price })
    setView('installation')
  }

  function requestDelivery(product, price) {
    setRequestContext({ product, price })
    setView('delivery')
  }

  useEffect(() => {
    console.log('App mounted. initial view=', view)
  }, [])

  useEffect(() => { console.log('App view changed ->', view) }, [view])

  useEffect(() => {
    const onRequestInstallation = (e) => {
      setRequestContext({ product: e.detail.product, price: e.detail.productPrice })
      setView('installation')
    }
    const onRequestDelivery = (e) => {
      setRequestContext({ product: e.detail.product, price: e.detail.productPrice })
      setView('delivery')
    }
    window.addEventListener('request-installation', onRequestInstallation)
    window.addEventListener('request-delivery', onRequestDelivery)
    return () => {
      window.removeEventListener('request-installation', onRequestInstallation)
      window.removeEventListener('request-delivery', onRequestDelivery)
    }
  }, [])

  useEffect(() => {
    const t = localStorage.getItem('etal_token')
    if (t) axios.defaults.headers.common['Authorization'] = `Bearer ${t}`
  }, [])

  useEffect(() => {
    if (token) {
      const decoded = decodeJWT(token)
      setUserRole(decoded?.role || null)
    } else {
      setUserRole(null)
    }
  }, [token])

  const playCartSound = (() => {
    let audioCtx = null
    return () => {
      if (typeof window === 'undefined') return
      const AudioContext = window.AudioContext || window.webkitAudioContext
      if (!AudioContext) return
      if (!audioCtx) {
        audioCtx = new AudioContext()
      }
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()
      osc.type = 'triangle'
      osc.frequency.value = 560
      gain.gain.value = 0.16
      osc.connect(gain)
      gain.connect(audioCtx.destination)
      osc.start()
      osc.stop(audioCtx.currentTime + 0.12)
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12)
    }
  })()

  function addToCart(product) {
    const existingIndex = cart.findIndex(item => item.id === product.id)
    let next
    if (existingIndex >= 0) {
      next = cart.map((item, index) =>
        index === existingIndex
          ? { ...item, quantity: (item.quantity || 1) + 1 }
          : item
      )
    } else {
      next = [...cart, { ...product, original_price: product.original_price, discount_percent: product.discount_percent, quantity: 1 }]
    }
    setCart(next)
    try {
      localStorage.setItem('etal_cart', JSON.stringify(next))
    } catch (e) {
      console.error('Failed to save cart to localStorage', e)
    }
    playCartSound()
  }

  function handleBuy(product, animationMeta) {
    addToCart(product)
    animateAddToCart(animationMeta)
    setView('cart')
  }

  function handleAddToCart(product, animationMeta) {
    addToCart(product)
    animateAddToCart(animationMeta)
  }

  function animateAddToCart({ sourceEl, imageUrl } = {}) {
    const cartButton = document.getElementById('cart-nav-button')
    if (!sourceEl || !cartButton) return
    const sourceRect = sourceEl.getBoundingClientRect()
    const cartRect = cartButton.getBoundingClientRect()
    const fly = document.createElement('div')
    fly.className = 'cart-fly'
    if (imageUrl) fly.style.backgroundImage = `url(${imageUrl})`
    const startX = sourceRect.left + (sourceRect.width / 2) - 24
    const startY = sourceRect.top + (sourceRect.height / 2) - 24
    const endX = cartRect.left + (cartRect.width / 2) - 24
    const endY = cartRect.top + (cartRect.height / 2) - 24
    fly.style.left = `${startX}px`
    fly.style.top = `${startY}px`
    document.body.appendChild(fly)
    requestAnimationFrame(() => {
      fly.style.transform = `translate(${endX - startX}px, ${endY - startY}px) scale(0.35)`
      fly.style.opacity = '0.2'
    })
    fly.addEventListener('transitionend', () => {
      fly.remove()
      cartButton.classList.add('cart-bump')
      setTimeout(() => cartButton.classList.remove('cart-bump'), 250)
    }, { once: true })
  }

  function removeFromCart(idx) {
    const item = cart[idx]
    let next
    if (item.quantity > 1) {
      next = cart.map((cartItem, index) =>
        index === idx
          ? { ...cartItem, quantity: cartItem.quantity - 1 }
          : cartItem
      )
    } else {
      next = cart.filter((_, i) => i !== idx)
    }
    setCart(next)
    localStorage.setItem('etal_cart', JSON.stringify(next))
  }

  function updateCartItem(idx, updates) {
    const next = cart.map((item, i) => i === idx ? { ...item, ...updates } : item)
    setCart(next)
    localStorage.setItem('etal_cart', JSON.stringify(next))
  }

  function checkout() {
    setCart([])
    localStorage.removeItem('etal_cart')
  }

  return (
    <div className="app">
      <Nav 
        setView={setView} 
        cartCount={cart.reduce((total, item) => total + (item.quantity || 1), 0)} 
        userRole={userRole} 
        token={token} 
        presenter={presenter} 
      />
      <ErrorBoundary>
        <main>
          {view === 'home' && <Home 
            presenter={presenter} 
            setView={setView}
            onSelect={(id) => { setSelectedProductId(id); setView('details') }} 
            onAddToCart={handleBuy} 
            onAddToCartOnly={handleAddToCart} 
            onRequestInstallation={requestInstallation} 
            onRequestDelivery={requestDelivery} 
          />}
          {view === 'products' && <Products 
            presenter={presenter} 
            onSelect={(id) => { setSelectedProductId(id); setView('details') }} 
            onBuy={handleBuy} 
            onAddToCart={handleAddToCart} 
            onRequestInstallation={requestInstallation} 
            onRequestDelivery={requestDelivery} 
          />}
          {view === 'services' && <Services presenter={presenter} setView={setView} onRequestInstallation={requestInstallation} />}
          {view === 'about' && <AboutUs />}
          {view === 'installation' && <InstallationRequest presenter={presenter} requestContext={requestContext} />}
          {view === 'delivery' && <DeliveryRequest presenter={presenter} requestContext={requestContext} />}
          {view === 'details' && <ProductDetails 
            presenter={presenter} 
            id={selectedProductId} 
            onBack={() => setView('products')} 
            onBuy={handleBuy} 
            onAddToCart={handleAddToCart} 
          />}
          {view === 'cart' && <Cart 
            presenter={presenter} 
            items={cart} 
            onRemove={removeFromCart} 
            onUpdateItem={updateCartItem} 
            onCheckoutNavigate={() => setView('checkout')} 
            onQuoteNavigate={() => setView('quote')} 
            onBack={() => setView('products')} 
            onRequestInstallation={requestInstallation} 
            onRequestDelivery={requestDelivery} 
          />}
          {view === 'checkout' && <Checkout 
            presenter={presenter} 
            cart={cart} 
            onRequestQuote={() => setView('quote')} 
            onComplete={() => { setCart([]); localStorage.removeItem('etal_cart'); setView('home') }} 
          />}
          {view === 'quote' && <QuoteRequest presenter={presenter} cart={cart} onComplete={() => setView('home')} />}
          {view === 'admin' && <Admin 
            presenter={adminPresenter} 
            token={token} 
            onLogout={() => { setToken(null); localStorage.removeItem('etal_token'); delete axios.defaults.headers.common['Authorization'] }} 
            onAuth={(t) => { setToken(t) }} 
          />}
        </main>
        <footer className="footer-modern">
          <div className="footer-content-modern">
            <div className="footer-section">
              <h4>ETAL SHOP</h4>
              <p>Your trusted partner for quality electronics in Malawi. We provide genuine products with professional service.</p>
            </div>
            <div className="footer-section">
              <h4>Quick Links</h4>
              <p><button onClick={() => setView('home')}>Home</button></p>
              <p><button onClick={() => setView('products')}>Products</button></p>
              <p><button onClick={() => setView('services')}>Services</button></p>
              <p><button onClick={() => setView('about')}>About Us</button></p>
            </div>
            <div className="footer-section">
              <h4>Contact Info</h4>
              <p>📍 Opposite Central Hospital, Lilongwe</p>
              <p>📞 +265 995 718 815</p>
              <p>✉️ goshsolutions@gmail.com</p>
            </div>
            <div className="footer-section">
              <h4>Business Hours</h4>
              <p>Mon-Fri: 8:00 AM - 5:00 PM</p>
              <p>Sat: 9:00 AM - 2:00 PM</p>
              <p>Sun: Closed</p>
            </div>
          </div>
          <div className="footer-bottom-modern">
            <p>Designed with ❤️ by GOSH SOLUTIONS | © 2024 ETAL SHOP. All rights reserved.</p>
          </div>
        </footer>
      </ErrorBoundary>
    </div>
  )
}