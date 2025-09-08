import axios from './axios';

export const getProducts = () => axios.get('/products');
export const getProductById = (id) => axios.get(`/products/${id}`);
