'use client'

import { useEffect, useState } from 'react';

interface ConfettiProps {
  show: boolean;
  onComplete: () => void;
}

export function Confetti({ show, onComplete }: ConfettiProps) {
  const [particles, setParticles] = useState<Array<{ id: number; color: string; x: number; y: number; rotation: number }>>([]);

  useEffect(() => {
    if (!show) return;

    // 紙吹雪のパーティクルを生成
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      color: ['#FFD700', '#FF6B6B', '#4CAF50', '#2196F3'][Math.floor(Math.random() * 4)],
      x: Math.random() * window.innerWidth,
      y: -20,
      rotation: Math.random() * 360
    }));

    setParticles(newParticles);

    // アニメーション終了後にクリーンアップ
    const timer = setTimeout(() => {
      setParticles([]);
      onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-3 h-3 transform transition-all duration-3000 ease-out"
          style={{
            backgroundColor: particle.color,
            left: particle.x,
            top: particle.y,
            transform: `rotate(${particle.rotation}deg)`,
            animation: 'confetti-fall 3s ease-out forwards'
          }}
        />
      ))}
      <style jsx global>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
} 