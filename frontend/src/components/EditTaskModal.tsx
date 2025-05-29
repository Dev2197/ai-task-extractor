import { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Task } from "../types/Task";
import { addDays, startOfToday, setHours, setMinutes, format } from "date-fns";

interface EditTaskModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedTask: Task) => void;
}

export const EditTaskModal = ({
  task,
  isOpen,
  onClose,
  onSave,
}: EditTaskModalProps) => {
  const [editedTask, setEditedTask] = useState<Task>(task);

  useEffect(() => {
    setEditedTask(task);
  }, [task]);

  const convertTextToDate = (text: string): Date | null => {
    const today = startOfToday();
    const lowerText = text.toLowerCase();

    if (lowerText === "tonight") {
      return setHours(setMinutes(today, 0), 20); // Set to 8:00 PM
    }

    if (lowerText === "tomorrow") {
      return addDays(setHours(setMinutes(today, 0), 9), 1); // Set to 9:00 AM tomorrow
    }

    // Handle days of the week
    const days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const dayIndex = days.indexOf(lowerText);
    if (dayIndex !== -1) {
      const currentDay = new Date().getDay();
      let daysToAdd = dayIndex - currentDay;
      if (daysToAdd <= 0) {
        daysToAdd += 7; // Move to next week if the day has passed
      }
      return setHours(setMinutes(addDays(today, daysToAdd), 0), 9); // Set to 9:00 AM
    }

    return null;
  };

  const formatDateForInput = (dueDate: Date | string | null) => {
    if (!dueDate) return "";

    // If dueDate is a string, try to convert it to a date
    if (typeof dueDate === "string") {
      const convertedDate = convertTextToDate(dueDate);
      if (convertedDate) {
        // Format date in local timezone
        const year = convertedDate.getFullYear();
        const month = String(convertedDate.getMonth() + 1).padStart(2, "0");
        const day = String(convertedDate.getDate()).padStart(2, "0");
        const hours = String(convertedDate.getHours()).padStart(2, "0");
        const minutes = String(convertedDate.getMinutes()).padStart(2, "0");
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      }
      return "";
    }

    try {
      // Ensure we're working with a valid Date object
      if (!(dueDate instanceof Date) || isNaN(dueDate.getTime())) {
        return "";
      }
      // Format date in local timezone
      const year = dueDate.getFullYear();
      const month = String(dueDate.getMonth() + 1).padStart(2, "0");
      const day = String(dueDate.getDate()).padStart(2, "0");
      const hours = String(dueDate.getHours()).padStart(2, "0");
      const minutes = String(dueDate.getMinutes()).padStart(2, "0");
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };

  const handleDateChange = (value: string) => {
    if (!value) {
      setEditedTask({
        ...editedTask,
        dueDate: null,
      });
      return;
    }

    // Create date object in local timezone
    const [datePart, timePart] = value.split("T");
    const [year, month, day] = datePart.split("-").map(Number);
    const [hours, minutes] = timePart.split(":").map(Number);

    const newDate = new Date(year, month - 1, day, hours, minutes);

    setEditedTask({
      ...editedTask,
      dueDate: newDate,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(editedTask);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Edit Task</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Title
            </label>
            <input
              type="text"
              value={editedTask.title}
              onChange={(e) =>
                setEditedTask({ ...editedTask, title: e.target.value })
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assigned To
            </label>
            <input
              type="text"
              value={editedTask.assignee}
              onChange={(e) =>
                setEditedTask({ ...editedTask, assignee: e.target.value })
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter assignee name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date & Time
            </label>
            {typeof editedTask.dueDate === "string" && (
              <div className="mb-2 text-sm text-gray-500">
                Original text date: {editedTask.dueDate}
              </div>
            )}
            <input
              type="datetime-local"
              value={formatDateForInput(editedTask.dueDate)}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              value={editedTask.priority}
              onChange={(e) =>
                setEditedTask({
                  ...editedTask,
                  priority: e.target.value as "P1" | "P2" | "P3" | "P4",
                })
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="P1">P1 - Urgent</option>
              <option value="P2">P2 - High</option>
              <option value="P3">P3 - Medium</option>
              <option value="P4">P4 - Low</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white flex items-center gap-2 justify-center"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
