import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  points: number;
  history: Array<{
    id: string;
    action: string;
    points: number;
    timestamp: string;
  }>;
  stats: {
    level: number;
    currentPoints: number;
    nextLevelPoints: number;
    streak: number;
    badges: Array<{
      id: string;
      name: string;
      description: string;
      icon: string;
      acquired: boolean;
      acquiredAt?: string;
    }>;
  };
}

export function ProfileDialog({ open, onOpenChange, points, history, stats }: ProfileDialogProps) {
  const progressToNextLevel = (stats.currentPoints / stats.nextLevelPoints) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>プロフィール</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="overview" className="py-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">概要</TabsTrigger>
            <TabsTrigger value="badges">バッジ</TabsTrigger>
            <TabsTrigger value="history">履歴</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold">Level {stats.level}</h3>
                <div className="mt-2">
                  <Progress value={progressToNextLevel} className="h-2" />
                  <p className="text-sm text-muted-foreground mt-1">
                    次のレベルまで: {stats.nextLevelPoints - stats.currentPoints} pt
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold">総獲得ポイント</h4>
                  <p className="text-2xl font-bold text-primary">{points} pt</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold">連続ログイン</h4>
                  <p className="text-2xl font-bold text-primary">{stats.streak} 日</p>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="badges">
            <div className="grid grid-cols-2 gap-4">
              {stats.badges.map((badge) => (
                <div 
                  key={badge.id} 
                  className={`p-4 border rounded-lg ${badge.acquired ? 'bg-primary/10' : 'opacity-50'}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{badge.icon}</span>
                    <div>
                      <h4 className="font-semibold">{badge.name}</h4>
                      <p className="text-sm text-muted-foreground">{badge.description}</p>
                    </div>
                  </div>
                  {badge.acquired && badge.acquiredAt && (
                    <p className="text-xs text-muted-foreground mt-2">
                      獲得: {format(new Date(badge.acquiredAt), 'yyyy/MM/dd')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="history">
            <ScrollArea className="h-[300px] rounded-md border p-4">
              {history.map((item) => (
                <div key={item.id} className="mb-4 last:mb-0">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{item.action}</span>
                    <span className={`font-bold ${item.points > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {item.points > 0 ? `+${item.points}` : item.points} pt
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(item.timestamp), 'yyyy/MM/dd HH:mm')}
                  </p>
                </div>
              ))}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
} 