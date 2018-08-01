import axios from 'axios'
import config from '@/config'

const defaultConfig = {
  baseURL: `http://${config.server.host}:${config.server.port}/api`
}

export default axios.create(defaultConfig)
