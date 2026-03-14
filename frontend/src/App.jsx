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

  function Home({ presenter, onSelect, onAddToCart }) {
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
                            <p style={{ textDecoration: 'line-through', color: 'var(--danger)', margin: 0 }}>Original: ${p.original_price}</p>
                            <p style={{ fontWeight: 'bold', color: 'var(--success)', margin: '4px 0 0' }}>Now: ${p.price} <span style={{ color: 'var(--success)' }}>({p.discount_percent}% off)</span></p>
                          </div>
                        ) : (
                          <p style={{ fontWeight: 'bold', color: 'var(--success)', margin: 0 }}>Price: ${p.price}</p>
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
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem('etal_cart')||'[]'))
  const [presenter] = useState(() => new ProductPresenter())
  const [adminPresenter] = useState(() => new AdminPresenter())

  useEffect(()=>{
    console.log('App mounted. initial view=', view)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])

  useEffect(()=>{ console.log('App view changed ->', view) }, [view])

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
    const next = [...cart, { ...product, original_price: product.original_price, discount_percent: product.discount_percent }]
    setCart(next)
    localStorage.setItem('etal_cart', JSON.stringify(next))
    alert('Added to cart')
  }

  function removeFromCart(idx){
    const next = cart.filter((_,i)=>i!==idx)
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
      <Nav setView={setView} cartCount={cart.length} />
      <ErrorBoundary>
        <main>
          {view === 'home' && <Home presenter={presenter} onSelect={(id)=>{ setSelectedProductId(id); setView('details') }} onAddToCart={addToCart} />}
          {view === 'products' && <Products presenter={presenter} onSelect={(id)=>{ setSelectedProductId(id); setView('details') }} onAddToCart={addToCart} />}
          {view === 'services' && <Services presenter={presenter} setView={setView} />}
          {view === 'about' && <AboutUs />}
          {view === 'installation' && <InstallationRequest presenter={presenter} />}
          {view === 'delivery' && <DeliveryRequest presenter={presenter} />}
          {view === 'details' && <ProductDetails presenter={presenter} id={selectedProductId} onBack={()=>setView('products')} onAddToCart={(p)=>{ addToCart(p) }} />}
          {view === 'cart' && <Cart presenter={presenter} items={cart} onRemove={removeFromCart} onCheckoutNavigate={()=>setView('checkout')} />}
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
