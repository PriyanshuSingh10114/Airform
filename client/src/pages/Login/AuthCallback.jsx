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

}
