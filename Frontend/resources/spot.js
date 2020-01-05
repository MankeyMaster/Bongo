'use strict'

import Client from '../src/Client';
import UserHandler from '../src/handlers/UserHandler';
import TrackHandler from '../src/handlers/TrackHandler';
import PlaylistHandler from '../src/handlers/PlaylistHandler';
import ArtistHandler from '../src/handlers/ArtistHandler';

let client = Client.instance

window.onSpotifyPlayerAPIReady = () => {
    const player = new Spotify.Player({
      name: 'Web Playback SDK Template',
      getOAuthToken: cb => { cb(_token); }
})};