import React, { Component } from 'react';
import PropTypes from 'prop-types';

import withRecipes from 'queries/recipes/recipesQuery';
import SearchForm from 'containers/recipes/_SearchForm';
import ListRecipes from 'containers/recipes/_ListRecipes';

class AllRecipes extends Component {
  static propTypes = {
    data: PropTypes.object,
    match: PropTypes.object
  };

  render() {
    const { recipes } = this.props.data;
    const { params: { keywords } } = this.props.match;

    if (!recipes) {
      return null;
    }

    return (
      <div className="all-recipes">
        <h1 className="title is-3 has-text-centered">Les recettes de cuisine de vos amis</h1>
        <hr />

        <div className="content">
          <SearchForm initialKeywords={keywords} />
        </div>

        <ListRecipes recipes={recipes} />
      </div>
    );
  }
}

export default withRecipes(AllRecipes);
