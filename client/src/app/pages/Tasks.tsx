import { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { motion } from 'motion/react';
import { MapPin } from 'lucide-react';
import { actionsAPI } from '../services/api';

const ItemType = 'TASK';

// Map API status to column key
const statusToColumn = (status: string) => {
  switch (status) {
    case 'CREATED': return 'pending';
    case 'ASSIGNED': return 'assigned';
    case 'COMPLETED': return 'completed';
    default: return 'pending';
  }
};

const columnToApiStatus = (col: string) => {
  switch (col) {
    case 'pending': return 'CREATED';
    case 'assigned': return 'ASSIGNED';
    case 'inProgress': return 'ASSIGNED';
    case 'completed': return 'COMPLETED';
    default: return 'CREATED';
  }
};

const TaskCard = ({ task, columnId }: any) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: { id: task._id || task.id, sourceColumn: columnId },
    collect: (monitor) => ({ isDragging: monitor.isDragging() })
  });

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-[#F97316]';
      case 'medium': return 'bg-[#14B8A6]';
      default: return 'bg-gray-400';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Food': return 'bg-[#F97316]/10 text-[#F97316]';
      case 'Medical': return 'bg-[#14B8A6]/10 text-[#14B8A6]';
      case 'Shelter': return 'bg-[#1E3A8A]/10 text-[#1E3A8A]';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const volunteerName = task.volunteerId
    ? `${task.volunteerId.firstName || ''} ${task.volunteerId.lastName || ''}`.trim()
    : task.assignedTo;

  return (
    <motion.div
      ref={drag}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isDragging ? 0.5 : 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-xl p-4 border border-gray-200 cursor-move hover:border-gray-300 transition-all mb-3"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm text-gray-900 flex-1">{task.title}</h3>
        <span className={`w-2 h-2 rounded-full ${getUrgencyColor(task.urgency)} ml-2 mt-1`} />
      </div>

      <div className="flex items-center text-xs text-gray-600 mb-2">
        <MapPin className="w-3 h-3 mr-1" />
        {task.recipientId?.city || task.location || 'Unknown'}
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        {(task.skills || []).map((skill: string) => (
          <span key={skill} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">{skill}</span>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <span className={`px-2 py-1 rounded-md text-xs ${getCategoryColor(task.category)}`}>
          {task.category || 'General'}
        </span>
        {volunteerName && (
          <div className="w-5 h-5 rounded-full bg-[#14B8A6] flex items-center justify-center text-white text-xs">
            {volunteerName.split(' ').map((n: string) => n[0]).join('')}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const Column = ({ title, tasks, columnId, onDrop, color }: any) => {
  const [{ isOver }, drop] = useDrop({
    accept: ItemType,
    drop: (item: any) => onDrop(item, columnId),
    collect: (monitor) => ({ isOver: monitor.isOver() })
  });

  return (
    <div className="flex-1 min-w-[280px]">
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${color}`} />
            <h2 className="text-sm text-gray-900">{title}</h2>
          </div>
          <span className="px-2 py-1 bg-white rounded-md text-xs text-gray-600 border border-gray-200">{tasks.length}</span>
        </div>
        <div ref={drop} className={`min-h-[500px] ${isOver ? 'bg-[#1E3A8A]/5 rounded-lg' : ''}`}>
          {tasks.map((task: any) => <TaskCard key={task._id || task.id} task={task} columnId={columnId} />)}
        </div>
      </div>
    </div>
  );
};

export default function Tasks() {
  const [taskColumns, setTaskColumns] = useState<any>({
    pending: [], assigned: [], inProgress: [], completed: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    actionsAPI.getAll()
      .then(res => {
        const columns: any = { pending: [], assigned: [], inProgress: [], completed: [] };
        res.data.forEach((action: any) => {
          const col = statusToColumn(action.status);
          // Separate ASSIGNED with volunteer into "assigned", those in progress to "inProgress"
          if (action.status === 'ASSIGNED' && action.assignedAt) {
            columns.inProgress.push(action);
          } else {
            columns[col].push(action);
          }
        });
        setTaskColumns(columns);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDrop = async (item: any, targetColumn: string) => {
    const sourceColumn = item.sourceColumn;
    if (sourceColumn === targetColumn) return;

    // Optimistic UI update
    setTaskColumns((prev: any) => {
      const newColumns = { ...prev };
      const taskToMove = newColumns[sourceColumn].find((t: any) => (t._id || t.id) === item.id);
      if (!taskToMove) return prev;
      newColumns[sourceColumn] = newColumns[sourceColumn].filter((t: any) => (t._id || t.id) !== item.id);
      newColumns[targetColumn] = [...newColumns[targetColumn], { ...taskToMove }];
      return newColumns;
    });

    // Persist to backend
    try {
      await actionsAPI.updateStatus(item.id, columnToApiStatus(targetColumn));
    } catch (e) { console.error('Status update failed', e); }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Loading tasks...</div>;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen pb-20 md:pb-8">
        <div className="p-6 md:p-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-3xl text-gray-900 mb-2">Task Management</h1>
            <p className="text-gray-600">Organize and track community needs</p>
          </motion.div>

          <div className="flex gap-6 overflow-x-auto pb-4">
            <Column title="Pending" tasks={taskColumns.pending} columnId="pending" onDrop={handleDrop} color="bg-gray-400" />
            <Column title="Assigned" tasks={taskColumns.assigned} columnId="assigned" onDrop={handleDrop} color="bg-[#14B8A6]" />
            <Column title="In Progress" tasks={taskColumns.inProgress} columnId="inProgress" onDrop={handleDrop} color="bg-[#F97316]" />
            <Column title="Completed" tasks={taskColumns.completed} columnId="completed" onDrop={handleDrop} color="bg-green-500" />
          </div>
        </div>
      </div>
    </DndProvider>
  );
}
