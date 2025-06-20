import React from 'react';
import TaskCard from './TaskCard';

const TaskList = ({ tasks, onEdit, onDelete, onQuickStatusUpdate }) => {
  if (tasks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onEdit={() => onEdit(task)}
          onDelete={() => onDelete(task.id)}
          onQuickStatusUpdate={(status) => onQuickStatusUpdate(task.id, status)}
        />
      ))}
    </div>
  );
};

export default TaskList;