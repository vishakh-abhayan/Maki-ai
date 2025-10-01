import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface Task {
  id: string;
  title: string;
  source: string;
  dueDate: string;
  priority?: 'high' | 'medium' | 'low';
  completed: boolean;
}

interface TaskItemProps {
  task: Task;
  onToggle?: (id: string) => void;
}

const TaskItem = ({ task, onToggle }: TaskItemProps) => {
  return (
    <div className={cn(
      "flex items-start gap-4 p-4 rounded-xl transition-all duration-300",
      "hover:bg-white/5",
      task.completed && "opacity-60"
    )}>
      <Checkbox
        checked={task.completed}
        onCheckedChange={() => onToggle?.(task.id)}
        className="mt-1 border-white/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
      />
      
      <div className="flex-1 space-y-1">
        <p className={cn(
          "font-medium",
          task.completed && "line-through text-subtle"
        )}>
          {task.title}
        </p>
        
        <div className="flex items-center gap-2 text-sm text-subtle">
          <span>Due: {task.dueDate}</span>
          {task.priority === 'high' && (
            <Badge variant="destructive" className="text-xs px-2 py-0">
              High Priority
            </Badge>
          )}
        </div>
        
        <p className="text-xs text-muted-subtle">From: {task.source}</p>
      </div>
    </div>
  );
};

export default TaskItem;
