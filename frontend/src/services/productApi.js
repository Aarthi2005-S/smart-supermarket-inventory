import api from './api';

export const getProducts = async (includeInactive = false) => {
  const response = await api.get('/products', {
    params: includeInactive ? { includeInactive: 'true' } : undefined,
  });
  return response.data.data.products;
};

export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data.data.product;
};

export const getProductByBarcode = async (barcode) => {
  const response = await api.get(`/products/barcode/${encodeURIComponent(barcode)}`);
  return response.data.data.product;
};

export const createProduct = async (productData) => {
  const response = await api.post('/products', productData);
  return response.data.data.product;
};

export const updateProduct = async (id, productData) => {
  const response = await api.put(`/products/${id}`, productData);
  return response.data.data.product;
};

export const deactivateProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data.data.product;
};
