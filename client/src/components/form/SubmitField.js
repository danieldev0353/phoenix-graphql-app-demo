import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Link } from 'react-router-dom';

export default class SubmitField extends Component {
  static propTypes = {
    value: PropTypes.string,
    loading: PropTypes.bool,
    cancel: PropTypes.bool
  };

  static defaultProps = {
    value: 'Soumettre',
    loading: false,
    cancel: true
  };

  render() {
    const { loading, value, cancel } = this.props;
    return (
      <div className="field is-grouped">
        <div className="control">
          <button className={classnames('button is-primary', { 'is-loading': loading })} type="submit">
            {value}
          </button>
        </div>
        {cancel ? (
          <div className="control">
            <Link className="button is-link" to="/">
              Retour
            </Link>
          </div>
        ) : null}
      </div>
    );
  }
}
