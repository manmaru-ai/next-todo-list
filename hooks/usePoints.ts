import { useState, useEffect } from 'react';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  acquired: boolean;
  acquiredAt?: string;
}

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
  streak: number;
  lastActivity: string;
  badges: Badge[];
}

interface PointSystem {
  points: number;
  history: PointHistory[];
  stats: UserStats;
  addPoints: (action: string, points: number) => void;
  checkBadges: (task: any) => void;
  updateStreak: () => void;
}

const INITIAL_BADGES: Badge[] = [
  {
    id: 'first-task',
    name: '始めの一歩',
    description: '最初のタスクを完了',
    icon: '🎯',
    acquired: false
  },
  {
    id: 'speed-runner',
    name: 'スピードランナー',
    description: '24時間以内にタスクを完了',
    icon: '⚡',
    acquired: false
  },
  {
    id: 'perfect-week',
    name: '完璧な一週間',
    description: '7日連続でタスクを完了',
    icon: '🌟',
    acquired: false
  },
  {
    id: 'task-master',
    name: 'タスクマスター',
    description: '合計10個のタスクを完了',
    icon: '👑',
    acquired: false
  },
  {
    id: 'high-achiever',
    name: 'ハイアチーバー',
    description: '高優先度のタスクを5個完了',
    icon: '🏆',
    acquired: false
  }
];

const calculateLevel = (points: number): { level: number; nextLevelPoints: number } => {
  const basePoints = 1000;
  const level = Math.floor(Math.sqrt(points / basePoints)) + 1;
  const nextLevelPoints = Math.pow(level, 2) * basePoints;
  return { level, nextLevelPoints };
};

export const usePoints = (): PointSystem => {
  const [points, setPoints] = useState(0);
  const [history, setHistory] = useState<PointHistory[]>([]);
  const [stats, setStats] = useState<UserStats>({
    level: 1,
    currentPoints: 0,
    nextLevelPoints: 1000,
    streak: 0,
    lastActivity: new Date().toISOString(),
    badges: INITIAL_BADGES
  });

  useEffect(() => {
    const savedPoints = localStorage.getItem('userPoints');
    const savedHistory = localStorage.getItem('pointHistory');
    const savedStats = localStorage.getItem('userStats');
    
    if (savedPoints) {
      const parsedPoints = JSON.parse(savedPoints);
      setPoints(parsedPoints);
      const { level, nextLevelPoints } = calculateLevel(parsedPoints);
      setStats(prev => ({
        ...prev,
        level,
        currentPoints: parsedPoints,
        nextLevelPoints
      }));
    }
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedStats) setStats(JSON.parse(savedStats));
  }, []);

  const updateStreak = () => {
    const today = new Date();
    const lastActivity = new Date(stats.lastActivity);
    const diffDays = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

    let newStreak = stats.streak;
    if (diffDays === 0) {
      // 同じ日の活動
      return;
    } else if (diffDays === 1) {
      // 連続日の活動
      newStreak += 1;
      // ストリークボーナスポイント
      const streakBonus = Math.min(newStreak * 10, 100); // 最大100ポイント
      addPoints(`${newStreak}日連続ログインボーナス`, streakBonus);
    } else {
      // ストリーク切れ
      newStreak = 1;
    }

    const newStats = { ...stats, streak: newStreak, lastActivity: today.toISOString() };
    setStats(newStats);
    localStorage.setItem('userStats', JSON.stringify(newStats));
  };

  const checkBadges = (task: any) => {
    const newBadges = [...stats.badges];
    let badgeUnlocked = false;

    // 各バッジの条件をチェック
    if (!newBadges.find(b => b.id === 'first-task')?.acquired) {
      newBadges.find(b => b.id === 'first-task')!.acquired = true;
      newBadges.find(b => b.id === 'first-task')!.acquiredAt = new Date().toISOString();
      addPoints('バッジ獲得: 始めの一歩', 100);
      badgeUnlocked = true;
    }

    // タスク完了時間のチェック
    const createdAt = new Date(task.createdAt);
    const completedAt = new Date();
    if (!newBadges.find(b => b.id === 'speed-runner')?.acquired &&
        (completedAt.getTime() - createdAt.getTime()) <= 24 * 60 * 60 * 1000) {
      newBadges.find(b => b.id === 'speed-runner')!.acquired = true;
      newBadges.find(b => b.id === 'speed-runner')!.acquiredAt = new Date().toISOString();
      addPoints('バッジ獲得: スピードランナー', 200);
      badgeUnlocked = true;
    }

    // 他のバッジ条件もここで追加...

    if (badgeUnlocked) {
      const newStats = { ...stats, badges: newBadges };
      setStats(newStats);
      localStorage.setItem('userStats', JSON.stringify(newStats));
    }
  };

  const addPoints = (action: string, pointsToAdd: number) => {
    const newPoints = points + pointsToAdd;
    const { level, nextLevelPoints } = calculateLevel(newPoints);
    
    const newHistory: PointHistory = {
      id: crypto.randomUUID(),
      action,
      points: pointsToAdd,
      timestamp: new Date().toISOString(),
    };

    // レベルアップ時のボーナス
    if (level > stats.level) {
      const levelUpBonus = level * 100;
      const levelUpHistory: PointHistory = {
        id: crypto.randomUUID(),
        action: `レベル${level}達成ボーナス`,
        points: levelUpBonus,
        timestamp: new Date().toISOString(),
      };
      setHistory(prev => [levelUpHistory, newHistory, ...prev]);
      setPoints(newPoints + levelUpBonus);
    } else {
      setHistory(prev => [newHistory, ...prev]);
      setPoints(newPoints);
    }

    const newStats = {
      ...stats,
      level,
      currentPoints: newPoints,
      nextLevelPoints
    };

    setStats(newStats);
    localStorage.setItem('userPoints', JSON.stringify(newPoints));
    localStorage.setItem('pointHistory', JSON.stringify(history));
    localStorage.setItem('userStats', JSON.stringify(newStats));
  };

  return {
    points,
    history,
    stats,
    addPoints,
    checkBadges,
    updateStreak
  };
}; 