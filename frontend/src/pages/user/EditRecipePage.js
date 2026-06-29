import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlus, FiTrash2, FiUpload, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { recipeAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const CATEGORIES = ['Breakfast','Lunch','Dinner','Dessert','Snack','Beverages','Appetizer','Salad','Soup','Other'];
const DIFFICULTIES = ['Easy','Medium','Hard'];
const UPLOADS_URL = process.env.REACT_APP_UPLOADS_URL || 'http://localhost:5000';

export default function EditRecipePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [imagePreview, setImagePreview] = useState('');
  const [image, setImage] = useState(null);
  const [form, setForm] = useState({
    title: '', description: '', cookingTime: '', prepTime: '', servings: '2',
    difficulty: 'Medium', category: 'Dinner', tags: '', referenceLinks: '',
  });
  const [ingredients, setIngredients] = useState([{ name: '', quantity: '', unit: '' }]);
  const [steps, setSteps] = useState([{ stepNumber: 1, instruction: '' }]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    recipeAPI.getById(id)
      .then(res => {
        const r = res.data.recipe;
        // Check ownership
        if (r.createdBy._id !== user?._id && user?.role !== 'admin') {
          toast.error('Not authorized to edit this recipe');
          navigate('/my-recipes');
          return;
        }
        setForm({
          title: r.title || '',
          description: r.description || '',
          cookingTime: r.cookingTime || '',
          prepTime: r.prepTime || '',
          servings: r.servings || '2',
          difficulty: r.difficulty || 'Medium',
          category: r.category || 'Dinner',
          tags: Array.isArray(r.tags) ? r.tags.join(', ') : '',
          referenceLinks: Array.isArray(r.referenceLinks) ? r.referenceLinks.join('\n') : '',
        });
        setIngredients(r.ingredients?.length ? r.ingredients : [{ name: '', quantity: '', unit: '' }]);
        setSteps(r.steps?.length ? r.steps : [{ stepNumber: 1, instruction: '' }]);
        if (r.image) setImagePreview(`${UPLOADS_URL}${r.image}`);
      })
      .catch(() => { toast.error('Failed to load recipe'); navigate('/my-recipes'); })
      .finally(() => setFetching(false));
  }, [id, user, navigate]);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    else if (form.title.trim().length < 3) e.title = 'Title must be at least 3 characters';
    if (!form.description.trim()) e.description = 'Description is required';
    else if (form.description.trim().length < 10) e.description = 'Description must be at least 10 characters';
    if (!form.cookingTime) e.cookingTime = 'Cooking time is required';
    else if (Number(form.cookingTime) < 1) e.cookingTime = 'Must be at least 1 minute';
    if (form.prepTime && Number(form.prepTime) < 0) e.prepTime = 'Cannot be negative';
    if (!form.servings || Number(form.servings) < 1) e.servings = 'At least 1 serving required';
    if (ingredients.some(ing => !ing.name.trim())) e.ingredients = 'All ingredients need a name';
    if (ingredients.some(ing => !ing.quantity.toString().trim())) e.ingredients = 'All ingredients need a quantity';
    if (steps.some(s => !s.instruction.trim())) e.steps = 'All steps need instructions';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const addIngredient = () => setIngredients([...ingredients, { name: '', quantity: '', unit: '' }]);
  const removeIngredient = (i) => ingredients.length > 1 && setIngredients(ingredients.filter((_, idx) => idx !== i));
  const updateIngredient = (i, field, val) => {
    const updated = [...ingredients]; updated[i][field] = val; setIngredients(updated);
  };

  const addStep = () => setSteps([...steps, { stepNumber: steps.length + 1, instruction: '' }]);
  const removeStep = (i) => {
    if (steps.length === 1) return;
    setSteps(steps.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, stepNumber: idx + 1 })));
  };
  const updateStep = (i, val) => {
    const updated = [...steps]; updated[i].instruction = val; setSteps(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) { toast.error('Please fix the errors below'); return; }

    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append('ingredients', JSON.stringify(ingredients));
      fd.append('steps', JSON.stringify(steps));
      fd.append('tags', JSON.stringify(form.tags.split(',').map(t => t.trim()).filter(Boolean)));
      fd.append('referenceLinks', JSON.stringify(form.referenceLinks.split('\n').map(l => l.trim()).filter(Boolean)));
      if (image) fd.append('image', image);

      await recipeAPI.update(id, fd);
      toast.success('Recipe updated! It will be reviewed before publishing.');
      navigate(user?.role === 'admin' ? '/admin/recipes' : '/my-recipes');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full border rounded-xl px-4 py-3 outline-none transition-colors bg-white text-gray-700 ${
      errors[field] ? 'border-red-400 focus:border-red-500' : 'border-orange-200 focus:border-orange-400'
    }`;

  if (fetching) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="space-y-4">{[...Array(5)].map((_, i) => <div key={i} className="skeleton rounded-2xl h-16" />)}</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-orange-500 transition-colors mb-6 font-semibold">
          <FiArrowLeft /> Back
        </button>

        <h1 className="font-display text-4xl font-bold text-gray-800 mb-2">Edit Recipe</h1>
        <p className="text-gray-500 mb-8">
          {user?.role !== 'admin'
            ? 'After saving, your recipe will be re-submitted for approval.'
            : 'As admin, your edits are saved immediately.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-8" noValidate>
          {/* Basic Info */}
          <Section title="Basic Information">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label>Recipe Title *</Label>
                <input className={inputClass('title')} placeholder="e.g. Creamy Pasta Carbonara"
                  value={form.title} onChange={e => { setForm({...form, title: e.target.value}); setErrors({...errors, title: ''}); }} />
                {errors.title && <Error>{errors.title}</Error>}
              </div>
              <div className="md:col-span-2">
                <Label>Description *</Label>
                <textarea className={inputClass('description')} rows={3} placeholder="Describe your recipe..."
                  value={form.description} onChange={e => { setForm({...form, description: e.target.value}); setErrors({...errors, description: ''}); }} />
                {errors.description && <Error>{errors.description}</Error>}
              </div>
              <div>
                <Label>Category *</Label>
                <select className={inputClass('category')} value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <Label>Difficulty *</Label>
                <select className={inputClass('difficulty')} value={form.difficulty} onChange={e => setForm({...form, difficulty: e.target.value})}>
                  {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <Label>Cooking Time (minutes) *</Label>
                <input className={inputClass('cookingTime')} type="number" min="1" placeholder="30"
                  value={form.cookingTime} onChange={e => { setForm({...form, cookingTime: e.target.value}); setErrors({...errors, cookingTime: ''}); }} />
                {errors.cookingTime && <Error>{errors.cookingTime}</Error>}
              </div>
              <div>
                <Label>Prep Time (minutes)</Label>
                <input className={inputClass('prepTime')} type="number" min="0" placeholder="15"
                  value={form.prepTime} onChange={e => setForm({...form, prepTime: e.target.value})} />
                {errors.prepTime && <Error>{errors.prepTime}</Error>}
              </div>
              <div>
                <Label>Servings</Label>
                <input className={inputClass('servings')} type="number" min="1" placeholder="4"
                  value={form.servings} onChange={e => { setForm({...form, servings: e.target.value}); setErrors({...errors, servings: ''}); }} />
                {errors.servings && <Error>{errors.servings}</Error>}
              </div>
              <div>
                <Label>Tags (comma separated)</Label>
                <input className={inputClass('tags')} placeholder="Italian, Pasta, Vegetarian"
                  value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} />
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
            {errors.ingredients && <div className="mb-3 text-sm text-red-500 font-medium bg-red-50 px-3 py-2 rounded-lg">{errors.ingredients}</div>}
            <div className="space-y-3">
              {ingredients.map((ing, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <span className="w-7 h-7 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center text-xs font-bold flex-shrink-0">{i+1}</span>
                  <input className="flex-1 border border-orange-200 rounded-xl px-3 py-2.5 outline-none focus:border-orange-400 text-sm"
                    placeholder="Ingredient name" value={ing.name}
                    onChange={e => { updateIngredient(i, 'name', e.target.value); setErrors({...errors, ingredients: ''}); }} />
                  <input className="w-20 border border-orange-200 rounded-xl px-3 py-2.5 outline-none focus:border-orange-400 text-sm"
                    placeholder="Qty" value={ing.quantity}
                    onChange={e => { updateIngredient(i, 'quantity', e.target.value); setErrors({...errors, ingredients: ''}); }} />
                  <input className="w-20 border border-orange-200 rounded-xl px-3 py-2.5 outline-none focus:border-orange-400 text-sm"
                    placeholder="Unit" value={ing.unit} onChange={e => updateIngredient(i, 'unit', e.target.value)} />
                  {ingredients.length > 1 && (
                    <button type="button" onClick={() => removeIngredient(i)} className="text-red-400 hover:text-red-600"><FiTrash2 /></button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" onClick={addIngredient} className="mt-3 flex items-center gap-2 text-orange-500 font-semibold hover:text-orange-600 text-sm">
              <FiPlus /> Add Ingredient
            </button>
          </Section>

          {/* Steps */}
          <Section title="Cooking Instructions">
            {errors.steps && <div className="mb-3 text-sm text-red-500 font-medium bg-red-50 px-3 py-2 rounded-lg">{errors.steps}</div>}
            <div className="space-y-3">
              {steps.map((step, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 mt-2">{step.stepNumber}</div>
                  <textarea className="flex-1 border border-orange-200 rounded-xl px-3 py-2.5 outline-none focus:border-orange-400 text-sm resize-none"
                    rows={2} placeholder={`Step ${step.stepNumber} instructions...`}
                    value={step.instruction}
                    onChange={e => { updateStep(i, e.target.value); setErrors({...errors, steps: ''}); }} />
                  {steps.length > 1 && (
                    <button type="button" onClick={() => removeStep(i)} className="text-red-400 hover:text-red-600 mt-2"><FiTrash2 /></button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" onClick={addStep} className="mt-3 flex items-center gap-2 text-orange-500 font-semibold hover:text-orange-600 text-sm">
              <FiPlus /> Add Step
            </button>
          </Section>

          {/* Reference Links */}
          <Section title="Reference Links (Optional)">
            <textarea className={inputClass('referenceLinks')} rows={3} placeholder="Paste reference URLs (one per line)"
              value={form.referenceLinks} onChange={e => setForm({...form, referenceLinks: e.target.value})} />
          </Section>

          <div className="flex gap-4">
            <button type="button" onClick={() => navigate(-1)}
              className="flex-1 py-4 bg-white border-2 border-orange-300 text-orange-500 font-bold text-lg rounded-2xl hover:bg-orange-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg rounded-2xl transition-colors shadow-lg disabled:opacity-70">
              {loading ? 'Saving...' : '✏️ Save Changes'}
            </button>
          </div>
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

function Error({ children }) {
  return <p className="text-xs text-red-500 mt-1 font-medium">{children}</p>;
}
