import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
  Calendar,
  KeyRound,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Save,
  Ticket,
  User,
  Wallet,
  Award
} from 'lucide-react';

import Avatar from '../../components/common/Avatar.jsx';
import Button from '../../components/common/Button.jsx';
import Modal from '../../components/common/Modal.jsx';
import Badge from '../../components/common/Badge.jsx';
import { Field, PasswordField } from '../../components/common/Field.jsx';

import { authService } from '../../services/authService.js';
import { bookingService } from '../../services/bookingService.js';

import { useAsync } from '../../hooks/useAsync.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useDocTitle } from '../../hooks/useDocTitle.js';

import { ROLES } from '../../data/users.js';
import { formatDate, money } from '../../utils/format.js';
import { passwordStrength, STRENGTH_LABEL } from '../../utils/validators.js';

export default function ProfilePage() {
  useDocTitle('My profile');

  const { user, updateProfile, logout } = useAuth();

  const toast = useToast();
  const nav = useNavigate();

  const stats = useAsync(
    () => bookingService.stats({
      userId: user.id,
      email: user.email
    }),
    [user.id]
  );

  const [edit, setEdit] = useState(false);

  const [f, setF] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    city: user.city || ''
  });

  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const [pw, setPw] = useState(false);

  const [p, setP] = useState({
    current: '',
    next: '',
    confirm: ''
  });

  const [pe, setPe] = useState({});
  const [pbusy, setPbusy] = useState(false);

  const startEdit = () => {
    setF({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      city: user.city || ''
    });

    setErrors({});
    setEdit(true);
  };

  const save = async (e) => {
    e.preventDefault();

    setBusy(true);

    try {
      await updateProfile(f);

      toast.success('Profile updated.');
      setEdit(false);

    } catch (err) {
      if (err.errors) {
        setErrors(err.errors);
      }

      toast.error(err.message);

    } finally {
      setBusy(false);
    }
  };

  const savePw = async (e) => {
    e.preventDefault();

    const er = {};

    if (!p.current) {
      er.current = 'Enter your current password';
    }

    if (p.next.length < 8) {
      er.next = 'Use at least 8 characters';
    }

    if (p.confirm !== p.next) {
      er.confirm = 'Passwords do not match';
    }

    setPe(er);

    if (Object.keys(er).length) return;

    setPbusy(true);

    try {
      await authService.changePassword(user.id, p);

      toast.success('Password changed.');
      setPw(false);

      setP({
        current: '',
        next: '',
        confirm: ''
      });

    } catch (err) {
      setPe(err.errors || {});
      toast.error(err.message);

    } finally {
      setPbusy(false);
    }
  };

  const score = passwordStrength(p.next);

  const role = ROLES[user.role];

  const row = (Icon, label, value) => (
    <div className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0">
      <Icon
        className="w-5 h-5 text-on-surface-variant"
        aria-hidden
      />

      <div className="min-w-0">
        <dt className="text-label-sm uppercase tracking-wider text-on-surface-variant">
          {label}
        </dt>

        <dd className="text-body-md text-white truncate">
          {value || '—'}
        </dd>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-margin-mobile md:px-margin py-8">

      <h1 className="font-headline text-headline-lg-mobile md:text-headline-lg font-bold text-white">
        My Profile
      </h1>

      <div className="mt-6 grid gap-gutter lg:grid-cols-[320px_1fr]">

        {/* Profile Card */}

        <section className="card p-6 text-center h-fit">

          <Avatar
            name={user.name}
            src={user.avatar}
            size="xl"
            className="mx-auto"
          />

          <h2 className="mt-4 font-headline text-headline-sm text-white">
            {user.name}
          </h2>

          <p className="text-body-sm text-on-surface-variant">
            {user.email}
          </p>

          <div className="mt-3 flex justify-center">
            <Badge
              tone={role?.tone === 'gold' ? 'gold' : 'slate'}
              icon={Award}
            >
              {role?.long || user.role}
            </Badge>
          </div>

         

          <Button
            variant="secondary"
            className="w-full mt-5"
            icon={LogOut}
            onClick={() => {
              logout();
              toast.info('You’ve been signed out.');
              nav('/');
            }}
          >
            Sign out
          </Button>

        </section>

        <div className="space-y-gutter-mobile">

          {/* Booking Statistics */}

          <section
            aria-label="Booking statistics"
            className="grid grid-cols-3 gap-3"
          >

            {[
              [Ticket, 'Bookings', stats.data?.total ?? '—'],
              [User, 'Tickets', stats.data?.tickets ?? '—'],
              [
                Wallet,
                'Total spent',
                stats.data ? money(stats.data.spent) : '—'
              ]
            ].map(([I, l, v]) => (
              <div key={l} className="panel p-4">

                <I
                  className="w-5 h-5 text-secondary"
                  aria-hidden
                />

                <p className="mt-2 font-headline text-headline-sm sm:text-headline-md font-bold text-white">
                  {v}
                </p>

                <p className="text-label-sm text-on-surface-variant">
                  {l}
                </p>

              </div>
            ))}

          </section>

          {/* Personal Details */}

          <section className="card p-5 md:p-6" aria-labelledby="pf">

            <div className="flex items-center justify-between">

              <h2
                id="pf"
                className="font-headline text-headline-sm text-white"
              >
                Personal details
              </h2>

              {!edit && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={startEdit}
                >
                  Edit profile
                </Button>
              )}

            </div>

            {edit ? (

              <form
                onSubmit={save}
                noValidate
                className="mt-4 grid sm:grid-cols-2 gap-4"
              >

                <Field
                  label="Full name"
                  icon={User}
                  value={f.name}
                  onChange={(e) => {
                    setF({ ...f, name: e.target.value });
                    setErrors({ ...errors, name: '' });
                  }}
                  error={errors.name}
                />

                <Field
                  label="Email"
                  type="email"
                  icon={Mail}
                  value={f.email}
                  onChange={(e) => {
                    setF({ ...f, email: e.target.value });
                    setErrors({ ...errors, email: '' });
                  }}
                  error={errors.email}
                />

                <Field
                  label="Phone"
                  icon={Phone}
                  value={f.phone}
                  onChange={(e) => {
                    setF({ ...f, phone: e.target.value });
                    setErrors({ ...errors, phone: '' });
                  }}
                  error={errors.phone}
                />

                <Field
                  label="City"
                  icon={MapPin}
                  value={f.city}
                  onChange={(e) => {
                    setF({ ...f, city: e.target.value });
                  }}
                />

                <div className="sm:col-span-2 flex justify-end gap-2">

                  <Button
                    variant="secondary"
                    onClick={() => setEdit(false)}
                    disabled={busy}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    icon={Save}
                    loading={busy}
                    loadingText="Saving…"
                  >
                    Save changes
                  </Button>

                </div>

              </form>

            ) : (

              <dl className="mt-2">

                {row(User, 'Full name', user.name)}
                {row(Mail, 'Email', user.email)}
                {row(Phone, 'Phone', user.phone)}
                {row(MapPin, 'City', user.city)}

              </dl>

            )}

          </section>

          {/* Password & Security */}

          <section className="card p-5 md:p-6 flex flex-wrap items-center justify-between gap-3">

            <div>

              <h2 className="font-headline text-headline-sm text-white">
                Password &amp; security
              </h2>

              <p className="text-body-sm text-on-surface-variant">
                Change your password regularly to keep your account safe.
              </p>

            </div>

            <Button
              variant="secondary"
              icon={KeyRound}
              onClick={() => {
                setPe({});
                setPw(true);
              }}
            >
              Change password
            </Button>

          </section>

          <Link
            to="/my-bookings"
            className="btn-secondary w-full sm:w-auto"
          >
            <Ticket className="w-4 h-4" aria-hidden />
            Go to My Bookings
          </Link>

        </div>

      </div>

      {/* Change Password Modal */}

      <Modal
        open={pw}
        onClose={() => setPw(false)}
        size="sm"
        title="Change password"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setPw(false)}
              disabled={pbusy}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              form="pw-form"
              loading={pbusy}
              loadingText="Updating…"
            >
              Update password
            </Button>
          </>
        }
      >

        <form
          id="pw-form"
          onSubmit={savePw}
          noValidate
          className="space-y-4"
        >

          <PasswordField
            label="Current password"
            value={p.current}
            onChange={(e) => {
              setP({ ...p, current: e.target.value });
              setPe({ ...pe, current: '' });
            }}
            error={pe.current}
            data-autofocus
            autoComplete="current-password"
          />

          <div>

            <PasswordField
              label="New password"
              value={p.next}
              onChange={(e) => {
                setP({ ...p, next: e.target.value });
                setPe({ ...pe, next: '' });
              }}
              error={pe.next}
              autoComplete="new-password"
            />

            <p className="mt-1.5 text-label-sm text-on-surface-variant">
              Strength:{' '}
              <b className="text-white">
                {STRENGTH_LABEL[score]}
              </b>
            </p>

          </div>

          <PasswordField
            label="Confirm new password"
            value={p.confirm}
            onChange={(e) => {
              setP({ ...p, confirm: e.target.value });
              setPe({ ...pe, confirm: '' });
            }}
            error={pe.confirm}
            autoComplete="new-password"
          />

        </form>

      </Modal>

    </div>
  );
}