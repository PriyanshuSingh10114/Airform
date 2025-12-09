import { useEffect, useContext } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export default function AuthCallback() {
    const [searchParams] = useSearchParams();
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        const userId = searchParams.get("userId");
        if (userId) {
            login(userId);
            navigate("/dashboard");
        } else {
            navigate("/login");
        }
    }, [searchParams, login, navigate]);

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            fontFamily: 'Inter, sans-serif'
        }}>
            <h2>Logging you in...</h2>
        </div>
    );
}
