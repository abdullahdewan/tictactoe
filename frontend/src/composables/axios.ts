import Axios from 'axios'
// import { useRouter } from 'vue-router'
const axios = Axios.create({
  timeout: 90000,
  withCredentials: true,
})

export default axios
