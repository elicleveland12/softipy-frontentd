import React, { Component } from 'react';

import CoverArtRender from './CoverArtRender'

class SearchResults extends Component {

  renderSearchResult = () => {
    if (this.props.results.data) {
      return this.props.results.data.map(result => {
        return <CoverArtRender key={result.id} result={result} handleDraggedSong={this.props.handleDraggedSong}/>
      })
    }
  }

  render() {
    return (
      <div className="results-container" >
        {this.props.searchTerm && this.props.searchTerm !== "" ? <h3 className="search-term">Searched by "{this.props.searchTerm}": </h3> : null}
        {this.renderSearchResult()}
      </div>
    );
  }
}

export default SearchResults;
