import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiClock, FiUser, FiBookmark, FiShare2, FiEdit2, FiTrash2, FiSend } from 'react-icons/fi';
import { GiKnifeFork } from 'react-icons/gi';
import toast from 'react-hot-toast';
import { recipeAPI, commentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StarRating from '../../components/common/StarRating';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const UPLOADS_URL = process.env.REACT_APP_UPLOADS_URL || 'http://localhost:5000';
const PLACEHOLDER = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=500&fit=crop';

export default function RecipeDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentRating, setCommentRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [userRating, setUserRating] = useState(0);

  useEffect(() => {
    recipeAPI.getById(id)
      .then(res => {
        setRecipe(res.data.recipe);
        setComments(res.data.comments);
        if (user && res.data.recipe.ratings) {
          const myRating = res.data.recipe.ratings.find(r => r.userId === user._id);
          if (myRating) setUserRating(myRating.rating);
        }
        if (user && res.data.recipe.bookmarks?.includes(user._id)) {
          setBookmarked(true);
        }
      })
      .catch(() => toast.error('Recipe not found'))
      .finally(() => setLoading(false));
  }, [id, user]);

  const handleRate = async (rating) => {
    if (!user) return toast.error('Please login to rate');
    try {
      const res = await recipeAPI.rate(id, rating);
      setUserRating(rating);
      setRecipe(r => ({ ...r, averageRating: res.data.averageRating, totalRatings: res.data.totalRatings }));
      toast.success('Rating saved!');
    } catch {
      toast.error('Failed to rate');
    }
  };

  const handleBookmark = async () => {
    if (!user) return toast.error('Please login to bookmark');
    try {
      const res = await recipeAPI.toggleBookmark(id);
      setBookmarked(res.data.bookmarked);
      toast.success(res.data.bookmarked ? 'Bookmarked!' : 'Removed from bookmarks');
    } catch {
      toast.error('Failed');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      const res = await commentAPI.add(id, { comment: commentText, rating: commentRating || undefined });
      setComments(c => [res.data.comment, ...c]);
      setCommentText('');
      setCommentRating(0);
      toast.success('Comment added!');
    } catch {
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await commentAPI.delete(commentId);
      setComments(c => c.filter(x => x._id !== commentId));
      toast.success('Comment deleted');
    } catch {
      toast.error('Failed');
    }
  };

  const handleUpdateComment = async (commentId) => {
    try {
      const res = await commentAPI.update(commentId, { comment: editText });
      setComments(c => c.map(x => x._id === commentId ? res.data.comment : x));
      setEditingId(null);
      toast.success('Comment updated');
    } catch {
      toast.error('Failed');
    }
  };

  if (loading) return <LoadingSpinner fullPage />;
  if (!recipe) return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center">
      <div className="text-6xl mb-4">🍽️</div>
      <h2 className="font-display text-3xl font-bold text-gray-700">Recipe not found</h2>
      <Link to="/recipes" className="mt-4 inline-block text-orange-500 font-semibold">← Back to Recipes</Link>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Back */}
      <Link to="/recipes" className="text-orange-500 font-semibold hover:text-orange-600 flex items-center gap-1 mb-6 text-sm">
        ← Back to Recipes
      </Link>

      {/* Hero image */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-3xl overflow-hidden h-72 md:h-96 mb-8 shadow-xl">
        <img
          src={recipe.image ? `${UPLOADS_URL}${recipe.image}` : PLACEHOLDER}
          alt={recipe.title}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = PLACEHOLDER; }}
        />
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="md:col-span-2">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="bg-orange-100 text-orange-600 text-sm font-bold px-3 py-1 rounded-full">{recipe.category}</span>
              <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                recipe.difficulty === 'Easy' ? 'bg-green-100 text-green-600' :
                recipe.difficulty === 'Hard' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
              }`}>{recipe.difficulty}</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-800 mb-3">{recipe.title}</h1>
            <p className="text-gray-600 leading-relaxed mb-4">{recipe.description}</p>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-4">
              <StarRating value={recipe.averageRating} readonly />
              <span className="font-bold text-gray-700">{recipe.averageRating > 0 ? recipe.averageRating.toFixed(1) : 'No ratings'}</span>
              <span className="text-gray-400 text-sm">({recipe.totalRatings} ratings)</span>
            </div>

            {/* Author */}
            {recipe.createdBy && (
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl mb-6">
                <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">
                  {recipe.createdBy.name?.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-gray-700 text-sm">{recipe.createdBy.name}</p>
                  <p className="text-gray-400 text-xs">Recipe Author</p>
                </div>
              </div>
            )}

            {/* Ingredients */}
            <div className="mb-8">
              <h2 className="font-display text-2xl font-bold text-gray-800 mb-4">Ingredients</h2>
              <ul className="space-y-2">
                {recipe.ingredients?.map((ing, i) => (
                  <li key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-orange-50 hover:border-orange-200 transition-colors">
                    <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 text-xs font-bold flex-shrink-0">
                      {i + 1}
                    </div>
                    <span className="text-gray-700">
                      <span className="font-semibold">{ing.quantity} {ing.unit}</span> {ing.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Steps */}
            <div className="mb-8">
              <h2 className="font-display text-2xl font-bold text-gray-800 mb-4">Instructions</h2>
              <div className="space-y-4">
                {recipe.steps?.map((step) => (
                  <div key={step.stepNumber} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5">
                      {step.stepNumber}
                    </div>
                    <div className="flex-1 bg-white border border-orange-50 rounded-xl p-4">
                      <p className="text-gray-700 leading-relaxed">{step.instruction}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reference Links */}
            {recipe.referenceLinks?.length > 0 && (
              <div className="mb-8">
                <h3 className="font-display text-xl font-bold text-gray-800 mb-3">Reference Links</h3>
                <div className="flex flex-wrap gap-2">
                  {recipe.referenceLinks.map((link, i) => (
                    <a key={i} href={link} target="_blank" rel="noreferrer"
                      className="text-orange-500 hover:underline text-sm bg-orange-50 px-3 py-1.5 rounded-lg"
                    >
                      🔗 Reference {i + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Rate this recipe */}
            {user && (
              <div className="bg-orange-50 rounded-2xl p-5 mb-8">
                <h3 className="font-display text-lg font-bold text-gray-800 mb-3">Rate this Recipe</h3>
                <StarRating value={userRating} onChange={handleRate} size={28} />
                {userRating > 0 && <p className="text-sm text-orange-500 mt-2 font-semibold">Your rating: {userRating}/5 ★</p>}
              </div>
            )}

            {/* Comments */}
            <div>
              <h2 className="font-display text-2xl font-bold text-gray-800 mb-6">
                Comments ({comments.length})
              </h2>

              {user && (
                <form onSubmit={handleAddComment} className="bg-white border border-orange-100 rounded-2xl p-5 mb-6">
                  <StarRating value={commentRating} onChange={setCommentRating} size={22} />
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Share your thoughts about this recipe..."
                    rows={3}
                    className="w-full mt-3 p-3 bg-orange-50 rounded-xl border border-orange-100 resize-none outline-none text-gray-700 focus:border-orange-300"
                  />
                  <button type="submit" disabled={submitting || !commentText.trim()}
                    className="mt-3 flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors disabled:opacity-50"
                  >
                    <FiSend size={15} />
                    {submitting ? 'Posting...' : 'Post Comment'}
                  </button>
                </form>
              )}

              <div className="space-y-4">
                {comments.map((c) => (
                  <div key={c._id} className="bg-white rounded-2xl border border-orange-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-orange-200 flex items-center justify-center text-orange-700 font-bold text-sm flex-shrink-0">
                          {c.userId?.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-sm">{c.userId?.name}</p>
                          {c.rating && <StarRating value={c.rating} readonly size={14} />}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {user && (c.userId?._id === user._id || user.role === 'admin') && (
                          <>
                            {c.userId?._id === user._id && (
                              <button onClick={() => { setEditingId(c._id); setEditText(c.comment); }}
                                className="text-gray-400 hover:text-orange-500"
                              >
                                <FiEdit2 size={14} />
                              </button>
                            )}
                            <button onClick={() => handleDeleteComment(c._id)} className="text-gray-400 hover:text-red-500">
                              <FiTrash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    {editingId === c._id ? (
                      <div className="mt-3">
                        <textarea value={editText} onChange={(e) => setEditText(e.target.value)}
                          className="w-full p-3 bg-orange-50 rounded-xl border border-orange-200 outline-none resize-none text-sm"
                          rows={2}
                        />
                        <div className="flex gap-2 mt-2">
                          <button onClick={() => handleUpdateComment(c._id)}
                            className="text-sm bg-orange-500 text-white px-4 py-1.5 rounded-lg font-semibold"
                          >Save</button>
                          <button onClick={() => setEditingId(null)}
                            className="text-sm bg-gray-100 text-gray-600 px-4 py-1.5 rounded-lg font-semibold"
                          >Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-600 text-sm mt-2 leading-relaxed">{c.comment}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(c.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div>
          <div className="bg-white rounded-2xl border border-orange-100 p-5 sticky top-24">
            <h3 className="font-display font-bold text-gray-800 mb-4">Recipe Info</h3>
            <div className="space-y-3">
              {[
                ['⏱️', 'Prep Time', `${recipe.prepTime || 0} min`],
                ['🍳', 'Cook Time', `${recipe.cookingTime} min`],
                ['⏰', 'Total Time', `${(recipe.prepTime || 0) + recipe.cookingTime} min`],
                ['👥', 'Servings', recipe.servings || 2],
                ['📊', 'Difficulty', recipe.difficulty],
              ].map(([emoji, label, val]) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-orange-50 last:border-0">
                  <span className="text-sm text-gray-500">{emoji} {label}</span>
                  <span className="text-sm font-bold text-gray-700">{val}</span>
                </div>
              ))}
            </div>

            {recipe.tags?.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-bold text-gray-600 mb-2">Tags</p>
                <div className="flex flex-wrap gap-1">
                  {recipe.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded-full font-semibold">#{tag}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 space-y-2">
              <button onClick={handleBookmark}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                  bookmarked ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-500 hover:bg-orange-100'
                }`}
              >
                <FiBookmark />
                {bookmarked ? 'Bookmarked' : 'Bookmark Recipe'}
              </button>
              <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <FiShare2 />
                Share Recipe
              </button>
            </div>

            {recipe.nutrition && (
              <div className="mt-4 bg-orange-50 rounded-xl p-4">
                <p className="font-bold text-sm text-gray-700 mb-2">Nutrition (per serving)</p>
                {Object.entries(recipe.nutrition).map(([key, val]) => val && (
                  <div key={key} className="flex justify-between text-xs py-1">
                    <span className="text-gray-500 capitalize">{key}</span>
                    <span className="font-bold text-gray-700">{val}{key === 'calories' ? ' kcal' : 'g'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
