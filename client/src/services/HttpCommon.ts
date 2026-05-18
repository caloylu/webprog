import axios from "axios";
import { loadSession, session } from "../auth/Session";

const axiosConfig = axios.create({
	baseURL: import.meta.env.VITE_SERVER_BASE_URL + '/api',
	headers: {
		'Content-Type': 'application/json'
	}
});

axiosConfig.interceptors.request.use((config) => {
	loadSession()
	const rel = String(config.url ?? "")
	const method = (config.method ?? "get").toLowerCase()
	const skipAuth =
		rel.includes("/auth/signin") ||
		rel.includes("/auth/refresh") ||
		(rel === "/users" && method === "post")
	if (!skipAuth && session.accessToken) {
		config.headers.Authorization = `Bearer ${session.accessToken}`
	}
	if (config.data instanceof FormData) {
		delete (config.headers as Record<string, unknown>)["Content-Type"]
	}
	return config
})

export default axiosConfig;
