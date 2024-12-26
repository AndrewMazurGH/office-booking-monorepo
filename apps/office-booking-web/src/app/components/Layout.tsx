import { Link, useLocation } from 'react-router-dom';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Bookings', href: '/bookings' },
  { name: 'Profile', href: '/profile' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem('access_token');

  return (
    <div>
      <nav className="nav">
        <div className="container nav-content">
          <Link to="/" className="nav-link">
            <h1>Office Booking</h1>
          </Link>
          
          <div className="nav-links">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`nav-link ${location.pathname === item.href ? 'active' : ''}`}
              >
                {item.name}
              </Link>
            ))}
            
            {!isLoggedIn ? (
              <Link to="/login" className="btn btn-primary">
                Log in
              </Link>
            ) : (
              <button
                onClick={() => {
                  localStorage.removeItem('access_token');
                  window.location.href = '/login';
                }}
                className="btn btn-primary"
              >
                Sign out
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="main-content">
        <div className="container">
          <div className="card">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}