import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSearch, FiFilter } from 'react-icons/fi';
import { recipeAPI } from '../../services/api';
import RecipeCard from '../../components/common/RecipeCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CATEGORIES = ['', 'Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack', 'Appetizer', 'Salad', 'Soup', 'Beverages', 'Other'];
const DIFFICULTIES = ['', 'Easy', 'Medium', 'Hard'];
const SORTS = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'createdAt', label: 'Oldest First' },
  { value: '-averageRating', label: 'Top Rated' },
  { value: 'cookingTime', label: 'Quick First' },
];

export default function RecipesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [difficulty, setDifficulty] = useState('');
  const [sort, setSort] = useState('-createdAt');
  const [page, setPage] = useState(1);
  const [inputSearch, setInputSearch] = useState(search);

  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12, sort };
      if (search) params.search = search;
      if (category) params.category = category;
      if (difficulty) params.difficulty = difficulty;
      const res = await recipeAPI.getAll(params);
      setRecipes(res.data.recipes);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search, category, difficulty, sort]);

  useEffect(() => { fetchRecipes(); }, [fetchRecipes]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(inputSearch);
    setPage(1);
  };

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold text-gray-800 mb-2">All Recipes</h1>
        <p className="text-gray-500">Discover {pagination.total} amazing recipes from our community</p>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-5 mb-8">
        <form onSubmit={handleSearch} className="flex gap-3 mb-4">
          <div className="flex-1 flex items-center gap-3 bg-orange-50 rounded-xl px-4 py-3 border border-orange-100">
            <FiSearch className="text-orange-400" />
            <input
              type="text"
              placeholder="Search recipes..."
              value={inputSearch}
              onChange={(e) => setInputSearch(e.target.value)}
              className="flex-1 outline-none bg-transparent text-gray-700"
            />
          </div>
          <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
            Search
          </button>
        </form>

        <div className="flex flex-wrap gap-3">
          {/* Category */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Category:</span>
            {CATEGORIES.map((cat) => (
              <button key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-colors ${
                  category === cat ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                }`}
              >
                {cat || 'All'}
              </button>
            ))}
          </div>

          {/* Difficulty */}
          <div className="flex items-center gap-2 ml-auto">
            <FiFilter className="text-gray-400" />
            <select value={difficulty} onChange={(e) => { setDifficulty(e.target.value); setPage(1); }}
              className="text-sm bg-orange-50 border border-orange-100 rounded-xl px-3 py-2 outline-none text-gray-700"
            >
              {DIFFICULTIES.map((d) => <option key={d} value={d}>{d || 'Any Difficulty'}</option>)}
            </select>
            <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="text-sm bg-orange-50 border border-orange-100 rounded-xl px-3 py-2 outline-none text-gray-700"
            >
              {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => <div key={i} className="skeleton rounded-2xl h-72" />)}
        </div>
      ) : recipes.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {recipes.map((r, i) => <RecipeCard key={r._id} recipe={r} index={i} />)}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center mt-10 gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 rounded-xl bg-white border border-orange-200 text-orange-500 font-semibold disabled:opacity-40 hover:bg-orange-50 transition-colors"
              >
                ← Prev
              </button>
              {[...Array(pagination.pages)].map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)}
                  className={`w-10 h-10 rounded-xl font-semibold transition-colors ${
                    page === i + 1 ? 'bg-orange-500 text-white' : 'bg-white border border-orange-200 text-gray-600 hover:bg-orange-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button disabled={page === pagination.pages} onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 rounded-xl bg-white border border-orange-200 text-orange-500 font-semibold disabled:opacity-40 hover:bg-orange-50 transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 text-gray-400">
          <div className="text-6xl mb-4">🍽️</div>
          <h3 className="font-display text-2xl font-bold text-gray-600 mb-2">No Recipes Found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
