import client from './client';

export const studentsApi = {
  listProfiles: (params) => client.get('/students/profiles/', { params }),
  createProfile: (payload) => client.post('/students/profiles/', payload),
  myProfile: () => client.get('/students/profiles/my_profile/'),
  updateMyProfile: (payload) => client.patch('/students/profiles/my_profile/', payload),

  listPreferences: () => client.get('/students/preferences/'),
  createPreference: (payload) => client.post('/students/preferences/', payload),
  deletePreference: (id) => client.delete(`/students/preferences/${id}/`),
};
