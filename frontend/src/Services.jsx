import React from 'react'

export default function Services({ presenter, setView }) {
  return (
    <div>
      <h1>Services & Installations</h1>
      <p>We offer a range of services including aircon installations, maintenance, and delivery.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div style={{ textAlign: 'center' }}>
          <img src="/uploads/aircon3peace.png" alt="Aircon Installation" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }} />
          <h3>Aircon Installation</h3>
          <p>Professional installation of air conditioning units.</p>
          <button onClick={() => setView('installation')}>Request Installation</button>
        </div>
        <div style={{ textAlign: 'center' }}>
          <img src="/uploads/indoorunit.png" alt="Indoor Unit Service" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }} />
          <h3>Indoor Unit Service</h3>
          <p>Maintenance and repair of indoor aircon units.</p>
          <button onClick={() => setView('installation')}>Request Service</button>
        </div>
        <div style={{ textAlign: 'center' }}>
          <img src="/uploads/outdoorunit.png" alt="Outdoor Unit Service" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }} />
          <h3>Outdoor Unit Service</h3>
          <p>Maintenance and repair of outdoor aircon units.</p>
          <button onClick={() => setView('installation')}>Request Service</button>
        </div>
        <div style={{ textAlign: 'center' }}>
          <img src="/uploads/UprightAirCon.png" alt="Upright Aircon" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }} />
          <h3>Upright Aircon</h3>
          <p>Specialized service for upright air conditioners.</p>
          <button onClick={() => setView('installation')}>Request Service</button>
        </div>
      </div>

      <div style={{ marginTop: '40px' }}>
        <h2>Request a Service</h2>
        <p>Fill out the form below to request installation or delivery services.</p>
        <div style={{ display: 'flex', gap: '20px' }}>
          <button onClick={() => setView('installation')}>Installation Request</button>
          <button onClick={() => setView('delivery')}>Delivery Request</button>
        </div>
      </div>
    </div>
  )
}