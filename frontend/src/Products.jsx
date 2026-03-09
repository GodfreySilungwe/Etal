import React, { useEffect, useState } from 'react'

export default function Products({ presenter, onSelect }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [items, setItems] = useState([])
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
            <div key={p.id} className="card" style={{ cursor: 'pointer' }} onClick={() => onSelect(p.id)}>
              <h3>{p.name}</h3>
              <p>{p.category}</p>
              <p>{p.description}</p>
              <p>Price: {p.price}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
