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

const fmtMK = (val) => {
  const n = Number(val)
  if (val == null || val === '' || Number.isNaN(n)) return ''
  return `MK ${n.toFixed(2)}`
}

function Nav({ setView, cartCount }) {
  return (
    <nav className="nav">
      <div className="nav-group" style={{ alignItems: 'center' }}>
        <img src="/uploads/Log.png" alt="ETAL Logo" style={{ height: '40px', marginRight: '20px' }} />
        <button onClick={() => { console.log('Nav: home'); setView('home') }}>Home</button>
        <button onClick={() => { console.log('Nav: products'); setView('products') }}>Products</button>
        <button onClick={() => { console.log('Nav: services'); setView('services') }}>Services & Installations</button>
        <button onClick={() => { console.log('Nav: about'); setView('about') }}>About Us</button>
        <button onClick={() => { console.log('Nav: admin'); setView('admin') }}>Admin</button>
      </div>

      <div className="nav-group" style={{ justifyContent: 'flex-end', alignItems: 'center' }}>
        <button onClick={() => { console.log('Nav: cart'); setView('cart') }}>
          Cart{cartCount ? ` (${cartCount})` : ''}
        </button>
      </div>
    </nav>
  )
}

  function Home({ presenter, onSelect, onAddToCart, onRequestInstallation, onRequestDelivery }) {
  const [email, setEmail] = useState('')
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  async function subscribe(){
    if(!email || !email.includes('@')) return alert('Invalid email')
    try{ await presenter.subscribeNewsletter(email); alert('Subscribed') }catch(e){ alert('Failed') }
  }

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

  // Group products by category
  const productsByCategory = categories.reduce((acc, cat) => {
    acc[cat.id] = products.filter(p => p.category_id === cat.id)
    return acc
  }, {})

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 className="rainbow-text">Welcome to ETAL Enterprise</h1>
        <p>Your Trusted Partner for Quality Electronics</p>
        <p>Opposite Central Hospital — Phone: +265 995 718 815</p>
      </div>

      {loading ? (
        <p>Loading products...</p>
      ) : (
        categories.map(cat => (
          productsByCategory[cat.id] && productsByCategory[cat.id].length > 0 && (
            <div key={cat.id} style={{ marginBottom: '40px' }}>
              <h2>{cat.name}</h2>
              <div className="grid">
                {productsByCategory[cat.id].map(p => (
                  <div key={p.id} className="card" style={{ cursor: 'pointer', backgroundImage: p.image_url ? `url(${p.image_url})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', color: p.image_url ? 'white' : 'inherit' }} onClick={() => onSelect(p.id)}>
                    <div style={{ background: p.image_url ? 'rgba(0,0,0,0.6)' : 'transparent', padding: '14px', borderRadius: '12px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <h3>{p.name}</h3>
                      <div>
                        {p.discount_percent > 0 ? (
                          <div>
                            <p style={{ textDecoration: 'line-through', color: 'var(--danger)', margin: 0 }}>Original: {fmtMK(p.original_price)}</p>
                            <p style={{ fontWeight: 'bold', color: 'var(--success)', margin: '4px 0 0' }}>Now: {fmtMK(p.price)} <span style={{ color: 'var(--success)' }}>({p.discount_percent}% off)</span></p>
                          </div>
                        ) : (
                          <p style={{ fontWeight: 'bold', color: 'var(--success)', margin: 0 }}>Price: {fmtMK(p.price)}</p>
                        )}
                        <p style={{ margin: '8px 0 0' }}>{p.description?.slice(0, 60)}...</p>
                        <button style={{ marginTop: 10, width: '100%', padding: '10px 0', borderRadius: 8, border: 'none', background: 'var(--primary)', color: 'white', cursor: 'pointer' }} onClick={(e)=>{ e.stopPropagation(); onAddToCart(p) }}>Add to cart</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        ))
      )}

      <div className="newsletter">
        <h3>Subscribe to our Newsletter</h3>
        <input placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button onClick={subscribe}>Subscribe</button>
      </div>
    </div>
  )
}

// Products view is provided by `frontend/src/Products.jsx` (presenter-based)

function Contact() {
  return (
    <div>
      <h2>Contact</h2>
      <p>Address: Opposite Central Hospital</p>
      <p>Phone: +265 995 718 815</p>
    </div>
  )
}

export default function App() {
  const [view, setView] = useState('home')
  const [token, setToken] = useState(localStorage.getItem('etal_token') || null)
  const [selectedProductId, setSelectedProductId] = useState(null)
  const [cart, setCart] = useState(() => {
    const storedCart = JSON.parse(localStorage.getItem('etal_cart')||'[]')
    // Ensure all items have quantity property for backward compatibility
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

  useEffect(()=>{
    console.log('App mounted. initial view=', view)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])

  useEffect(()=>{ console.log('App view changed ->', view) }, [view])

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

  // ensure axios header uses stored token
  useEffect(()=>{
    const t = localStorage.getItem('etal_token')
    if(t) axios.defaults.headers.common['Authorization'] = `Bearer ${t}`
  }, [])

  function onSubscribe(email) {
    if (!email || !email.includes('@')) return alert('Invalid email')
    axios.post('http://localhost:4000/api/newsletter', { email }).then(() => alert('Subscribed')).catch(() => alert('Failed'))
  }

  function addToCart(product){
    const existingIndex = cart.findIndex(item => item.id === product.id)
    let next
    
    if (existingIndex >= 0) {
      // Item already exists, increment quantity
      next = cart.map((item, index) => 
        index === existingIndex 
          ? { ...item, quantity: (item.quantity || 1) + 1 }
          : item
      )
    } else {
      // New item, add with quantity 1
      next = [...cart, { ...product, original_price: product.original_price, discount_percent: product.discount_percent, quantity: 1 }]
    }
    
    setCart(next)
    localStorage.setItem('etal_cart', JSON.stringify(next))
    alert('Added to cart')
  }

  function removeFromCart(idx){
    const item = cart[idx]
    let next
    
    if (item.quantity > 1) {
      // Decrement quantity
      next = cart.map((cartItem, index) => 
        index === idx 
          ? { ...cartItem, quantity: cartItem.quantity - 1 }
          : cartItem
      )
    } else {
      // Remove item if quantity is 1
      next = cart.filter((_,i)=>i!==idx)
    }
    
    setCart(next)
    localStorage.setItem('etal_cart', JSON.stringify(next))
  }

  function updateCartItem(idx, updates){
    const next = cart.map((item, i) => i === idx ? { ...item, ...updates } : item)
    setCart(next)
    localStorage.setItem('etal_cart', JSON.stringify(next))
  }

  function checkout(){
    // cart clearing is handled after presenter checkout succeeds in Cart
    setCart([])
    localStorage.removeItem('etal_cart')
  }

  return (
    <div className="app">
      <Nav setView={setView} cartCount={cart.reduce((total, item) => total + (item.quantity || 1), 0)} />
      <ErrorBoundary>
        <main>
          {view === 'home' && <Home presenter={presenter} onSelect={(id)=>{ setSelectedProductId(id); setView('details') }} onAddToCart={addToCart} onRequestInstallation={requestInstallation} onRequestDelivery={requestDelivery} />}
          {view === 'products' && <Products presenter={presenter} onSelect={(id)=>{ setSelectedProductId(id); setView('details') }} onAddToCart={addToCart} onRequestInstallation={requestInstallation} onRequestDelivery={requestDelivery} />}
          {view === 'services' && <Services presenter={presenter} setView={setView} />}
          {view === 'about' && <AboutUs />}
          {view === 'installation' && <InstallationRequest presenter={presenter} requestContext={requestContext} />}
          {view === 'delivery' && <DeliveryRequest presenter={presenter} requestContext={requestContext} />}
          {view === 'details' && <ProductDetails presenter={presenter} id={selectedProductId} onBack={()=>setView('products')} onAddToCart={(p)=>{ addToCart(p) }} onRequestInstallation={requestInstallation} onRequestDelivery={requestDelivery} />}
          {view === 'cart' && <Cart presenter={presenter} items={cart} onRemove={removeFromCart} onUpdateItem={updateCartItem} onCheckoutNavigate={()=>setView('checkout')} onRequestInstallation={requestInstallation} onRequestDelivery={requestDelivery} />}
          {view === 'checkout' && <Checkout presenter={presenter} cart={cart} onComplete={() => { setCart([]); localStorage.removeItem('etal_cart'); setView('home') }} />}
          {view === 'admin' && <Admin presenter={adminPresenter} token={token} onLogout={()=>{ setToken(null); localStorage.removeItem('etal_token'); delete axios.defaults.headers.common['Authorization'] }} onAuth={(t)=>{ setToken(t) }} />}
        </main>
        <footer style={{ textAlign: 'center', padding: '20px', background: 'var(--bg-2)', marginTop: '40px', fontSize: '0.9rem', color: 'var(--muted)' }}>
          <p>This app is designed by GOSH SOLUTIONS</p>
          <p>Email: goshsolutions@gmail.com | Phone: +265 995 718 815</p>
        </footer>
      </ErrorBoundary>
    </div>
  )
}
