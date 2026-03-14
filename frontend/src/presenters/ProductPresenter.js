import axios from 'axios'

export default class ProductPresenter {
  async getCategories() {
    const res = await axios.get('http://localhost:4000/api/categories')
    // normalize response to an array
    if (Array.isArray(res.data)) return res.data
    if (res.data && Array.isArray(res.data.rows)) return res.data.rows
    return []
  }

  async getProducts(filters = {}) {
    const params = {}
    if (filters.search) params.search = filters.search
    if (filters.category_id) params.category_id = filters.category_id
    const res = await axios.get('http://localhost:4000/api/products', { params })
    return res.data
  }

  async getProductById(id) {
    const res = await axios.get(`http://localhost:4000/api/products/${id}`)
    return res.data
  }

  async subscribeNewsletter(email) {
    const res = await axios.post('http://localhost:4000/api/newsletter', { email })
    return res.data
  }

  async createInvoice(payload) {
    // payload: { customer_name, phone, email, product_details }
    const res = await axios.post('http://localhost:4000/api/invoice-requests', payload)
    return res.data
  }

  async createInstallation(payload) {
    const res = await axios.post('http://localhost:4000/api/installation-requests', payload)
    return res.data
  }

  async createDelivery(payload) {
    const res = await axios.post('http://localhost:4000/api/delivery-requests', payload)
    return res.data
  }
}
