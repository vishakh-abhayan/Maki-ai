import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { apiService, Task } from "@/services/api";
import { format, parseISO } from "date-fns";
import { useDataRefresh } from "@/contexts/DataRefreshContext";

const TasksList = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { refreshTrigger } = useDataRefresh();

  useEffect(() => {
    fetchTasks();
  }, [refreshTrigger]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await apiService.getTasks();
      const taskItems = data.filter(
        (item) => item.category === 'task' || item.category === 'deadline'
      );
      setTasks(taskItems.slice(0, 3));
      setError(null);
    } catch (err) {
      setError('Failed to load tasks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (taskId: string, currentStatus: boolean) => {
    try {
      await apiService.updateTaskStatus(taskId, !currentStatus);
      setTasks(tasks.map(task => 
        task._id === taskId ? { ...task, completed: !currentStatus } : task
      ));
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const formatDueDate = (dateString: string | null): string => {
    if (!dateString) return 'No due date';
    
    try {
      const date = parseISO(dateString);
      return format(date, 'MMM d \'at\' h:mm a');
    } catch (e) {
      console.error('Error parsing date:', e);
      return 'Invalid date';
    }
  };

  const formatFromText = (text: string | null): string => {
    if (!text) return 'No time specified';
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  if (loading) {
    return (
      <div className="glass-container p-2">
        <div className="glass-card p-4 md:p-6">
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">Loading tasks...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-container p-2">
        <div className="glass-card p-4 md:p-6">
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-container p-2">
      <div className="glass-card p-4 md:p-6">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h3 className="text-lg md:text-xl font-medium text-foreground">Today's Tasks</h3>
          <button className="text-xs md:text-sm hover:text-foreground transition-colors">
            View all
          </button>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No tasks for today</p>
          </div>
        ) : (
          <div className="space-y-3 md:space-y-4">
            {tasks.map((task) => (
              <div
                key={task._id}
                className={`p-3 md:p-4 rounded-xl border transition-all ${
                  task.completed
                    ? 'border-card-border bg-card/30'
                    : 'border-card-border bg-transparent'
                }`}
              >
                <div className="flex items-start gap-2 md:gap-3">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => handleToggleTask(task._id, task.completed)}
                    className="mt-0.5 md:mt-1 border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs md:text-sm font-medium mb-1 ${
                        task.completed
                          ? 'line-through text-muted-foreground'
                          : 'text-foreground'
                      }`}
                    >
                      {task.title}
                    </p>
                    <p className="text-[10px] md:text-xs text-muted-foreground mb-0.5 md:mb-1">
                      From: {formatFromText(task.due_date_text)}
                    </p>
                    <p className="text-[10px] md:text-xs text-muted-foreground">
                      Due: {formatDueDate(task.due_date)}
                    </p>
                  </div>
                  {task.priority === 'high' && !task.completed && (
                    <span className="px-1.5 md:px-2 py-0.5 md:py-1 text-[10px] md:text-xs font-medium bg-destructive text-destructive-foreground rounded flex-shrink-0">
                      High Priority
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksList;