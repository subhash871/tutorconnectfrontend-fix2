import client from './client';

export const notificationsApi = {
  list: (params) => client.get('/notifications/', { params }),
  markRead: (id) => client.patch(`/notifications/${id}/`, { is_read: true }),
  markAllRead: () => client.post('/notifications/mark_all_read/'),
  unreadCount: () => client.get('/notifications/unread_count/'),
  listDevices: () => client.get('/notifications/devices/'),
  registerDevice: (payload) => client.post('/notifications/devices/', payload),
};
