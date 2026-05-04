import React, { useEffect, useState } from 'react'

const fmtMK = (val) => {
  const n = Number(val)
  if (val == null || val === '' || Number.isNaN(n)) return ''
  return `MWK ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function Services({ presenter, setView, onRequestInstallation }) {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedService, setSelectedService] = useState(null)
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: '',
    preferredDate: '',
    notes: ''
  })

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
    setSelectedService(service)
    setShowRequestForm(true)
  }

  function handleFormSubmit(e) {
    e.preventDefault()
    if (onRequestInstallation) {
      onRequestInstallation(
        { 
          id: `service-${selectedService.id}`, 
          name: selectedService.name,
          customer_name: formData.name,
          phone: formData.phone,
          location: formData.location,
          preferred_date: formData.preferredDate,
          notes: formData.notes
        }, 
        selectedService.price
      )
    }
    setShowRequestForm(false)
    setFormData({ name: '', phone: '', location: '', preferredDate: '', notes: '' })
    setSelectedService(null)
    setView('installation')
  }

  function closeModal() {
    setShowRequestForm(false)
    setSelectedService(null)
    setFormData({ name: '', phone: '', location: '', preferredDate: '', notes: '' })
  }

  return (
    <div className="services-container-modern">
      {/* Hero Section */}
      <div className="services-hero-modern">
        <div className="services-hero-overlay"></div>
        <div className="services-hero-content">
          <div className="hero-badge-modern">Professional Services</div>
          <h1 className="services-hero-title">Services & Installations</h1>
          <p className="services-hero-subtitle">
            Expert installation and professional services for all your electronics needs
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="services-main-section">
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading services...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="empty-state-modern">
            <div className="empty-icon-modern">🔧</div>
            <h2>No Services Available</h2>
            <p>Check back soon for our professional services</p>
          </div>
        ) : (
          <div className="services-grid-modern">
            {services.map((s) => (
              <div key={s.id} className="service-card-modern-new">
                {s.image_url && (
                  <div className="service-image-wrapper">
                    <img src={s.image_url} alt={s.name} />
                    <div className="service-overlay"></div>
                  </div>
                )}
                <div className="service-content">
                  <h3 className="service-title">{s.name}</h3>
                  <p className="service-description">{s.description || 'Professional installation and setup service'}</p>
                  <div className="service-features">
                    <div className="feature-item">
                      <span>✓</span> Expert Technicians
                    </div>
                    <div className="feature-item">
                      <span>✓</span> Quality Guarantee
                    </div>
                    <div className="feature-item">
                      <span>✓</span> Timely Service
                    </div>
                  </div>
                  <div className="service-footer">
                    <div className="service-price">{fmtMK(s.price)}</div>
                    <button 
                      className="service-request-btn" 
                      onClick={() => requestService(s)}
                    >
                      Request Service →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Why Choose Us Section */}
      <div className="why-choose-services">
        <div className="section-header-modern">
          <span className="section-badge">Why Choose Us</span>
          <h2>Professional Service You Can Trust</h2>
          <p className="section-subtitle-modern">We deliver excellence in every installation</p>
        </div>
        <div className="why-features-grid">
          <div className="why-feature">
            <div className="why-feature-icon">👨‍🔧</div>
            <h4>Certified Technicians</h4>
            <p>All our technicians are professionally trained and certified</p>
          </div>
          <div className="why-feature">
            <div className="why-feature-icon">⏰</div>
            <h4>On-Time Service</h4>
            <p>We respect your time and arrive promptly at scheduled appointments</p>
          </div>
          <div className="why-feature">
            <div className="why-feature-icon">🛡️</div>
            <h4>Warranty Support</h4>
            <p>All installations come with warranty and after-service support</p>
          </div>
          <div className="why-feature">
            <div className="why-feature-icon">📍</div>
            <h4>Nationwide Service</h4>
            <p>Available across Lilongwe and surrounding areas</p>
          </div>
        </div>
      </div>

      {/* Service Request Modal */}
      {showRequestForm && selectedService && (
        <div className="modal-overlay-modern" onClick={closeModal}>
          <div className="modal-content-modern service-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-modern">
              <h2>Request Service</h2>
              <button className="modal-close-modern" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body-modern">
              <div className="selected-service-info">
                <strong>Service:</strong> {selectedService.name}
                <div className="service-price-tag">{fmtMK(selectedService.price)}</div>
              </div>
              <form onSubmit={handleFormSubmit}>
                <div className="form-group-modern">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="form-input-modern"
                  />
                </div>
                <div className="form-group-modern">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    className="form-input-modern"
                  />
                </div>
                <div className="form-group-modern">
                  <label>Installation Location *</label>
                  <input
                    type="text"
                    placeholder="Enter your full address"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                    className="form-input-modern"
                  />
                </div>
                <div className="form-group-modern">
                  <label>Preferred Date *</label>
                  <input
                    type="date"
                    value={formData.preferredDate}
                    onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                    required
                    className="form-input-modern"
                  />
                </div>
                <div className="form-group-modern">
                  <label>Additional Notes</label>
                  <textarea
                    placeholder="Any special requirements or instructions"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows="3"
                    className="form-input-modern"
                  />
                </div>
                <div className="modal-footer-modern">
                  <button type="button" className="cancel-btn-modern" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn-modern">
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}