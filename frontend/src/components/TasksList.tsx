import { Checkbox } from "@/components/ui/checkbox";

interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueTime?: string;
  from?: string;
  priority?: 'high' | 'normal';
}

const TasksList = () => {
  const tasks: Task[] = [
    {
      id: '1',
      title: 'Buy new outfit for Hinge date',
      completed: false,
      dueTime: 'Today, 7:00 P.M.',
      from: 'Date with Sarah',
      priority: 'normal',
    },
    {
      id: '2',
      title: 'Call dentist for appointment',
      completed: true,
      dueTime: 'Today, 10:30 A.M.',
      from: 'Conversation with mom',
      priority: 'normal',
    },
    {
      id: '3',
      title: 'Prepare presentation for marketing meeting',
      completed: false,
      dueTime: 'Tomorrow, 2:00 P.M.',
      from: 'Team Standup',
      priority: 'high',
    },
  ];

  return (
    <div className="glass-card p-4 md:p-6">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h3 className="text-lg md:text-xl font-medium text-foreground">Today's Tasks</h3>
        <button className="text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors">
          View all
        </button>
      </div>

      <div className="space-y-3 md:space-y-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`p-3 md:p-4 rounded-xl border transition-all ${
              task.completed
                ? 'border-card-border bg-card/30'
                : 'border-card-border bg-transparent'
            }`}
          >
            <div className="flex items-start gap-2 md:gap-3">
              <Checkbox
                checked={task.completed}
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
                  {task.completed ? 'Completed:' : 'Due:'} {task.dueTime}
                </p>
                <p className="text-[10px] md:text-xs text-muted-foreground">From: {task.from}</p>
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
    </div>
  );
};

export default TasksList;
