import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function TodoItem({ todo, onToggle, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    position: isDragging ? 'relative' : undefined,
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`flex items-center gap-3 p-3 bg-gray-800 rounded-lg cursor-grab active:cursor-grabbing touch-none ${
        isDragging ? 'opacity-50 shadow-lg scale-105' : ''
      }`}
    >
      {/* Grip icon */}
      <div className="flex flex-col gap-0.5 text-gray-500">
        <div className="flex gap-0.5">
          <div className="w-1 h-1 bg-current rounded-full"></div>
          <div className="w-1 h-1 bg-current rounded-full"></div>
        </div>
        <div className="flex gap-0.5">
          <div className="w-1 h-1 bg-current rounded-full"></div>
          <div className="w-1 h-1 bg-current rounded-full"></div>
        </div>
        <div className="flex gap-0.5">
          <div className="w-1 h-1 bg-current rounded-full"></div>
          <div className="w-1 h-1 bg-current rounded-full"></div>
        </div>
      </div>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        className="w-5 h-5 rounded cursor-pointer"
      />
      <span className={`flex-1 ${todo.completed ? 'line-through text-gray-500' : ''}`}>
        {todo.text}
      </span>
      <button
        onClick={() => onDelete(todo.id)}
        onPointerDown={(e) => e.stopPropagation()}
        className="px-2 py-1 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded transition-colors"
      >
        Delete
      </button>
    </li>
  )
}

export default TodoItem
