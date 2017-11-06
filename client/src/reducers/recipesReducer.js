export default {
  recipes(state = [], { mutationResult, queryVariables }) {
    const { createRecipe, deleteRecipe } = mutationResult.data;

    if (createRecipe) {
      const newRecipe = createRecipe.newRecipe;
      if (!newRecipe) {
        return null;
      }
      return {
        recipes: [newRecipe, ...state.recipes],
        recipesCount: state.recipesCount + 1
      };
    }

    if (deleteRecipe) {
      const recipeDeleted = deleteRecipe.recipe;
      if (!recipeDeleted) {
        return null;
      }
      return {
        recipes: state.recipes.filter(recipe => recipe.id !== recipeDeleted.id),
        recipesCount: state.recipesCount - 1
      };
    }

    return state;
  }
};

export const recipeReducers = {
  recipe(state = [], { mutationResult, queryVariables }) {
    const { createComment } = mutationResult.data;

    if (createComment) {
      const newComment = createComment.newComment;
      if (!newComment) {
        return null;
      }
      return {
        recipe: {
          ...state.recipe,
          comments: [newComment, ...state.recipe.comments]
        }
      };
    }

    return state;
  }
};

export function updateQuery(state, { fetchMoreResult }) {
  const { recipes, recipesCount } = fetchMoreResult;
  return {
    recipes: [...state.recipes, ...recipes],
    recipesCount
  };
}
