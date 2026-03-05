import React from 'react';
import './Footer.css';

const Footer = () => {
  const handleContactClick = () => {
    window.location.href = 'mailto:contact@skillswap.com?subject=Contact from SkillSwap';
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Logo & About Section */}
        <div className="footer-brand">
          <div className="footer-logo">
            <span className="logo-icon"><img src="favicon.png" alt="skillswap" /></span>
            <h3>SkillSwap</h3>
          </div>
          <p>Learn skills from experts. Share your passion. Connect with professionals worldwide.</p>
          <div className="social-links">
            <a href="/" className="social-icon">f</a>
            <a href="/" className="social-icon">𝕏</a>
            <a href="/" className="social-icon">in</a>
          </div>
        </div>

        {/* Link Sections */}
        <div className="footer-links">
          <div className="footer-section">
            <h4>Skill Swap</h4>
            <ul>
              <li><a href="/">Partner With Us</a></li>
              <li><a href="/">About</a></li>
              <li><a href="/">For Business</a></li>
              <li><a href="/">Affiliates</a></li>
              <li><a href="/">Careers</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Connect</h4>
            <ul>
              <li><button onClick={handleContactClick} className="footer-link-btn">Contact Us</button></li>
              <li><a href="/">Idea Hub</a></li>
              <li><a href="/">Help Center</a></li>
              <li><a href="/">Security</a></li>
              <li><a href="/">Media Kit</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Legal</h4>
            <ul>
              <li><a href="/">Terms of Service</a></li>
              <li><a href="/">Privacy Policy</a></li>
              <li><a href="/">Cookie Policy</a></li>
              <li><a href="/">Accessibility</a></li>
              <li><a href="/">Sitemap</a></li>
            </ul>
          </div>
        </div>

        {/* Right Section - Language */}
        <div className="footer-language">
          <label>Choose your language</label>
          <div className="language-selector">
            <select defaultValue="en">
              <option value="en">English</option>
            </select>
            <button className="apply-btn">Apply</button>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <p>&copy; 2025 SkillSwap. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
