import axios from 'axios'
import Env from './env.js'
import { Toast } from 'antd-mobile';
const appInfo = window.localStorage.getItem('appInfo') ? JSON.parse(window.localStorage.getItem('appInfo')) : '';
const userInfo = window.localStorage.getItem('userInfo') ? JSON.parse(window.localStorage.getItem('userInfo')) : '';
const token = window.localStorage.getItem('token') || '';
axios.defaults.timeout = 5000;

axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8'
axios.defaults.baseURL = Env.api || 'http://localhost:3000'
axios.defaults.withCredentials = false

if(appInfo) {
    axios.default.headers = {...axios.default.headers, ...appInfo, ...userInfo}
}  else if(token) {
    axios.default.headers["Jwt-Token"] = token;
}
axios.interceptors.request.use(config => {
    return config
}, error => {
    return Promise.reject(error)
})

axios.interceptors.response.use(res => {
    return res.data
}, error => {
    Toast.fail('网络错误，请重试。')
    return Promise.reject(error)
})

export default axios