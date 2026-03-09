import React, { useEffect, useState } from 'react'
import axios from 'axios'

function Login({ onLogin, presenter }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  async function submit(e) {
    e.preventDefault()
    try {
      const res = await presenter.login(username, password)
      const token = res.token
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      localStorage.setItem('etal_token', token)
      onLogin(token)
    } catch (err) {
      alert('Login failed')
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

function ProductsAdmin({ presenter }) {
  const [products, setProducts] = useState([])
  const [editing, setEditing] = useState(null)
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({ name:'', category_id:'', description:'', price:'', specs:'', image_url:'' })
  const [errors, setErrors] = useState([])

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
    setForm({ name:p.name||'', category_id:p.category_id||'', description:p.description||'', price:p.price||'', specs: p.specs ? JSON.stringify(p.specs) : '', image_url:p.image_url||'' })
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
      const payload = { name: form.name, category_id: form.category_id || null, description: form.description, price: form.price || null, specs: form.specs ? JSON.parse(form.specs) : null, image_url: form.image_url }
      if(editing){
        await presenter.updateProduct(editing, payload)
      } else {
        await presenter.createProduct(payload)
      }
      setEditing(null)
      setForm({ name:'', category_id:'', description:'', price:'', specs:'', image_url:'' })
      load()
    }catch(err){ alert('Save failed') }
  }

  async function del(id){ if(!confirm('Delete?')) return; await presenter.deleteProduct(id); load() }

  async function uploadImage(file){
    if(!file) return null
    const res = await presenter.uploadImage(file)
    return res.url
  }

  return (
    <div>
      <h3>Products</h3>
      <div className="admin-grid">
        <div className="admin-list">
          {products.map(p=> (
            <div key={p.id} className="card">
              <h4>{p.name}</h4>
              <p>{p.category}</p>
              <p>Price: {p.price}</p>
              <button onClick={()=>startEdit(p)}>Edit</button>
              <button onClick={()=>del(p.id)}>Delete</button>
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

export default function Admin({ token, onLogout, onAuth, presenter }){
  const [auth, setAuth] = useState(!!token)
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
      <ProductsAdmin presenter={presenter} />
      <CategoriesAdmin presenter={presenter} />
    </div>
  )
}
