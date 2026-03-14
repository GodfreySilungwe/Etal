import React, { useEffect, useState } from 'react'

const fmtMK = (val) => {
  const n = Number(val)
  if (val == null || val === '' || Number.isNaN(n)) return ''
  return `MK ${n.toFixed(2)}`
}

export default function Products({ presenter, onSelect, onAddToCart, onRequestInstallation, onRequestDelivery }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [items, setItems] = useState(["fridge","phones"])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)

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
            <div
              key={p.id}
              className="card"
              style={{
                cursor: 'pointer',
                backgroundImage: p.image_url ? `url(${p.image_url})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: p.image_url ? 'white' : 'inherit'
              }}
              onClick={() => onSelect(p.id)}
            >
              <div style={{ background: p.image_url ? 'rgba(0,0,0,0.6)' : 'transparent', padding: '14px', borderRadius: '12px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3>{p.name}</h3>
                  <p style={{ margin: 0, opacity: 0.9 }}>{p.category}</p>
                </div>

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
                  <p style={{ margin: '6px 0 0', fontSize: '0.9rem', opacity: 0.9 }}>Stock: {p.stock ?? 0}</p>
                  <button style={{ marginTop: 10, width: '100%', padding: '10px 0', borderRadius: 8, border: 'none', background: 'var(--primary)', color: 'white', cursor: 'pointer' }} onClick={(e)=>{ e.stopPropagation(); onAddToCart(p) }}>Add to cart</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
