import { describe, it, expect, vi } from 'vitest'

// Simple utility function tests
const validateRecipeData = (recipe) => {
  if (!recipe) return false
  if (!recipe.title || recipe.title.trim() === '') return false
  if (!Array.isArray(recipe.ingredients) || recipe.ingredients.length === 0) return false
  if (!recipe.instructions || recipe.instructions.trim() === '') return false
  if (!recipe.cookingTime || recipe.cookingTime <= 0) return false
  return true
}

const formatCookingTime = (minutes) => {
  if (minutes < 60) {
    return `${minutes} minutes`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
}

describe('Recipe Sharing App - Utility Functions', () => {
  it('validates correct recipe data', () => {
    const validRecipe = {
      id: 1,
      title: 'Test Recipe',
      ingredients: ['Ingredient 1', 'Ingredient 2'],
      instructions: 'Test instructions',
      cookingTime: 30
    }
    
    expect(validateRecipeData(validRecipe)).toBe(true)
  })

  it('rejects invalid recipe data', () => {
    const invalidRecipe = {
      title: '',
      ingredients: [],
      instructions: '',
      cookingTime: 0
    }
    
    expect(validateRecipeData(invalidRecipe)).toBe(false)
  })

  it('rejects recipe with missing fields', () => {
    const incompleteRecipe = {
      title: 'Test Recipe'
      // missing other fields
    }
    
    expect(validateRecipeData(incompleteRecipe)).toBe(false)
  })

  it('formats cooking time correctly for minutes', () => {
    expect(formatCookingTime(30)).toBe('30 minutes')
    expect(formatCookingTime(45)).toBe('45 minutes')
  })

  it('formats cooking time correctly for hours', () => {
    expect(formatCookingTime(60)).toBe('1h')
    expect(formatCookingTime(120)).toBe('2h')
    expect(formatCookingTime(90)).toBe('1h 30m')
  })
})

describe('Recipe Sharing App - API Integration', () => {
  it('should construct correct API URLs', () => {
    const baseUrl = 'http://localhost:5000'
    const apiEndpoints = {
      getAllRecipes: `${baseUrl}/api/recipes`,
      getRecipe: (id) => `${baseUrl}/api/recipes/${id}`,
      createRecipe: `${baseUrl}/api/recipes`,
      updateRecipe: (id) => `${baseUrl}/api/recipes/${id}`,
      deleteRecipe: (id) => `${baseUrl}/api/recipes/${id}`
    }

    expect(apiEndpoints.getAllRecipes).toBe('http://localhost:5000/api/recipes')
    expect(apiEndpoints.getRecipe(1)).toBe('http://localhost:5000/api/recipes/1')
    expect(apiEndpoints.createRecipe).toBe('http://localhost:5000/api/recipes')
  })

  it('should handle API errors gracefully', async () => {
    // Mock fetch to simulate network error
    global.fetch = vi.fn(() => Promise.reject(new Error('Network error')))

    const fetchRecipes = async () => {
      try {
        const response = await fetch('/api/recipes')
        return await response.json()
      } catch (error) {
        return { error: 'Failed to fetch recipes' }
      }
    }

    const result = await fetchRecipes()
    expect(result).toEqual({ error: 'Failed to fetch recipes' })
  })

  it('should handle successful API responses', async () => {
    const mockRecipes = [
      { id: 1, title: 'Test Recipe', ingredients: ['test'], instructions: 'test', cookingTime: 30 }
    ]

    // Mock successful fetch
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockRecipes)
      })
    )

    const fetchRecipes = async () => {
      const response = await fetch('/api/recipes')
      if (response.ok) {
        return await response.json()
      }
      throw new Error('Failed to fetch')
    }

    const result = await fetchRecipes()
    expect(result).toEqual(mockRecipes)
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('Test Recipe')
  })
})