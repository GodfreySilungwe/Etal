import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Admin from './Admin'
import ProductDetails from './ProductDetails'
import Cart from './Cart'
import ProductPresenter from './presenters/ProductPresenter'
import AdminPresenter from './presenters/AdminPresenter'
import ErrorBoundary from './ErrorBoundary'
import Products from './Products'
import InstallationRequest from './InstallationRequest'
import DeliveryRequest from './DeliveryRequest'
import Checkout from './Checkout'

function Nav({ setView }) {
  return (
    <nav className="nav">
      <button onClick={() => { console.log('Nav: home'); setView('home') }}>Home</button>
      <button onClick={() => { console.log('Nav: products'); setView('products') }}>Products</button>
      <button onClick={() => { console.log('Nav: contact'); setView('contact') }}>Contact</button>
      <button onClick={() => { console.log('Nav: admin'); setView('admin') }}>Admin</button>
      <button onClick={() => { console.log('Nav: cart'); setView('cart') }}>Cart</button>
    </nav>
  )
}

  function Home({ presenter }) {
  const [email, setEmail] = useState('')
  async function subscribe(){
    if(!email || !email.includes('@')) return alert('Invalid email')
    try{ await presenter.subscribeNewsletter(email); alert('Subscribed') }catch(e){ alert('Failedapp') }
  }
  return (
    <div>
      <h1>ETAL Enterprise</h1>
      <p>Opposite Central Hospital — Phone: +265 995 718 815</p>
      <h2>Featured Products</h2>
      <p>Check our products page for full catalog.</p>
      <div className="newsletter">
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
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
    axios.post('/api/newsletter', { email }).then(() => alert('Subscribed')).catch(() => alert('Failed'))
  }

  function addToCart(product){
    const next = [...cart, product]
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
      <Nav setView={setView} />
      <ErrorBoundary>
        <main>
          {view === 'home' && <Home presenter={presenter} />}
          {view === 'products' && <Products presenter={presenter} onSelect={(id)=>{ setSelectedProductId(id); setView('details') }} />}
          {view === 'contact' && <Contact />}
          {view === 'installation' && <InstallationRequest presenter={presenter} />}
          {view === 'delivery' && <DeliveryRequest presenter={presenter} />}
          {view === 'details' && <ProductDetails presenter={presenter} id={selectedProductId} onBack={()=>setView('products')} onAddToCart={(p)=>{ addToCart(p) }} />}
          {view === 'cart' && <Cart presenter={presenter} items={cart} onRemove={removeFromCart} onCheckoutNavigate={()=>setView('checkout')} />}
          {view === 'checkout' && <Checkout presenter={presenter} cart={cart} onComplete={() => { setCart([]); localStorage.removeItem('etal_cart'); setView('home') }} />}
          {view === 'admin' && <Admin presenter={adminPresenter} token={token} onLogout={()=>{ setToken(null); localStorage.removeItem('etal_token'); delete axios.defaults.headers.common['Authorization'] }} onAuth={(t)=>{ setToken(t) }} />}
        </main>
      </ErrorBoundary>
    </div>
  )
}
