export default function LoginPage() {
  const authBypassEnabled = /^(1|true|yes|on)$/i.test(process.env.AUTH_BYPASS || '');

  return (
    <main className="shell">
      <div className="card">
        <h1>Spec Sheet Dashboard Login</h1>
        <p>
          {authBypassEnabled
            ? 'Auth bypass is currently enabled, so dashboard access is open for now.'
            : 'Enter the dashboard password to continue.'}
        </p>
        <form className="stack" method="post" action="/api/login">
          <input name="password" type="password" placeholder="Dashboard password" required />
          <button className="button" type="submit">
            Sign In
          </button>
        </form>
        <p>
          Set <code>DASHBOARD_PASSWORD</code> in your environment for production.
        </p>
      </div>
    </main>
  );
}
