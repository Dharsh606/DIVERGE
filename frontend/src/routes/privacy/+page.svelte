<svelte:head>
  <title>Privacy Policy - DIVERGE</title>
  <meta name="description" content="Privacy Policy for DIVERGE music streaming service." />
</svelte:head>

<div class="legal-container">
  <div class="legal-header">
    <a href="/" class="back-link">&larr; Back to home</a>
    <h1>Privacy Policy</h1>
    <p class="effective-date text-muted">Last updated: October 15, 2026</p>
  </div>

  <div class="legal-content">
    <section>
      <h2>1. Overview</h2>
      <p>
        DIVERGE is committed to respecting your privacy. This Privacy Policy explains how your information is collected, used, and safeguarded when you access and use the DIVERGE music streaming service.
      </p>
    </section>

    <section>
      <h2>2. Information We Collect</h2>
      <p>
        We collect only the minimum information necessary to provide the service:
      </p>
      <ul>
        <li><strong>Account Information:</strong> When you register, we store your username, email address, and a securely salted and hashed password.</li>
        <li><strong>Listening Activity:</strong> When you stream tracks, we log the track identifier, playback duration, completion status, and optional user-assigned context tags to compute your personal listening history and listening trace.</li>
        <li><strong>Session Information:</strong> When you create or join a shared listening session, room membership and synchronized playback state are temporarily maintained.</li>
      </ul>
    </section>

    <section>
      <h2>3. How We Use Information</h2>
      <p>
        Your information is used solely to provide core service capabilities:
      </p>
      <ul>
        <li>Authenticating your account sessions via secure HTTP-only session cookies.</li>
        <li>Generating personalized recommendations, Anti-Algorithm discovery playlists, and Sound Canvas coordinates.</li>
        <li>Visualizing your personal listening journey on your Trace tree.</li>
        <li>Allowing you to create, edit, and share music playlists.</li>
      </ul>
    </section>

    <section>
      <h2>4. Data Storage and Retention</h2>
      <p>
        All user data is stored within our local PostgreSQL database. We do not sell, rent, monetize, or transfer your personal data to external third parties. Audio content is streamed directly from open-access repositories under Creative Commons licenses.
      </p>
    </section>

    <section>
      <h2>5. Security</h2>
      <p>
        We employ industry standard security practices including bcrypt password hashing, scoped JSON Web Tokens, and strict parameterized database queries to protect your data against unauthorized access.
      </p>
    </section>

    <section>
      <h2>6. Your Rights and Inquiries</h2>
      <p>
        You have the right to request deletion or modification of your account details and listening history at any time through your account preferences or by contacting support.
      </p>
    </section>
  </div>
</div>

<style>
  .legal-container {
    max-width: 760px;
    margin: 0 auto;
    padding: 2.5rem 1.5rem 4rem;
  }

  .legal-header {
    margin-bottom: 2.5rem;
    border-bottom: 1px solid var(--color-border);
    padding-bottom: 1.5rem;
  }

  .back-link {
    display: inline-block;
    color: var(--color-primary);
    font-size: var(--text-sm);
    margin-bottom: 1rem;
    text-decoration: none;
  }

  .back-link:hover {
    text-decoration: underline;
  }

  h1 {
    font-size: var(--text-3xl);
    font-weight: 700;
    color: var(--color-text);
    margin-bottom: 0.5rem;
  }

  .effective-date {
    font-size: var(--text-sm);
  }

  .legal-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  section h2 {
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--color-text);
    margin-bottom: 0.75rem;
  }

  section p {
    color: var(--color-text-muted);
    line-height: 1.7;
    margin-bottom: 0.75rem;
  }

  section ul {
    margin-left: 1.25rem;
    color: var(--color-text-muted);
    line-height: 1.7;
  }

  section li {
    margin-bottom: 0.5rem;
  }

  section strong {
    color: var(--color-text);
  }
</style>
