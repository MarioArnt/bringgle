import axios from 'axios'

const defaultConfig = {
  baseURL: 'http://localhost:8081/api'
}

export default axios.create(defaultConfig)
