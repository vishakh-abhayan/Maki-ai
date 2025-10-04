import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { apiService, Task } from "@/services/api";
import { format, isToday, parseISO } from "date-fns";
import { useDataRefresh } from "@/contexts/DataRefreshContext";

const TasksList = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { refreshTrigger } = useDataRefresh(); // Listen for refresh events

  useEffect(() => {
    fetchTasks();
  }, [refreshTrigger]); // Re-fetch when refreshTrigger changes

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await apiService.getTasks();
      // Filter for task categories only
      const taskItems = data.filter(
        (item) => item.category === 'task' || item.category === 'deadline'
      );
      setTasks(taskItems);
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
      // Update local state
      setTasks(tasks.map(task => 
        task._id === taskId ? { ...task, completed: !currentStatus } : task
      ));
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const formatDueDate = (task: Task): string => {
    if (task.due_date_text) {
      return task.due_date_text;
    }
    if (task.due_date) {
      const date = parseISO(task.due_date);
      if (isToday(date)) {
        return `Today, ${format(date, 'h:mm a')}`;
      }
      return format(date, 'MMM d, h:mm a');
    }
    return 'No due date';
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
                          ? 'line-through'
                          : 'text-foreground'
                      }`}
                    >
                      {task.title}
                    </p>
                    <p className="text-[10px] md:text-xs mb-0.5 md:mb-1">
                      {task.completed ? 'Completed:' : 'Due:'} {formatDueDate(task)}
                    </p>
                    <p className="text-[10px] md:text-xs">From: {task.from}</p>
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