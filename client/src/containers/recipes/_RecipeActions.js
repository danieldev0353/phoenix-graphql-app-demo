import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import withDeleteRecipe from 'mutations/recipes/deleteRecipeMutation';
import withFlashMessage from 'components/withFlashMessage';

class RecipeActions extends Component {
  static propTypes = {
    recipe: PropTypes.object,
    notice: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.destroy = this.destroy.bind(this);
  }

  destroy() {
    if (window.confirm('êtes vous sûre ?')) {
      this.props.deleteRecipe(this.props.recipe.id).then(response => {
        if (!response.data.deleteRecipe.errors) {
          this.props.notice('La recette a bien été supprimé.');
        }
      });
    }
    return false;
  }

  render() {
    const { recipe } = this.props;

    return (
      <div className="recipe-actions is-pulled-right">
        <Link to={`/recipes/${recipe.id}/edit`}>
          <span className="icon">
            <i className="fa fa-edit" />
          </span>
        </Link>
        <a onClick={this.destroy}>
          <span className="icon">
            <i className="fa fa-trash-o" />
          </span>
        </a>
      </div>
    );
  }
}

export default withDeleteRecipe(withFlashMessage(RecipeActions));
