var data = '{"uris":}'
var device = "";
window.onSpotifyPlayerAPIReady = () => {
    const player = new Spotify.Player({
      name: 'Web Playback SDK Template',
      getOAuthToken: cb => { cb(accessToken);
      }
});
player.on('initialization_error', e => console.error(e));
player.on('authentication_error', e => console.error(e));
player.on('account_error', e => console.error(e));
player.on('playback_error', e => console.error(e));


player.on('ready', deviceReq => {
  console.log('Ready with Device ID', deviceReq.device_id);
  data.uris[0] = songs[0]
  device = deviceReq
  // Play a track using our new device ID
  play(device.device_id);
});

// Connect to the player!
player.connect();

};
document.getElementById('song').addEventListener('click', function(){
  var songRet = parseInt(this.id, 10);
  data.uris[songRet] = songs[songRet];
  play(device.device_id)  
  
})
function play(device_id) {
  $.ajax({
   url: "https://api.spotify.com/v1/me/player/play?device_id=" + device_id,
   type: "PUT",
   data,
   beforeSend: function(xhr){xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken );},
   success: function(data) { 
     console.log(data)
   }
  });
}

