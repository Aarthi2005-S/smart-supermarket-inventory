import api from './api';

// Create a new batch
export const createBatch = async (batchData) => {
  const response = await api.post('/batches', batchData);
  return response.data.data;
};

// Get all batches
export const getAllBatches = async () => {
  const response = await api.get('/batches');
  return response.data.data;
};

// Get all batches for a product
export const getBatchesByProduct = async (productId) => {
  const response = await api.get(`/batches/product/${productId}`);
  return response.data.data;
};

// Update a batch
export const updateBatch = async (id, batchData) => {
  const response = await api.put(`/batches/${id}`, batchData);
  return response.data.data;
};

// Delete a batch
export const deleteBatch = async (id) => {
  const response = await api.delete(`/batches/${id}`);
  return response.data.data;
};