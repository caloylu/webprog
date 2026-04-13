import axios from "axios";

const axiosConfig = axios.create({
	baseURL: import.meta.env.VITE_SERVER_BASE_URL + '/api',
	headers: {
		'Content-Type': 'application/json'
	}
});

export default axiosConfig;
