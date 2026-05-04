// src/pages/Sections.tsx
import React, { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, AlertCircle, Users } from "lucide-react";
import { Section, NewSection, Subject } from "../type";
import { getSections, createSection, updateSection, deleteSection, getSubjects } from "../api";

const Sections: React.FC = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState<NewSection>({
    subject_id: 0,
    name: "",
    schedule: "MWF",
    time_start: "09:00",
    time_end: "10:30",
    room: "",
    max_capacity: 40,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sectionsData, subjectsData] = await Promise.all([getSections(), getSubjects()]);
      setSections(sectionsData);
      setSubjects(subjectsData);
    } catch (err) {
      setError("Failed to fetch data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject_id || !formData.name || !formData.room) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      if (editingId) {
        const updated = await updateSection(editingId, formData);
        setSections(sections.map((s) => (s.id === editingId ? updated : s)));
      } else {
        const created = await createSection(formData);
        setSections([...sections, created]);
      }
      resetForm();
    } catch (err) {
      setError("Failed to save section");
      console.error(err);
    }
  };

  const handleEdit = (section: Section) => {
    const subjectId = typeof section.subject === "object" ? section.subject.id : section.subject;
    setFormData({
      subject_id: subjectId,
      name: section.name,
      schedule: section.schedule,
      time_start: section.time_start,
      time_end: section.time_end,
      room: section.room,
      max_capacity: section.max_capacity,
    });
    setEditingId(section.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm("Are you sure you want to delete this section?")) {
      try {
        await deleteSection(id);
        setSections(sections.filter((s) => s.id !== id));
      } catch (err) {
        setError("Failed to delete section");
        console.error(err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      subject_id: 0,
      name: "",
      schedule: "MWF",
      time_start: "09:00",
      time_end: "10:30",
      room: "",
      max_capacity: 40,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const getSubjectCode = (subjectId: number | Subject): string => {
    const id = typeof subjectId === "object" ? subjectId.id : subjectId;
    return subjects.find((s) => s.id === id)?.code || "N/A";
  };

  const getCapacityPercentage = (section: Section) => {
    return Math.round((section.current_enrollment / section.max_capacity) * 100);
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="text-red-600" size={20} />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Sections</h2>
          <p className="text-slate-600 mt-1">Manage course sections and schedules</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          <Plus size={20} />
          Add Section
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-600">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            {editingId ? "Edit Section" : "New Section"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={formData.subject_id}
                onChange={(e) => setFormData({ ...formData, subject_id: parseInt(e.target.value) })}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">Select Subject</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} - {s.title}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Section Name (A, B, C, etc.)"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={formData.schedule}
                onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="MWF">MWF</option>
                <option value="TTH">TTH</option>
                <option value="DAILY">DAILY</option>
                <option value="SAT">SAT</option>
              </select>
              <input
                type="time"
                value={formData.time_start}
                onChange={(e) => setFormData({ ...formData, time_start: e.target.value })}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="time"
                value={formData.time_end}
                onChange={(e) => setFormData({ ...formData, time_end: e.target.value })}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Room Number"
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
              <input
                type="number"
                placeholder="Max Capacity"
                value={formData.max_capacity}
                onChange={(e) => setFormData({ ...formData, max_capacity: parseInt(e.target.value) })}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
                min="1"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                {editingId ? "Update" : "Create"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sections List */}
      {loading ? (
        <div className="flex justify-center items-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      ) : sections.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-xl shadow-md">
          <p className="text-gray-600 text-lg">No sections yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sections.map((section) => {
            const capacity = getCapacityPercentage(section);
            return (
              <div
                key={section.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-600">
                        {getSubjectCode(section.subject)} - Section {section.name}
                      </p>
                      <h3 className="text-xl font-bold text-slate-900">Class Details</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-slate-900">{section.schedule}</p>
                      <p className="text-sm text-slate-600">
                        {section.time_start} - {section.time_end}
                      </p>
                    </div>
                  </div>

                  {/* Room and Capacity */}
                  <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="text-xs font-semibold text-slate-600 uppercase">Room</p>
                      <p className="text-lg font-bold text-slate-900">{section.room}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-600 uppercase">Capacity</p>
                      <p className="text-lg font-bold text-slate-900">
                        {section.current_enrollment}/{section.max_capacity}
                      </p>
                    </div>
                  </div>

                  {/* Capacity Bar */}
                  <div className="mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          capacity > 80
                            ? "bg-red-500"
                            : capacity > 60
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                        style={{ width: `${Math.min(capacity, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{capacity}% Capacity</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(section)}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold py-2 rounded-lg transition-colors"
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(section.id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-2 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Sections;
