import { useEffect } from 'react';
import Countdown from './Countdown.jsx';
import './Modal.css';

const Modal = ({
    isOpen,
    onClose,
    type = 'default',
    children
}) => {
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose?.();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className={`modal-container ${type}`}
                onClick={e => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    );
};

const getGameOverMessage = (reason, reasons) => {
    return "Spelet är över"
}

// Specialized Game Over Modal
export const GameOverModal = ({
    gameState,
    onShare,
    isOpen,
    onClose,
}) => {
    return (
        <Modal
            isOpen={isOpen} onClose={onClose}
            type="game-over"
        >
            <header className="modal-header">

                <h2>{getGameOverMessage()}</h2>
                <button className="modal-close" onClick={onClose}>×</button>
            </header>

            <div className='modal-broadcast'>
                <p>Nästa spel börjar om:</p>
                <Countdown />
            </div>

            <div className="modal-content">
                Dagens ord: TODO: gameState
                Länk
            </div>

            <footer className="modal-footer">
                {onShare && (
                    <button
                        className={`modal-button primary`}
                        onClick={onShare}
                    >
                        Dela
                    </button>
                )}
            </footer>
        </Modal>
    );
};



export default Modal;
