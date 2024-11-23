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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">概要</TabsTrigger>
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
              <div className="grid grid-cols-1 gap-4 text-center">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold">総獲得ポイント</h4>
                  <p className="text-2xl font-bold text-primary">{points} pt</p>
                </div>
              </div>
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
  );
} 