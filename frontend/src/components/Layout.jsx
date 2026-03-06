import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const API = '/api';

export default function Layout() {
  return (
    <div className="layout">
      <Navbar />

      <main className="main">
        <Outlet />
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <div className="top">
            <div>
              <h2>Are you ready?</h2>
              <h3>100+ components</h3>
            </div>
            <button>Get started</button>
          </div>

          <div className="bottom">
            <div className="logo-content">
              <img className="logo" src="/logo.png" alt="Gift Mart Logo" />
              <div className="socials">
                <a className="fa-brands fa-x-twitter" href="#"></a>
                {/* Add more social links as needed */}
              </div>
            </div>

            <nav>
              <ul>
                <li><h4>GIFT MART</h4></li>
                <li><a href="#">Components</a></li>
              </ul>
              {/* Add more ul's as needed */}
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
