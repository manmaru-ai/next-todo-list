import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>プロフィール</DialogTitle>
          <DialogDescription>
            現在のポイントと獲得履歴を確認できます。
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">ポイント: {points}</h3>
            <div className="text-sm text-muted-foreground">
              レベル: {Math.floor(points / 1000) + 1}
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">ポイント獲得履歴</h4>
            <div className="max-h-[200px] overflow-y-auto space-y-2">
              {history.map((entry, index) => (
                <div key={index} className="text-sm border-b pb-2">
                  <div className="font-medium">{entry.action}</div>
                  <div className="text-muted-foreground flex justify-between">
                    <span>+{entry.points}pt</span>
                    <span>{new Date(entry.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 