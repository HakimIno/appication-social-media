import axios from "axios";

export const httpEndpoint = axios.create({
    baseURL: "http://192.168.95.145:8888",
    timeout: 3 * 60 * 1000,
});