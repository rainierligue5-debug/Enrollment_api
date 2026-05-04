// src/pages/Subjects.tsx
import React, { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, AlertCircle, CheckCircle, BookOpen } from "lucide-react";
import { Subject, NewSubject } from "../type";
import { getSubjects, createSubject, updateSubject, deleteSubject } from "../api";

const Subjects: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState<NewSubject>({
    code: "",
    title: "",
    description: "",
    units: 0,
  });

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const data = await getSubjects();
      setSubjects(data);
    } catch (err) {
      setError("Failed to fetch subjects");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.title || !formData.units) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      if (editingId) {
        const updated = await updateSubject(editingId, formData);
        setSubjects(subjects.map((s) => (s.id === editingId ? updated : s)));
      } else {
        const created = await createSubject(formData);
        setSubjects([...subjects, created]);
      }
      resetForm();
    } catch (err) {
      setError("Failed to save subject");
      console.error(err);
    }
  };

  const handleEdit = (subject: Subject) => {
    setFormData({
      code: subject.code,
      title: subject.title,
      description: subject.description,
      units: subject.units,
    });
    setEditingId(subject.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm("Are you sure you want to delete this subject?")) {
      try {
        await deleteSubject(id);
        setSubjects(subjects.filter((s) => s.id !== id));
      } catch (err) {
        setError("Failed to delete subject");
        console.error(err);
      }
    }
  };

  const resetForm = () => {
    setFormData({ code: "", title: "", description: "", units: 0 });
    setEditingId(null);
    setShowForm(false);
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
          <h2 className="text-3xl font-bold text-slate-900">Subjects</h2>
          <p className="text-slate-600 mt-1">Manage academic subjects and courses</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          <Plus size={20} />
          Add Subject
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-600">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            {editingId ? "Edit Subject" : "New Subject"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Subject Code (e.g., CS101)"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="text"
                placeholder="Subject Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
            <input
              type="number"
              placeholder="Units"
              value={formData.units}
              onChange={(e) => setFormData({ ...formData, units: parseInt(e.target.value) })}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              min="1"
            />
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

      {/* Subjects Grid */}
      {loading ? (
        <div className="flex justify-center items-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : subjects.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-xl shadow-md">
          <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 text-lg">No subjects yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <div key={subject.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 text-white">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold opacity-90">Code</p>
                    <h3 className="text-2xl font-bold">{subject.code}</h3>
                  </div>
                  <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                    <span className="text-lg font-bold">{subject.units} units</span>
                  </div>
                </div>
                <p className="mt-2 text-purple-100">{subject.title}</p>
              </div>
              <div className="p-6">
                <p className="text-sm text-slate-600 line-clamp-2 mb-4">{subject.description}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(subject)}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold py-2 rounded-lg transition-colors"
                  >
                    <Edit2 size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(subject.id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-2 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Subjects;
