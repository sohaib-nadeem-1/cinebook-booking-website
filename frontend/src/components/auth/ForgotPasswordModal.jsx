import { useState } from 'react';
import { MailCheck, Mail } from 'lucide-react';
import Modal from '../common/Modal.jsx';
import Button from '../common/Button.jsx';
import { Field } from '../common/Field.jsx';
import { authService } from '../../services/authService.js';

export default function ForgotPasswordModal({ open, onClose, initialEmail = '' }) {
  const [email, setEmail] = useState(initialEmail); const [state, setState] = useState({ loading: false, error: '', sent: false });
  const submit = async (e) => {
    e.preventDefault(); setState({ loading: true, error: '', sent: false });
    try { await authService.forgotPassword(email); setState({ loading: false, error: '', sent: true }); }
    catch (err) { setState({ loading: false, error: err.message, sent: false }); }
  };
  const close = () => { setState({ loading: false, error: '', sent: false }); onClose(); };
  return (
    <Modal open={open} onClose={close} size="sm" title="Reset your password" description="We’ll email you a link to choose a new password.">
      {state.sent ? (
        <div className="text-center py-4"><MailCheck className="w-12 h-12 mx-auto text-emerald-300" aria-hidden />
          <p className="mt-3 text-white font-semibold">Check your inbox</p>
          <p className="mt-1 text-body-sm text-on-surface-variant">If an account exists for <b className="text-white">{email}</b>, a reset link is on its way. (Demo only — no email is actually sent.)</p>
          <Button className="mt-5" variant="secondary" onClick={close}>Back to sign in</Button></div>
      ) : (
        <form onSubmit={submit} noValidate className="space-y-4">
          <Field label="Email address" type="email" icon={Mail} value={email} onChange={(e) => setEmail(e.target.value)} error={state.error} placeholder="you@example.com" data-autofocus autoComplete="email" />
          <div className="flex justify-end gap-2"><Button variant="secondary" onClick={close}>Cancel</Button><Button type="submit" loading={state.loading} loadingText="Sending…">Send reset link</Button></div>
        </form>)}
    </Modal>
  );
}
