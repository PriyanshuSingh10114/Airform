import "./Navbar.css";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="nav">
      <Link to="/dashboard" className="nav-logo">Hiring Task</Link>

      <div>
        <Link to="/dashboard" className="nav-link">Dashboard</Link>
      </div>
    </nav>
  );
}
