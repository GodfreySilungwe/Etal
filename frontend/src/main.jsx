import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'
import ProductCard from './ProductCard'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
