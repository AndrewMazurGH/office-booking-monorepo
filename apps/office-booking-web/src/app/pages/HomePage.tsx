import React from 'react';

const HomePage = () => {
  return (
    <div>
      <div className="card">
        <h1>Welcome to Office Booking</h1>
        <p>Manage your office space efficiently</p>
      </div>

      <div className="grid">
        <div className="card">
          <h2>Quick Stats</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <p className="stat-label">Active Bookings</p>
              <p className="stat-value">12</p>
            </div>
            <div className="stat-item">
              <p className="stat-label">Available Rooms</p>
              <p className="stat-value">8</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            <div className="activity-item">
              <div>
                <h3>Meeting Room A</h3>
                <p className="text-secondary">Today, 2:00 PM</p>
              </div>
              <span className="badge badge-success">Active</span>
            </div>
            <div className="activity-item">
              <div>
                <h3>Conference Room</h3>
                <p className="text-secondary">Tomorrow, 10:00 AM</p>
              </div>
              <span className="badge badge-warning">Pending</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;