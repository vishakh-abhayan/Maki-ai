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

  // UPDATED: Format speaker source
  const formatTaskSource = (from: string | null): string => {
    if (!from) return 'Unknown';
    
    // Check if it's a speaker format (SPEAKER 1, SPEAKER 2, etc.)
    if (from.toUpperCase().startsWith('SPEAKER')) {
      const speakerNumber = from.split(' ')[1];
      return `Conversation with Speaker ${speakerNumber}`;
    }
    
    // Otherwise, it's a custom name
    return `Conversation with ${from}`;
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
          <h3 className="text-lg md:text-xl font-medium text-foreground border-b-2 border-gray-100/10 pb-1">Today's Tasks</h3>
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
                className="flex items-start gap-3 p-3 md:p-4 rounded-xl border border-border/50 bg-card/50 transition-all hover:border-border"
              >
                <Checkbox
                  id={task._id}
                  checked={task.completed}
                  onCheckedChange={() => handleToggleTask(task._id, task.completed)}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <label
                    htmlFor={task._id}
                    className={`text-xs md:text-sm font-medium cursor-pointer ${
                      task.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                    }`}
                  >
                    {task.title}
                  </label>
                  {/* UPDATED: Show conversation source */}
                  <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">
                     From: {formatTaskSource(task.from)}
                  </p>
                  <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">
                     Due: {task.due_date_text || 'No due date'}
                  </p>
                </div>
                {task.priority === 'high' && (
                  <span className="px-2 py-1 text-[10px] font-medium bg-destructive/10 text-destructive rounded-md">
                    High
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksList;