import axios from 'axios';

const instance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`, // Update based on your backend
  withCredentials: true,
});

export default instance;
