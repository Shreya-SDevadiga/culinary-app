import React from 'react';
import { Link } from 'react-router-dom';
import { GiCook } from 'react-icons/gi';
import { FiInstagram, FiTwitter, FiYoutube } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl hero-gradient flex items-center justify-center">
              <GiCook className="text-white text-lg" />
            </div>
            <span className="font-display font-bold text-xl text-white">CulinaryBook</span>
          </div>
          <p className="text-sm leading-relaxed text-stone-400 max-w-xs">
            A community-driven recipe platform where food lovers share, discover, and celebrate the art of cooking.
          </p>
          <div className="flex gap-4 mt-6">
            {[FiInstagram, FiTwitter, FiYoutube].map((Icon, i) => (
              <a key={i} href="#" className="w-9 h-9 rounded-full bg-stone-800 flex items-center justify-center hover:bg-orange-500 transition-colors">
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-display font-bold text-white mb-4">Explore</h4>
          <ul className="space-y-2 text-sm">
            {[['/', 'Home'], ['/recipes', 'All Recipes'], ['/about', 'About Us']].map(([to, label]) => (
              <li key={to}><Link to={to} className="hover:text-orange-400 transition-colors">{label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-display font-bold text-white mb-4">Account</h4>
          <ul className="space-y-2 text-sm">
            {[['/login', 'Login'], ['/register', 'Sign Up'], ['/submit-recipe', 'Submit Recipe']].map(([to, label]) => (
              <li key={to}><Link to={to} className="hover:text-orange-400 transition-colors">{label}</Link></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-stone-800 py-5 text-center text-xs text-stone-500">
        © {new Date().getFullYear()} CulinaryBook. Made with ❤️ for food lovers.
      </div>
    </footer>
  );
}
