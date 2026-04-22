import React, { useState } from 'react'

const fmtMK = (val) => {
  const n = Number(val)
  if (val == null || val === '' || Number.isNaN(n)) return ''
  return `MK ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const WHATSAPP_NUMBER = '265995718815' // WhatsApp number without + or spaces

export default function Cart({ items, onRemove, onUpdateItem, onCheckoutNavigate, onQuoteNavigate, onBack, onRequestInstallation, onRequestDelivery, presenter }){
  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [transactionRef, setTransactionRef] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')

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

  function sendViaWhatsApp() {
    if (!transactionRef.trim()) {
      alert('Please enter your transaction reference number')
      return
    }
    if (!paymentMethod) {
      alert('Please select the payment method used')
      return
    }

    const cartSummary = items.map(item => {
      let itemTotal = (Number(item.price)||0) * (item.quantity || 1)
      if (item.installation_selected) itemTotal += Number(item.installation_price)||0
      if (item.delivery_selected) itemTotal += Number(item.delivery_price)||0
      return `${item.name} (Qty: ${item.quantity || 1}) - MK ${itemTotal.toFixed(2)}`
    }).join('\n')

    const message = `*PAYMENT CONFIRMATION*\n\n*Transaction Reference:* ${transactionRef}\n*Payment Method:* ${paymentMethod}\n*Total Amount:* MK ${total.toFixed(2)}\n\n*Items:*\n${cartSummary}\n\nPlease confirm receipt and process my order. Thank you!`

    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`
    
    window.open(whatsappUrl, '_blank')
    setShowTransactionModal(false)
    setTransactionRef('')
    setPaymentMethod('')
  }

  function goToCheckout(){
    if(items.length===0) return alert('Your cart is empty')
    onCheckoutNavigate && onCheckoutNavigate()
  }

  return (
    <div className="cart-container">
      {/* Header */}
      <div className="cart-header">
        <div className="cart-header-content">
          <h1>Shopping Cart</h1>
          <button
            type="button"
            onClick={() => onBack && onBack()}
            className="cart-back-btn"
          >
            ← Back to Products
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="cart-empty">
          <div className="empty-state">
            <div className="empty-icon">🛒</div>
            <h2>Your Cart is Empty</h2>
            <p>Add some products to get started</p>
            <button onClick={() => onBack && onBack()} className="btn-primary">
              Continue Shopping
            </button>
          </div>
        </div>
      ) : (
        <div className="cart-content">
          {/* Items List */}
          <div className="cart-items-section">
            <h2>Items in Cart</h2>
            <div className="cart-items">
              {items.map((it, idx)=> {
                const savings = it.discount_percent > 0 ? (Number(it.original_price) || 0) - (Number(it.price) || 0) : 0
                const basePrice = Number(it.price)||0
                const itemTotal = (basePrice + (it.installation_selected ? Number(it.installation_price)||0 : 0) + (it.delivery_selected ? Number(it.delivery_price)||0 : 0)) * (it.quantity || 1)
                const quantity = it.quantity || 1

                return (
                  <div key={idx} className="cart-item">
                    <div className="cart-item-header">
                      <div className="cart-item-info">
                        <h3 className="cart-item-name">{it.name}</h3>
                        <div className="cart-item-price">
                          {it.discount_percent > 0 ? (
                            <>
                              <span className="price-original">{fmtMK(it.original_price)}</span>
                              <span className="price-sale">{fmtMK(it.price)}</span>
                              <span className="discount-badge">{it.discount_percent}% OFF</span>
                            </>
                          ) : (
                            <span className="price-sale">{fmtMK(it.price)}</span>
                          )}
                        </div>
                        {savings > 0 && <div className="savings-label">💰 Saved: {fmtMK(savings)}</div>}
                      </div>

                      <div className="cart-item-quantity">
                        <label>Quantity</label>
                        <div className="qty-control">
                          <button onClick={() => onUpdateItem(idx, { quantity: Math.max(1, (it.quantity || 1) - 1) })}>−</button>
                          <input 
                            type="number" 
                            value={quantity} 
                            onChange={(e) => onUpdateItem(idx, { quantity: Math.max(1, Number(e.target.value) || 1) })}
                            min="1"
                          />
                          <button onClick={() => onUpdateItem(idx, { quantity: (it.quantity || 1) + 1 })}>+</button>
                        </div>
                      </div>

                      <div className="cart-item-total">
                        <label>Total</label>
                        <div className="item-total-value">{fmtMK(itemTotal)}</div>
                      </div>

                      <button 
                        onClick={()=>onRemove(idx)} 
                        className="cart-item-remove"
                        title="Remove item"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Services */}
                    <div className="cart-item-services">
                      {/* Installation Option */}
                      {it.installation_price && (
                        <div className="service-option">
                          <label className="service-checkbox">
                            <input
                              type="checkbox"
                              checked={it.installation_selected || false}
                              onChange={(e) => onUpdateItem(idx, { installation_selected: e.target.checked })}
                            />
                            <span className="service-label">
                              <span className="service-icon">🔧</span>
                              Installation Service
                              <span className="service-price">+{fmtMK(it.installation_price)}</span>
                            </span>
                          </label>
                          {it.installation_selected && (
                            <div className="service-details">
                              <input
                                type="text"
                                placeholder="Installation Location"
                                value={it.installation_location || ''}
                                onChange={(e) => onUpdateItem(idx, { installation_location: e.target.value })}
                              />
                              <input
                                type="date"
                                value={it.installation_date || ''}
                                onChange={(e) => onUpdateItem(idx, { installation_date: e.target.value })}
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Delivery Option */}
                      {it.delivery_price && (
                        <div className="service-option">
                          <label className="service-checkbox">
                            <input
                              type="checkbox"
                              checked={it.delivery_selected || false}
                              onChange={(e) => onUpdateItem(idx, { delivery_selected: e.target.checked })}
                            />
                            <span className="service-label">
                              <span className="service-icon">🚚</span>
                              Delivery Service
                              <span className="service-price">+{fmtMK(it.delivery_price)}</span>
                            </span>
                          </label>
                          {it.delivery_selected && (
                            <div className="service-details">
                              <input
                                type="text"
                                placeholder="Delivery Address"
                                value={it.delivery_address || ''}
                                onChange={(e) => onUpdateItem(idx, { delivery_address: e.target.value })}
                              />
                              <input
                                type="tel"
                                placeholder="Phone Number"
                                value={it.delivery_phone || ''}
                                onChange={(e) => onUpdateItem(idx, { delivery_phone: e.target.value })}
                              />
                              <textarea
                                placeholder="Additional Delivery Details"
                                value={it.delivery_details || ''}
                                onChange={(e) => onUpdateItem(idx, { delivery_details: e.target.value })}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="cart-sidebar">
            {/* Order Summary */}
            <div className="order-summary">
              <h3>Order Summary</h3>
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>{fmtMK(totalBefore)}</span>
              </div>
              {totalSavings > 0 && (
                <div className="summary-row savings">
                  <span>💰 Discount:</span>
                  <span>-{fmtMK(totalSavings)}</span>
                </div>
              )}
              <div className="summary-divider"></div>
              <div className="summary-row total">
                <span>Total Amount:</span>
                <span>{fmtMK(total)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="cart-actions">
              <button 
                className="btn-primary btn-full"
                onClick={() => setShowTransactionModal(true)}
                disabled={items.length===0}
              >
                💬 proceed to payment
              </button>
              <button 
                className="btn-secondary btn-full"
                onClick={() => onQuoteNavigate && onQuoteNavigate()} 
                disabled={items.length===0}
              >
                📋 Request a Quote
              </button>
            </div>

            {/* Payment Methods */}
            <div className="payment-card">
              <h4>Payment Methods</h4>
              <div className="payment-method-item">
                <span className="payment-icon">💬</span>
                <div>
                  <strong>WhatsApp</strong>
                  <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer">
                    +265 995 718 815
                  </a>
                </div>
              </div>
              <div className="payment-note">
                Send your payment proof and transaction reference via WhatsApp for quick processing
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Modal */}
      {showTransactionModal && (
        <div className="modal-overlay" onClick={() => setShowTransactionModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Send Payment Receipt</h2>
              <button 
                className="modal-close"
                onClick={() => setShowTransactionModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <p className="modal-subtitle">Share your payment details with us via WhatsApp</p>

              <div className="form-group">
                <label>Select Payment Method</label>
                <select 
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="form-select"
                >
                  <option value="">-- Choose Payment Method --</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Mobile Money (TNM)">Mobile Money - TNM</option>
                  <option value="Mobile Money (Airtel)">Mobile Money - Airtel</option>
                  <option value="Cash Payment">Cash Payment</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <div className="form-group">
                <label>Transaction Reference Number</label>
                <input
                  type="text"
                  placeholder="e.g., TXN123456789 or receipt number"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  className="form-input"
                />
                <small>Enter your bank/mobile money transaction ID or receipt number</small>
              </div>

              <div className="order-preview">
                <h4>Order Summary</h4>
                <div className="preview-items">
                  {items.map((item, idx) => (
                    <div key={idx} className="preview-item">
                      <span>{item.name} × {item.quantity || 1}</span>
                      <span>{fmtMK((Number(item.price)||0) * (item.quantity || 1))}</span>
                    </div>
                  ))}
                </div>
                <div className="preview-total">
                  <strong>Total: {fmtMK(total)}</strong>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setShowTransactionModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={sendViaWhatsApp}
              >
                💬 Send via WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
