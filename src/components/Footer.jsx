export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div>
          <div className="brand footer-brand">
            <span className="brand-mark">TC</span>
            <span className="brand-word">TutorConnect<em>Nepal</em></span>
          </div>
          <p className="text-sm text-muted" style={{ maxWidth: 320 }}>
            Connecting students across Nepal with verified home &amp; online tutors, one class at a time.
          </p>
        </div>
        <div className="footer-col">
          <h4>Platform</h4>
          <a href="/find-tutors">Find Tutors</a>
          <a href="/register">Join as Tutor</a>
          <a href="/bookings">My Bookings</a>
        </div>
        <div className="footer-col">
          <h4>Support</h4>
          <a href="/api/docs" target="_blank" rel="noreferrer">API Docs</a>
          <a href="mailto:support@tutorconnectnepal.com">Contact Support</a>
        </div>
      </div>
      <div className="container">
        <p className="text-sm text-muted footer-legal">© {new Date().getFullYear()} TutorConnect Nepal. Built for students, teachers &amp; guardians nationwide.</p>
      </div>
    </footer>
  );
}
