import { Link } from "react-router-dom";
import "./Home.css";

export default function Home() {
  return (
    <div className="home-container">
      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">Hiring Task of BustBrain Labs</div>
          <h1 className="hero-title">
            Build beautiful forms <br /> with <span className="text-gradient">Airtable</span>
          </h1>
          <p className="hero-subtitle">
            The premium Airtable-powered form builder. Design, publish, and collect responses seamlessly with a touch of elegance.
          </p>

          <div className="hero-cta">
            <Link to="/login" className="btn btn-primary btn-lg">Login</Link>
            <Link to="/dashboard" className="btn btn-secondary btn-lg">View Dashboard</Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="home-footer">
        <div className="container">
          <p>© {new Date().getFullYear()} Hiring Task of BustBrain Labs</p>
          <p>Created by Priyanshu Singh. Assignment for BustBrain Labs.</p>
        </div>
      </footer>
    </div>
  );
}
