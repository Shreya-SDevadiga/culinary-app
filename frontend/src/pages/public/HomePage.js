import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiArrowRight } from 'react-icons/fi';
import { GiKnifeFork } from 'react-icons/gi';
import { recipeAPI } from '../../services/api';
import RecipeCard from '../../components/common/RecipeCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CATEGORIES = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack', 'Appetizer', 'Soup', 'Beverages'];

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [latest, setLatest] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([recipeAPI.getFeatured(), recipeAPI.getLatest()])
      .then(([f, l]) => {
        setFeatured(f.data.recipes);
        setLatest(l.data.recipes);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/recipes?search=${encodeURIComponent(search)}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="hero-gradient relative overflow-hidden py-20 px-4">
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-yellow-300/20 rounded-full blur-2xl" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-semibold mb-6"
          >
            <GiKnifeFork />
            <span>Community Recipe Platform</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
          >
            Cook. Share.<br />
            <span className="text-yellow-200">Celebrate.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/90 text-lg md:text-xl mb-10 max-w-2xl mx-auto"
          >
            Discover thousands of recipes from home chefs around the world. Share your culinary creations and inspire others.
          </motion.p>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onSubmit={handleSearch}
            className="flex max-w-xl mx-auto gap-2"
          >
            <div className="flex-1 flex items-center gap-3 bg-white rounded-2xl px-5 py-3 shadow-xl">
              <FiSearch className="text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search recipes, ingredients..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 outline-none text-gray-700 font-medium bg-transparent"
              />
            </div>
            <button type="submit" className="bg-stone-900 hover:bg-stone-800 text-white px-6 py-3 rounded-2xl font-semibold transition-colors shadow-xl">
              Search
            </button>
          </motion.form>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center gap-8 mt-12 text-white"
          >
            {[['500+', 'Recipes'], ['200+', 'Chefs'], ['10K+', 'Food Lovers']].map(([num, label]) => (
              <div key={label} className="text-center">
                <div className="font-display font-bold text-3xl">{num}</div>
                <div className="text-white/70 text-sm">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="bg-white border-b border-orange-100 py-4 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat}
                to={cat === 'All' ? '/recipes' : `/recipes?category=${cat}`}
                className="px-4 py-2 rounded-full text-sm font-semibold bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white transition-colors whitespace-nowrap border border-orange-100"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Recipes */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-3xl font-bold text-gray-800">Featured Recipes</h2>
            <p className="text-gray-500 mt-1">Hand-picked favorites from our community</p>
          </div>
          <Link to="/recipes" className="flex items-center gap-1 text-orange-500 font-semibold hover:text-orange-600 transition-colors">
            View All <FiArrowRight />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton rounded-2xl h-72" />
            ))}
          </div>
        ) : featured.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((r, i) => <RecipeCard key={r._id} recipe={r} index={i} />)}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <GiKnifeFork size={48} className="mx-auto mb-3 opacity-30" />
            <p>No featured recipes yet. Be the first to submit!</p>
          </div>
        )}
      </section>

      {/* Latest Recipes */}
      <section className="bg-orange-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-3xl font-bold text-gray-800">Latest Recipes</h2>
              <p className="text-gray-500 mt-1">Fresh from our community kitchens</p>
            </div>
            <Link to="/recipes" className="flex items-center gap-1 text-orange-500 font-semibold hover:text-orange-600">
              See More <FiArrowRight />
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {latest.map((r, i) => <RecipeCard key={r._id} recipe={r} index={i} />)}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="hero-gradient py-20 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-4xl font-bold text-white mb-4">Ready to Share Your Recipe?</h2>
          <p className="text-white/80 text-lg mb-8 max-w-md mx-auto">
            Join thousands of home chefs who share their passion for cooking every day.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/register" className="bg-white text-orange-500 font-bold px-8 py-3 rounded-full hover:bg-orange-50 transition-colors shadow-xl">
              Get Started Free
            </Link>
            <Link to="/recipes" className="border-2 border-white text-white font-bold px-8 py-3 rounded-full hover:bg-white/10 transition-colors">
              Browse Recipes
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
