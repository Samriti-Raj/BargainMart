import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5000/api', // Update based on your backend
  withCredentials: true,
});

export default instance;
