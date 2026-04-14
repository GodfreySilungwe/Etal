import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://xw9zhawaqf.execute-api.us-east-1.amazonaws.com';

export default class ProductPresenter {
  async getCategories() {
    const res = await axios.get(`${API_BASE_URL}/api/categories`)
    // normalize response to an array
    if (Array.isArray(res.data)) return res.data
    if (res.data && Array.isArray(res.data.rows)) return res.data.rows
    return []
  }

  async getProducts(filters = {}) {
    const params = {}
    if (filters.search) params.search = filters.search
    if (filters.category_id) params.category_id = filters.category_id
    const res = await axios.get(`${API_BASE_URL}/api/products`, { params })
    return res.data
  }

  async getProductById(id) {
    const res = await axios.get(`${API_BASE_URL}/api/products/${id}`)
    return res.data
  }

  async subscribeNewsletter(email) {
    const res = await axios.post(`${API_BASE_URL}/api/newsletter`, { email })
    return res.data
  }

  async createInvoice(payload) {
    // payload: { customer_name, phone, email, product_details }
    const res = await axios.post(`${API_BASE_URL}/api/invoice-requests`, payload)
    return res.data
  }

  async createPaymentReference(payload) {
    const res = await axios.post(`${API_BASE_URL}/api/payment-references`, payload)
    return res.data
  }

  async createQuoteRequest(payload) {
    const res = await axios.post(`${API_BASE_URL}/api/quote-requests`, payload)
    return res.data
  }

  async getServices() {
    const res = await axios.get(`${API_BASE_URL}/api/services`)
    return Array.isArray(res.data) ? res.data : []
  }

  async createInstallation(payload) {
    const res = await axios.post(`${API_BASE_URL}/api/installation-requests`, payload)
    return res.data
  }

  async createDelivery(payload) {
    const res = await axios.post(`${API_BASE_URL}/api/delivery-requests`, payload)
    return res.data
  }

  async getSalesReport() {
    const res = await axios.get(`${API_BASE_URL}/api/reports/sales`)
    return res.data
  }
}
