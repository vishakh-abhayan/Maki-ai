import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { createAPIService, Task } from "@/services/api";
import { useDataRefresh } from "@/contexts/DataRefreshContext";
import { useAuth } from "@clerk/clerk-react";
import { isToday, parseISO } from "date-fns";
import { useNavigate } from "react-router-dom";

const TasksList = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { refreshTrigger } = useDataRefresh();
  const { getToken } = useAuth();

  const apiService = createAPIService(getToken);

  //configure navigate
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
  }, [refreshTrigger]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await apiService.getTasks();
      
      // Filter for tasks with due date TODAY only (not completed)
      const todayTasks = data.filter((item) => {
        if (item.completed) return false;
        if (item.category !== 'task' && item.category !== 'deadline') return false;
        if (!item.dueDate) return false;
        
        try {
          const taskDate = parseISO(item.dueDate);
          return isToday(taskDate);
        } catch {
          return false;
        }
      });
      
      // Limit to 3 tasks
      setTasks(todayTasks.slice(0, 3));
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

  const formatTaskSource = (from: string | null): string => {
    if (!from) return 'Unknown';
    
    if (from.toUpperCase().startsWith('SPEAKER')) {
      const speakerNumber = from.split(' ')[1];
      return `Speaker ${speakerNumber}`;
    }
    
    return from;
  };

  const getCategoryLabel = (category: string) => {
  const labels: Record<string, string> = {
    work: 'Work',
    personal: 'Personal',
    followup: 'Follow-up',
    deadline: 'Deadline',
    general: 'Task'
  };
  return labels[category] || 'Task';
};

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    work: 'bg-blue-500/10 text-blue-600',
    personal: 'bg-purple-500/10 text-purple-600',
    followup: 'bg-green-500/10 text-green-600',
    deadline: 'bg-red-500/10 text-red-600',
    general: 'bg-gray-500/10 text-gray-600'
  };
  return colors[category] || 'bg-gray-500/10 text-gray-600';
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
          <h3 className="text-lg md:text-xl font-medium text-foreground border-b-2 border-gray-100/10 pb-1">
            Today's Tasks
          </h3>
          <button onClick={() => navigate('/activities')} className="underline text-xs md:text-sm hover:text-foreground transition-colors">
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
                  <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">
                    From: {formatTaskSource(task.from)}
                  </p>
                  <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">
                    Due: {task.dueDateText || 'No due date'}
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