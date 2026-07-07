import client from './client';

export const wishlistApi = {
  list: () => client.get('/wishlist/'),
  add: (teacherProfileId) => client.post('/wishlist/', { teacher: teacherProfileId }),
  check: (teacherId) => client.get('/wishlist/check/', { params: { teacher_id: teacherId } }),
  remove: (id) => client.delete(`/wishlist/${id}/`),
  clear: () => client.delete('/wishlist/clear/'),
};
