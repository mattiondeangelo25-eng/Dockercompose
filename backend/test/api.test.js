const request = require('supertest');
const app = require('../server');

describe('Recipe API Tests', () => {
  let server;

  beforeAll(() => {
    // Start server on a different port for testing
    server = app.listen(5001);
  });

  afterAll(() => {
    server.close();
  });

  describe('GET /api/recipes', () => {
    test('should return all recipes', async () => {
      const response = await request(app)
        .get('/api/recipes')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    test('should return recipes with correct structure', async () => {
      const response = await request(app)
        .get('/api/recipes')
        .expect(200);

      const recipe = response.body[0];
      expect(recipe).toHaveProperty('id');
      expect(recipe).toHaveProperty('name');
      expect(recipe).toHaveProperty('ingredients');
      expect(recipe).toHaveProperty('instructions');
      expect(recipe).toHaveProperty('cookTime');
    });
  });

  describe('POST /api/recipes', () => {
    test('should create a new recipe', async () => {
      const newRecipe = {
        name: 'Test Recipe',
        ingredients: 'Test ingredient 1\nTest ingredient 2',
        instructions: 'Test instructions',
        cookTime: '30 minutes'
      };

      const response = await request(app)
        .post('/api/recipes')
        .send(newRecipe)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(newRecipe.name);
      expect(response.body.ingredients).toBe(newRecipe.ingredients);
      expect(response.body.instructions).toBe(newRecipe.instructions);
      expect(response.body.cookTime).toBe(newRecipe.cookTime);
    });

    test('should return 400 for invalid recipe data', async () => {
      const invalidRecipe = {
        name: '', // Empty name should fail
        ingredients: '',
        instructions: '',
        cookTime: '' 
      };

      await request(app)
        .post('/api/recipes')
        .send(invalidRecipe)
        .expect(400);
    });
  });

  describe('GET /api/recipes/:id', () => {
    test('should return a specific recipe', async () => {
      const response = await request(app)
        .get('/api/recipes/1')
        .expect(200);

      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('name');
    });

    test('should return 404 for non-existent recipe', async () => {
      await request(app)
        .get('/api/recipes/999')
        .expect(404);
    });
  });

  describe('DELETE /api/recipes/:id', () => {
    test('should delete an existing recipe', async () => {
      // First create a recipe to delete
      const newRecipe = {
        name: 'Recipe to Delete',
        ingredients: 'Ingredient 1',
        instructions: 'Instructions',
        cookTime: '20 minutes'
      };

      const createResponse = await request(app)
        .post('/api/recipes')
        .send(newRecipe)
        .expect(201);

      const recipeId = createResponse.body.id;

      // Then delete it
      await request(app)
        .delete(`/api/recipes/${recipeId}`)
        .expect(204);

      // Verify it's deleted
      await request(app)
        .get(`/api/recipes/${recipeId}`)
        .expect(404);
    });

    test('should return 404 for deleting non-existent recipe', async () => {
      await request(app)
        .delete('/api/recipes/999')
        .expect(404);
    });
  });

  describe('GET /api/health', () => {
    test('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
    });
  });
});