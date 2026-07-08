import { useState } from "react";
import { Navigate, useNavigate  } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { loginUser } from '../../services/authService.js';
import { GoogleIcon, GitHubIcon } from '../components/Icons.jsx';

import '../styles/auth.css'

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    
    const { user, loading, setUser } = useAuth();

    if (loading) return null;
    if (user) return <Navigate to="/dashboard" replace />;


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = await loginUser({ email, password });
            setUser(data.user);
            navigate("/dashboard", { replace: true });
        } catch (error) {
            console.error(error.message || "network error", error)
        }
    };

    return (
        <div className="page">
        <div className="card">
            <h1 className="title">Sign In</h1>
            <p className="subtitle">Welcome back. Enter your details below.</p>

            <div className="form">
            <div className="field">
                <label className="label">Email</label>
                <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                />
            </div>


            <div className="field">
                <label className="label">Password</label>
                <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                />
            </div>

            <button onClick={handleSubmit} className="btnPrimary">
                Sign In
            </button>

            <div className="divider">
                <span className="dividerLine" />
                <span className="dividerText">or</span>
                <span className="dividerLine" />
            </div>

            <a href="http://localhost:3000/auth/google" className="btnGoogle">
                <GoogleIcon />
                Continue with Google
            </a>
            <br />
            <a href="http://localhost:3000/auth/github" className="btnGoogle">
                <GitHubIcon />
                Continue with Github
            </a>
            </div>

            <p className="footer">
            Don't have an account?{" "}
            <a onClick={() => navigate("/signup")} className="footerLink">Sign up</a>
            </p>
        </div>
        </div>
    );
}

