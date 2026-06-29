import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlus, FiTrash2, FiUpload } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { recipeAPI } from '../../services/api';

const CATEGORIES = ['Breakfast','Lunch','Dinner','Dessert','Snack','Beverages','Appetizer','Salad','Soup','Other'];
const DIFFICULTIES = ['Easy','Medium','Hard'];

export default function SubmitRecipePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [form, setForm] = useState({
    title: '', description: '', cookingTime: '', prepTime: '', servings: '2',
    difficulty: 'Medium', category: 'Dinner', tags: '', referenceLinks: '',
  });
  const [ingredients, setIngredients] = useState([{ name: '', quantity: '', unit: '' }]);
  const [steps, setSteps] = useState([{ stepNumber: 1, instruction: '' }]);
  const [image, setImage] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const addIngredient = () => setIngredients([...ingredients, { name: '', quantity: '', unit: '' }]);
  const removeIngredient = (i) => setIngredients(ingredients.filter((_, idx) => idx !== i));
  const updateIngredient = (i, field, val) => {
    const updated = [...ingredients];
    updated[i][field] = val;
    setIngredients(updated);
  };

  const addStep = () => setSteps([...steps, { stepNumber: steps.length + 1, instruction: '' }]);
  const removeStep = (i) => {
    const updated = steps.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, stepNumber: idx + 1 }));
    setSteps(updated);
  };
  const updateStep = (i, val) => {
    const updated = [...steps];
    updated[i].instruction = val;
    setSteps(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.cookingTime || !form.category) {
      return toast.error('Please fill all required fields');
    }
    if (ingredients.some(ing => !ing.name || !ing.quantity)) {
      return toast.error('Please fill all ingredient fields');
    }
    if (steps.some(s => !s.instruction)) {
      return toast.error('Please fill all step instructions');
    }

    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append('ingredients', JSON.stringify(ingredients));
      fd.append('steps', JSON.stringify(steps));
      fd.append('tags', JSON.stringify(form.tags.split(',').map(t => t.trim()).filter(Boolean)));
      fd.append('referenceLinks', JSON.stringify(form.referenceLinks.split('\n').map(l => l.trim()).filter(Boolean)));
      if (image) fd.append('image', image);

      await recipeAPI.create(fd);
      toast.success('Recipe submitted for approval!');
      navigate('/my-recipes');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full border border-orange-200 rounded-xl px-4 py-3 outline-none focus:border-orange-400 bg-white text-gray-700 transition-colors";

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-4xl font-bold text-gray-800 mb-2">Submit a Recipe</h1>
        <p className="text-gray-500 mb-8">Share your culinary creation with the community. It will be reviewed before publishing.</p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <Section title="Basic Information">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label>Recipe Title *</Label>
                <input className={inputClass} placeholder="e.g. Creamy Pasta Carbonara" value={form.title}
                  onChange={e => setForm({...form, title: e.target.value})} required />
              </div>
              <div className="md:col-span-2">
                <Label>Description *</Label>
                <textarea className={inputClass} rows={3} placeholder="Describe your recipe..."
                  value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
              </div>
              <div>
                <Label>Category *</Label>
                <select className={inputClass} value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <Label>Difficulty *</Label>
                <select className={inputClass} value={form.difficulty} onChange={e => setForm({...form, difficulty: e.target.value})}>
                  {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <Label>Cooking Time (minutes) *</Label>
                <input className={inputClass} type="number" min="1" placeholder="30" value={form.cookingTime}
                  onChange={e => setForm({...form, cookingTime: e.target.value})} required />
              </div>
              <div>
                <Label>Prep Time (minutes)</Label>
                <input className={inputClass} type="number" min="0" placeholder="15" value={form.prepTime}
                  onChange={e => setForm({...form, prepTime: e.target.value})} />
              </div>
              <div>
                <Label>Servings</Label>
                <input className={inputClass} type="number" min="1" placeholder="4" value={form.servings}
                  onChange={e => setForm({...form, servings: e.target.value})} />
              </div>
              <div>
                <Label>Tags (comma separated)</Label>
                <input className={inputClass} placeholder="Italian, Pasta, Vegetarian" value={form.tags}
                  onChange={e => setForm({...form, tags: e.target.value})} />
              </div>
            </div>
          </Section>

          {/* Image */}
          <Section title="Recipe Image">
            <label className="block cursor-pointer">
              {imagePreview ? (
                <div className="relative rounded-2xl overflow-hidden h-48">
                  <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-white font-semibold">Change Image</span>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-orange-300 rounded-2xl h-40 flex flex-col items-center justify-center text-orange-400 hover:bg-orange-50 transition-colors">
                  <FiUpload size={28} className="mb-2" />
                  <p className="font-semibold">Click to upload image</p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP up to 5MB</p>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          </Section>

          {/* Ingredients */}
          <Section title="Ingredients">
            <div className="space-y-3">
              {ingredients.map((ing, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <span className="w-7 h-7 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center text-xs font-bold flex-shrink-0">{i+1}</span>
                  <input className="flex-1 border border-orange-200 rounded-xl px-3 py-2.5 outline-none focus:border-orange-400 text-sm"
                    placeholder="Ingredient name" value={ing.name} onChange={e => updateIngredient(i, 'name', e.target.value)} />
                  <input className="w-20 border border-orange-200 rounded-xl px-3 py-2.5 outline-none focus:border-orange-400 text-sm"
                    placeholder="Qty" value={ing.quantity} onChange={e => updateIngredient(i, 'quantity', e.target.value)} />
                  <input className="w-20 border border-orange-200 rounded-xl px-3 py-2.5 outline-none focus:border-orange-400 text-sm"
                    placeholder="Unit" value={ing.unit} onChange={e => updateIngredient(i, 'unit', e.target.value)} />
                  {ingredients.length > 1 && (
                    <button type="button" onClick={() => removeIngredient(i)} className="text-red-400 hover:text-red-600"><FiTrash2 /></button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" onClick={addIngredient}
              className="mt-3 flex items-center gap-2 text-orange-500 font-semibold hover:text-orange-600 text-sm">
              <FiPlus /> Add Ingredient
            </button>
          </Section>

          {/* Steps */}
          <Section title="Cooking Instructions">
            <div className="space-y-3">
              {steps.map((step, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 mt-2">{step.stepNumber}</div>
                  <textarea className="flex-1 border border-orange-200 rounded-xl px-3 py-2.5 outline-none focus:border-orange-400 text-sm resize-none"
                    rows={2} placeholder={`Step ${step.stepNumber} instructions...`}
                    value={step.instruction} onChange={e => updateStep(i, e.target.value)} />
                  {steps.length > 1 && (
                    <button type="button" onClick={() => removeStep(i)} className="text-red-400 hover:text-red-600 mt-2"><FiTrash2 /></button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" onClick={addStep}
              className="mt-3 flex items-center gap-2 text-orange-500 font-semibold hover:text-orange-600 text-sm">
              <FiPlus /> Add Step
            </button>
          </Section>

          {/* Reference Links */}
          <Section title="Reference Links (Optional)">
            <textarea className={inputClass} rows={3} placeholder="Paste reference URLs (one per line)"
              value={form.referenceLinks} onChange={e => setForm({...form, referenceLinks: e.target.value})} />
          </Section>

          <button type="submit" disabled={loading}
            className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg rounded-2xl transition-colors shadow-lg disabled:opacity-70">
            {loading ? 'Submitting...' : '🍳 Submit Recipe for Approval'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-orange-100 p-6">
      <h2 className="font-display text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-orange-100">{title}</h2>
      {children}
    </div>
  );
}

function Label({ children }) {
  return <label className="text-sm font-bold text-gray-600 mb-1 block">{children}</label>;
}
