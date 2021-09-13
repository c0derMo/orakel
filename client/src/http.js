import Axios from 'axios'

let url = "http://localhost:5002"
// export default Axios.create({
//     baseURL: url,
//     headers: {
//         "Content-type": "application/json"
//     }
// });

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