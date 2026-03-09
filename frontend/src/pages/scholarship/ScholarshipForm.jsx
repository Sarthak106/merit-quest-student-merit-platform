import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function ScholarshipForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditing);

  const [form, setForm] = useState({
    title: '',
    description: '',
    organizationName: '',
    organizationType: 'NGO',
    amount: '',
    currency: 'INR',
    totalSlots: '',
    applicationDeadline: '',
    startDate: '',
    endDate: '',
    minCompositeScore: '',
    grades: [],
    districts: [],
    boards: [],
  });

  const [gradeInput, setGradeInput] = useState('');
  const [districtInput, setDistrictInput] = useState('');
  const [boardInput, setBoardInput] = useState('');

  useEffect(() => {
    if (isEditing) fetchScholarship();
  }, [id]);

  const fetchScholarship = async () => {
    try {
      const { data } = await api.get(`/scholarships/${id}`);
      const s = data.data;
      setForm({
        title: s.title || '',
        description: s.description || '',
        organizationName: s.organizationName || '',
        organizationType: s.organizationType || 'NGO',
        amount: s.amount || '',
        currency: s.currency || 'INR',
        totalSlots: s.totalSlots || '',
        applicationDeadline: s.applicationDeadline || '',
        startDate: s.startDate || '',
        endDate: s.endDate || '',
        minCompositeScore: s.eligibilityCriteria?.minCompositeScore ?? '',
        grades: s.eligibilityCriteria?.grades || [],
        districts: s.eligibilityCriteria?.districts || [],
        boards: s.eligibilityCriteria?.boards || [],
      });
    } catch {
      toast.error('Failed to load scholarship');
      navigate('/scholarships');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const addTag = (field, value, setter) => {
    const trimmed = value.trim();
    if (trimmed && !form[field].includes(trimmed)) {
      setForm(prev => ({ ...prev, [field]: [...prev[field], trimmed] }));
    }
    setter('');
  };

  const removeTag = (field, value) => {
    setForm(prev => ({ ...prev, [field]: prev[field].filter(v => v !== value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const eligibilityCriteria = {};
    if (form.minCompositeScore !== '' && form.minCompositeScore !== null) {
      eligibilityCriteria.minCompositeScore = Number(form.minCompositeScore);
    }
    if (form.grades.length > 0) eligibilityCriteria.grades = form.grades;
    if (form.districts.length > 0) eligibilityCriteria.districts = form.districts;
    if (form.boards.length > 0) eligibilityCriteria.boards = form.boards;

    const payload = {
      title: form.title,
      description: form.description,
      organizationName: form.organizationName,
      organizationType: form.organizationType,
      amount: form.amount ? Number(form.amount) : null,
      currency: form.currency,
      totalSlots: form.totalSlots ? Number(form.totalSlots) : null,
      eligibilityCriteria,
      applicationDeadline: form.applicationDeadline || null,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
    };

    try {
      if (isEditing) {
        await api.put(`/scholarships/${id}`, payload);
        toast.success('Scholarship updated');
      } else {
        const { data } = await api.post('/scholarships', payload);
        toast.success('Scholarship created');
        navigate(`/scholarships/${data.data.id}`);
        return;
      }
      navigate(`/scholarships/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save scholarship');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/scholarships')}
        className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Scholarships
      </button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
        <h1 className="text-xl font-bold text-slate-900 mb-6">
          {isEditing ? 'Edit Scholarship' : 'Create New Scholarship'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-600 mb-1">Title *</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800"
                placeholder="e.g. National Merit Scholarship 2026"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-600 mb-1">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800"
                placeholder="Describe the scholarship, its purpose, and benefits..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Organization Name *</label>
              <input
                name="organizationName"
                value={form.organizationName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Organization Type *</label>
              <select
                name="organizationType"
                value={form.organizationType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800"
              >
                <option value="NGO">NGO</option>
                <option value="GOVERNMENT">Government</option>
                <option value="PRIVATE">Private</option>
              </select>
            </div>
          </div>

          {/* Financial */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Amount</label>
              <input
                name="amount"
                type="number"
                step="0.01"
                value={form.amount}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800"
                placeholder="50000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Currency</label>
              <select
                name="currency"
                value={form.currency}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800"
              >
                <option value="INR">INR</option>
                <option value="USD">USD</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Total Slots</label>
              <input
                name="totalSlots"
                type="number"
                value={form.totalSlots}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800"
                placeholder="Leave empty for unlimited"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Application Deadline</label>
              <input
                name="applicationDeadline"
                type="date"
                value={form.applicationDeadline}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Start Date</label>
              <input
                name="startDate"
                type="date"
                value={form.startDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">End Date</label>
              <input
                name="endDate"
                type="date"
                value={form.endDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800"
              />
            </div>
          </div>

          {/* Eligibility Criteria */}
          <div className="border-t pt-6">
            <h3 className="text-md font-semibold text-slate-900 mb-4">Eligibility Criteria</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Minimum Composite Merit Score</label>
              <input
                  name="minCompositeScore"
                  type="number"
                  step="0.01"
                  value={form.minCompositeScore}
                  onChange={handleChange}
                  className="w-full sm:w-48 px-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800"
                  placeholder="e.g. 0.5"
                />
              </div>

              <TagInput
                label="Target Grades"
                tags={form.grades}
                inputValue={gradeInput}
                onInputChange={setGradeInput}
                onAdd={() => addTag('grades', gradeInput, setGradeInput)}
                onRemove={(v) => removeTag('grades', v)}
                placeholder="e.g. 10, 12"
              />
              <TagInput
                label="Target Districts"
                tags={form.districts}
                inputValue={districtInput}
                onInputChange={setDistrictInput}
                onAdd={() => addTag('districts', districtInput, setDistrictInput)}
                onRemove={(v) => removeTag('districts', v)}
                placeholder="e.g. Central, South"
              />
              <TagInput
                label="Target Boards"
                tags={form.boards}
                inputValue={boardInput}
                onInputChange={setBoardInput}
                onAdd={() => addTag('boards', boardInput, setBoardInput)}
                onRemove={(v) => removeTag('boards', v)}
                placeholder="e.g. CBSE, ICSE"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate('/scholarships')}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors font-medium disabled:opacity-50"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isEditing ? 'Update Scholarship' : 'Create Scholarship'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function TagInput({ label, tags, inputValue, onInputChange, onAdd, onRemove, placeholder }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onAdd();
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map(tag => (
          <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm">
            {tag}
            <button type="button" onClick={() => onRemove(tag)} className="hover:text-indigo-900">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 px-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={onAdd}
          className="px-3 py-2 border border-indigo-200 text-indigo-700 rounded-lg hover:bg-indigo-50 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
