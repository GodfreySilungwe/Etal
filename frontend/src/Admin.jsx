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
    <div className="admin-login-container">
      <form onSubmit={submit} className="admin-login-modern">
        <div className="login-header">
          <div className="login-icon">🔐</div>
          <h3>Admin Login</h3>
          <p>Enter your credentials to access the dashboard</p>
        </div>
        <div className="login-form">
          <input 
            placeholder="Username" 
            value={username} 
            onChange={(e)=>setUsername(e.target.value)} 
            className="login-input"
          />
          <input 
            placeholder="Password" 
            value={password} 
            type="password" 
            onChange={(e)=>setPassword(e.target.value)} 
            className="login-input"
          />
          <button type="submit" className="login-btn">Login</button>
        </div>
      </form>
    </div>
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
    <div className="admin-products-modern">
      <div className="admin-grid-modern">
        <div className="admin-list-modern">
          <div className="admin-list-header">
            <h3>Products Management</h3>
            <span>{products.length} products</span>
          </div>
          <div className="products-grid-admin">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                showAction={false}
                extraContent={
                  <div className="admin-card-actions-modern">
                    <p><strong>Category:</strong> {p.category || 'Uncategorized'}</p>
                    <p><strong>Installation:</strong> {fmtMK(p.installation_price) || '-'}</p>
                    <p><strong>Delivery:</strong> {fmtMK(p.delivery_price) || '-'}</p>
                    <div className="admin-card-buttons-modern">
                      <button type="button" onClick={() => startEdit(p)} className="edit-btn">Edit</button>
                      <button type="button" onClick={() => del(p.id)} className="delete-btn">Delete</button>
                    </div>
                  </div>
                }
              />
            ))}
          </div>
        </div>

        <div className="admin-form-modern">
          <div className="form-header">
            <h4>{editing ? 'Edit Product' : 'Create New Product'}</h4>
          </div>
          <form onSubmit={submit}>
            {errors.length > 0 && <div className="errors-modern">{errors.map((er, i) => <div key={i}>⚠️ {er}</div>)}</div>}
            <div className="form-group-admin">
              <label>Product Name</label>
              <input placeholder="Enter product name" value={form.name} onChange={(e)=>setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group-admin">
              <label>Category</label>
              <select value={form.category_id} onChange={(e)=>setForm({ ...form, category_id: e.target.value })}>
                <option value=''>-- Select Category --</option>
                {Array.isArray(categories) ? categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>) : null}
              </select>
            </div>
            <div className="form-group-admin">
              <label>Description</label>
              <textarea placeholder="Product description" value={form.description} onChange={(e)=>setForm({ ...form, description: e.target.value })} rows="3" />
            </div>
            <div className="form-row-admin">
              <div className="form-group-admin half">
                <label>Price (MWK)</label>
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
              </div>
              <div className="form-group-admin half">
                <label>Original Price (MWK)</label>
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
              </div>
            </div>
            <div className="form-row-admin">
              <div className="form-group-admin half">
                <label>Discount Percent</label>
                <input type="number" step="1" placeholder="Discount Percent" value={form.discount_percent} readOnly className="readonly-input" />
              </div>
              <div className="form-group-admin half">
                <label>Stock Quantity</label>
                <input type="number" step="1" placeholder="Stock" value={form.stock} onChange={(e)=>setForm({ ...form, stock: e.target.value })} />
              </div>
            </div>
            <div className="form-row-admin">
              <div className="form-group-admin half">
                <label>Installation Price (MWK)</label>
                <input type="number" step="0.01" placeholder="Installation Price" value={form.installation_price} onChange={(e)=>setForm({ ...form, installation_price: e.target.value })} />
              </div>
              <div className="form-group-admin half">
                <label>Delivery Price (MWK)</label>
                <input type="number" step="0.01" placeholder="Delivery Price" value={form.delivery_price} onChange={(e)=>setForm({ ...form, delivery_price: e.target.value })} />
              </div>
            </div>
            <div className="form-group-admin">
              <label>Specifications (JSON format)</label>
              <textarea placeholder='{"brand": "Example", "color": "Black"}' value={form.specs} onChange={(e)=>setForm({ ...form, specs: e.target.value })} rows="2" />
            </div>
            <div className="form-group-admin">
              <label>Product Image</label>
              <input type="file" accept="image/*" onChange={(e) => {
                const file = e.target.files?.[0]
                setSelectedFile(file)
                if (file) {
                  const url = URL.createObjectURL(file)
                  setForm((prev) => ({ ...prev, image_url: url }))
                } else {
                  setForm((prev) => ({ ...prev, image_url: '' }))
                }
              }} />
              {form.image_url && <div className="image-preview"><img src={form.image_url} alt="preview" /></div>}
            </div>
            <div className="form-actions-admin">
              <button type="submit" className="save-btn">Save Product</button>
              {editing && <button type="button" className="cancel-btn" onClick={() => { setEditing(null); setForm(EMPTY_FORM); setErrors([]); setSelectedFile(null) }}>Cancel Edit</button>}
            </div>
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
    <div className="categories-admin-modern">
      <div className="categories-header">
        <h3>Categories Management</h3>
        <span>{categories.length} categories</span>
      </div>
      <div className="categories-list">
        {Array.isArray(categories) ? categories.map((c) => (
          <div key={c.id} className="category-item">
            <span className="category-name">{c.name}</span>
            <button onClick={() => del(c.id)} className="delete-category-btn">Delete</button>
          </div>
        )) : null}
      </div>
      <form onSubmit={add} className="add-category-form">
        <input placeholder="New category name" value={name} onChange={(e)=>setName(e.target.value)} />
        <button type="submit">Add Category</button>
      </form>
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

  if (loading) return <div className="loading-state"><div className="spinner"></div><p>Loading report...</p></div>
  if (!report) return <p className="error-state">Failed to load report</p>

  const totalInvoicesAmount = report.products ? report.products.reduce((sum, p) => sum + (Number(p.revenue || 0)), 0) : 0
  const avgTransactionValue = report.totalInvoices > 0 ? (totalInvoicesAmount / report.totalInvoices).toFixed(2) : 0
  const totalUnits = report.products ? report.products.reduce((sum, p) => sum + (Number(p.units || 0)), 0) : 0

  return (
    <div className="report-container-modern">
      <div className="report-header">
        <h3>📊 Sales Report</h3>
        <p>Performance overview and analytics</p>
      </div>
      
      {/* Key Metrics Grid */}
      <div className="metrics-grid">
        <div className="metric-card revenue">
          <div className="metric-icon">💰</div>
          <div className="metric-info">
            <div className="metric-label">Total Revenue</div>
            <div className="metric-value">{fmtMK(report.totalRevenue)}</div>
          </div>
        </div>

        <div className="metric-card transactions">
          <div className="metric-icon">📋</div>
          <div className="metric-info">
            <div className="metric-label">Total Transactions</div>
            <div className="metric-value">{report.totalInvoices}</div>
          </div>
        </div>

        <div className="metric-card units">
          <div className="metric-icon">📦</div>
          <div className="metric-info">
            <div className="metric-label">Total Units Sold</div>
            <div className="metric-value">{totalUnits}</div>
          </div>
        </div>

        <div className="metric-card average">
          <div className="metric-icon">⚡</div>
          <div className="metric-info">
            <div className="metric-label">Avg Transaction</div>
            <div className="metric-value">{fmtMK(avgTransactionValue)}</div>
          </div>
        </div>
      </div>

      {/* Highlights */}
      <div className="highlights-card">
        <h4>🏆 Highlights</h4>
        <div className="highlights-grid">
          <div>
            <div className="highlight-label">Top Category</div>
            <div className="highlight-value">{report.topCategory ? `${report.topCategory.category} (${report.topCategory.units} units)` : 'N/A'}</div>
          </div>
          <div>
            <div className="highlight-label">Peak Selling Day</div>
            <div className="highlight-value">{report.peakDay ? `${report.peakDay.date} (${report.peakDay.units} units)` : 'N/A'}</div>
          </div>
        </div>
      </div>

      {/* Category Performance */}
      <div className="data-table-container">
        <h4>📦 Category Performance</h4>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Category</th>
                <th className="text-right">Units Sold</th>
                <th className="text-right">Revenue</th>
                <th className="text-right">% of Total</th>
              </tr>
            </thead>
            <tbody>
              {(report.categories || []).map((c, idx) => (
                <tr key={c.category}>
                  <td>{c.category}</td>
                  <td className="text-right">{c.units}</td>
                  <td className="text-right revenue-value">{fmtMK(c.revenue || 0)}</td>
                  <td className="text-right percentage-value">
                    {((Number(c.revenue || 0) / report.totalRevenue) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Products */}
      <div className="data-table-container">
        <h4>🛍️ Top Selling Products</h4>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th className="text-right">Units Sold</th>
                <th className="text-right">Total Revenue</th>
                <th className="text-right">Avg Price</th>
              </tr>
            </thead>
            <tbody>
              {report.products.map((p, idx) => (
                <tr key={p.id}>
                  <td className="product-name">{p.name}</td>
                  <td className="text-right">{p.units}</td>
                  <td className="text-right revenue-value">{fmtMK(p.revenue)}</td>
                  <td className="text-right price-value">{fmtMK(p.revenue / p.units)}</td>
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

  if (loading) return <div className="loading-state"><div className="spinner"></div><p>Loading paid items...</p></div>
  
  const pendingItems = items.filter((it) => (it.service_status || 'pending') !== 'complete')
  const processedItems = items.filter((it) => (it.service_status || 'pending') === 'complete')

  return (
    <div className="requests-container">
      <div className="requests-header">
        <h3>Paid Items</h3>
        <span className="pending-badge">{pendingItems.length} Pending</span>
      </div>
      
      <div className="requests-section">
        <h4>Pending Processing</h4>
        {pendingItems.length === 0 && <p className="empty-state">No pending paid items.</p>}
        <div className="requests-grid">
          {pendingItems.map((it) => (
            <div key={it.id} className="request-card">
              <div className="request-header">
                <strong>{it.customer_name}</strong>
                <span className="status-badge pending">Pending</span>
              </div>
              <div className="request-details">
                <p><strong>Phone:</strong> {it.phone}</p>
                <p><strong>Method:</strong> {it.method_used}</p>
                <p><strong>Transaction Ref:</strong> {it.transaction_reference}</p>
                {it.order_id && <p><strong>Order ID:</strong> {it.order_id}</p>}
                <p><strong>Submitted:</strong> {new Date(it.submitted_at).toLocaleString()}</p>
              </div>
              <div className="request-items">
                <strong>Items Purchased:</strong>
                {(() => {
                  let rows = []
                  if (Array.isArray(it.product_details)) rows = it.product_details
                  else { try { rows = JSON.parse(it.product_details || '[]') } catch (e) { rows = [] } }
                  return rows.map((r, idx) => (
                    <div key={idx} className="request-item">
                      <span>{r.name} × {r.quantity}</span>
                      <span>{fmtMK(r.total_price)}</span>
                    </div>
                  ))
                })()}
              </div>
              <div className="request-action">
                <label>Service Status:</label>
                <select value={it.service_status || 'pending'} onChange={(e) => onStatusChange(it.id, e.target.value)}>
                  <option value="pending">Pending</option>
                  <option value="complete">Complete</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="requests-section">
        <h4>Processed</h4>
        {processedItems.length === 0 && <p className="empty-state">No processed items yet.</p>}
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Phone</th>
                <th>Date Paid</th>
                <th>Date Processed</th>
              </tr>
            </thead>
            <tbody>
              {processedItems.map((it) => (
                <tr key={it.id}>
                  <td>{it.customer_name}</td>
                  <td>{it.phone}</td>
                  <td>{new Date(it.submitted_at).toLocaleString()}</td>
                  <td>{it.processed_at ? new Date(it.processed_at).toLocaleString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
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

  if (loading) return <div className="loading-state"><div className="spinner"></div><p>Loading quote requests...</p></div>
  
  const pendingItems = items.filter((it) => (it.status || 'pending') !== 'complete')
  const processedItems = items.filter((it) => (it.status || 'pending') === 'complete')

  return (
    <div className="requests-container">
      <div className="requests-header">
        <h3>Quote Requests</h3>
        <span className="pending-badge">{pendingItems.length} Pending</span>
      </div>
      
      <div className="requests-section">
        <h4>Pending Quotes</h4>
        {pendingItems.length === 0 && <p className="empty-state">No pending quote requests.</p>}
        <div className="requests-grid">
          {pendingItems.map((it) => (
            <div key={it.id} className="request-card">
              <div className="request-header">
                <strong>{it.customer_name}</strong>
                <span className="status-badge pending">Pending</span>
              </div>
              <div className="request-details">
                <p><strong>Phone:</strong> {it.phone}</p>
                <p><strong>Email:</strong> {it.email || '-'}</p>
                <p><strong>Details:</strong> {it.details || '-'}</p>
                <p><strong>Requested:</strong> {new Date(it.requested_at).toLocaleString()}</p>
              </div>
              <div className="request-action">
                <label>Status:</label>
                <select value={it.status} onChange={(e) => onStatusChange(it.id, e.target.value)}>
                  <option value="pending">Pending</option>
                  <option value="complete">Complete</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="requests-section">
        <h4>Processed Quotations</h4>
        {processedItems.length === 0 && <p className="empty-state">No processed quotations yet.</p>}
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Date Requested</th>
                <th>Date Processed</th>
              </tr>
            </thead>
            <tbody>
              {processedItems.map((it) => (
                <tr key={it.id}>
                  <td>{it.customer_name}</td>
                  <td>{it.phone}</td>
                  <td>{it.email || '-'}</td>
                  <td>{new Date(it.requested_at).toLocaleString()}</td>
                  <td>{it.processed_at ? new Date(it.processed_at).toLocaleString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
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

  if (loading) return <div className="loading-state"><div className="spinner"></div><p>Loading service requests...</p></div>

  return (
    <div className="requests-container">
      <div className="requests-header">
        <h3>Service Requests</h3>
        <span className="pending-badge">{items.length} Total</span>
      </div>
      
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Service/Product</th>
              <th>Location</th>
              <th>Date</th>
              <th>Fee</th>
              <th>Payment Status</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id}>
                <td>{it.customer_name}</td>
                <td>{it.phone}</td>
                <td>{it.product}</td>
                <td>{it.customer_location}</td>
                <td>{it.preferred_date ? String(it.preferred_date).slice(0, 10) : '-'}</td>
                <td className="text-right">{fmtMK(it.product_price)}</td>
                <td>
                  <select value={it.payment_status || 'pending'} onChange={(e) => onPaymentStatusChange(it.id, e.target.value)} className="status-select">
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                  </select>
                </td>
                <td>
                  <select value={it.status || 'pending'} onChange={(e) => onStatusChange(it.id, e.target.value)} className="status-select">
                    <option value="pending">Pending</option>
                    <option value="complete">Complete</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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

  if (loading) return <div className="loading-state"><div className="spinner"></div><p>Loading subscribers...</p></div>

  return (
    <div className="data-table-container">
      <div className="data-table-header">
        <h3>Newsletter Subscribers</h3>
        <span>{subscribers.length} subscribers</span>
      </div>
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Subscribed At</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map((sub) => (
              <tr key={sub.id}>
                <td>{sub.email}</td>
                <td>{new Date(sub.subscribed_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
    <div className="admin-services-modern">
      <div className="admin-grid-modern">
        <div className="admin-list-modern">
          <div className="admin-list-header">
            <h3>Services</h3>
            <span>{services.length} services</span>
          </div>
          <div className="services-list">
            {services.map((s) => (
              <div key={s.id} className="service-item-admin">
                {s.image_url && <img src={s.image_url} alt={s.name} className="service-image" />}
                <div className="service-info">
                  <strong>{s.name}</strong>
                  <p>{s.description || '-'}</p>
                  <div className="service-price">{fmtMK(s.price)}</div>
                  <div className="service-actions">
                    <button type="button" onClick={() => startEdit(s)}>Edit</button>
                    <button type="button" onClick={() => del(s.id)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="admin-form-modern">
          <div className="form-header">
            <h4>{editing ? 'Edit Service' : 'Create New Service'}</h4>
          </div>
          <form onSubmit={submit}>
            <div className="form-group-admin">
              <label>Service Name</label>
              <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group-admin">
              <label>Description</label>
              <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows="3" />
            </div>
            <div className="form-group-admin">
              <label>Service Image</label>
              <input type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
              {selectedFile && <div className="image-preview"><img src={URL.createObjectURL(selectedFile)} alt="service preview" /></div>}
              {form.image_url && !selectedFile && <div className="image-preview"><img src={form.image_url} alt="service preview" /></div>}
            </div>
            <div className="form-group-admin">
              <label>Price (MWK)</label>
              <input type="number" step="0.01" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
            <div className="form-actions-admin">
              <button type="submit" className="save-btn">Save Service</button>
              {editing && <button type="button" className="cancel-btn" onClick={() => { setEditing(null); setForm({ name: '', description: '', image_url: '', price: '' }); setSelectedFile(null) }}>Cancel</button>}
            </div>
          </form>
        </div>
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

  if (loading) return <div className="loading-state"><div className="spinner"></div><p>Loading quotation report...</p></div>
  if (!report) return <p className="error-state">Failed to load quotation report</p>

  const completionRate = report.totalQuotes > 0 ? ((report.byStatus?.complete || 0) / report.totalQuotes * 100).toFixed(1) : 0

  return (
    <div className="report-container-modern">
      <div className="report-header">
        <h3>📝 Quotation Report</h3>
        <p>Quote request analytics and trends</p>
      </div>

      <div className="metrics-grid">
        <div className="metric-card total-quotes">
          <div className="metric-icon">📋</div>
          <div className="metric-info">
            <div className="metric-label">Total Quotations</div>
            <div className="metric-value">{report.totalQuotes}</div>
          </div>
        </div>

        <div className="metric-card pending-quotes">
          <div className="metric-icon">⏳</div>
          <div className="metric-info">
            <div className="metric-label">Pending</div>
            <div className="metric-value">{report.byStatus?.pending ?? 0}</div>
          </div>
        </div>

        <div className="metric-card completed-quotes">
          <div className="metric-icon">✅</div>
          <div className="metric-info">
            <div className="metric-label">Completed</div>
            <div className="metric-value">{report.byStatus?.complete ?? 0}</div>
          </div>
        </div>

        <div className="metric-card completion-rate">
          <div className="metric-icon">📊</div>
          <div className="metric-info">
            <div className="metric-label">Completion Rate</div>
            <div className="metric-value">{completionRate}%</div>
          </div>
        </div>
      </div>

      <div className="highlights-card">
        <h4>📊 Peak Activity</h4>
        <div>
          <div className="highlight-label">Peak Quote Day</div>
          <div className="highlight-value">{report.peakDay ? `${report.peakDay.date} (${report.peakDay.count} quotes)` : 'N/A'}</div>
        </div>
      </div>

      <div className="data-table-container">
        <h4>📈 Daily Quote Trends</h4>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th className="text-right">Quote Count</th>
                <th className="text-right">% of Total</th>
              </tr>
            </thead>
            <tbody>
              {(report.daily || []).map((d, idx) => (
                <tr key={d.date}>
                  <td>{d.date}</td>
                  <td className="text-right">{d.count}</td>
                  <td className="text-right percentage-value">{((d.count / report.totalQuotes) * 100).toFixed(1)}%</td>
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
    <div className="admin-dashboard-modern">
      <div className="admin-header-modern">
        <div className="admin-title">
          <h2>Admin Dashboard</h2>
          <p>Manage your store, products, and orders</p>
        </div>
        <button onClick={logout} className="logout-btn">Logout</button>
      </div>

      <div className="admin-tabs-modern">
        {/* Settings Tab Group */}
        <div className="tab-group">
          <div className="tab-group-label">⚙️ Settings</div>
          <div className="tab-buttons">
            <button className={view === 'products' ? 'tab-active' : 'tab-inactive'} onClick={() => setView('products')}>Products</button>
            <button className={view === 'services' ? 'tab-active' : 'tab-inactive'} onClick={() => setView('services')}>Services</button>
            <button className={view === 'categories' ? 'tab-active' : 'tab-inactive'} onClick={() => setView('categories')}>Categories</button>
            <button className={view === 'newsletter' ? 'tab-active' : 'tab-inactive'} onClick={() => setView('newsletter')}>Newsletter</button>
          </div>
        </div>

        {/* Reports & Orders Tab Group */}
        <div className="tab-group">
          <div className="tab-group-label">📊 Reports & Orders</div>
          <div className="tab-buttons">
            <button className={view === 'sales' ? 'tab-active' : 'tab-inactive'} onClick={() => setView('sales')}>Sales Report</button>
            <button className={view === 'quote-report' ? 'tab-active' : 'tab-inactive'} onClick={() => setView('quote-report')}>Quotation Report</button>
            <button className={view === 'paid' ? 'tab-active' : 'tab-inactive'} onClick={() => setView('paid')}>Paid Items</button>
            <button className={view === 'quotes' ? 'tab-active' : 'tab-inactive'} onClick={() => setView('quotes')}>Quote Requests</button>
            <button className={view === 'service-requests' ? 'tab-active' : 'tab-inactive'} onClick={() => setView('service-requests')}>Service Requests</button>
          </div>
        </div>
      </div>

      <div className="admin-content-modern">
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
    </div>
  )
}