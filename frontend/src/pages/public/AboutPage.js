import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GiCook } from 'react-icons/gi';

export default function AboutPage() {
  return (
    <div>
      <section className="hero-gradient py-20 text-center px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-6">
            <GiCook className="text-white text-4xl" />
          </div>
          <h1 className="font-display text-5xl font-bold text-white mb-4">About CulinaryBook</h1>
          <p className="text-white/80 text-lg max-w-xl mx-auto">
            A platform built with love for food enthusiasts who want to share their culinary passion with the world.
          </p>
        </motion.div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-10">
          {[
            { title: 'Our Mission', text: 'We believe great recipes deserve to be shared. CulinaryBook connects home cooks, chefs, and food lovers in a vibrant community where every dish has a story.' },
            { title: 'Quality First', text: 'Every recipe is reviewed by our team before publication. We ensure accuracy, safety, and culinary integrity so you can cook with confidence.' },
            { title: 'Community Driven', text: 'Our platform thrives on community contributions. Anyone can submit a recipe, rate dishes, and leave reviews to help others discover great food.' },
            { title: 'For Everyone', text: 'From beginner cooks to professional chefs, CulinaryBook offers recipes at every skill level — easy weeknight dinners to challenging gourmet creations.' },
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-orange-100"
            >
              <h3 className="font-display text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
              <p className="text-gray-600 leading-relaxed">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-orange-50 py-16 text-center px-4">
        <h2 className="font-display text-3xl font-bold text-gray-800 mb-4">Ready to share your recipes?</h2>
        <Link to="/register" className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-full transition-colors shadow-lg">
          Join CulinaryBook
        </Link>
      </section>
    </div>
  );
}
