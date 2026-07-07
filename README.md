# TutorConnect Nepal — Frontend

A React (Vite) frontend built against the [`tutor-connect-backend`](https://github.com/subhash871/tutor-connect-backend) Django REST API. It implements the full student/tutor marketplace flow: auth, tutor discovery, bookings, payments, reviews, wishlist, real-time-ish chat, and notifications.

## Stack

- React 19 + Vite
- react-router-dom for routing
- axios for API calls, with a JWT access/refresh interceptor
- Plain CSS with design tokens (no UI framework) — see `src/styles/`

## Getting started

```bash
npm install
npm run dev
```

By default the app expects the Django API at `http://127.0.0.1:8000` (set in `.env` as `VITE_API_BASE_URL`). The backend's `CORS_ALLOWED_ORIGINS` already includes `http://localhost:5173`, which is Vite's default dev port, so no backend changes are needed for local development.

Start the backend per its own README (typically `python manage.py runserver`), then run the frontend dev server and open the printed local URL.

## Project structure

```
src/
  api/            # One module per Django app: auth, users, teachers, students,
                   bookings, payments, reviews, wishlist, chat, notifications
  api/client.js   # Axios instance, JWT storage, refresh-token interceptor,
                   error-message normalizer for the backend's error envelope
  context/        # AuthContext (session/user state), ToastContext (toasts)
  components/     # Navbar, Footer, TeacherCard, StarRating, modals, etc.
  pages/          # One file per route (see below)
  utils/          # Response-envelope unwrapping, media URL resolution
  styles/         # Global tokens + one stylesheet per page/feature area
```

## Routes implemented

| Route | Purpose |
|---|---|
| `/` | Landing page with featured tutors & subjects |
| `/find-tutors` | Search/filter tutors (subject, price via ordering, teaching mode, rating) |
| `/teachers/:id` | Tutor profile — bio, qualifications, experience, certificates, gallery, availability, reviews, booking + wishlist actions |
| `/login`, `/register` | Auth (role selection: student or tutor) |
| `/verify-email`, `/forgot-password`, `/reset-password` | OTP-based email verification & password reset |
| `/student/dashboard` | Student profile, subject preferences, upcoming sessions |
| `/teacher/dashboard` | Tutor profile editor, subjects, qualifications/experience/certificates, weekly availability, gallery, earnings |
| `/bookings` | Booking list with role-aware actions (accept/reject/complete/cancel/reschedule/pay) |
| `/wishlist` | Saved tutors (students only) |
| `/chat` | Conversations + messages (polls every 4s; the backend exposes Django Channels websockets under `apps.chat.routing`, which could replace polling later) |
| `/notifications` | Notification feed with mark-as-read / mark-all-read |
| `/account-settings` | Shared profile fields (name, photo, bio, address) + change password |

## API coverage

Every endpoint documented in the backend's `docs/thunder-client-api-guide.md` is wired up in `src/api/*.js`, including the extra `mark_all_read` / `unread_count` notification actions and `toggle_availability` / `add_subject` / `remove_subject` teacher actions found directly in the viewsets.

Payments are integrated against `initiate_payment` / `verify_payment` with eSewa, Khalti, and Stripe as selectable methods; since the backend's webhook handlers are stubs (`apps/payments/views.py`), the frontend's "confirm payment" step calls `verify_payment` directly, standing in for a real gateway redirect.

## Notes & assumptions

- The backend wraps most responses as `{ success, data, pagination }` but a few endpoints (e.g. `/users/me/`, `/students/profiles/my_profile/`, `/payments/initiate_payment/`) return raw objects. `src/utils/unwrap.js` normalizes both shapes.
- `Booking.teacher` is the tutor's **User** id, while `Review.teacher` is the **TeacherProfile** id — the frontend uses the correct id in each case (see `BookingModal.jsx` vs the review flow).
- Role-gated routes redirect to `/login` (unauthenticated) or `/` (wrong role) via `ProtectedRoute`.
