import "./Login.css";

export default function Login() {
  const handleLogin = () => {
    window.location.href = "http://localhost:7000/auth/airtable";
  };

  return (
    <div className="login-container">
      <div className="card login-card">
        <h1 className="login-title">AirForm</h1>
        <p className="login-tagline">
          Connect your Airtable to start building powerful forms.
        </p>

        <button className="btn btn-primary login-btn" onClick={handleLogin}>
          Login with Airtable
        </button>
      </div>
    </div>
  );
}

