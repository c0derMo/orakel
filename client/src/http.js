import Axios from 'axios'

let url = window.location.hostname.includes('localhost') ? "http://localhost:5002" : window.location.origin;

export default {
    async get(path) {
        return await Axios.get(url + path, {
            headers: {
                "Content-type": "application/json"
            }
        })
    },
    async patch(path, data) {
        return await Axios.patch(url + path, data, {
            headers: {
                "Content-type": "application/json"
            }
        });
    },
    async post(path, data) {
        return await Axios.post(url + path, data, {
            headers: {
                "Content-type": "application/json"
            }
        });
    }
}