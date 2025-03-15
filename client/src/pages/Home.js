import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <header className="home-header">
        <div className="logo">
          <i className="fas fa-map-marker-alt"></i>
          <span>She-Secure</span>
        </div>
        <nav>
          <ul>
            <li><a href="#features">Features</a></li>
            <li><a href="#testimonials">Testimonials</a></li>
            <li><a href="#about">About</a></li>
            <li><Link to="/login" className="nav-button">Log In</Link></li>
          </ul>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-content">
          <h1>Your Personalized <span className="highlight">Safety</span> Navigation System</h1>
          <p>
            She-Secure empowers women to travel safely by providing real-time route options,
            safety alerts, and location sharing capabilities - all in one secure platform.
          </p>
          <div className="cta-buttons">
            <Link to="/login" className="cta-button primary">
              Log In
            </Link>
            <Link to="/register" className="cta-button secondary">
              Sign Up
            </Link>
          </div>
        </div>
        <div className="hero-image">
          {/* Placeholder for hero image */}
          <div className="placeholder-image">
          <img src="/SheSecurePic.png" alt="She-Secure" />
          </div>
        </div>
      </section>

      <section id="features" className="features">
        <h2>Key Features</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-route"></i>
            </div>
            <h3>Multiple Route Options</h3>
            <p>Choose from several paths based on safety, time, and distance</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-location-arrow"></i>
            </div>
            <h3>Real-time Location Sharing</h3>
            <p>Share your journey with trusted contacts with one click</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-bell"></i>
            </div>
            <h3>Safety Alerts</h3>
            <p>Receive notifications about potential safety concerns</p>
          </div>
        </div>
      </section>

      <section id="testimonials" className="testimonials">
        <h2>What Our Users Say</h2>
        <div className="testimonial-wrapper">
          <div className="testimonial-card">
            <p>"She-Secure has completely changed how I navigate the city. I feel empowered and safer."</p>
            <div className="testimonial-author">- Sarah Johnson, Designer</div>
          </div>
        </div>
      </section>

      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-logo">
            <i className="fas fa-map-marker-alt"></i>
            <span>She-Secure</span>
            <p>Safety in every step</p>
          </div>
          <div className="footer-links">
            <div>
              <h4>About</h4>
              <ul>
                <li><a href="#about">Our Mission</a></li>
                <li><a href="#about">Team</a></li>
                <li><a href="#about">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4>Resources</h4>
              <ul>
                <li><a href="#resources">Blog</a></li>
                <li><a href="#resources">Safety Tips</a></li>
                <li><a href="#resources">Community</a></li>
              </ul>
            </div>
            <div>
              <h4>Legal</h4>
              <ul>
                <li><a href="#legal">Privacy Policy</a></li>
                <li><a href="#legal">Terms of Service</a></li>
                <li><a href="#legal">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="copyright">
          <p>&copy; 2025 She-Secure. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home; 