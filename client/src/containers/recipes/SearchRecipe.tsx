import * as React from 'react';
import { compose } from 'react-apollo';

import withRecipes from 'queries/recipesQuery';
import HeadListRecipes from 'containers/recipes/_HeadListRecipes';
import ListRecipes from 'containers/recipes/_ListRecipes';

// typings
import { ApolloQueryResult } from 'apollo-client/core/types';
import { RecipesQuery } from 'types';

interface IProps {
  data: RecipesQuery;
  match: any;
  loadMoreRecipes: () => ApolloQueryResult<RecipesQuery>;
}

class SearchRecipes extends React.Component<IProps, {}> {
  public componentWillUpdate(nextProps: IProps) {
    if (nextProps.match.params.keywords !== this.props.match.params.keywords) {
      this.props.data.recipes = [];
    }
  }

  public render() {
    const { data: { recipes, recipesCount }, loadMoreRecipes } = this.props;
    const { params: { keywords } } = this.props.match;

    if (!recipes) {
      return null;
    }

    return (
      <div className="search-recipes">
        <h1 className="title is-3 has-text-centered">Recherche pour : {keywords}</h1>
        <hr />

        <HeadListRecipes keywords={keywords} />

        {recipes && recipes.length === 0 ? (
          <h3>Pas de résultats ...</h3>
        ) : (
          <ListRecipes recipes={recipes} recipesCount={recipesCount} loadMoreRecipes={loadMoreRecipes} />
        )}
      </div>
    );
  }
}

export default compose(withRecipes)(SearchRecipes);
