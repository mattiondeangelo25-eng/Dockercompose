const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let recipes = [
  {
    id: 1,
    name: 'Spaghetti Carbonara',
    ingredients: 'Spaghetti\nEggs\nParmesan cheese\nPancetta\nBlack pepper',
    instructions: 'Cook spaghetti. Mix eggs and cheese. Combine with hot pasta and pancetta.',
    cookTime: '20 minutes',
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Chicken Stir Fry',
    ingredients: 'Chicken breast\nMixed vegetables\nSoy sauce\nGarlic\nGinger',
    instructions: 'Cut chicken and vegetables. Stir fry in hot oil with seasonings.',
    cookTime: '15 minutes',
    created_at: new Date().toISOString()
  }
];

let nextId = 3;

// Validation function
const validateRecipe = (recipe) => {
  return recipe.name && 
         recipe.name.trim() !== '' &&
         recipe.ingredients && 
         recipe.ingredients.trim() !== '' &&
         recipe.instructions && 
         recipe.instructions.trim() !== '' &&
         recipe.cookTime && 
         recipe.cookTime.trim() !== '';
};

// Get all recipes
app.get('/api/recipes', (req, res) => {
  db.all("SELECT * FROM recipes ORDER BY created_at DESC", (err, rows) => {
    if (err) {
      console.error('Error fetching recipes:', err);
      res.status(500).json({ error: 'Failed to fetch recipes' });
      return;
    }
    res.json(rows);
  });
});

// Get single recipe by ID
app.get('/api/recipes/:id', (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM recipes WHERE id = ?", [id], (err, row) => {
    if (err) {
      console.error('Error fetching recipe:', err);
      res.status(500).json({ error: 'Failed to fetch recipe' });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Recipe not found' });
      return;
    }
    res.json(row);
  });
});

// Create new recipe
app.post('/api/recipes', (req, res) => {
  const { name, ingredients, instructions, cookTime } = req.body;
  
  if (!name || !ingredients || !instructions || !cookTime) {
    res.status(400).json({ error: 'All fields are required' });
    return;
  }

  db.run(
    "INSERT INTO recipes (name, ingredients, instructions, cookTime) VALUES (?, ?, ?, ?)",
    [name, ingredients, instructions, cookTime],
    function(err) {
      if (err) {
        console.error('Error creating recipe:', err);
        res.status(500).json({ error: 'Failed to create recipe' });
        return;
      }
      
      db.get("SELECT * FROM recipes WHERE id = ?", [this.lastID], (err, row) => {
        if (err) {
          console.error('Error fetching created recipe:', err);
          res.status(500).json({ error: 'Recipe created but failed to fetch' });
          return;
        }
        res.status(201).json(row);
      });
    }
  );
});

// Delete recipe
app.delete('/api/recipes/:id', (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM recipes WHERE id = ?", [id], function(err) {
    if (err) {
      console.error('Error deleting recipe:', err);
      res.status(500).json({ error: 'Failed to delete recipe' });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Recipe not found' });
      return;
    }
    res.json({ message: 'Recipe deleted successfully' });
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    port: PORT 
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Recipe API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;