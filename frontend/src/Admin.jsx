import React, { useEffect, useState } from 'react'
import axios from 'axios'

function Login({ onLogin, presenter }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  async function submit(e) {
    e.preventDefault()
    try {
      console.log("before admin call for  presenter.login")
      const res = await presenter.login(username, password)
      console.log("after call presenter.login")
      const token = res.token
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      localStorage.setItem('etal_token', token)
      onLogin(token)
    } catch (err) {
      alert(err)
    }
  }

  return (
    <form onSubmit={submit} className="admin-login">
      <h3>Admin Login</h3>
      <input placeholder="Username" value={username} onChange={(e)=>setUsername(e.target.value)} />
      <input placeholder="Password" value={password} type="password" onChange={(e)=>setPassword(e.target.value)} />
      <button type="submit">Login</button>
    </form>
  )
}

function ProductsAdmin({ presenter, token }) {
  const [products, setProducts] = useState([])
  const [editing, setEditing] = useState(null)
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({ name:'', category_id:'', description:'', price:'', original_price:'', discount_percent:'', specs:'', image_url:'' })
  const [errors, setErrors] = useState([])

  async function uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    const res = await axios.post('http://localhost:4000/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` }
    });
    return res.data.url;
  }

  async function load() {
    try{
      const res = await presenter.getProducts()
      setProducts(res)
    }catch(e){ setProducts([]) }
    try{
      const c = await presenter.getCategories()
      setCategories(c)
    }catch(e){ setCategories([]) }
  }

  useEffect(()=>{ load() }, [])

  function startEdit(p){
    setEditing(p.id)
    setForm({
      name:p.name||'',
      category_id:p.category_id||'',
      description:p.description||'',
      price:p.price||'',
      original_price:p.original_price||'',
      discount_percent:p.discount_percent||'',
      stock:p.stock||'',
      specs: p.specs ? JSON.stringify(p.specs) : '',
      image_url:p.image_url||''
    })
  }

  async function submit(e){
    e.preventDefault()
    const errs = []
    if(!form.name) errs.push('Name is required')
    if(form.price && isNaN(Number(form.price))) errs.push('Price must be a number')
    if(form.specs){ try{ JSON.parse(form.specs) }catch(e){ errs.push('Specs must be valid JSON') } }
    if(errs.length){ setErrors(errs); return }
    setErrors([])
    try{
      const payload = { name: form.name, category_id: form.category_id || null, description: form.description, price: form.price || null, original_price: form.original_price || null, discount_percent: form.discount_percent || 0, specs: form.specs ? JSON.parse(form.specs) : null, image_url: form.image_url }
      if(editing){
        await presenter.updateProduct(editing, payload)
      } else {
        await presenter.createProduct(payload)
      }
      setEditing(null)
      setForm({ name:'', category_id:'', description:'', price:'', original_price:'', discount_percent:'', stock:'', specs:'', image_url:'' })
      load()
    }catch(err){ alert('Save failed') }
  }

  async function del(id){ if(!confirm('Delete?')) return; await presenter.deleteProduct(id); load() }

  return (
    <div>
      <h3>Products</h3>
      <div className="admin-grid">
        <div className="admin-list">
          {products.map(p=> (
            <div key={p.id} className="card" style={{ cursor: 'pointer', backgroundImage: p.image_url ? `url(${p.image_url})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', color: p.image_url ? 'white' : 'inherit' }}>
              <div style={{ background: p.image_url ? 'rgba(0,0,0,0.6)' : 'transparent', padding: '14px', borderRadius: '12px' }}>
                <h4>{p.name}</h4>
                <p style={{ margin: 0, opacity: 0.9 }}>{p.category}</p>
                <p style={{ margin: '4px 0' }}>Price: {p.price}</p>
                <p style={{ margin: '4px 0' }}>Stock: {p.stock ?? 0}</p>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button onClick={()=>startEdit(p)}>Edit</button>
                  <button onClick={()=>del(p.id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="admin-form">
          <h4>{editing ? 'Edit' : 'Create'} Product</h4>
          <form onSubmit={submit}>
            {errors.length > 0 && <div className="errors">{errors.map((er,i)=><div key={i}>{er}</div>)}</div>}
            <input placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
            <select value={form.category_id} onChange={e=>setForm({...form, category_id:e.target.value})}>
              <option value=''>-- Select Category --</option>
              {Array.isArray(categories) ? categories.map(c=> <option key={c.id} value={c.id}>{c.name}</option>) : null}
            </select>
            <input placeholder="Description" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} />
            <input placeholder="Price" value={form.price} onChange={e=>setForm({...form, price:e.target.value})} />
            <input placeholder="Original Price" value={form.original_price} onChange={e=>setForm({...form, original_price:e.target.value})} />
            <input placeholder="Discount Percent" value={form.discount_percent} onChange={e=>setForm({...form, discount_percent:e.target.value})} />
            <input placeholder="Stock" value={form.stock} onChange={e=>setForm({...form, stock:e.target.value})} />
            <textarea placeholder='Specs JSON' value={form.specs} onChange={e=>setForm({...form, specs:e.target.value})} />
            <div>
              <input type="file" accept="image/*" onChange={async(e)=>{ const url = await uploadImage(e.target.files[0]); if(url) setForm({...form, image_url:url}) }} />
              {form.image_url && <div className="thumb"><img src={form.image_url} alt="preview" /></div>}
            </div>
            <button type="submit">Save</button>
          </form>
        </div>
      </div>
    </div>
  )
}

function CategoriesAdmin({ presenter }){
  const [categories, setCategories] = useState([])
  const [name, setName] = useState('')
  async function load(){ const res = await presenter.getCategories(); setCategories(res) }
  useEffect(()=>{ load() }, [])
  async function add(e){ e.preventDefault(); if(!name) return; await presenter.createCategory(name); setName(''); load() }
  async function del(id){ if(!confirm('Delete category?')) return; await presenter.deleteCategory(id); load() }
  return (
    <div>
      <h3>Categories</h3>
      <ul>
        {Array.isArray(categories) ? categories.map(c=> <li key={c.id}>{c.name} <button onClick={()=>del(c.id)}>Delete</button></li>) : null}
      </ul>
      <form onSubmit={add}><input placeholder="Name" value={name} onChange={e=>setName(e.target.value)} /><button>Add</button></form>
    </div>
  )
}

function SalesReport({ presenter }) {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  async function load() {
    setLoading(true)
    try {
      const res = await presenter.getSalesReport()
      setReport(res)
    } catch (e) {
      console.error(e)
      setReport(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  if (loading) return <p>Loading report...</p>
  if (!report) return <p>Failed to load report</p>

  return (
    <div>
      <h3>Sales Report</h3>
      <p>Total invoices: {report.totalInvoices}</p>
      <p>Total revenue: {report.totalRevenue.toFixed(2)}</p>
      <h4>Products sold</h4>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '6px' }}>Product</th>
            <th style={{ textAlign: 'right', borderBottom: '1px solid #ddd', padding: '6px' }}>Units</th>
            <th style={{ textAlign: 'right', borderBottom: '1px solid #ddd', padding: '6px' }}>Revenue</th>
          </tr>
        </thead>
        <tbody>
          {report.products.map(p => (
            <tr key={p.id}>
              <td style={{ padding: '6px' }}>{p.name}</td>
              <td style={{ padding: '6px', textAlign: 'right' }}>{p.units}</td>
              <td style={{ padding: '6px', textAlign: 'right' }}>{p.revenue.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function Admin({ token, onLogout, onAuth, presenter }){
  const [auth, setAuth] = useState(!!token)
  const [view, setView] = useState('products')

  useEffect(()=>{
    const stored = localStorage.getItem('etal_token')
    if(stored){ axios.defaults.headers.common['Authorization'] = `Bearer ${stored}`; setAuth(true); onAuth && onAuth(stored) }
  }, [])

  function handleLogin(t){ setAuth(true); onAuth && onAuth(t) }
  function logout(){ localStorage.removeItem('etal_token'); delete axios.defaults.headers.common['Authorization']; setAuth(false); onLogout && onLogout() }

  if(!auth) return <Login onLogin={handleLogin} presenter={presenter} />
  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h2>Admin Dashboard</h2>
        <div><button onClick={logout}>Logout</button></div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <button className={view === 'products' ? 'primary' : 'ghost'} onClick={() => setView('products')}>Products</button>
        <button className={view === 'categories' ? 'primary' : 'ghost'} onClick={() => setView('categories')}>Categories</button>
        <button className={view === 'sales' ? 'primary' : 'ghost'} onClick={() => setView('sales')}>Sales Report</button>
      </div>

      {view === 'products' && <ProductsAdmin presenter={presenter} token={token} />}
      {view === 'categories' && <CategoriesAdmin presenter={presenter} />}
      {view === 'sales' && <SalesReport presenter={presenter} />}
    </div>
  )
}
