const mongoose = require('mongoose');
const User = require('../models/User');
const Recipe = require('../models/Recipe');
require('dotenv').config();

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await Promise.all([User.deleteMany(), Recipe.deleteMany()]);

  // Create admin
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@culinary.com',
    password: 'Admin@123',
    role: 'admin',
    bio: 'System Administrator',
  });

  // Create sample users
  const users = await User.insertMany([
    { name: 'Chef Maria', email: 'maria@example.com', password: 'Test@123', role: 'user', bio: 'Italian cuisine specialist' },
    { name: 'John Baker', email: 'john@example.com', password: 'Test@123', role: 'user', bio: 'Passionate home baker' },
    { name: 'Priya Sharma', email: 'priya@example.com', password: 'Test@123', role: 'user', bio: 'Indian spice expert' },
  ]);

  // Sample recipes
  const recipes = [
    {
      title: 'Classic Margherita Pizza',
      description: 'Authentic Italian Margherita pizza with fresh tomatoes, mozzarella, and basil on a crispy thin crust.',
      ingredients: [
        { name: 'Pizza dough', quantity: '300', unit: 'g' },
        { name: 'San Marzano tomatoes', quantity: '200', unit: 'g' },
        { name: 'Fresh mozzarella', quantity: '150', unit: 'g' },
        { name: 'Fresh basil', quantity: '10', unit: 'leaves' },
        { name: 'Olive oil', quantity: '2', unit: 'tbsp' },
        { name: 'Salt', quantity: '1', unit: 'tsp' },
      ],
      steps: [
        { stepNumber: 1, instruction: 'Preheat oven to 250°C (480°F) with a pizza stone inside.' },
        { stepNumber: 2, instruction: 'Stretch dough on a floured surface to form a thin round.' },
        { stepNumber: 3, instruction: 'Crush tomatoes by hand and spread over dough, leaving a 2cm border.' },
        { stepNumber: 4, instruction: 'Tear mozzarella and distribute evenly.' },
        { stepNumber: 5, instruction: 'Bake for 8-10 minutes until crust is golden and cheese bubbles.' },
        { stepNumber: 6, instruction: 'Top with fresh basil leaves and drizzle olive oil.' },
      ],
      cookingTime: 25,
      prepTime: 15,
      servings: 2,
      difficulty: 'Medium',
      category: 'Dinner',
      tags: ['Italian', 'Pizza', 'Vegetarian'],
      approvalStatus: 'approved',
      isFeatured: true,
      createdBy: users[0]._id,
    },
    {
      title: 'Butter Chicken (Murgh Makhani)',
      description: 'Creamy, rich North Indian butter chicken with aromatic spices in a velvety tomato sauce.',
      ingredients: [
        { name: 'Chicken thighs', quantity: '500', unit: 'g' },
        { name: 'Butter', quantity: '3', unit: 'tbsp' },
        { name: 'Heavy cream', quantity: '200', unit: 'ml' },
        { name: 'Tomato puree', quantity: '400', unit: 'g' },
        { name: 'Garam masala', quantity: '2', unit: 'tsp' },
        { name: 'Ginger garlic paste', quantity: '2', unit: 'tbsp' },
        { name: 'Kashmiri chili powder', quantity: '1', unit: 'tsp' },
      ],
      steps: [
        { stepNumber: 1, instruction: 'Marinate chicken in yogurt and spices for 2 hours, then grill or pan-fry.' },
        { stepNumber: 2, instruction: 'In a pan, melt butter and sauté ginger garlic paste for 2 minutes.' },
        { stepNumber: 3, instruction: 'Add tomato puree and cook for 10 minutes on medium heat.' },
        { stepNumber: 4, instruction: 'Add cream, garam masala, and salt. Simmer for 5 minutes.' },
        { stepNumber: 5, instruction: 'Add grilled chicken and simmer for another 10 minutes.' },
        { stepNumber: 6, instruction: 'Garnish with cream and fresh cilantro. Serve with naan.' },
      ],
      cookingTime: 35,
      prepTime: 20,
      servings: 4,
      difficulty: 'Medium',
      category: 'Dinner',
      tags: ['Indian', 'Chicken', 'Curry'],
      approvalStatus: 'approved',
      isFeatured: true,
      createdBy: users[2]._id,
    },
    {
      title: 'Classic French Toast',
      description: 'Golden, custardy French toast dusted with cinnamon sugar — the perfect weekend breakfast.',
      ingredients: [
        { name: 'Thick bread slices', quantity: '4', unit: 'slices' },
        { name: 'Eggs', quantity: '2', unit: 'large' },
        { name: 'Milk', quantity: '60', unit: 'ml' },
        { name: 'Vanilla extract', quantity: '1', unit: 'tsp' },
        { name: 'Cinnamon', quantity: '1/2', unit: 'tsp' },
        { name: 'Butter', quantity: '1', unit: 'tbsp' },
        { name: 'Maple syrup', quantity: '2', unit: 'tbsp' },
      ],
      steps: [
        { stepNumber: 1, instruction: 'Whisk together eggs, milk, vanilla, and cinnamon in a shallow bowl.' },
        { stepNumber: 2, instruction: 'Dip each bread slice in the egg mixture, soaking for 30 seconds per side.' },
        { stepNumber: 3, instruction: 'Heat butter in a non-stick pan over medium heat.' },
        { stepNumber: 4, instruction: 'Cook bread slices for 2-3 minutes per side until golden brown.' },
        { stepNumber: 5, instruction: 'Serve warm with maple syrup and fresh berries.' },
      ],
      cookingTime: 15,
      prepTime: 5,
      servings: 2,
      difficulty: 'Easy',
      category: 'Breakfast',
      tags: ['Breakfast', 'Quick', 'Sweet'],
      approvalStatus: 'approved',
      isFeatured: true,
      createdBy: users[1]._id,
    },
    {
      title: 'Chocolate Lava Cake',
      description: 'Decadent individual chocolate cakes with a molten, flowing center. A restaurant-worthy dessert at home.',
      ingredients: [
        { name: 'Dark chocolate', quantity: '200', unit: 'g' },
        { name: 'Unsalted butter', quantity: '100', unit: 'g' },
        { name: 'Eggs', quantity: '3', unit: 'large' },
        { name: 'Sugar', quantity: '80', unit: 'g' },
        { name: 'All-purpose flour', quantity: '40', unit: 'g' },
        { name: 'Cocoa powder', quantity: '1', unit: 'tsp' },
      ],
      steps: [
        { stepNumber: 1, instruction: 'Preheat oven to 200°C. Grease 4 ramekins with butter and dust with cocoa.' },
        { stepNumber: 2, instruction: 'Melt chocolate and butter together over a double boiler until smooth.' },
        { stepNumber: 3, instruction: 'Whisk eggs and sugar until pale and fluffy, about 5 minutes.' },
        { stepNumber: 4, instruction: 'Fold chocolate mixture into eggs, then fold in flour.' },
        { stepNumber: 5, instruction: 'Divide batter among ramekins and bake for exactly 12 minutes.' },
        { stepNumber: 6, instruction: 'Run a knife around edges and invert onto plates. Serve immediately.' },
      ],
      cookingTime: 20,
      prepTime: 15,
      servings: 4,
      difficulty: 'Hard',
      category: 'Dessert',
      tags: ['Chocolate', 'Dessert', 'Baking'],
      approvalStatus: 'approved',
      isFeatured: false,
      createdBy: users[1]._id,
    },
    {
      title: 'Green Goddess Smoothie Bowl',
      description: 'A vibrant, nutrient-packed smoothie bowl loaded with tropical fruits and crunchy toppings.',
      ingredients: [
        { name: 'Frozen spinach', quantity: '100', unit: 'g' },
        { name: 'Frozen mango', quantity: '150', unit: 'g' },
        { name: 'Banana', quantity: '1', unit: 'large' },
        { name: 'Coconut milk', quantity: '100', unit: 'ml' },
        { name: 'Granola', quantity: '30', unit: 'g' },
        { name: 'Mixed berries', quantity: '50', unit: 'g' },
        { name: 'Honey', quantity: '1', unit: 'tbsp' },
      ],
      steps: [
        { stepNumber: 1, instruction: 'Blend spinach, mango, banana, and coconut milk until very smooth.' },
        { stepNumber: 2, instruction: 'Pour into a bowl — it should be thick enough to support toppings.' },
        { stepNumber: 3, instruction: 'Arrange granola, berries, and other toppings decoratively.' },
        { stepNumber: 4, instruction: 'Drizzle with honey and serve immediately.' },
      ],
      cookingTime: 5,
      prepTime: 5,
      servings: 1,
      difficulty: 'Easy',
      category: 'Breakfast',
      tags: ['Healthy', 'Vegan', 'Quick'],
      approvalStatus: 'approved',
      isFeatured: false,
      createdBy: users[2]._id,
    },
    {
      title: 'Pending: Spicy Ramen Bowl',
      description: 'A rich and spicy ramen with homemade broth, soft-boiled eggs, and assorted toppings.',
      ingredients: [
        { name: 'Ramen noodles', quantity: '200', unit: 'g' },
        { name: 'Pork belly', quantity: '200', unit: 'g' },
        { name: 'Miso paste', quantity: '3', unit: 'tbsp' },
        { name: 'Soft boiled eggs', quantity: '2', unit: '' },
        { name: 'Green onions', quantity: '3', unit: 'stalks' },
      ],
      steps: [
        { stepNumber: 1, instruction: 'Prepare broth by simmering pork bones for 4 hours.' },
        { stepNumber: 2, instruction: 'Cook ramen noodles according to package instructions.' },
        { stepNumber: 3, instruction: 'Assemble bowl with noodles, broth, and toppings.' },
      ],
      cookingTime: 30,
      prepTime: 240,
      servings: 2,
      difficulty: 'Hard',
      category: 'Lunch',
      tags: ['Japanese', 'Soup', 'Noodles'],
      approvalStatus: 'pending',
      createdBy: users[0]._id,
    },
  ];

  await Recipe.insertMany(recipes);

  console.log('✅ Seed data inserted successfully!');
  console.log('Admin Login: admin@culinary.com / Admin@123');
  console.log('User Login: maria@example.com / Test@123');
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
