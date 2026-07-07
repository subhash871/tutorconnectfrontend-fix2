import client from './client';

export const reviewsApi = {
  list: (params) => client.get('/reviews/', { params }),
  create: (payload) => client.post('/reviews/', payload),
  retrieve: (id) => client.get(`/reviews/${id}/`),
  update: (id, payload) => client.patch(`/reviews/${id}/`, payload),
  remove: (id) => client.delete(`/reviews/${id}/`),
};
