import React, { useState } from 'react'

const fmtMK = (val) => {
  const n = Number(val)
  if (val == null || val === '' || Number.isNaN(n)) return ''
  return `MK ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const WHATSAPP_NUMBER = '265995718815'

export default function Cart({ items, onRemove, onUpdateItem, onCheckoutNavigate, onQuoteNavigate, onBack, onRequestInstallation, onRequestDelivery, presenter }) {
  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [transactionRef, setTransactionRef] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')

  const total = items.reduce((s, i) => {
    let price = Number(i.price) || 0
    if (i.installation_selected) price += Number(i.installation_price) || 0
    if (i.delivery_selected) price += Number(i.delivery_price) || 0
    return s + (price * (i.quantity || 1))
  }, 0)

  const totalBefore = items.reduce((s, i) => {
    let before = i.discount_percent > 0 ? (Number(i.original_price) || 0) : (Number(i.price) || 0)
    if (i.installation_selected) before += Number(i.installation_price) || 0
    if (i.delivery_selected) before += Number(i.delivery_price) || 0
    return s + (before * (i.quantity || 1))
  }, 0)

  const totalSavings = totalBefore - total

  async function submitPaymentToBackend() {
    const paymentData = {
      customer_name: customerName.trim(),
      phone: customerPhone.trim(),
      method_used: paymentMethod,
      transaction_reference: transactionRef,
      product_details: items.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        quantity: item.quantity || 1,
        price: Number(item.price) || 0,
        original_price: Number(item.original_price) || 0,
        discount_percent: item.discount_percent || 0,
        installation_selected: item.installation_selected || false,
        installation_price: Number(item.installation_price) || 0,
        delivery_selected: item.delivery_selected || false,
        delivery_price: Number(item.delivery_price) || 0
      }))
    }
    return await presenter.createPaymentReference(paymentData)
  }

  async function submitPaymentReference() {
    if (!customerName.trim()) {
      alert('Please enter your name')
      return
    }
    if (!customerPhone.trim()) {
      alert('Please enter your phone number')
      return
    }
    if (!transactionRef.trim()) {
      alert('Please enter your transaction reference number')
      return
    }
    if (!paymentMethod) {
      alert('Please select the payment method used')
      return
    }

    setSubmitting(true)
    try {
      const response = await submitPaymentToBackend()
      const orderId = response?.order_id || 'N/A'
      const hasDelivery = items.some(item => item.delivery_selected)
      
      let deliveryInfo = ''
      if (hasDelivery) {
        const deliveryDate = new Date()
        deliveryDate.setDate(deliveryDate.getDate() + 1)
        while (deliveryDate.getDay() === 0 || deliveryDate.getDay() === 6) {
          deliveryDate.setDate(deliveryDate.getDate() + 1)
        }
        deliveryInfo = `\n✓ Expected Delivery: ${deliveryDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`
      } else {
        deliveryInfo = `\n✓ Collection Pickup: Available at our store location\n   Contact us at +265 (0)995 718 815 for pickup details`
      }
      
      alert(`✅ Payment Received!\n\nOrder ID: ${orderId}${deliveryInfo}\n\nOur team will process your order shortly and contact you for confirmation.`)
      
      setShowTransactionModal(false)
      setTransactionRef('')
      setPaymentMethod('')
      setCustomerName('')
      setCustomerPhone('')
      return response
    } catch (err) {
      const errMsg = err?.response?.data?.error || err?.message || 'Failed to submit payment'
      alert(`Error: ${errMsg}`)
      throw err
    } finally {
      setSubmitting(false)
    }
  }

  async function sendViaWhatsApp() {
    if (!customerName.trim()) {
      alert('Please enter your name')
      return
    }
    if (!customerPhone.trim()) {
      alert('Please enter your phone number')
      return
    }
    if (!transactionRef.trim()) {
      alert('Please enter your transaction reference number')
      return
    }
    if (!paymentMethod) {
      alert('Please select the payment method used')
      return
    }

    setSubmitting(true)
    try {
      const response = await submitPaymentToBackend()
      const orderId = response?.order_id || 'N/A'
      const hasDelivery = items.some(item => item.delivery_selected)
      
      let deliveryInfo = ''
      if (hasDelivery) {
        const deliveryDate = new Date()
        deliveryDate.setDate(deliveryDate.getDate() + 1)
        while (deliveryDate.getDay() === 0 || deliveryDate.getDay() === 6) {
          deliveryDate.setDate(deliveryDate.getDate() + 1)
        }
        deliveryInfo = `\n✓ Expected Delivery: ${deliveryDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`
      } else {
        deliveryInfo = `\n✓ Collection Pickup: Available at our store location\n   Contact us at +265 (0)995 718 815 for pickup details`
      }

      const cartSummary = items.map(item => {
        let itemTotal = (Number(item.price) || 0) * (item.quantity || 1)
        if (item.installation_selected) itemTotal += Number(item.installation_price) || 0
        if (item.delivery_selected) itemTotal += Number(item.delivery_price) || 0
        return `${item.name} (Qty: ${item.quantity || 1}) - MK ${itemTotal.toFixed(2)}`
      }).join('\n')

      const message = `*PAYMENT CONFIRMATION*\n\n*Order ID:* ${orderId}\n*Name:* ${customerName}\n*Phone:* ${customerPhone}\n*Transaction Reference:* ${transactionRef}\n*Payment Method:* ${paymentMethod}\n*Total Amount:* MK ${total.toFixed(2)}\n\n*Items:*\n${cartSummary}\n\nPlease confirm receipt and process my order. Thank you!`

      const encodedMessage = encodeURIComponent(message)
      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`
      
      window.open(whatsappUrl, '_blank')
      
      alert(`✅ Payment Received!\n\nOrder ID: ${orderId}${deliveryInfo}\n\nWhatsApp message opened. Please send the payment confirmation.\nOur team will process your order shortly.`)
      
      setShowTransactionModal(false)
      setTransactionRef('')
      setPaymentMethod('')
      setCustomerName('')
      setCustomerPhone('')
    } catch (err) {
      const errMsg = err?.response?.data?.error || err?.message || 'Failed to submit payment'
      alert(`Error: ${errMsg}`)
    } finally {
      setSubmitting(false)
    }
  }

  function goToCheckout() {
    if (items.length === 0) return alert('Your cart is empty')
    onCheckoutNavigate && onCheckoutNavigate()
  }

  return (
    <div className="cart-container-modern">
      {/* Header */}
      <div className="cart-header-modern">
        <div className="cart-header-content-modern">
          <div className="cart-header-left">
            <h1>Shopping Cart</h1>
            <p className="cart-header-subtitle">{items.length} {items.length === 1 ? 'item' : 'items'} in your cart</p>
          </div>
          <button type="button" onClick={() => onBack && onBack()} className="cart-back-btn-modern">
            ← Continue Shopping
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="cart-empty-modern">
          <div className="empty-state-modern">
            <div className="empty-icon-modern">🛒</div>
            <h2>Your Cart is Empty</h2>
            <p>Looks like you haven't added any items yet. Browse our products and find something you'll love!</p>
            <button onClick={() => onBack && onBack()} className="empty-cart-btn">
              Continue Shopping →
            </button>
          </div>
        </div>
      ) : (
        <div className="cart-content-modern">
          {/* Items Section */}
          <div className="cart-items-section-modern">
            <div className="cart-items-header">
              <h2>Cart Items</h2>
              <span>{items.length} items</span>
            </div>
            
            <div className="cart-items-list">
              {items.map((it, idx) => {
                const savings = it.discount_percent > 0 ? (Number(it.original_price) || 0) - (Number(it.price) || 0) : 0
                const basePrice = Number(it.price) || 0
                const itemTotal = (basePrice + (it.installation_selected ? Number(it.installation_price) || 0 : 0) + (it.delivery_selected ? Number(it.delivery_price) || 0 : 0)) * (it.quantity || 1)
                const quantity = it.quantity || 1

                return (
                  <div key={idx} className="cart-item-modern">
                    <div className="cart-item-main">
                      <div className="cart-item-info-modern">
                        <h3 className="cart-item-name-modern">{it.name}</h3>
                        <div className="cart-item-meta">
                          {it.discount_percent > 0 && (
                            <span className="discount-badge-modern">{it.discount_percent}% OFF</span>
                          )}
                          {savings > 0 && (
                            <span className="savings-badge-modern">Save {fmtMK(savings)}</span>
                          )}
                        </div>
                        <div className="cart-item-price-modern">
                          {it.discount_percent > 0 ? (
                            <>
                              <span className="old-price-modern">{fmtMK(it.original_price)}</span>
                              <span className="new-price-modern">{fmtMK(it.price)}</span>
                            </>
                          ) : (
                            <span className="new-price-modern">{fmtMK(it.price)}</span>
                          )}
                        </div>
                      </div>

                      <div className="cart-item-quantity-modern">
                        <label>Quantity</label>
                        <div className="qty-control-modern">
                          <button onClick={() => onUpdateItem(idx, { quantity: Math.max(1, quantity - 1) })}>−</button>
                          <input 
                            type="number" 
                            value={quantity} 
                            onChange={(e) => onUpdateItem(idx, { quantity: Math.max(1, Number(e.target.value) || 1) })}
                            min="1"
                          />
                          <button onClick={() => onUpdateItem(idx, { quantity: quantity + 1 })}>+</button>
                        </div>
                      </div>

                      <div className="cart-item-total-modern">
                        <label>Total</label>
                        <div className="item-total-value-modern">{fmtMK(itemTotal)}</div>
                      </div>

                      <button onClick={() => onRemove(idx)} className="cart-item-remove-modern" title="Remove item">
                        ✕
                      </button>
                    </div>

                    {/* Services Section */}
                    {(it.installation_price || it.delivery_price) && (
                      <div className="cart-item-services-modern">
                        {it.installation_price && (
                          <div className="service-option-modern">
                            <label className="service-checkbox-modern">
                              <input
                                type="checkbox"
                                checked={it.installation_selected || false}
                                onChange={(e) => onUpdateItem(idx, { installation_selected: e.target.checked })}
                              />
                              <span className="service-label-modern">
                                <span className="service-icon-modern">🔧</span>
                                Professional Installation
                                <span className="service-price-modern">+{fmtMK(it.installation_price)}</span>
                              </span>
                            </label>
                            {it.installation_selected && (
                              <div className="service-details-modern">
                                <input
                                  type="text"
                                  placeholder="Installation Location / Address"
                                  value={it.installation_location || ''}
                                  onChange={(e) => onUpdateItem(idx, { installation_location: e.target.value })}
                                  className="service-input"
                                />
                                <input
                                  type="date"
                                  value={it.installation_date || ''}
                                  onChange={(e) => onUpdateItem(idx, { installation_date: e.target.value })}
                                  className="service-input"
                                />
                              </div>
                            )}
                          </div>
                        )}

                        {it.delivery_price && (
                          <div className="service-option-modern">
                            <label className="service-checkbox-modern">
                              <input
                                type="checkbox"
                                checked={it.delivery_selected || false}
                                onChange={(e) => onUpdateItem(idx, { delivery_selected: e.target.checked })}
                              />
                              <span className="service-label-modern">
                                <span className="service-icon-modern">🚚</span>
                                Delivery Service
                                <span className="service-price-modern">+{fmtMK(it.delivery_price)}</span>
                              </span>
                            </label>
                            {it.delivery_selected && (
                              <div className="service-details-modern">
                                <input
                                  type="text"
                                  placeholder="Delivery Address"
                                  value={it.delivery_address || ''}
                                  onChange={(e) => onUpdateItem(idx, { delivery_address: e.target.value })}
                                  className="service-input"
                                />
                                <input
                                  type="tel"
                                  placeholder="Contact Phone Number"
                                  value={it.delivery_phone || ''}
                                  onChange={(e) => onUpdateItem(idx, { delivery_phone: e.target.value })}
                                  className="service-input"
                                />
                                <textarea
                                  placeholder="Additional delivery instructions"
                                  value={it.delivery_details || ''}
                                  onChange={(e) => onUpdateItem(idx, { delivery_details: e.target.value })}
                                  className="service-textarea"
                                  rows="2"
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="cart-sidebar-modern">
            <div className="order-summary-modern">
              <h3>Order Summary</h3>
              
              <div className="summary-row-modern">
                <span>Subtotal</span>
                <span>{fmtMK(totalBefore)}</span>
              </div>
              
              {totalSavings > 0 && (
                <div className="summary-row-modern savings">
                  <span>Discount</span>
                  <span>-{fmtMK(totalSavings)}</span>
                </div>
              )}
              
              <div className="summary-divider-modern"></div>
              
              <div className="summary-row-modern total">
                <span>Total Amount</span>
                <span>{fmtMK(total)}</span>
              </div>
              
              <div className="summary-note">
                <p>✓ Free delivery on orders above MK 50,000</p>
                <p>✓ 14-day return policy</p>
                <p>✓ 1-year warranty on all products</p>
              </div>
            </div>

            <div className="cart-actions-modern">
              <button 
                className="checkout-btn-modern"
                onClick={() => setShowTransactionModal(true)}
                disabled={items.length === 0}
              >
                💳 Proceed to Payment
              </button>
              <button 
                className="quote-btn-modern"
                onClick={() => onQuoteNavigate && onQuoteNavigate()} 
                disabled={items.length === 0}
              >
                📋 Request a Quote
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Modal */}
      {showTransactionModal && (
        <div className="modal-overlay-modern" onClick={() => setShowTransactionModal(false)}>
          <div className="modal-content-modern" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-modern">
              <h2>Complete Payment</h2>
              <button className="modal-close-modern" onClick={() => setShowTransactionModal(false)}>✕</button>
            </div>

            <div className="modal-body-modern">
              {/* Payment Methods */}
              <div className="payment-methods-card">
                <h4>💰 Payment Methods</h4>
                <div className="payment-methods-grid">
                  <div className="payment-method-item">
                    <span className="payment-icon">🏦</span>
                    <div>
                      <strong>National Bank</strong>
                      <div className="payment-detail">Account: 76648848</div>
                    </div>
                  </div>
                  <div className="payment-method-item">
                    <span className="payment-icon">📱</span>
                    <div>
                      <strong>Airtel Money</strong>
                      <div className="payment-detail">Code: 677744</div>
                    </div>
                  </div>
                  <div className="payment-method-item">
                    <span className="payment-icon">💳</span>
                    <div>
                      <strong>Mpamba</strong>
                      <div className="payment-detail">Code: 87765</div>
                    </div>
                  </div>
                </div>
              </div>

              <p className="modal-subtitle-modern">Enter your payment details to complete the order</p>

              <div className="form-group-modern">
                <label>Full Name *</label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="form-input-modern"
                />
              </div>

              <div className="form-group-modern">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  placeholder="e.g., 0995718815"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="form-input-modern"
                />
              </div>

              <div className="form-group-modern">
                <label>Payment Method *</label>
                <select 
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="form-select-modern"
                >
                  <option value="">Select payment method</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Airtel Money">Airtel Money</option>
                  <option value="Mpamba">Mpamba</option>
                  <option value="Cash Payment">Cash Payment</option>
                </select>
              </div>

              <div className="form-group-modern">
                <label>Transaction Reference *</label>
                <input
                  type="text"
                  placeholder="Enter transaction reference number"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  className="form-input-modern"
                />
                <small>Enter the transaction ID or receipt number</small>
              </div>

              <div className="order-preview-modern">
                <h4>Order Preview</h4>
                <div className="preview-items-modern">
                  {items.map((item, idx) => (
                    <div key={idx} className="preview-item-modern">
                      <span>{item.name} × {item.quantity || 1}</span>
                      <span>{fmtMK((Number(item.price) || 0) * (item.quantity || 1))}</span>
                    </div>
                  ))}
                </div>
                <div className="preview-total-modern">
                  <span>Total:</span>
                  <strong>{fmtMK(total)}</strong>
                </div>
              </div>
            </div>

            <div className="modal-footer-modern">
              <button className="cancel-btn-modern" onClick={() => setShowTransactionModal(false)}>
                Cancel
              </button>
              <button className="submit-btn-modern" onClick={submitPaymentReference} disabled={submitting}>
                {submitting ? 'Processing...' : 'Submit Payment'}
              </button>
              <button className="whatsapp-btn-modern" onClick={sendViaWhatsApp} disabled={submitting}>
                💬 Send via WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}