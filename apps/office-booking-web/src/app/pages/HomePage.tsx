import React from 'react';
import styles from '../styles/shared.module.css';

const HomePage = () => {
  return (
    <div className={styles['pageContainer']}>
      <div className={styles['card']}>
        <div className={styles['header']}>
          <h1 className={styles['title']}>Welcome to Office Booking</h1>
          <p className={styles['subtitle']}>Manage your office space efficiently</p>
        </div>

        <div className={styles['grid']}>
          <div className={styles['card']}>
            <h2 className={styles['title']}>Quick Stats</h2>
            <div className={styles['flexRow']}>
              <div>
                <p>Active Bookings</p>
                <h3>12</h3>
              </div>
              <div>
                <p>Available Rooms</p>
                <h3>8</h3>
              </div>
            </div>
          </div>

          <div className={styles['card']}>
            <h2 className={styles['title']}>Recent Activity</h2>
            <table className={styles['table']}>
              <thead>
                <tr>
                  <th>Room</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Meeting Room A</td>
                  <td>Today, 2:00 PM</td>
                  <td><span className={styles['badgeSuccess']}>Active</span></td>
                </tr>
                <tr>
                  <td>Conference Room</td>
                  <td>Tomorrow, 10:00 AM</td>
                  <td><span className={styles['badgeWarning']}>Pending</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;