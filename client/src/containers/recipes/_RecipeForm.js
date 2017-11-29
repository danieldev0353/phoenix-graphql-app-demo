import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import { Form, Field } from 'react-final-form';

import ROOT_URL from 'config/rootUrl';
import SubmitField from 'components/form/SubmitField';
import RenderField from 'components/form/RenderField';
import { required } from 'components/form/validation';
import RECIPE_OPTIONS from 'graphql/recipes/recipeOptionsQuery.graphql';

class RecipeForm extends Component {
  static propTypes = {
    action: PropTypes.func,
    handleSubmit: PropTypes.func,
    data: PropTypes.object,
    initialValues: PropTypes.object,
    mutation: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.state = { removeImage: false };
    this.submitForm = this.submitForm.bind(this);
    this.onRemoveImage = this.onRemoveImage.bind(this);
  }

  async submitForm(values) {
    const { removeImage } = this.state;
    try {
      await this.props.action({ removeImage, ...values });
    } catch (errors) {
      return errors;
    }
  }

  onRemoveImage() {
    this.setState({ removeImage: true });
  }

  render() {
    const { removeImage } = this.state;
    const {
      initialValues: recipe,
      mutation: { loading },
      data: { totalTimeOptions, levelOptions, budgetOptions }
    } = this.props;

    return (
      <Form
        onSubmit={this.submitForm}
        initialValues={recipe}
        render={({ handleSubmit, pristine }) => (
          <form onSubmit={handleSubmit} className="recipe-form">
            <Field name="title" label="Titre" component={RenderField} validate={required} />
            <div className="columns">
              <div className="column">
                <Field
                  name="totalTime"
                  label="Temps"
                  type="select"
                  options={totalTimeOptions}
                  component={RenderField}
                />
              </div>
              <div className="column">
                <Field name="level" label="Niveau" type="select" options={levelOptions} component={RenderField} />
              </div>
              <div className="column">
                <Field name="budget" type="select" options={budgetOptions} component={RenderField} />
              </div>
            </div>

            {recipe.image_url && !removeImage ? (
              <div className="field">
                <label className="label" htmlFor="recipe_image_url">
                  Photo
                </label>
                <img
                  src={`${ROOT_URL}${recipe.image_url}`}
                  alt={recipe.title}
                  className="recipe-image image is-96x96"
                />
                <a onClick={this.onRemoveImage} className="button is-text remove-image-link">
                  Supprimer
                </a>
              </div>
            ) : null}
            <Field name="image" label="Choisir une photo..." type="file" component={RenderField} />
            <Field
              name="content"
              label="Recette"
              type="textarea"
              inputHtml={{ rows: 14 }}
              component={RenderField}
              validate={required}
            />

            <SubmitField loading={loading} />
          </form>
        )}
      />
    );
  }
}

export default graphql(RECIPE_OPTIONS)(RecipeForm);
