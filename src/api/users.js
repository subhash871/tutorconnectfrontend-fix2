import client from './client';

export const usersApi = {
  me: () => client.get('/users/me/'),
  updateMe: (payload) => {
    const isFormData = payload instanceof FormData;
    return client.patch('/users/me/', payload, isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined);
  },
  list: (params) => client.get('/users/', { params }),
  retrieve: (id) => client.get(`/users/${id}/`),
  loginHistory: () => client.get('/users/login_history/'),
  deactivate: () => client.post('/users/deactivate/'),
  approveTeacher: (id) => client.post(`/users/${id}/approve_teacher/`),
};
