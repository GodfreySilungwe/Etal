import axios from 'axios'

export default class AdminPresenter {

  async login(username, password) {
    console.log("before presenter actually send login to server")
    const res = await axios.post('http://localhost:4000/api/admin/login', { username, password })
    console.log("after presenter actually send login to server")
    return res.data
  }

  async getProducts() {
    const res = await axios.get('http://localhost:4000/api/products')
    return res.data
  }

  async createProduct(payload) {
    const res = await axios.post('http://localhost:4000/api/products', payload)
    return res.data
  }

  async updateProduct(id, payload) {
    const res = await axios.put(`http://localhost:4000/api/products/${id}`, payload)
    return res.data
  }

  async deleteProduct(id) {
    const res = await axios.delete(`http://localhost:4000/api/products/${id}`)
    return res.data
  }

  async uploadImage(file) {
    const fd = new FormData()
    fd.append('image', file)
    const res = await axios.post('http://localhost:4000/api/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    return res.data
  }

  async getCategories() {
    const res = await axios.get('http://localhost:4000/api/categories')
    if (Array.isArray(res.data)) return res.data
    if (res.data && Array.isArray(res.data.rows)) return res.data.rows
    return []
  }

  async createCategory(name) {
    const res = await axios.post('http://localhost:4000/api/categories', { name })
    return res.data
  }

  async deleteCategory(id) {
    const res = await axios.delete(`http://localhost:4000/api/categories/${id}`)
    return res.data
  }
}
