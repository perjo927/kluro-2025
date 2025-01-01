import { useState, useEffect } from 'react';

const Countdown = () => {
    const [timeLeft, setTimeLeft] = useState(getTimeUntilNextDay());

    function getTimeUntilNextDay() {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        return Math.max(0, tomorrow - now);
    }

    function formatTime(ms) {
        const seconds = Math.floor((ms / 1000) % 60);
        const minutes = Math.floor((ms / (1000 * 60)) % 60);
        const hours = Math.floor((ms / (1000 * 60 * 60)));

        return {
            hours: String(hours).padStart(2, '0'),
            minutes: String(minutes).padStart(2, '0'),
            seconds: String(seconds).padStart(2, '0')
        };
    }

    useEffect(() => {
        const timer = setInterval(() => {
            const newTime = getTimeUntilNextDay();
            setTimeLeft(newTime);

            if (newTime <= 0) {
                clearInterval(timer);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const time = formatTime(timeLeft);

    return (
        <time>
            <span>
                {time.hours}
                <small>TIMMAR</small>
            </span>
            <span>
                {time.minutes}
                <small>MINUTER</small>
            </span>
            <span>
                {time.seconds}
                <small>SEKUNDER</small>
            </span>
        </time>
    );
};

export default Countdown;
