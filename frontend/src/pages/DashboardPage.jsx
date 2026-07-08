import { useAuth } from '../context/AuthContext.jsx';

export default function DashboardPage() {
  const { user, setUser } = useAuth();

  const handleLogout = async () => {
    try {
        const response = await fetch('http://localhost:3000/auth/logout', { method: 'POST', credentials: 'include' });
        if (response.ok) {
            setUser(null); // Only wipes state on success
        } else {
            // Handle server-side errors (e.g., 401 Unauthorized, 500 Server Error)
            console.error(`Logout failed with status: ${response.status}`);
        }
    } catch (err) {
        console.error('Network error during logout:', err);
    }
  };



  return (

    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>Dashboard</h1>
      <p>Welcome back, <strong>{user?.name}</strong>!</p>
      <p>Email: {user?.email}</p>
      <button 
        onClick={handleLogout}
        style={{ padding: '8px 16px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        Log Out
      </button>
    </div>
  );
}