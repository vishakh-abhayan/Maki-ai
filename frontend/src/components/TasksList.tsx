import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { createAPIService, Task } from "@/services/api";
import { useDataRefresh } from "@/contexts/DataRefreshContext";
import { useAuth } from "@clerk/clerk-react";
import {
  format,
  isToday,
  parseISO,
  isPast,
  isFuture,
  isYesterday,
} from "date-fns";
import { useNavigate } from "react-router-dom";

const TasksList = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { refreshTrigger } = useDataRefresh();
  const { getToken } = useAuth();

  const apiService = createAPIService(getToken);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
  }, [refreshTrigger]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await apiService.getTasks();

      // ✅ Filter for TODAY's tasks ONLY (not overdue from yesterday) AND not completed
      const todayTasks = data.filter((item) => {
        if (item.completed) return false; // ✅ Filter out completed tasks

        if (!item.dueDate) {
          // If no date, only include if text explicitly says "today"
          const text = item.dueDateText?.toLowerCase() || "";
          return text.includes("today") && !text.includes("yesterday");
        }

        try {
          const taskDate = parseISO(item.dueDate);
          // ✅ ONLY show tasks that are actually TODAY (not past)
          return isToday(taskDate);
        } catch {
          return false;
        }
      });

      // Sort by priority
      const sorted = todayTasks.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, normal: 1, low: 1 };
        const aPriority =
          priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
        const bPriority =
          priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
        return bPriority - aPriority;
      });

      setTasks(sorted.slice(0, 3));
      setError(null);
    } catch (err) {
      setError("Failed to load tasks");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (taskId: string, currentStatus: boolean) => {
    try {
      // ✅ Optimistically remove the task from UI immediately
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));

      // Update on backend
      await apiService.updateTaskStatus(taskId, !currentStatus);
    } catch (err) {
      console.error("Failed to update task:", err);
      // ✅ Revert on error by refetching
      fetchTasks();
    }
  };

  const formatDueDate = (
    dueDate: string | null,
    dueDateText: string
  ): string => {
    if (!dueDate) {
      return dueDateText || "No due date";
    }

    try {
      const date = parseISO(dueDate);

      // ✅ Show actual status, not just what was said
      if (isToday(date)) {
        return "Today";
      } else if (isYesterday(date)) {
        return "Yesterday (overdue)";
      } else if (isPast(date)) {
        return `${format(date, "MMM d")} (overdue)`;
      } else {
        return format(date, "MMM d, yyyy");
      }
    } catch {
      return dueDateText || "No due date";
    }
  };

  const formatTaskSource = (from: string | null): string => {
    if (!from) return "Unknown";

    if (from.toUpperCase().startsWith("SPEAKER")) {
      const speakerNumber = from.split(" ")[1];
      return `Speaker ${speakerNumber}`;
    }

    return from;
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      work: "Work",
      personal: "Personal",
      followup: "Follow-up",
      deadline: "Deadline",
      general: "Task",
    };
    return labels[category] || "Task";
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      work: "bg-blue-500/10 text-blue-600",
      personal: "bg-purple-500/10 text-purple-600",
      followup: "bg-green-500/10 text-green-600",
      deadline: "bg-red-500/10 text-red-600",
      general: "bg-gray-500/10 text-gray-600",
    };
    return colors[category] || "bg-gray-500/10 text-gray-600";
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
          <button
            onClick={() => navigate("/activities")}
            className=" text-xs md:text-sm hover:text-foreground transition-colors"
          >
            View all
          </button>
        </div>

        {tasks.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">No tasks due today</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task._id}
                className="flex items-start gap-3 p-3 rounded-lg bg-card/5 hover:bg-card/10 transition-colors"
              >
                <label className="flex items-center cursor-pointer mt-0.5">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggleTask(task._id, task.completed)}
                    className="sr-only"
                  />
                  <span
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                      task.completed
                        ? "bg-primary border-primary"
                        : "border-muted-foreground"
                    }`}
                  >
                    {task.completed && (
                      <svg
                        className="w-3 h-3 text-white"
                        viewBox="0 0 12 9"
                        fill="none"
                      >
                        <path
                          d="M1 4.5L4.5 8L11 1"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>
                </label>

                <div className="flex-1 min-w-0">
                  <h4
                    className={`text-sm font-normal text-foreground mb-1 ${
                      task.completed ? "line-through opacity-75" : ""
                    }`}
                  >
                    {task.title}
                  </h4>
                  {task.from && (
                    <p className="text-xs text-muted-foreground/60 mb-1">
                      From: {task.from.replace(/SPEAKER \d+/i, "Speaker")}
                    </p>
                  )}
                  <div className="flex items-center gap-2 flex-wrap">
                    {task.priority !== "normal" &&
                      task.priority !== "medium" && (
                        <span
                          className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                            task.priority === "high"
                              ? "bg-red-500/10 text-red-600"
                              : "bg-green-500/10 text-green-600"
                          }`}
                        >
                          {task.priority}
                        </span>
                      )}
                    <p className="text-xs text-muted-foreground/60">
                      {formatDueDate(task.dueDate, task.dueDateText)}
                    </p>
                  </div>
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
