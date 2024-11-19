import axios from "axios";

export const httpEndpoint = axios.create({
    baseURL: "http://8.219.201.235:8888",
    timeout: 3 * 60 * 1000,
});