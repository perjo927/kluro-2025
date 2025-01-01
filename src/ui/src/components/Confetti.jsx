// components/Confetti.jsx
import { useEffect, useRef } from 'react';
import './Confetti.css';

// Helper to generate random number within a range
const random = (min, max) => Math.random() * (max - min) + min;

// Different particle shapes for variety
const SHAPES = {
    CIRCLE: 'circle',
    SQUARE: 'square',
    STAR: 'star',
    RIBBON: 'ribbon'
};

// Vibrant color palette for the celebration
const COLORS = [
    '#FF0000', '#FF3381', '#FF00FF', // Reds and magentas
    '#4B0082', '#0000FF', '#0085FF', // Blues and indigos
    '#00FF00', '#39FF14', '#00FF85', // Greens
    '#FFFF00', '#FFD700', '#FFA500', // Yellows and golds
    '#FFFFFF', '#FFFFFF' // Some white for sparkle
];

const Confetti = ({ isActive }) => {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const particlesRef = useRef([]);

    useEffect(() => {
        if (!isActive || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Set canvas size to window size
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Create initial particles with varied properties
        const createParticles = () => {
            const particles = [];
            const particleCount = 150; // Increased particle count

            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: random(0, canvas.width),
                    y: random(-canvas.height, 0),
                    shape: Object.values(SHAPES)[Math.floor(random(0, 4))],
                    size: random(8, 22),
                    color: COLORS[Math.floor(random(0, COLORS.length))],
                    velocity: {
                        x: random(-3, 3),
                        y: random(2, 5)
                    },
                    rotation: random(0, 360),
                    rotationSpeed: random(-2, 2),
                    oscillationSpeed: random(0.01, 0.03),
                    oscillationDistance: random(20, 50),
                    initialX: 0,
                    opacity: 1,
                    fadeOut: random(0.95, 0.99)
                });
            }
            return particles;
        };

        // Draw different particle shapes
        const drawParticle = (particle) => {
            ctx.save();
            ctx.translate(particle.x, particle.y);
            ctx.rotate((particle.rotation * Math.PI) / 180);
            ctx.globalAlpha = particle.opacity;
            ctx.fillStyle = particle.color;

            switch (particle.shape) {
                case SHAPES.CIRCLE:
                    ctx.beginPath();
                    ctx.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                case SHAPES.SQUARE:
                    ctx.fillRect(-particle.size / 2, -particle.size / 2,
                        particle.size, particle.size);
                    break;
                case SHAPES.STAR:
                    drawStar(ctx, 0, 0, 5, particle.size / 2, particle.size / 4);
                    break;
                case SHAPES.RIBBON:
                    drawRibbon(ctx, particle.size);
                    break;
            }
            ctx.restore();
        };

        // Helper function to draw star shape
        const drawStar = (ctx, cx, cy, spikes, outerRadius, innerRadius) => {
            ctx.beginPath();
            for (let i = 0; i < spikes * 2; i++) {
                const radius = i % 2 === 0 ? outerRadius : innerRadius;
                const angle = (i * Math.PI) / spikes;
                const x = cx + Math.cos(angle) * radius;
                const y = cy + Math.sin(angle) * radius;
                i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
        };

        // Helper function to draw ribbon shape
        const drawRibbon = (ctx, size) => {
            ctx.beginPath();
            ctx.moveTo(-size / 2, 0);
            ctx.quadraticCurveTo(0, -size / 2, size / 2, 0);
            ctx.quadraticCurveTo(0, size / 2, -size / 2, 0);
            ctx.fill();
        };

        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particlesRef.current = particlesRef.current.filter(particle => {
                // Update position
                particle.x += particle.velocity.x;
                particle.y += particle.velocity.y;

                // Add oscillation
                particle.x += Math.sin(particle.y * particle.oscillationSpeed) *
                    particle.oscillationDistance;

                // Update rotation
                particle.rotation += particle.rotationSpeed;

                // Add gravity and wind resistance
                particle.velocity.y += 0.1;
                particle.velocity.x *= 0.99;

                // Fade out
                particle.opacity *= particle.fadeOut;

                // Draw if still visible
                if (particle.opacity > 0.1) {
                    drawParticle(particle);
                    return true;
                }
                return false;
            });

            // Add new particles if needed
            if (particlesRef.current.length < 20) {
                particlesRef.current.push(...createParticles());
            }

            animationRef.current = requestAnimationFrame(animate);
        };

        // Start the celebration
        particlesRef.current = createParticles();
        animate();

        // Cleanup
        return () => {
            cancelAnimationFrame(animationRef.current);
            window.removeEventListener('resize', resizeCanvas);
        };
    }, [isActive]);

    return (
        <canvas
            ref={canvasRef}
            className="confetti-canvas"
        />
    );
};

export default Confetti;
