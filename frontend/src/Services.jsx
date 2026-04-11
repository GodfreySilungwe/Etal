import React, { useEffect, useState } from 'react'

const fmtMK = (val) => {
  const n = Number(val)
  if (val == null || val === '' || Number.isNaN(n)) return ''
  return `MWK ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function Services({ presenter, setView, onRequestInstallation }) {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const rows = await presenter.getServices()
        setServices(Array.isArray(rows) ? rows : [])
      } catch (err) {
        console.error(err)
        setServices([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [presenter])

  function requestService(service) {
    if (onRequestInstallation) {
      onRequestInstallation({ id: `service-${service.id}`, name: service.name }, service.price)
      return
    }
    setView('installation')
  }

  return (
    <div>
      <h1>Services & Installations</h1>

      {loading ? (
        <p>Loading services...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          {services.map((s) => (
            <div key={s.id} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.9)', color: '#111827', borderRadius: 12, padding: 16 }}>
              {s.image_url && (
                <img
                  src={s.image_url}
                  alt={s.name}
                  style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px' }}
                />
              )}
              <h3>{s.name}</h3>
              <p>{s.description || 'No description provided.'}</p>
              <p><strong>{fmtMK(s.price)}</strong></p>
              <button className="buy-like-btn" onClick={() => requestService(s)}>Request Service</button>
            </div>
          ))}
          {services.length === 0 && <p>No services have been added yet.</p>}
        </div>
      )}

      <div style={{ marginTop: '40px' }}>
        <h2>Request a Service</h2>
        <p>Use service cards above or request delivery below.</p>
        <div style={{ display: 'flex', gap: '20px' }}>
          <button onClick={() => setView('installation')}>Installation Request</button>
          <button onClick={() => setView('delivery')}>Delivery Request</button>
        </div>
      </div>
    </div>
  )
}
