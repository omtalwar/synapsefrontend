import { useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function IdeaForm({ onSubmit, onCancel, initialData = {}, isLoading }) {
  const [form, setForm] = useState({ title: initialData.title || '', content: initialData.content || '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="input" placeholder="Give your idea a short title" required maxLength={100} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
        <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
          className="input resize-none" rows={5} placeholder="Describe your idea in detail..." required />
      </div>
      <div className="flex gap-3 justify-end">
        {onCancel && <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>}
        <button type="submit" disabled={isLoading} className="btn-primary flex items-center gap-2">
          {isLoading && <Loader2 size={14} className="animate-spin" />}
          {isLoading ? 'Saving...' : initialData._id ? 'Update Idea' : 'Create Idea'}
        </button>
      </div>
    </form>
  );
}
