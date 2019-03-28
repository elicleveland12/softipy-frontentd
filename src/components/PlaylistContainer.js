import React, { Component } from 'react';

import Playlists from './Playlists'

class PlaylistContainer extends Component {

  state = {
    playlists: [],
    expandPlaylist: false,
    clickedPlaylist: null,
    playlistForm: false,
    newPlaylistName: "",
    myPlaylists: [],
    addNewPlaylist: [],
    followPlaylist: false,
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.addNewPlaylist && prevState.addNewPlaylist) {
      // so this is getting set back to true when you click on that playlist for some reason and that's sad
       if (nextProps.addNewPlaylist.id !== prevState.addNewPlaylist.id && prevState.followPlaylist === false) {
         return {
           followPlaylist: true,
           addNewPlaylist: [...prevState.addNewPlaylist, nextProps.addNewPlaylist],
           myPlaylists: [...prevState.myPlaylists, nextProps.addNewPlaylist],
           playlists: [...prevState.playlists, nextProps.addNewPlaylist],
         }
      } else {
        console.log('hey, here')
        return {followPlaylist: false};
      }
    }
  }

  followPlaylist = () => {
    let data = {
      user_id: localStorage.getItem("user"),
      playlist_id: this.props.addNewPlaylist.id
    };

    fetch('http://localhost:3000/user_playlists' , {
      method: 'POST',
      headers: {
        "Content-type": "application/json"
      },
      body: JSON.stringify(data)
    })
  }

  setMyPlaylists = () => {
    let userId = parseInt(localStorage.getItem("user"));
    let currentUser;
    let myPlaylists = []

    this.state.playlists.forEach(playlist => {
      playlist.users.forEach(user => {
        if (user.id === userId) {
          return currentUser = user;
        }
      })
    })

    this.state.playlists.forEach(playlist => {
      playlist.users.forEach(user => {
        if (user.id === userId) {
          myPlaylists.push(playlist);
        }
      })
    })

    this.setState({ myPlaylists })
  }

  componentDidMount() {
    fetch('http://localhost:3000/playlists')
    .then(r=>r.json())
    .then(playlists => {
      this.setState({
        playlists
      })
    })
    .then(this.setMyPlaylists)
  }

  handleClick = (playlist) => {
    if (this.state.expandPlaylist === false) {
      this.setState({
        expandPlaylist: !this.state.expandPlaylist,
        clickedPlaylist: playlist
      })
    }
  }

  renderSinglePlaylist = () => {
    return (
      <Playlists
        playlist={this.state.clickedPlaylist}
        handleClick={this.handleClick}
        songs={this.props.songs}
        expandPlaylist={this.state.expandPlaylist}
        draggedSong={this.props.draggedSong}
        addSong={this.props.addSong}
        deleteSong={this.props.deleteSong}
        goBack={this.goBack}
        deletePlaylist={this.deletePlaylist}
      />
    )
  }

  renderPlaylists = () => {
      if (this.state.myPlaylists !== []) {
        return (
          this.state.myPlaylists.map(playlist => {
          return (
            <div class="playlist-cards">
              <Playlists
                key={playlist.id}
                playlist={playlist}
                handleClick={this.handleClick}
                songs={this.props.songs}
                expandPlaylist={this.state.expandPlaylist}
                draggedSong={this.props.draggedSong}
                addSong={this.props.addSong}
              />
            </div>
          )
        })
      )
    } else {
      return null;
    }
  }

  newPlaylistName = (e) => {
    this.setState({
      newPlaylistName: e.target.value
    })
  }

  createPlaylist = (e) => {
    e.preventDefault()
    fetch('http://localhost:3000/playlists', {
      method: 'POST',
      headers: {
        "Content-type": "application/json"
      },
      body: JSON.stringify({
        name: this.state.newPlaylistName
      })
    })
    .then(res => res.json())
    .then(newPlaylist => {
      this.setState({
        myPlaylists: [...this.state.myPlaylists, newPlaylist],
        playlists: [...this.state.playlists, newPlaylist],
        playlistForm: false
      })
      this.createUserPlaylist(newPlaylist)
    })
  }

  createUserPlaylist = (playlist) => {
    let data = {
      user_id: localStorage.getItem("user"),
      playlist_id: playlist.id
    }

    fetch('http://localhost:3000/user_playlists' , {
      method: 'POST',
      headers: {
        "Content-type": "application/json"
      },
      body: JSON.stringify(data)
    })
    .then(res => res.json())
  }

  goBack = () => {
   this.setState({
     expandPlaylist: !this.state.expandPlaylist,
     clickedPlaylist: null
   })
  }

  deletePlaylist = (deletePlaylist) => {
    let foundPlaylist = this.state.myPlaylists.find(playlist => playlist.id === deletePlaylist.id)
    let newPlaylists = this.state.myPlaylists.filter(playlist => playlist.id !== deletePlaylist.id)
    fetch(`http://localhost:3000/playlists/${deletePlaylist.id}`, {
      method: "DELETE"
    })
    .then(r => r.json())
    .then(() => {
      this.setState({
        myPlaylists: newPlaylists,
        expandPlaylist: false,
        clickedPlaylist: null
      })
    })
  }

  addNewPlaylist = () => {
    return (
      <div className="playlist-form">
        <h2>Playlist Name:</h2>
        <form onSubmit={this.createPlaylist}>
          <input className="playlist-form-input" onChange={this.newPlaylistName} type="text" name="newPlaylistName"/>
          <br/><br/>
          <input className="playlistButton" type="submit" value="Create Playlist" />
          <br/><br/>
        </form>
      </div>
    )
  }

  changePlaylistFormState = () => {
    this.setState({ playlistForm: !this.state.playlistForm})
  }

  render() {
    console.log(this.state.followPlaylist)
    return (
      <div>
        {this.state.followPlaylist === true ? this.followPlaylist() : null}
        {this.state.expandPlaylist === false ?
          <div>
            <button class="new-playlist" onClick={this.changePlaylistFormState}> + </button>
            <br/>
            <h1 className="header">MY PLAYLISTS:</h1>
            {this.state.playlistForm ? this.addNewPlaylist() : null}
            {this.renderPlaylists()}
          </div> :
          <div>
            {this.renderSinglePlaylist()}
          </div>
        }
      </div>
    );
  }
}

export default PlaylistContainer;
