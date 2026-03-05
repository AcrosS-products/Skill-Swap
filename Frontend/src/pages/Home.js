import React from 'react';
import { Link } from 'react-router-dom';

// --- Data for the moving courses ---
// We define it here to make it easy to change
const popularSkills = [
  "React.js",
  "Photography",
  "Spanish",
  "Guitar Lessons",
  "Advanced Baking",
  "Digital Marketing",
  "Adobe Illustrator",
  "Python for Beginners"
];

const Home = () => {
    return (
        // Fragment to hold everything
        <>
            {/* --- SECTION 1: HERO & ANIMATED HEADER --- */}
            <header className="hero-section">
                
                {/* This is your "crazy" animated header from our last chat */}
                {/* It will animate and stick to the top after 2 seconds */}

            <div>
                
            </div>

                
                <div className="hero-content">
                    <h1 className="hero-title">Swap Your Skill, Expand Your World.</h1>
                    <p className="hero-subtitle">Connect with experts. Learn new skills. Share your passion. It's all free!</p>
                    <Link to="/skills" className="cta-button">🚀 Explore Skills</Link>
                </div>
            </header>

            <main>
                {/* --- SECTION 2: HOW IT WORKS --- */}
                <section className="how-it-works">
                    <h2>How Skill Swap Works</h2>
                    <div className="steps-container">
                        <div className="step">
                            <h3>1. Find a Skill</h3>
                            <p>Search our vast library for thousands of skills you want to learn, from coding to cooking.</p>
                        </div>
                        <div className="step">
                            <h3>2. Offer a Skill</h3>
                            <p>Post what you're an expert in. Your passion for baking could be someone else's new hobby.</p>
                        </div>
                        <div className="step">
                            <h3>3. Connect & Swap</h3>
                            <p>Message users directly, set up a time, and start swapping knowledge. It's that simple.</p>
                        </div>
                    </div>
                </section>

                {/* --- SECTION 3: POPULAR COURSES (ANIMATED) --- */}
                <section id="popular" className="popular-courses">
                    <h2>Popular Skills This Week</h2>
                    <div className="courses-marquee-container">
                        <div className="courses-marquee">
                            {/* We render the list twice for a seamless infinite loop */}
                            <div className="course-track">
                                {popularSkills.map((skill, index) => (
                                    <div className="course-card" key={`a-${index}`}>{skill}</div>
                                ))}
                            </div>
                            <div className="course-track" aria-hidden="true">
                                {popularSkills.map((skill, index) => (
                                    <div className="course-card" key={`b-${index}`}>{skill}</div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- SECTION 4: WHY JOIN? --- */}
                <section className="why-join">
                    <h2>Why You'll Love Skill Swap</h2>
                    <div className="features-grid">
                        <div className="feature-card">
                            <h3>Learn for Free</h3>
                            <p>Trade your knowledge, not your money. All learning is based on a mutual exchange of skills.</p>
                        </div>
                        <div className="feature-card">
                            <h3>Build Community</h3>
                            <p>Connect with like-minded learners and passionate teachers from all over the world.</p>
                        </div>
                        <div className="feature-card">
                            <h3>Grow Your Network</h3>
                            <p>Meet professionals, hobbyists, and mentors who can help you on your personal and professional journey.</p>
                        </div>
                        <div className="feature-card">
                            <h3>Flexible Learning</h3>
                            <p>No strict schedules. Arrange swaps at times that work for both you and your learning partner.</p>
                        </div>
                    </div>
                </section>
            </main>

            {/* --- FOOTER --- */}
            <footer>
                <p>© 2025 Skill Swap. All rights reserved.</p>
            </footer>
        </>
    )
}

export default Home;