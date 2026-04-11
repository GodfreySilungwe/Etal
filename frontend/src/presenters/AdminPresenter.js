import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default class AdminPresenter {
  authConfig() {
    const token = localStorage.getItem('etal_token')
    if (!token) return {}
    return { headers: { Authorization: `Bearer ${token}` } }
  }

  async login(username, password) {
    console.log("before presenter actually send login to server")
    const res = await axios.post(`${API_BASE_URL}/api/admin/login`, { username, password })
    console.log("after presenter actually send login to server")
    return res.data
  }

  async getProducts() {
    const res = await axios.get(`${API_BASE_URL}/api/products`)
    return res.data
  }

  async createProduct(payload) {
    const res = await axios.post(`${API_BASE_URL}/api/products`, payload, this.authConfig())
    return res.data
  }

  async updateProduct(id, payload) {
    const res = await axios.put(`${API_BASE_URL}/api/products/${id}`, payload, this.authConfig())
    return res.data
  }

  async deleteProduct(id) {
    const res = await axios.delete(`${API_BASE_URL}/api/products/${id}`, this.authConfig())
    return res.data
  }

  async uploadImage(file) {
    const fd = new FormData()
    fd.append('image', file)
    const res = await axios.post(
      `${API_BASE_URL}/api/upload`,
      fd,
      { headers: { 'Content-Type': 'multipart/form-data', ...(this.authConfig().headers || {}) } }
    )
    return res.data
  }

  async getCategories() {
    const res = await axios.get(`${API_BASE_URL}/api/categories`)
    if (Array.isArray(res.data)) return res.data
    if (res.data && Array.isArray(res.data.rows)) return res.data.rows
    return []
  }

  async createCategory(name) {
    const res = await axios.post(`${API_BASE_URL}/api/categories`, { name }, this.authConfig())
    return res.data
  }

  async deleteCategory(id) {
    const res = await axios.delete(`${API_BASE_URL}/api/categories/${id}`, this.authConfig())
    return res.data
  }

  async getSalesReport() {
    const res = await axios.get(`${API_BASE_URL}/api/reports/sales`, this.authConfig())
    return res.data
  }

  async getQuotationReport() {
    const res = await axios.get(`${API_BASE_URL}/api/reports/quotations`, this.authConfig())
    return res.data
  }

  async getPaymentReferences() {
    const res = await axios.get(`${API_BASE_URL}/api/payment-references`, this.authConfig())
    return res.data
  }

  async updatePaymentStatus(id, service_status) {
    const res = await axios.patch(`${API_BASE_URL}/api/payment-references/${id}/status`, { service_status }, this.authConfig())
    return res.data
  }

  async getQuoteRequests() {
    const res = await axios.get(`${API_BASE_URL}/api/quote-requests`, this.authConfig())
    return res.data
  }

  async updateQuoteStatus(id, status) {
    const res = await axios.patch(`${API_BASE_URL}/api/quote-requests/${id}/status`, { status }, this.authConfig())
    return res.data
  }

  async getServices() {
    const res = await axios.get(`${API_BASE_URL}/api/services`)
    return Array.isArray(res.data) ? res.data : []
  }

  async createService(payload) {
    const res = await axios.post(`${API_BASE_URL}/api/services`, payload, this.authConfig())
    return res.data
  }

  async updateService(id, payload) {
    const res = await axios.put(`${API_BASE_URL}/api/services/${id}`, payload, this.authConfig())
    return res.data
  }

  async deleteService(id) {
    const res = await axios.delete(`${API_BASE_URL}/api/services/${id}`, this.authConfig())
    return res.data
  }

  async getInstallationRequests() {
    const res = await axios.get(`${API_BASE_URL}/api/installation-requests`, this.authConfig())
    return Array.isArray(res.data) ? res.data : []
  }

  async updateInstallationRequestStatus(id, status) {
    const res = await axios.patch(`${API_BASE_URL}/api/installation-requests/${id}/status`, { status }, this.authConfig())
    return res.data
  }

  async getNewsletterSubscribers() {
    const res = await axios.get(`${API_BASE_URL}/api/newsletter`, this.authConfig())
    return Array.isArray(res.data) ? res.data : []
  }
}
