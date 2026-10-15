<svelte:head>
  <title>Terms and Conditions - DIVERGE</title>
  <meta name="description" content="Terms and Conditions of use for DIVERGE music streaming service." />
</svelte:head>

<div class="legal-container">
  <div class="legal-header">
    <a href="/" class="back-link">&larr; Back to home</a>
    <h1>Terms and Conditions</h1>
    <p class="effective-date text-muted">Last updated: October 15, 2026</p>
  </div>

  <div class="legal-content">
    <section>
      <h2>1. Acceptance of Terms</h2>
      <p>
        By creating an account or accessing the DIVERGE music streaming service, you agree to comply with and be bound by these Terms and Conditions. If you do not agree to these terms, do not access or use the service.
      </p>
    </section>

    <section>
      <h2>2. Permitted Use and Audio Licensing</h2>
      <p>
        The music available on DIVERGE is cataloged via open APIs under Creative Commons and free distribution licenses. You are permitted to stream and, where permitted, cache audio files for personal non-commercial listening purposes.
      </p>
      <p>
        You agree not to bypass digital rights management, re-sell audio streams, or redistribute music content in violation of original artist copyright terms.
      </p>
    </section>

    <section>
      <h2>3. User Accounts</h2>
      <p>
        You are responsible for maintaining the confidentiality of your credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
      </p>
    </section>

    <section>
      <h2>4. Community Features and Shared Sessions</h2>
      <p>
        DIVERGE provides shared listening sessions and public playlist sharing. You agree not to distribute malicious links, harass other listeners, or use automated scripts to spam room queues.
      </p>
    </section>

    <section>
      <h2>5. Service Availability and Modifications</h2>
      <p>
        DIVERGE is provided on an "as is" and "as available" basis. We reserve the right to modify, suspend, or discontinue aspects of the platform at any time without prior notice.
      </p>
    </section>

    <section>
      <h2>6. Governing Law</h2>
      <p>
        These terms shall be governed by and construed in accordance with applicable laws governing digital service delivery.
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
</style>
