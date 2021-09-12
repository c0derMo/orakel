import axios from "axios";

let url = "http://localhost:5002"

export default axios.create({
    baseURL: url,
    headers: {
        "Content-type": "application/json"
    }
});