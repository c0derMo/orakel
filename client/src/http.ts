import Axios from "axios";

const url = window.location.hostname.includes("localhost")
  ? "http://localhost:5002"
  : window.location.origin;

export default {
  async get(path: string) {
    return await Axios.get(url + path, {
      headers: {
        "Content-type": "application/json",
      },
    });
  },
  async patch(path: string, data: any) {
    return await Axios.patch(url + path, data, {
      headers: {
        "Content-type": "application/json",
      },
    });
  },
  async post(path: string, data: any) {
    return await Axios.post(url + path, data, {
      headers: {
        "Content-type": "application/json",
      },
    });
  },
};
