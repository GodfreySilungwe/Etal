import React from 'react'

export default function AboutUs() {
  return (
    <div className="about-container-modern">
      {/* Hero Section */}
      <section className="about-hero-modern">
        <div className="about-hero-overlay"></div>
        <div className="about-hero-content-modern">
          <div className="hero-badge-modern">Since 2015</div>
          <h1 className="about-hero-title-modern">About ETAL</h1>
          <p className="about-hero-subtitle-modern">Transforming Business Through Innovation & Excellence</p>
          <div className="hero-stats-modern">
            <div className="hero-stat">
              <span className="stat-number">8+</span>
              <span className="stat-label">Years Experience</span>
            </div>
            <div className="hero-stat">
              <span className="stat-number">500+</span>
              <span className="stat-label">Clients Served</span>
            </div>
            <div className="hero-stat">
              <span className="stat-number">1000+</span>
              <span className="stat-label">Projects Completed</span>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Cards */}
      <section className="about-cards-section-modern">
        <div className="cards-grid-modern">
          <div className="about-card-modern mission-card">
            <div className="card-icon-modern">🎯</div>
            <h2>Our Mission</h2>
            <p>To build lasting relationships by providing efficient, cost-effective, and sustainable supply chain solutions that empower businesses to thrive.</p>
            <div className="card-accent"></div>
          </div>

          <div className="about-card-modern vision-card">
            <div className="card-icon-modern">🚀</div>
            <h2>Our Vision</h2>
            <p>To deliver exceptional value, quality, and convenience to our customers, while fostering long-term relationships built on trust, expertise, and innovation.</p>
            <div className="card-accent"></div>
          </div>

          <div className="about-card-modern values-card">
            <div className="card-icon-modern">⭐</div>
            <h2>Our Values</h2>
            <p>Integrity, Excellence, Customer-Focus, and Sustainability form the foundation of everything we do at ETAL.</p>
            <div className="card-accent"></div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="about-services-modern">
        <div className="section-header-modern">
          <span className="section-badge">What We Offer</span>
          <h2>Our Services</h2>
          <p className="section-subtitle-modern">Comprehensive solutions tailored to your business needs</p>
        </div>

        <div className="services-grid-modern">
          <div className="service-card-modern">
            <div className="service-icon-modern">💻</div>
            <h3>IT Equipment Supply</h3>
            <p>Comprehensive supply of computers, phones, CCTV equipment, and modern technology solutions for businesses of all sizes.</p>
            <div className="service-link">Learn More →</div>
          </div>

          <div className="service-card-modern">
            <div className="service-icon-modern">🔧</div>
            <h3>Installation & Setup</h3>
            <p>Professional installation and configuration of CCTV systems, biometric security systems, and IT infrastructure.</p>
            <div className="service-link">Learn More →</div>
          </div>

          <div className="service-card-modern">
            <div className="service-icon-modern">🛡️</div>
            <h3>Security Systems</h3>
            <p>Advanced CCTV and biometric security solutions to protect your business and assets with cutting-edge technology.</p>
            <div className="service-link">Learn More →</div>
          </div>

          <div className="service-card-modern">
            <div className="service-icon-modern">📎</div>
            <h3>Office Supplies</h3>
            <p>Wide range of office stationery, papers, envelopes, notebooks, and materials to support your daily operations.</p>
            <div className="service-link">Learn More →</div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="why-choose-section-modern">
        <div className="section-header-modern">
          <span className="section-badge">Why ETAL</span>
          <h2>Why Choose Us?</h2>
          <p className="section-subtitle-modern">What makes us different from the rest</p>
        </div>

        <div className="why-choose-grid-modern">
          <div className="why-card-modern">
            <div className="why-number">01</div>
            <div className="why-icon">👥</div>
            <h4>Expert Team</h4>
            <p>Experienced professionals dedicated to delivering quality solutions with technical expertise.</p>
          </div>

          <div className="why-card-modern">
            <div className="why-number">02</div>
            <div className="why-icon">💰</div>
            <h4>Competitive Pricing</h4>
            <p>Cost-effective solutions without compromising on quality, offering the best value for your investment.</p>
          </div>

          <div className="why-card-modern">
            <div className="why-number">03</div>
            <div className="why-icon">📍</div>
            <h4>Local Service</h4>
            <p>Based in Malawi with local pickup and service availability, ensuring quick response times.</p>
          </div>

          <div className="why-card-modern">
            <div className="why-number">04</div>
            <div className="why-icon">🎧</div>
            <h4>24/7 Support</h4>
            <p>Dedicated support team ready to assist with any inquiries or technical issues you may have.</p>
          </div>

          <div className="why-card-modern">
            <div className="why-number">05</div>
            <div className="why-icon">✅</div>
            <h4>Quality Guarantee</h4>
            <p>All products come with warranty and quality assurance for your peace of mind.</p>
          </div>

          <div className="why-card-modern">
            <div className="why-number">06</div>
            <div className="why-icon">🚚</div>
            <h4>Fast Delivery</h4>
            <p>Quick and reliable delivery service across Lilongwe and surrounding areas.</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section-modern">
        <div className="section-header-modern">
          <span className="section-badge">Testimonials</span>
          <h2>What Our Clients Say</h2>
          <p className="section-subtitle-modern">Trusted by businesses across Malawi</p>
        </div>

        <div className="testimonials-grid-modern">
          <div className="testimonial-card-modern">
            <div className="testimonial-icon">“</div>
            <p>ETAL has been our go-to supplier for IT equipment. Their service is professional, and delivery is always on time.</p>
            <div className="testimonial-author">
              <strong>John Banda</strong>
              <span>IT Manager, Capital Hotel</span>
            </div>
          </div>

          <div className="testimonial-card-modern">
            <div className="testimonial-icon">“</div>
            <p>The installation team was very professional. They set up our CCTV system perfectly and provided excellent training.</p>
            <div className="testimonial-author">
              <strong>Sarah Phiri</strong>
              <span>Operations Director</span>
            </div>
          </div>

          <div className="testimonial-card-modern">
            <div className="testimonial-icon">“</div>
            <p>Great prices, quality products, and outstanding customer service. Highly recommended!</p>
            <div className="testimonial-author">
              <strong>Michael Chiumia</strong>
              <span>Business Owner</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta-section">
        <div className="cta-content-modern">
          <h2>Ready to work with us?</h2>
          <p>Let's discuss how we can help your business grow with our quality products and services.</p>
          <div className="cta-buttons-modern">
            <button className="cta-primary-btn">Contact Us Today</button>
            <button className="cta-secondary-btn">View Our Products</button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="about-contact-modern">
        <div className="section-header-modern">
          <span className="section-badge">Get In Touch</span>
          <h2>Contact Information</h2>
          <p className="section-subtitle-modern">We'd love to hear from you</p>
        </div>

        <div className="contact-methods-modern">
          <div className="contact-card-modern">
            <div className="contact-icon-modern">✉️</div>
            <h3>Email Us</h3>
            <a href="mailto:goshsolutions@gmail.com" className="contact-link-modern">goshsolutions@gmail.com</a>
            <p>Response within 24 hours</p>
          </div>

          <div className="contact-card-modern">
            <div className="contact-icon-modern">📱</div>
            <h3>Call Us</h3>
            <a href="tel:+265995718815" className="contact-link-modern">+265 995 718 815</a>
            <p>Mon-Fri, 8AM - 5PM</p>
          </div>

          <div className="contact-card-modern">
            <div className="contact-icon-modern">💬</div>
            <h3>WhatsApp</h3>
            <a href="https://wa.me/265995718815" className="contact-link-modern">Chat on WhatsApp</a>
            <p>Quick responses via chat</p>
          </div>

          <div className="contact-card-modern">
            <div className="contact-icon-modern">📍</div>
            <h3>Visit Us</h3>
            <p className="contact-info-modern">Opposite Central Hospital, Lilongwe, Malawi</p>
            <p>Local pickup available</p>
          </div>
        </div>
      </section>
    </div>
  )
}