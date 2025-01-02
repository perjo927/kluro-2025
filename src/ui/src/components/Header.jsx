import { useState } from 'react';
import './Header.css';
import Volume from './Volume';

const Header = ({ onShowAbout, volumeOff, onVolumeOffToggle }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="game-header">
            <div className="header-content">
                <div style={{ width: "40px" }}>
                    <Volume
                        volumeOff={volumeOff}
                        onVolumeOffToggle={onVolumeOffToggle} />
                </div>
                <h1 className="game-title">
                    🅺🅻🆄🆁🅾
                </h1>

                <button
                    className={`menu-button ${isMenuOpen ? 'active' : ''}`}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Menu"
                >
                    <span className="menu-icon"></span>
                </button>
            </div>

            <div className={`menu-panel ${isMenuOpen ? 'open' : ''}`}>
                <nav className="menu-nav">

                    <button
                        className="menu-item"
                        onClick={() => {
                            onShowAbout();
                            setIsMenuOpen(false);
                        }}
                    >
                        <span className="menu-icon-about">👨‍💻</span>
                        About
                    </button>
                </nav>
            </div>

            {isMenuOpen && (
                <div
                    className="menu-overlay"
                    onClick={() => setIsMenuOpen(false)}
                ></div>
            )}
        </header>
    );
};

export default Header;
