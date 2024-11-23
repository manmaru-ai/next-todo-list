import { useState, useEffect } from 'react';

interface PointHistory {
  id: string;
  action: string;
  points: number;
  timestamp: string;
}

interface UserStats {
  level: number;
  currentPoints: number;
  nextLevelPoints: number;
}

export const usePoints = () => {
  const [points, setPoints] = useState(0);
  const [history, setHistory] = useState<PointHistory[]>([]);
  const [stats, setStats] = useState<UserStats>({
    level: 1,
    currentPoints: 0,
    nextLevelPoints: 1000,
  });

  useEffect(() => {
    // LocalStorageからデータを読み込む
    const savedPoints = localStorage.getItem('userPoints');
    const savedHistory = localStorage.getItem('pointHistory');
    const savedStats = localStorage.getItem('userStats');

    if (savedPoints) setPoints(JSON.parse(savedPoints));
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedStats) setStats(JSON.parse(savedStats));
  }, []);

  const addPoints = (action: string, pointsToAdd: number) => {
    const newPoints = points + pointsToAdd;
    const newHistory = [...history, {
      id: crypto.randomUUID(),
      action,
      points: pointsToAdd,
      timestamp: new Date().toISOString()
    }];

    // レベルの更新
    const newStats = { ...stats };
    
    // レベルアップのチェック
    while (newPoints >= newStats.nextLevelPoints) {
      newStats.level += 1;
      newStats.currentPoints = newPoints - newStats.nextLevelPoints;
      newStats.nextLevelPoints = Math.floor(newStats.nextLevelPoints * 1.5);
    }

    // 状態の更新とLocalStorageへの保存
    setPoints(newPoints);
    setHistory(newHistory);
    setStats(newStats);

    localStorage.setItem('userPoints', JSON.stringify(newPoints));
    localStorage.setItem('pointHistory', JSON.stringify(newHistory));
    localStorage.setItem('userStats', JSON.stringify(newStats));
  };

  return {
    points,
    history,
    stats,
    addPoints
  };
}; 