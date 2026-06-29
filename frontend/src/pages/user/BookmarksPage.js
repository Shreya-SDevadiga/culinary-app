import React, { useState, useEffect } from 'react';
import { recipeAPI } from '../../services/api';
import RecipeCard from '../../components/common/RecipeCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FiBookmark } from 'react-icons/fi';

export default function BookmarksPage() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    recipeAPI.getBookmarked()
      .then(res => setRecipes(res.data.recipes))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="font-display text-4xl font-bold text-gray-800 mb-2">Bookmarked Recipes</h1>
      <p className="text-gray-500 mb-8">{recipes.length} saved recipe{recipes.length !== 1 ? 's' : ''}</p>
      {loading ? <LoadingSpinner /> : recipes.length === 0 ? (
        <div className="text-center py-20">
          <FiBookmark size={48} className="mx-auto mb-4 text-orange-300" />
          <h3 className="font-display text-2xl font-bold text-gray-600 mb-2">No bookmarks yet</h3>
          <p className="text-gray-400">Browse recipes and bookmark your favorites!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {recipes.map((r, i) => <RecipeCard key={r._id} recipe={r} index={i} />)}
        </div>
      )}
    </div>
  );
}
