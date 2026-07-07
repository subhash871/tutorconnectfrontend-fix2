import client from './client';

export const chatApi = {
  listConversations: () => client.get('/chat/conversations/'),
  createConversation: (payload) => client.post('/chat/conversations/', payload),
  markRead: (id) => client.post(`/chat/conversations/${id}/mark_read/`),

  listMessages: (conversationId) => client.get('/chat/messages/', { params: { conversation: conversationId } }),
  sendMessage: (payload) => {
    const isFormData = payload instanceof FormData;
    return client.post('/chat/messages/', payload, isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined);
  },
  sendTyping: (conversationId, isTyping) => client.post('/chat/typing/', { conversation: conversationId, is_typing: isTyping }),
};
