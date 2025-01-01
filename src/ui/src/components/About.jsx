import './About.css';

const About = ({ onClose }) => {

    return (
        <div className="about-overlay">
            <div className="about-modal">
                <button
                    className="close-button"
                    onClick={onClose}
                    aria-label="Close instructions"
                >
                    ×
                </button>

                <h2 className="about-title">About</h2>

                <div className="about-section">
                    <h3>👨‍💻 CREATOR</h3>
                    <p>
                        <a href="https://github.com/perjo927" target='_blank'>ProgrammerPer</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default About;
