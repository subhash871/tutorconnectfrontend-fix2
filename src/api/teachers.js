import client from './client';

export const teachersApi = {
  // Subjects
  listSubjects: (params) => client.get('/teachers/subjects/', { params }),
  createSubject: (payload) => client.post('/teachers/subjects/', payload),
  getSubject: (id) => client.get(`/teachers/subjects/${id}/`),
  updateSubject: (id, payload) => client.patch(`/teachers/subjects/${id}/`, payload),
  deleteSubject: (id) => client.delete(`/teachers/subjects/${id}/`),

  // Languages
  listLanguages: (params) => client.get('/teachers/languages/', { params }),
  createLanguage: (payload) => client.post('/teachers/languages/', payload),

  // Teacher profiles
  listProfiles: (params) => client.get('/teachers/profiles/', { params }),
  getProfile: (id) => client.get(`/teachers/profiles/${id}/`),
  createProfile: (payload) => client.post('/teachers/profiles/', payload),
  updateProfile: (id, payload) => client.patch(`/teachers/profiles/${id}/`, payload),
  myProfile: () => client.get('/teachers/profiles/my_profile/'),
  updateMyProfile: (payload) => client.patch('/teachers/profiles/my_profile/', payload),
  addSubject: (profileId, subjectId) => client.post(`/teachers/profiles/${profileId}/add_subject/`, { subject_id: subjectId }),
  removeSubject: (profileId, subjectId) => client.post(`/teachers/profiles/${profileId}/remove_subject/`, { subject_id: subjectId }),
  toggleAvailability: (profileId) => client.post(`/teachers/profiles/${profileId}/toggle_availability/`),

  // Qualifications
  listQualifications: () => client.get('/teachers/qualifications/'),
  createQualification: (payload) => client.post('/teachers/qualifications/', payload),
  deleteQualification: (id) => client.delete(`/teachers/qualifications/${id}/`),

  // Experiences
  listExperiences: () => client.get('/teachers/experiences/'),
  createExperience: (payload) => client.post('/teachers/experiences/', payload),
  deleteExperience: (id) => client.delete(`/teachers/experiences/${id}/`),

  // Certificates
  listCertificates: () => client.get('/teachers/certificates/'),
  createCertificate: (payload) => client.post('/teachers/certificates/', payload, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteCertificate: (id) => client.delete(`/teachers/certificates/${id}/`),

  // Gallery
  listGallery: () => client.get('/teachers/gallery/'),
  uploadGalleryImage: (payload) => client.post('/teachers/gallery/', payload, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteGalleryImage: (id) => client.delete(`/teachers/gallery/${id}/`),

  // Availability
  listAvailability: () => client.get('/teachers/availability/'),
  createAvailability: (payload) => client.post('/teachers/availability/', payload),
  deleteAvailability: (id) => client.delete(`/teachers/availability/${id}/`),
};
