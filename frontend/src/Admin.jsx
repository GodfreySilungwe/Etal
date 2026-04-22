import React, { useEffect, useState } from 'react'
import axios from 'axios'
import ProductCard from './ProductCard'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js'
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement)

const fmtMK = (val) => val == null || val === '' ? '' : `MK ${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const EMPTY_FORM = {
  name: '',
  category_id: '',
  description: '',
  price: '',
  original_price: '',
  discount_percent: '',
  stock: '',
  installation_price: '',
  delivery_price: '',
  specs: '',
  image_url: ''
}

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
      alert(err?.response?.data?.error || err?.message || 'Login failed')
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
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
  const effectiveToken = token || localStorage.getItem('etal_token') || ''

  async function load() {
    try {
      const res = await presenter.getProducts()
      setProducts(res)
    } catch (e) {
      setProducts([])
    }
    try {
      const c = await presenter.getCategories()
      setCategories(c)
    } catch (e) {
      setCategories([])
    }
  }

  useEffect(() => { load() }, [])

  function startEdit(p) {
    setEditing(p.id)
    setForm({
      name: p.name || '',
      category_id: p.category_id || '',
      description: p.description || '',
      price: p.price ?? '',
      original_price: p.original_price ?? '',
      discount_percent: p.discount_percent ?? '',
      stock: p.stock ?? '',
      installation_price: p.installation_price ?? '',
      delivery_price: p.delivery_price ?? '',
      specs: p.specs ? JSON.stringify(p.specs) : '',
      image_url: p.image_url || ''
    })
    setSelectedFile(null)
  }

  const calculateDiscountPercent = (originalPrice, price) => {
    if (originalPrice == null || price == null || originalPrice <= 0 || price >= originalPrice) return 0
    const percent = ((originalPrice - price) / originalPrice) * 100
    return Math.round(percent)
  }

  async function submit(e) {
    e.preventDefault()

    const toNumberOrNull = (value) => {
      if (value === '' || value == null) return null
      const n = Number(value)
      return Number.isNaN(n) ? NaN : n
    }

    const price = toNumberOrNull(form.price)
    const originalPrice = toNumberOrNull(form.original_price)
    const stock = toNumberOrNull(form.stock)
    const installationPrice = toNumberOrNull(form.installation_price)
    const deliveryPrice = toNumberOrNull(form.delivery_price)
    const discountPercent = calculateDiscountPercent(originalPrice, price)

    const errs = []
    if (!form.name.trim()) errs.push('Name is required')
    if (Number.isNaN(price)) errs.push('Price must be a number')
    if (Number.isNaN(originalPrice)) errs.push('Original price must be a number')
    if (Number.isNaN(discountPercent)) errs.push('Discount percent must be a number')
    if (Number.isNaN(stock)) errs.push('Stock must be a number')
    if (Number.isNaN(installationPrice)) errs.push('Installation price must be a number')
    if (Number.isNaN(deliveryPrice)) errs.push('Delivery price must be a number')
    if (form.specs) {
      try {
        JSON.parse(form.specs)
      } catch (error) {
        errs.push('Specs must be valid JSON')
      }
    }
    if (errs.length) {
      setErrors(errs)
      return
    }
    setErrors([])

    try {
      const formData = new FormData()
      formData.append('name', form.name.trim())
      formData.append('category_id', form.category_id || '')
      formData.append('description', form.description || '')
      formData.append('price', price != null ? price.toString() : '')
      formData.append('original_price', originalPrice != null ? originalPrice.toString() : '')
      formData.append('discount_percent', discountPercent.toString())
      formData.append('stock', stock != null ? stock.toString() : '')
      formData.append('installation_price', installationPrice != null ? installationPrice.toString() : '')
      formData.append('delivery_price', deliveryPrice != null ? deliveryPrice.toString() : '')
      formData.append('specs', form.specs || '')
      if (selectedFile) {
        formData.append('image', selectedFile)
      } else if (form.image_url) {
        formData.append('image_url', form.image_url)
      }

      if (editing) {
        const updated = await presenter.updateProduct(editing, formData)
        if (!updated) throw new Error('Product was not updated')
      } else {
        await presenter.createProduct(formData)
      }
      setEditing(null)
      setForm(EMPTY_FORM)
      setSelectedFile(null)
      await load()
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Save failed'
      alert(`Save failed: ${msg}`)
    }
  }

  async function del(id) {
    if (!confirm('Delete?')) return
    await presenter.deleteProduct(id)
    await load()
  }

  return (
    <div>
      <h3>Products</h3>
      <div className="admin-grid">
        <div className="admin-list">
          <div className="grid">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                showAction={false}
                extraContent={
                  <div className="admin-card-actions">
                    <p>Category: {p.category || 'Uncategorized'}</p>
                    <p>Installation: {fmtMK(p.installation_price) || '-'}</p>
                    <p>Delivery: {fmtMK(p.delivery_price) || '-'}</p>
                    <div className="admin-card-buttons">
                      <button type="button" onClick={() => startEdit(p)}>Edit</button>
                      <button type="button" onClick={() => del(p.id)}>Delete</button>
                    </div>
                  </div>
                }
              />
            ))}
          </div>
        </div>

        <div className="admin-form">
          <h4>{editing ? 'Edit' : 'Create'} Product</h4>
          <form onSubmit={submit}>
            {errors.length > 0 && <div className="errors">{errors.map((er, i) => <div key={i}>{er}</div>)}</div>}
            <input placeholder="Name" value={form.name} onChange={(e)=>setForm({ ...form, name: e.target.value })} />
            <select value={form.category_id} onChange={(e)=>setForm({ ...form, category_id: e.target.value })}>
              <option value=''>-- Select Category --</option>
              {Array.isArray(categories) ? categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>) : null}
            </select>
            <input placeholder="Description" value={form.description} onChange={(e)=>setForm({ ...form, description: e.target.value })} />
            <input type="number" step="0.01" placeholder="Price" value={form.price} onChange={(e)=>{
              const nextPrice = e.target.value
              setForm({
                ...form,
                price: nextPrice,
                discount_percent: calculateDiscountPercent(
                  form.original_price === '' ? null : Number(form.original_price),
                  nextPrice === '' ? null : Number(nextPrice)
                )
              })
            }} />
            <input type="number" step="0.01" placeholder="Original Price" value={form.original_price} onChange={(e)=>{
              const nextOriginalPrice = e.target.value
              setForm({
                ...form,
                original_price: nextOriginalPrice,
                discount_percent: calculateDiscountPercent(
                  nextOriginalPrice === '' ? null : Number(nextOriginalPrice),
                  form.price === '' ? null : Number(form.price)
                )
              })
            }} />
            <input type="number" step="1" placeholder="Discount Percent" value={form.discount_percent} readOnly />
            <input type="number" step="1" placeholder="Stock" value={form.stock} onChange={(e)=>setForm({ ...form, stock: e.target.value })} />
            <input type="number" step="0.01" placeholder="Installation Price" value={form.installation_price} onChange={(e)=>setForm({ ...form, installation_price: e.target.value })} />
            <input type="number" step="0.01" placeholder="Delivery Price" value={form.delivery_price} onChange={(e)=>setForm({ ...form, delivery_price: e.target.value })} />
            <textarea placeholder='Specs JSON' value={form.specs} onChange={(e)=>setForm({ ...form, specs: e.target.value })} />
            <div>
              <input type="file" accept="image/*" onChange={(e) => {
                const file = e.target.files?.[0]
                setSelectedFile(file)
                if (file) {
                  const url = URL.createObjectURL(file)
                  setForm((prev) => ({ ...prev, image_url: url })) // Preview
                } else {
                  setForm((prev) => ({ ...prev, image_url: '' }))
                }
              }} />
              {form.image_url && <div className="thumb"><img src={form.image_url} alt="preview" /></div>}
            </div>
            <button type="submit">Save</button>
            {editing && <button type="button" onClick={() => { setEditing(null); setForm(EMPTY_FORM); setErrors([]); setSelectedFile(null) }}>Cancel Edit</button>}
          </form>
        </div>
      </div>
    </div>
  )
}

function CategoriesAdmin({ presenter }) {
  const [categories, setCategories] = useState([])
  const [name, setName] = useState('')
  async function load() {
    const res = await presenter.getCategories()
    setCategories(res)
  }
  useEffect(() => { load() }, [])
  async function add(e) {
    e.preventDefault()
    if (!name) return
    await presenter.createCategory(name)
    setName('')
    load()
  }
  async function del(id) {
    if (!confirm('Delete category?')) return
    await presenter.deleteCategory(id)
    load()
  }
  return (
    <div>
      <h3>Categories</h3>
      <ul>
        {Array.isArray(categories) ? categories.map((c) => <li key={c.id}>{c.name} <button onClick={() => del(c.id)}>Delete</button></li>) : null}
      </ul>
      <form onSubmit={add}><input placeholder="Name" value={name} onChange={(e)=>setName(e.target.value)} /><button>Add</button></form>
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

  const totalInvoicesAmount = report.products ? report.products.reduce((sum, p) => sum + (Number(p.revenue || 0)), 0) : 0
  const avgTransactionValue = report.totalInvoices > 0 ? (totalInvoicesAmount / report.totalInvoices).toFixed(2) : 0
  const totalUnits = report.products ? report.products.reduce((sum, p) => sum + (Number(p.units || 0)), 0) : 0

  return (
    <div style={{ padding: '20px 0' }}>
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: '1.8rem', marginBottom: 16, fontWeight: 700 }}>📊 Sales Report</h3>
        
        {/* Key Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
          {/* Total Revenue Card */}
          <div style={{ background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(22, 163, 74, 0.1))', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: 12, padding: 20, textAlign: 'center' }}>
            <div style={{ fontSize: '0.9rem', color: '#a1a1a1', marginBottom: 8 }}>Total Revenue</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#22c55e' }}>{fmtMK(report.totalRevenue)}</div>
          </div>

          {/* Total Transactions */}
          <div style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.1))', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: 12, padding: 20, textAlign: 'center' }}>
            <div style={{ fontSize: '0.9rem', color: '#a1a1a1', marginBottom: 8 }}>Total Transactions</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#3b82f6' }}>{report.totalInvoices}</div>
          </div>

          {/* Total Units Sold */}
          <div style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(147, 51, 234, 0.1))', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: 12, padding: 20, textAlign: 'center' }}>
            <div style={{ fontSize: '0.9rem', color: '#a1a1a1', marginBottom: 8 }}>Total Units Sold</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#a855f7' }}>{totalUnits}</div>
          </div>

          {/* Avg Transaction Value */}
          <div style={{ background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(234, 88, 12, 0.1))', border: '1px solid rgba(249, 115, 22, 0.3)', borderRadius: 12, padding: 20, textAlign: 'center' }}>
            <div style={{ fontSize: '0.9rem', color: '#a1a1a1', marginBottom: 8 }}>Avg Transaction</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#f97316' }}>{fmtMK(avgTransactionValue)}</div>
          </div>
        </div>

        {/* Highlights */}
        <div style={{ background: 'rgba(200, 16, 46, 0.08)', border: '1px solid rgba(200, 16, 46, 0.2)', borderRadius: 12, padding: 16, marginBottom: 24 }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 12 }}>🏆 Highlights</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 12 }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#a1a1a1', marginBottom: 4 }}>Top Category</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f5f5f5' }}>
                {report.topCategory ? `${report.topCategory.category} (${report.topCategory.units} units)` : 'N/A'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#a1a1a1', marginBottom: 4 }}>Peak Selling Day</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f5f5f5' }}>
                {report.peakDay ? `${report.peakDay.date} (${report.peakDay.units} units)` : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Performance */}
      <div style={{ marginBottom: 24 }}>
        <h4 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: 16 }}>📦 Category Performance</h4>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16, background: 'rgba(20, 20, 20, 0.5)', borderRadius: 8 }}>
            <thead>
              <tr style={{ background: 'rgba(200, 16, 46, 0.1)', borderBottom: '2px solid rgba(200, 16, 46, 0.3)' }}>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: 600, color: '#f5f5f5' }}>Category</th>
                <th style={{ textAlign: 'right', padding: '12px', fontWeight: 600, color: '#f5f5f5' }}>Units Sold</th>
                <th style={{ textAlign: 'right', padding: '12px', fontWeight: 600, color: '#f5f5f5' }}>Revenue</th>
                <th style={{ textAlign: 'right', padding: '12px', fontWeight: 600, color: '#f5f5f5' }}>% of Total</th>
              </tr>
            </thead>
            <tbody>
              {(report.categories || []).map((c, idx) => (
                <tr key={c.category} style={{ borderBottom: '1px solid rgba(200, 16, 46, 0.1)', background: idx % 2 === 0 ? 'rgba(200, 16, 46, 0.05)' : 'transparent' }}>
                  <td style={{ padding: '12px', color: '#f5f5f5' }}>{c.category}</td>
                  <td style={{ padding: '12px', textAlign: 'right', color: '#a1a1a1' }}>{c.units}</td>
                  <td style={{ padding: '12px', textAlign: 'right', color: '#22c55e', fontWeight: 600 }}>{fmtMK(c.revenue || 0)}</td>
                  <td style={{ padding: '12px', textAlign: 'right', color: '#f97316', fontWeight: 600 }}>
                    {((Number(c.revenue || 0) / report.totalRevenue) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Daily Sales Performance */}
      <div style={{ marginBottom: 24 }}>
        <h4 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: 16 }}>📈 Daily Sales Performance</h4>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16, background: 'rgba(20, 20, 20, 0.5)', borderRadius: 8 }}>
            <thead>
              <tr style={{ background: 'rgba(200, 16, 46, 0.1)', borderBottom: '2px solid rgba(200, 16, 46, 0.3)' }}>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: 600, color: '#f5f5f5' }}>Date</th>
                <th style={{ textAlign: 'right', padding: '12px', fontWeight: 600, color: '#f5f5f5' }}>Units Sold</th>
                <th style={{ textAlign: 'right', padding: '12px', fontWeight: 600, color: '#f5f5f5' }}>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {(report.daily || []).map((d, idx) => (
                <tr key={d.date} style={{ borderBottom: '1px solid rgba(200, 16, 46, 0.1)', background: idx % 2 === 0 ? 'rgba(200, 16, 46, 0.05)' : 'transparent' }}>
                  <td style={{ padding: '12px', color: '#f5f5f5' }}>{d.date}</td>
                  <td style={{ padding: '12px', textAlign: 'right', color: '#a1a1a1' }}>{d.units}</td>
                  <td style={{ padding: '12px', textAlign: 'right', color: '#22c55e', fontWeight: 600 }}>{fmtMK(d.revenue || 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Products */}
      <div>
        <h4 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: 16 }}>🛍️ Top Selling Products</h4>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'rgba(20, 20, 20, 0.5)', borderRadius: 8 }}>
            <thead>
              <tr style={{ background: 'rgba(200, 16, 46, 0.1)', borderBottom: '2px solid rgba(200, 16, 46, 0.3)' }}>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: 600, color: '#f5f5f5' }}>Product Name</th>
                <th style={{ textAlign: 'right', padding: '12px', fontWeight: 600, color: '#f5f5f5' }}>Units Sold</th>
                <th style={{ textAlign: 'right', padding: '12px', fontWeight: 600, color: '#f5f5f5' }}>Total Revenue</th>
                <th style={{ textAlign: 'right', padding: '12px', fontWeight: 600, color: '#f5f5f5' }}>Avg Price</th>
              </tr>
            </thead>
            <tbody>
              {report.products.map((p, idx) => (
                <tr key={p.id} style={{ borderBottom: '1px solid rgba(200, 16, 46, 0.1)', background: idx % 2 === 0 ? 'rgba(200, 16, 46, 0.05)' : 'transparent' }}>
                  <td style={{ padding: '12px', color: '#f5f5f5', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</td>
                  <td style={{ padding: '12px', textAlign: 'right', color: '#a1a1a1' }}>{p.units}</td>
                  <td style={{ padding: '12px', textAlign: 'right', color: '#22c55e', fontWeight: 600 }}>{fmtMK(p.revenue)}</td>
                  <td style={{ padding: '12px', textAlign: 'right', color: '#a855f7', fontWeight: 600 }}>{fmtMK(p.revenue / p.units)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function PaidItems({ presenter }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const res = await presenter.getPaymentReferences()
      setItems(Array.isArray(res) ? res : [])
    } catch (e) {
      console.error(e)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  async function onStatusChange(id, service_status) {
    try {
      await presenter.updatePaymentStatus(id, service_status)
      await load()
    } catch (e) {
      alert('Failed to update status')
    }
  }

  useEffect(() => { load() }, [])

  if (loading) return <p>Loading paid items...</p>
  const pendingItems = items.filter((it) => (it.service_status || 'pending') !== 'complete')
  const processedItems = items.filter((it) => (it.service_status || 'pending') === 'complete')

  return (
    <div>
      <h3>Paid Items (Pending)</h3>
      {pendingItems.length === 0 && <p>No pending paid items.</p>}
      <div style={{ display: 'grid', gap: 12 }}>
        {pendingItems.map((it) => (
          <div key={it.id} style={{ border: '1px solid #ddd', borderRadius: 10, padding: 12, background: 'rgba(255,255,255,0.92)', color: '#111827' }}>
            <p><strong>Name:</strong> {it.customer_name}</p>
            <p><strong>Phone:</strong> {it.phone}</p>
            <p><strong>Method:</strong> {it.method_used}</p>
            <p><strong>Transaction Ref:</strong> {it.transaction_reference}</p>
            {it.order_id && <p><strong>Order ID:</strong> {it.order_id}</p>}
            <p><strong>Submitted:</strong> {new Date(it.submitted_at).toLocaleString()}</p>
            <div style={{ marginTop: 8 }}>
              <strong>Paid Items</strong>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 6 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '4px' }}>Name</th>
                    <th style={{ textAlign: 'right', borderBottom: '1px solid #ddd', padding: '4px' }}>Qty</th>
                    <th style={{ textAlign: 'right', borderBottom: '1px solid #ddd', padding: '4px' }}>Discount</th>
                    <th style={{ textAlign: 'right', borderBottom: '1px solid #ddd', padding: '4px' }}>Price</th>
                    <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '4px' }}>Install/Service</th>
                    <th style={{ textAlign: 'right', borderBottom: '1px solid #ddd', padding: '4px' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    let rows = []
                    if (Array.isArray(it.product_details)) {
                      rows = it.product_details
                    } else {
                      try { rows = JSON.parse(it.product_details || '[]') } catch (e) { rows = [] }
                    }
                    if (!Array.isArray(rows)) rows = []
                    return rows.length > 0 ? rows.map((r, idx) => (
                      <tr key={`${it.id}-${idx}`}>
                        <td style={{ padding: '4px' }}>{r.name || '-'}</td>
                        <td style={{ padding: '4px', textAlign: 'right' }}>{r.quantity ?? 1}</td>
                        <td style={{ padding: '4px', textAlign: 'right' }}>{r.discount_percent ? `${r.discount_percent}%` : '0%'}</td>
                        <td style={{ padding: '4px', textAlign: 'right' }}>{fmtMK(r.price)}</td>
                        <td style={{ padding: '4px' }}>
                          {r.service_included
                            ? `Yes (${fmtMK(r.service_fee)})`
                            : 'No'}
                        </td>
                        <td style={{ padding: '4px', textAlign: 'right' }}>{fmtMK(r.total_price)}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="6" style={{ padding: '8px', textAlign: 'center', color: '#666' }}>No paid item details available</td>
                      </tr>
                    )
                  })()}
                </tbody>
              </table>
            </div>
            <label>
              <strong>Service Status: </strong>
              <select value={it.service_status || 'pending'} onChange={(e) => onStatusChange(it.id, e.target.value)}>
                <option value="pending">Pending</option>
                <option value="complete">Complete</option>
              </select>
            </label>
          </div>
        ))}
      </div>

      <h4 style={{ marginTop: 18 }}>Processed Paid Items</h4>
      {processedItems.length === 0 && <p>No processed paid items yet.</p>}
      {processedItems.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '6px' }}>Customer</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '6px' }}>Phone</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '6px' }}>Date Paid</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '6px' }}>Date Processed</th>
            </tr>
          </thead>
          <tbody>
            {processedItems.map((it) => (
              <tr key={`processed-paid-${it.id}`}>
                <td style={{ padding: '6px' }}>{it.customer_name}</td>
                <td style={{ padding: '6px' }}>{it.phone}</td>
                <td style={{ padding: '6px' }}>{new Date(it.submitted_at).toLocaleString()}</td>
                <td style={{ padding: '6px' }}>{it.processed_at ? new Date(it.processed_at).toLocaleString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

function QuoteRequestsAdmin({ presenter }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const res = await presenter.getQuoteRequests()
      setItems(Array.isArray(res) ? res : [])
    } catch (e) {
      console.error(e)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  async function onStatusChange(id, status) {
    try {
      await presenter.updateQuoteStatus(id, status)
      await load()
    } catch (e) {
      alert('Failed to update quote status')
    }
  }

  useEffect(() => { load() }, [])

  if (loading) return <p>Loading quote requests...</p>
  const pendingItems = items.filter((it) => (it.status || 'pending') !== 'complete')
  const processedItems = items.filter((it) => (it.status || 'pending') === 'complete')

  return (
    <div>
      <h3>Quote Requests (Pending)</h3>
      {pendingItems.length === 0 && <p>No pending quote requests.</p>}
      <div style={{ display: 'grid', gap: 12 }}>
        {pendingItems.map((it) => (
          <div key={it.id} style={{ border: '1px solid #ddd', borderRadius: 10, padding: 12, background: 'rgba(255,255,255,0.92)', color: '#111827' }}>
            <p><strong>Name:</strong> {it.customer_name}</p>
            <p><strong>Phone:</strong> {it.phone}</p>
            <p><strong>Email:</strong> {it.email || '-'}</p>
            <p><strong>Details:</strong> {it.details || '-'}</p>
            <p><strong>Requested:</strong> {new Date(it.requested_at).toLocaleString()}</p>
            <div style={{ marginTop: 8 }}>
              <strong>Quoted Items</strong>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 6 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '4px' }}>Name</th>
                    <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '4px' }}>Category</th>
                    <th style={{ textAlign: 'right', borderBottom: '1px solid #ddd', padding: '4px' }}>Qty</th>
                    <th style={{ textAlign: 'right', borderBottom: '1px solid #ddd', padding: '4px' }}>Price</th>
                    <th style={{ textAlign: 'right', borderBottom: '1px solid #ddd', padding: '4px' }}>Discount</th>
                    <th style={{ textAlign: 'right', borderBottom: '1px solid #ddd', padding: '4px' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    let rows = []
                    if (Array.isArray(it.product_details)) {
                      rows = it.product_details
                    } else {
                      try { rows = JSON.parse(it.product_details || '[]') } catch (e) { rows = [] }
                    }
                    if (!Array.isArray(rows)) rows = []
                    return rows.length > 0 ? rows.map((r, idx) => (
                      <tr key={`${it.id}-${idx}`}>
                        <td style={{ padding: '4px' }}>{r.name || '-'}</td>
                        <td style={{ padding: '4px' }}>{r.category || '-'}</td>
                        <td style={{ padding: '4px', textAlign: 'right' }}>{r.quantity ?? 1}</td>
                        <td style={{ padding: '4px', textAlign: 'right' }}>{fmtMK(r.unit_price)}</td>
                        <td style={{ padding: '4px', textAlign: 'right' }}>
                          {r.discount_percent ? `${r.discount_percent}%` : '0%'}
                        </td>
                        <td style={{ padding: '4px', textAlign: 'right' }}>{fmtMK(r.line_amount)}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="6" style={{ padding: '8px', textAlign: 'center', color: '#666' }}>
                          No quoted item details available
                        </td>
                      </tr>
                    )
                  })()}
                </tbody>
              </table>
            </div>
            <label>
              <strong>Status: </strong>
              <select value={it.status} onChange={(e) => onStatusChange(it.id, e.target.value)}>
                <option value="pending">Pending</option>
                <option value="complete">Complete</option>
              </select>
            </label>
          </div>
        ))}
      </div>

      <h4 style={{ marginTop: 18 }}>Processed Quotations</h4>
      {processedItems.length === 0 && <p>No processed quotations yet.</p>}
      {processedItems.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '6px' }}>Customer</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '6px' }}>Phone</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '6px' }}>Email</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '6px' }}>Date Requested</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '6px' }}>Date Processed</th>
            </tr>
          </thead>
          <tbody>
            {processedItems.map((it) => (
              <tr key={`processed-quote-${it.id}`}>
                <td style={{ padding: '6px' }}>{it.customer_name}</td>
                <td style={{ padding: '6px' }}>{it.phone}</td>
                <td style={{ padding: '6px' }}>{it.email || '-'}</td>
                <td style={{ padding: '6px' }}>{new Date(it.requested_at).toLocaleString()}</td>
                <td style={{ padding: '6px' }}>{it.processed_at ? new Date(it.processed_at).toLocaleString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

function ServiceRequestsAdmin({ presenter }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const res = await presenter.getInstallationRequests()
      setItems(Array.isArray(res) ? res : [])
    } catch (e) {
      console.error(e)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  async function onPaymentStatusChange(id, payment_status) {
    try {
      await presenter.updateInstallationPaymentStatus(id, payment_status)
      await load()
    } catch (e) {
      alert('Failed to update payment status')
    }
  }

  async function onStatusChange(id, status) {
    try {
      await presenter.updateInstallationRequestStatus(id, status)
      await load()
    } catch (e) {
      alert('Failed to update service status')
    }
  }

  useEffect(() => { load() }, [])

  if (loading) return <p>Loading service requests...</p>

  return (
    <div>
      <h3>Service Requests</h3>
      {items.length === 0 && <p>No service requests yet.</p>}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '6px' }}>Name</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '6px' }}>Phone</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '6px' }}>Service/Product</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '6px' }}>Location</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '6px' }}>Preferred Date</th>
            <th style={{ textAlign: 'right', borderBottom: '1px solid #ddd', padding: '6px' }}>Fee</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '6px' }}>Payment Status</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '6px' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.id}>
              <td style={{ padding: '6px' }}>{it.customer_name}</td>
              <td style={{ padding: '6px' }}>{it.phone}</td>
              <td style={{ padding: '6px' }}>{it.product}</td>
              <td style={{ padding: '6px' }}>{it.customer_location}</td>
              <td style={{ padding: '6px' }}>{it.preferred_date ? String(it.preferred_date).slice(0, 10) : '-'}</td>
              <td style={{ padding: '6px', textAlign: 'right' }}>{fmtMK(it.product_price)}</td>
              <td style={{ padding: '6px' }}>
                <select value={it.payment_status || 'pending'} onChange={(e) => onPaymentStatusChange(it.id, e.target.value)}>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                </select>
                {it.payment_status === 'paid' && it.order_id && (
                  <div style={{ marginTop: '4px', fontSize: '12px', color: '#666' }}>
                    <strong>Order ID: {it.order_id}</strong><br />
                    Message: Our staff will call you with confirmation.
                  </div>
                )}
              </td>
              <td style={{ padding: '6px' }}>
                <select value={it.status || 'pending'} onChange={(e) => onStatusChange(it.id, e.target.value)}>
                  <option value="pending">Pending</option>
                  <option value="complete">Complete</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function NewsletterAdmin({ presenter }) {
  const [subscribers, setSubscribers] = useState([])
  const [loading, setLoading] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const res = await presenter.getNewsletterSubscribers()
      setSubscribers(Array.isArray(res) ? res : [])
    } catch (e) {
      console.error(e)
      setSubscribers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  if (loading) return <p>Loading newsletter subscribers...</p>

  return (
    <div>
      <h3>Newsletter Subscribers</h3>
      {subscribers.length === 0 && <p>No subscribers yet.</p>}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '6px' }}>Email</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '6px' }}>Subscribed At</th>
          </tr>
        </thead>
        <tbody>
          {subscribers.map((sub) => (
            <tr key={sub.id}>
              <td style={{ padding: '6px' }}>{sub.email}</td>
              <td style={{ padding: '6px' }}>{new Date(sub.subscribed_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ServicesAdmin({ presenter }) {
  const [services, setServices] = useState([])
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', description: '', image_url: '', price: '' })
  const [selectedFile, setSelectedFile] = useState(null)

  async function load() {
    try {
      const rows = await presenter.getServices()
      setServices(Array.isArray(rows) ? rows : [])
    } catch (e) {
      setServices([])
    }
  }

  useEffect(() => { load() }, [])

  function startEdit(s) {
    setEditing(s.id)
    setForm({ name: s.name || '', description: s.description || '', image_url: s.image_url || '', price: s.price ?? '' })
    setSelectedFile(null)
  }

  async function submit(e) {
    e.preventDefault()
    if (!form.name.trim()) return alert('Service name is required')
    const price = Number(form.price)
    if (Number.isNaN(price)) return alert('Price must be a number')
    try {
      const formData = new FormData()
      formData.append('name', form.name.trim())
      formData.append('description', form.description || '')
      formData.append('price', price.toString())
      if (selectedFile) {
        formData.append('image', selectedFile)
      } else if (form.image_url) {
        formData.append('image_url', form.image_url)
      }

      if (editing) await presenter.updateService(editing, formData)
      else await presenter.createService(formData)
      setEditing(null)
      setForm({ name: '', description: '', image_url: '', price: '' })
      setSelectedFile(null)
      await load()
    } catch (err) {
      const msg = err?.response?.data?.error || 'Failed to save service'
      alert(msg)
    }
  }

  async function del(id) {
    if (!confirm('Delete service?')) return
    await presenter.deleteService(id)
    await load()
  }

  return (
    <div className="admin-grid">
      <div className="admin-list">
        <h3>Services</h3>
        {services.map((s) => (
          <div key={s.id} style={{ border: '1px solid #ddd', borderRadius: 10, padding: 12, background: 'rgba(255,255,255,0.92)', color: '#111827', marginBottom: 10 }}>
            {s.image_url && <img src={s.image_url} alt={s.name} style={{ width: '100%', maxHeight: 160, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }} />}
            <p><strong>{s.name}</strong></p>
            <p>{s.description || '-'}</p>
            <p><strong>{fmtMK(s.price)}</strong></p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={() => startEdit(s)}>Edit</button>
              <button type="button" onClick={() => del(s.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
      <div className="admin-form">
        <h4>{editing ? 'Edit' : 'Create'} Service</h4>
        <form onSubmit={submit}>
          <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <input type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
          {selectedFile && <div className="thumb"><img src={URL.createObjectURL(selectedFile)} alt="service preview" /></div>}
          {form.image_url && !selectedFile && <div className="thumb"><img src={form.image_url} alt="service preview" /></div>}
          <input type="number" step="0.01" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          <button type="submit">Save Service</button>
          {editing && <button type="button" onClick={() => { setEditing(null); setForm({ name: '', description: '', image_url: '', price: '' }); setSelectedFile(null) }}>Cancel</button>}
        </form>
      </div>
    </div>
  )
}

function QuotationReport({ presenter }) {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const res = await presenter.getQuotationReport()
      setReport(res)
    } catch (e) {
      console.error(e)
      setReport(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  if (loading) return <p>Loading quotation report...</p>
  if (!report) return <p>Failed to load quotation report</p>

  const completionRate = report.totalQuotes > 0 ? ((report.byStatus?.complete || 0) / report.totalQuotes * 100).toFixed(1) : 0

  return (
    <div style={{ padding: '20px 0' }}>
      <h3 style={{ fontSize: '1.8rem', marginBottom: 16, fontWeight: 700 }}>📝 Quotation Report</h3>
      
      {/* Key Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        {/* Total Quotes */}
        <div style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(109, 40, 217, 0.1))', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: 12, padding: 20, textAlign: 'center' }}>
          <div style={{ fontSize: '0.9rem', color: '#a1a1a1', marginBottom: 8 }}>Total Quotations</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#8b5cf6' }}>{report.totalQuotes}</div>
        </div>

        {/* Pending Quotes */}
        <div style={{ background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(234, 88, 12, 0.1))', border: '1px solid rgba(249, 115, 22, 0.3)', borderRadius: 12, padding: 20, textAlign: 'center' }}>
          <div style={{ fontSize: '0.9rem', color: '#a1a1a1', marginBottom: 8 }}>Pending</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#f97316' }}>{report.byStatus?.pending ?? 0}</div>
        </div>

        {/* Completed Quotes */}
        <div style={{ background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(22, 163, 74, 0.1))', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: 12, padding: 20, textAlign: 'center' }}>
          <div style={{ fontSize: '0.9rem', color: '#a1a1a1', marginBottom: 8 }}>Completed</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#22c55e' }}>{report.byStatus?.complete ?? 0}</div>
        </div>

        {/* Completion Rate */}
        <div style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.1))', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: 12, padding: 20, textAlign: 'center' }}>
          <div style={{ fontSize: '0.9rem', color: '#a1a1a1', marginBottom: 8 }}>Completion Rate</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#3b82f6' }}>{completionRate}%</div>
        </div>
      </div>

      {/* Peak Activity */}
      <div style={{ background: 'rgba(200, 16, 46, 0.08)', border: '1px solid rgba(200, 16, 46, 0.2)', borderRadius: 12, padding: 16, marginBottom: 24 }}>
        <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 12 }}>📊 Peak Activity</h4>
        <div>
          <div style={{ fontSize: '0.85rem', color: '#a1a1a1', marginBottom: 4 }}>Peak Quote Day</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f5f5f5' }}>
            {report.peakDay ? `${report.peakDay.date} (${report.peakDay.count} quotes)` : 'N/A'}
          </div>
        </div>
      </div>

      {/* Daily Quote Trends */}
      <div>
        <h4 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: 16 }}>📈 Daily Quote Trends</h4>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 10, background: 'rgba(20, 20, 20, 0.5)', borderRadius: 8 }}>
            <thead>
              <tr style={{ background: 'rgba(200, 16, 46, 0.1)', borderBottom: '2px solid rgba(200, 16, 46, 0.3)' }}>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: 600, color: '#f5f5f5' }}>Date</th>
                <th style={{ textAlign: 'right', padding: '12px', fontWeight: 600, color: '#f5f5f5' }}>Quote Count</th>
                <th style={{ textAlign: 'right', padding: '12px', fontWeight: 600, color: '#f5f5f5' }}>% of Total</th>
              </tr>
            </thead>
            <tbody>
              {(report.daily || []).map((d, idx) => (
                <tr key={d.date} style={{ borderBottom: '1px solid rgba(200, 16, 46, 0.1)', background: idx % 2 === 0 ? 'rgba(200, 16, 46, 0.05)' : 'transparent' }}>
                  <td style={{ padding: '12px', color: '#f5f5f5' }}>{d.date}</td>
                  <td style={{ padding: '12px', textAlign: 'right', color: '#a1a1a1', fontWeight: 600 }}>{d.count}</td>
                  <td style={{ padding: '12px', textAlign: 'right', color: '#8b5cf6', fontWeight: 600 }}>
                    {((d.count / report.totalQuotes) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default function Admin({ token, onLogout, onAuth, presenter }) {
  const [auth, setAuth] = useState(!!token)
  const [view, setView] = useState('products')

  useEffect(() => {
    const stored = localStorage.getItem('etal_token')
    if (stored) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${stored}`
      setAuth(true)
      onAuth && onAuth(stored)
    }
  }, [])

  function handleLogin(t) {
    setAuth(true)
    onAuth && onAuth(t)
  }

  function logout() {
    localStorage.removeItem('etal_token')
    delete axios.defaults.headers.common['Authorization']
    setAuth(false)
    onLogout && onLogout()
  }

  if (!auth) return <Login onLogin={handleLogin} presenter={presenter} />
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Admin Dashboard</h2>
        <div><button onClick={logout}>Logout</button></div>
      </div>

      {/* Settings Tab Group */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#a1a1a1', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>⚙️ Settings</div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <button className={view === 'products' ? 'primary' : 'ghost'} onClick={() => setView('products')}>Products</button>
          <button className={view === 'services' ? 'primary' : 'ghost'} onClick={() => setView('services')}>Services</button>
          <button className={view === 'categories' ? 'primary' : 'ghost'} onClick={() => setView('categories')}>Categories</button>
          <button className={view === 'newsletter' ? 'primary' : 'ghost'} onClick={() => setView('newsletter')}>Newsletter</button>
        </div>
      </div>

      {/* Reports & Orders Tab Group */}
      <div>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#a1a1a1', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>📊 Reports & Orders</div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <button className={view === 'sales' ? 'primary' : 'ghost'} onClick={() => setView('sales')}>Sales Report</button>
          <button className={view === 'quote-report' ? 'primary' : 'ghost'} onClick={() => setView('quote-report')}>Quotation Report</button>
          <button className={view === 'paid' ? 'primary' : 'ghost'} onClick={() => setView('paid')}>Paid Items</button>
          <button className={view === 'quotes' ? 'primary' : 'ghost'} onClick={() => setView('quotes')}>Quote Requests</button>
          <button className={view === 'service-requests' ? 'primary' : 'ghost'} onClick={() => setView('service-requests')}>Service Requests</button>
        </div>
      </div>

      {view === 'products' && <ProductsAdmin presenter={presenter} token={token} />}
      {view === 'services' && <ServicesAdmin presenter={presenter} />}
      {view === 'categories' && <CategoriesAdmin presenter={presenter} />}
      {view === 'sales' && <SalesReport presenter={presenter} />}
      {view === 'quote-report' && <QuotationReport presenter={presenter} />}
      {view === 'paid' && <PaidItems presenter={presenter} />}
      {view === 'quotes' && <QuoteRequestsAdmin presenter={presenter} />}
      {view === 'service-requests' && <ServiceRequestsAdmin presenter={presenter} />}
      {view === 'newsletter' && <NewsletterAdmin presenter={presenter} />}
    </div>
  )
}
