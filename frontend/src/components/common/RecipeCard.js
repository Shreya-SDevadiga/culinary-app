import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiClock, FiStar, FiUser } from 'react-icons/fi';
import { GiKnifeFork } from 'react-icons/gi';

const UPLOADS_URL = process.env.REACT_APP_UPLOADS_URL || 'http://localhost:5000';
const PLACEHOLDER = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop';

const difficultyColors = {
  Easy: 'bg-green-100 text-green-700',
  Medium: 'bg-yellow-100 text-yellow-700',
  Hard: 'bg-red-100 text-red-700',
};

export default function RecipeCard({ recipe, index = 0 }) {
  const imageUrl = recipe.image ? `${UPLOADS_URL}${recipe.image}` : PLACEHOLDER;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="recipe-card bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl border border-orange-50"
    >
      <Link to={`/recipes/${recipe._id}`}>
        <div className="relative h-48 overflow-hidden">
          <img
            src={imageUrl}
            alt={recipe.title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            onError={(e) => { e.target.src = PLACEHOLDER; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

          {recipe.isFeatured && (
            <span className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              ⭐ Featured
            </span>
          )}
          <span className={`absolute top-3 right-3 text-xs font-bold px-2 py-1 rounded-full ${difficultyColors[recipe.difficulty] || difficultyColors.Medium}`}>
            {recipe.difficulty}
          </span>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-1 mb-1">
            <span className="text-xs font-semibold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">
              {recipe.category}
            </span>
          </div>

          <h3 className="font-display font-bold text-gray-800 text-lg leading-tight line-clamp-2 mt-1 hover:text-orange-500 transition-colors">
            {recipe.title}
          </h3>

          <p className="text-sm text-gray-500 line-clamp-2 mt-1">{recipe.description}</p>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-orange-50">
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <FiClock className="text-orange-400" />
                {recipe.cookingTime}m
              </span>
              <span className="flex items-center gap-1">
                <FiStar className="text-yellow-400" />
                {recipe.averageRating > 0 ? recipe.averageRating.toFixed(1) : 'New'}
              </span>
            </div>
            {recipe.createdBy && (
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <div className="w-5 h-5 rounded-full bg-orange-200 flex items-center justify-center">
                  <FiUser size={10} className="text-orange-600" />
                </div>
                <span>{recipe.createdBy.name?.split(' ')[0]}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
