export default function LoginPage() {
  return (
    <main className="shell">
      <div className="card">
        <h1>Spec Sheet Dashboard Login</h1>
        <p>Use the shared dashboard password to access tenant/unit controls.</p>
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
