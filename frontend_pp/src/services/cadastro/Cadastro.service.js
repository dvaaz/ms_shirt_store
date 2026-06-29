import axios from 'axios'

const cadastroService = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

export default cadastroService