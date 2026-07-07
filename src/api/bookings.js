import client from './client';

export const bookingsApi = {
  list: (params) => client.get('/bookings/', { params }),
  retrieve: (id) => client.get(`/bookings/${id}/`),
  create: (payload) => client.post('/bookings/', payload),
  accept: (id) => client.post(`/bookings/${id}/accept/`),
  reject: (id, reason) => client.post(`/bookings/${id}/reject/`, reason ? { reason } : {}),
  cancel: (id, reason) => client.post(`/bookings/${id}/cancel/`, { reason }),
  complete: (id) => client.post(`/bookings/${id}/complete/`),
  requestReschedule: (id, payload) => client.post(`/bookings/${id}/reschedule_request/`, payload),

  listRescheduleRequests: () => client.get('/bookings/reschedule-requests/'),
  approveReschedule: (id) => client.post(`/bookings/reschedule-requests/${id}/approve/`),
};
