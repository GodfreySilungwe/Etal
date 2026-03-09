import axios from 'axios'

export default class AdminPresenter {
  async login(username, password) {
    const res = await axios.post('/api/admin/login', { username, password })
    return res.data
  }

  async getProducts() {
    const res = await axios.get('/api/products')
    return res.data
  }

  async createProduct(payload) {
    const res = await axios.post('/api/products', payload)
    return res.data
  }

  async updateProduct(id, payload) {
    const res = await axios.put(`/api/products/${id}`, payload)
    return res.data
  }

  async deleteProduct(id) {
    const res = await axios.delete(`/api/products/${id}`)
    return res.data
  }

  async uploadImage(file) {
    const fd = new FormData()
    fd.append('image', file)
    const res = await axios.post('/api/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    return res.data
  }

  async getCategories() {
    const res = await axios.get('/api/categories')
    return res.data
  }

  async createCategory(name) {
    const res = await axios.post('/api/categories', { name })
    return res.data
  }

  async deleteCategory(id) {
    const res = await axios.delete(`/api/categories/${id}`)
    return res.data
  }
}
