import React from 'react'

export default function AboutUs() {
  return (
    <div className="about-container">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-content">
          <h1 className="about-hero-title">About ETAL</h1>
          <p className="about-hero-subtitle">Transforming Business Through Innovation & Excellence</p>
        </div>
      </section>

      {/* Mission & Vision Cards */}
      <section className="about-cards-section">
        <div className="about-cards">
          <div className="about-card mission-card">
            <div className="card-icon">🎯</div>
            <h2>Our Mission</h2>
            <p>To build lasting relationships by providing efficient, cost-effective, and sustainable supply chain solutions.</p>
          </div>

          <div className="about-card vision-card">
            <div className="card-icon">🚀</div>
            <h2>Our Vision</h2>
            <p>To deliver exceptional value, quality, and convenience to our customers, while fostering long-term relationships built on trust, expertise, and innovation.</p>
          </div>

          <div className="about-card values-card">
            <div className="card-icon">⭐</div>
            <h2>Our Values</h2>
            <p>Integrity, Excellence, Customer-Focus, and Sustainability form the foundation of everything we do.</p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="about-services">
        <div className="services-header">
          <h2>What We Do</h2>
          <p className="section-subtitle">Comprehensive solutions tailored to your business needs</p>
        </div>

        <div className="services-grid">
          <div className="service-item">
            <div className="service-icon">💻</div>
            <h3>IT Equipment Supply</h3>
            <p>Comprehensive supply of computers, phones, CCTV equipment, and modern technology solutions for businesses of all sizes.</p>
          </div>

          <div className="service-item">
            <div className="service-icon">🔧</div>
            <h3>Installation & Setup</h3>
            <p>Professional installation and configuration of CCTV systems, biometric security systems, and IT infrastructure.</p>
          </div>

          <div className="service-item">
            <div className="service-icon">🛡️</div>
            <h3>Security Systems</h3>
            <p>Advanced CCTV and biometric security solutions to protect your business and assets with cutting-edge technology.</p>
          </div>

          <div className="service-item">
            <div className="service-icon">📎</div>
            <h3>Office Supplies</h3>
            <p>Wide range of office stationery, papers, envelopes, notebooks, and materials to support your daily operations.</p>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="about-why-choose">
        <div className="why-choose-content">
          <h2>Why Choose ETAL?</h2>
          <div className="why-choose-list">
            <div className="why-item">
              <div className="why-number">01</div>
              <div className="why-text">
                <h4>Expert Team</h4>
                <p>Experienced professionals dedicated to delivering quality solutions</p>
              </div>
            </div>

            <div className="why-item">
              <div className="why-number">02</div>
              <div className="why-text">
                <h4>Competitive Pricing</h4>
                <p>Cost-effective solutions without compromising on quality</p>
              </div>
            </div>

            <div className="why-item">
              <div className="why-number">03</div>
              <div className="why-text">
                <h4>Local Service</h4>
                <p>Based in Malawi with local pickup and service availability</p>
              </div>
            </div>

            <div className="why-item">
              <div className="why-number">04</div>
              <div className="why-text">
                <h4>Customer Support</h4>
                <p>Dedicated support team ready to assist with any inquiries</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="about-contact">
        <h2>Get In Touch</h2>
        <p className="section-subtitle">Ready to work with us? We'd love to hear from you</p>
        
        <div className="contact-methods">
          <div className="contact-card">
            <div className="contact-icon">✉️</div>
            <h3>Email</h3>
            <a href="mailto:goshsolutions@gmail.com" className="contact-link">goshsolutions@gmail.com</a>
          </div>

          <div className="contact-card">
            <div className="contact-icon">📱</div>
            <h3>Phone</h3>
            <a href="tel:+265995718815" className="contact-link">+265 995 718 815</a>
          </div>

          <div className="contact-card">
            <div className="contact-icon">📍</div>
            <h3>Location</h3>
            <p className="contact-info">Malawi (local pickup and service available)</p>
          </div>
        </div>
      </section>
    </div>
  )
}