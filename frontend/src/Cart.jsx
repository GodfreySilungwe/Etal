import React from 'react'

const fmtMK = (val) => {
  const n = Number(val)
  if (val == null || val === '' || Number.isNaN(n)) return ''
  return `MK ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function Cart({ items, onRemove, onUpdateItem, onCheckoutNavigate, onQuoteNavigate, onRequestInstallation, onRequestDelivery, presenter }){
  const total = items.reduce((s,i)=>{
    let price = Number(i.price)||0
    if (i.installation_selected) price += Number(i.installation_price)||0
    if (i.delivery_selected) price += Number(i.delivery_price)||0
    return s + (price * (i.quantity || 1))
  }, 0)
  const totalBefore = items.reduce((s,i)=>{
    let before = i.discount_percent > 0 ? (Number(i.original_price)||0) : (Number(i.price)||0)
    if (i.installation_selected) before += Number(i.installation_price)||0
    if (i.delivery_selected) before += Number(i.delivery_price)||0
    return s + (before * (i.quantity || 1))
  }, 0)
  const totalSavings = totalBefore - total

  function goToCheckout(){
    if(items.length===0) return alert('Your cart is empty')
    onCheckoutNavigate && onCheckoutNavigate()
  }

  return (
    <div>
      <h2>Cart</h2>
      {items.length===0 && <p>Your cart is empty</p>}
      <ul>
        {items.map((it, idx)=> {
          const savings = it.discount_percent > 0 ? (Number(it.original_price) || 0) - (Number(it.price) || 0) : 0
          const basePrice = Number(it.price)||0
          const itemTotal = (basePrice + (it.installation_selected ? Number(it.installation_price)||0 : 0) + (it.delivery_selected ? Number(it.delivery_price)||0 : 0)) * (it.quantity || 1)
          const quantity = it.quantity || 1
          return (
            <li key={idx} style={{ marginBottom: 16, padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <strong>{it.name}</strong>
                    <div style={{ fontSize: '1.1em', fontWeight: 'bold', color: 'var(--primary)' }}>Qty: {quantity}</div>
                  </div>
                  {it.discount_percent > 0 ? (
                    <>
                      <div style={{ color: 'var(--danger)', textDecoration: 'line-through' }}>{fmtMK(it.original_price)}</div>
                      <div style={{ color: 'var(--success)', fontWeight: 'bold' }}>{fmtMK(it.price)} <span>({it.discount_percent}% off)</span></div>
                    </>
                  ) : (
                    <div style={{ color: 'var(--success)', fontWeight: 'bold' }}>{fmtMK(it.price)}</div>
                  )}
                  {savings > 0 && <div style={{ color: 'var(--success)' }}>Saved: {fmtMK(savings)}</div>}
                  <div style={{ fontWeight: 'bold', marginTop: '8px' }}>Item Total: {fmtMK(itemTotal)}</div>
                </div>
                <button onClick={()=>onRemove(idx)} style={{ marginLeft: 8, background: 'var(--danger)', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px' }}>Remove</button>
              </div>

              {/* Installation Option */}
              {it.installation_price && (
                <div style={{ marginTop: 12 }}>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={it.installation_selected || false}
                      onChange={(e) => onUpdateItem(idx, { installation_selected: e.target.checked })}
                      style={{ marginRight: 8 }}
                    />
                    Installation (+{fmtMK(it.installation_price)})
                  </label>
                  {it.installation_selected && (
                    <div style={{ marginTop: 8, padding: '8px', background: '#f9f9f9', borderRadius: '4px' }}>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                        <input
                          type="text"
                          placeholder="Customer Location"
                          value={it.installation_location || ''}
                          onChange={(e) => onUpdateItem(idx, { installation_location: e.target.value })}
                          style={{ flex: 1, padding: '4px' }}
                        />
                        <input
                          type="date"
                          value={it.installation_date || ''}
                          onChange={(e) => onUpdateItem(idx, { installation_date: e.target.value })}
                          style={{ flex: 1, padding: '4px' }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Delivery Option */}
              {it.delivery_price && (
                <div style={{ marginTop: 12 }}>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={it.delivery_selected || false}
                      onChange={(e) => onUpdateItem(idx, { delivery_selected: e.target.checked })}
                      style={{ marginRight: 8 }}
                    />
                    Delivery (+{fmtMK(it.delivery_price)})
                  </label>
                  {it.delivery_selected && (
                    <div style={{ marginTop: 8, padding: '8px', background: '#f9f9f9', borderRadius: '4px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <input
                          type="text"
                          placeholder="Delivery Address"
                          value={it.delivery_address || ''}
                          onChange={(e) => onUpdateItem(idx, { delivery_address: e.target.value })}
                          style={{ padding: '4px' }}
                        />
                        <input
                          type="tel"
                          placeholder="Phone"
                          value={it.delivery_phone || ''}
                          onChange={(e) => onUpdateItem(idx, { delivery_phone: e.target.value })}
                          style={{ padding: '4px' }}
                        />
                        <textarea
                          placeholder="Order Details"
                          value={it.delivery_details || ''}
                          onChange={(e) => onUpdateItem(idx, { delivery_details: e.target.value })}
                          style={{ padding: '4px', minHeight: '60px' }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </li>
          )
        })}
      </ul>
      {totalBefore !== total ? (
        <>
          <p style={{ color: 'var(--danger)', fontWeight: 'bold', textDecoration: 'line-through' }}>Original total: {fmtMK(totalBefore)}</p>
          <p style={{ color: 'var(--success)', fontWeight: 'bold' }}>Total after discounts: {fmtMK(total)}</p>
          <p style={{ color: 'var(--success)', fontWeight: 'bold' }}>You save: {fmtMK(totalSavings)}</p>
        </>
      ) : (
        <p style={{ fontWeight: 'bold', color: 'var(--success)' }}>Total: {fmtMK(total)}</p>
      )}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
        <button className="buy-like-btn" onClick={goToCheckout} disabled={items.length===0}>
          Send Transaction Reference
        </button>
        <button className="buy-like-btn" onClick={() => onQuoteNavigate && onQuoteNavigate()} disabled={items.length===0}>
          Request a Quote
        </button>
      </div>
      <div className="payment-methods">
        <h3>Payment Methods</h3>
        <p>Please transfer payment and send proof of payment to WhatsApp: <strong>0995718815</strong>.</p>
        <p><strong>Bank:</strong> National Bank</p>
        <p><strong>Branch:</strong> Lilongwe</p>
        <p><strong>Account Name:</strong> ETAL Enterprises</p>
        <p><strong>Account Number:</strong> 868655</p>
        <p><strong>Airtel Money:</strong> 0995718815</p>
        <p><strong>TNM Mpamba:</strong> 0888481844</p>
      </div>
    </div>
  )
}
