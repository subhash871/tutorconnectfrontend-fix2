import client from './client';

export const paymentsApi = {
  list: (params) => client.get('/payments/', { params }),
  myTransactions: () => client.get('/payments/my_transactions/'),
  invoices: () => client.get('/payments/invoices/'),
  initiate: (bookingId, paymentMethod) =>
    client.post('/payments/initiate_payment/', { booking_id: bookingId, payment_method: paymentMethod }),
  verify: (paymentId, payload) => client.post(`/payments/${paymentId}/verify_payment/`, payload),
  refund: (paymentId, payload) => client.post(`/payments/${paymentId}/refund/`, payload),
};
