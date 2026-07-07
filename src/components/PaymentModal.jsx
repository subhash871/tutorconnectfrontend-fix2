import { useState } from 'react';
import { paymentsApi } from '../api/payments';
import { extractErrorMessage } from '../api/client';
import { unwrapItem } from '../utils/unwrap';
import Modal from './Modal';

const METHODS = [
  { value: 'esewa', label: 'eSewa' },
  { value: 'khalti', label: 'Khalti' },
  { value: 'stripe', label: 'Card (Stripe)' },
];

export default function PaymentModal({ booking, onClose, onSuccess }) {
  const [method, setMethod] = useState('esewa');
  const [step, setStep] = useState('choose'); // choose -> confirm
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const initiate = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await paymentsApi.initiate(booking.booking_id, method);
      setPayment(unwrapItem(res));
      setStep('confirm');
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const verify = async () => {
    setError('');
    setLoading(true);
    try {
      await paymentsApi.verify(payment.id, {
        transaction_id: `TXN-${Date.now()}`,
        gateway_data: { status: 'success', provider: method },
      });
      onSuccess();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title={`Pay for booking ${booking.booking_id}`} onClose={onClose}>
      {error && <div className="alert alert-error">{error}</div>}
      <p>Amount due: <strong>Rs. {booking.total_amount}</strong></p>

      {step === 'choose' && (
        <>
          <div className="field">
            <label>Payment method</label>
            <div className="payment-method-grid">
              {METHODS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  className={`payment-method-btn ${method === m.value ? 'active' : ''}`}
                  onClick={() => setMethod(m.value)}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          <button className="btn btn-primary btn-block" disabled={loading} onClick={initiate}>
            {loading ? 'Preparing…' : `Continue with ${METHODS.find((m) => m.value === method).label}`}
          </button>
        </>
      )}

      {step === 'confirm' && (
        <>
          <div className="alert alert-info">
            A {METHODS.find((m) => m.value === method).label} payment session has been created.
            Complete it in the gateway window, then confirm below.
          </div>
          <button className="btn btn-primary btn-block" disabled={loading} onClick={verify}>
            {loading ? 'Verifying…' : "I've completed the payment"}
          </button>
        </>
      )}
    </Modal>
  );
}
