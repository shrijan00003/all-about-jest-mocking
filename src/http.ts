import { Axios } from "axios";

const axios = new Axios({
  baseURL: process.env.BASE_URL,
  timeout: 100,
  headers: {
    "Content-Type": "applications/json",
  },
});

export function post(url: string, data: Record<string, unknown>) {
  // to replicate the error we will throw error for /with-error
  if (url.startsWith("/with-error")) {
    throw new Error("something wrong with post api");
  }

  // console.log("What is axios.post here", axios.post);

  return axios.post(url, data);
}

export function get(url: string) {
  // to replicate the error we will throw error for path /with-error
  if (url.startsWith("/with-error")) {
    throw new Error("something wrong with get api");
  }
  return axios.get(url);
}
