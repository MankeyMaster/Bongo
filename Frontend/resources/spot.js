var spotifyApi = new SpotifyWebApi();
var songView = document.getElementById("Music");
var accessToken = "";
const clientId = 'dc9dbbb0da88417b9e2da982fb163709';
const clientSec = '463b923f1e8d4992ba595089a8222b33';
const redirectUri = 'http://localhost:8888/callback';
const scopes = ['streaming user-follow-modify user-follow-read playlist-read-private user-library-modify user-library-read playlist-modify-public user-read-playback-state'];
var songs = [];

function login(callback) {
  function getLoginURL() {
      return 'https://accounts.spotify.com/authorize?client_id=' + clientId +
        '&redirect_uri=' + encodeURIComponent(redirectUri) +
        '&scope=' + encodeURIComponent(scopes) +
        '&response_type=token';
  }
  
  var url = getLoginURL([
      'user-read-email'
  ]);
  
  var width = 450,
      height = 730,
      left = (screen.width / 2) - (width / 2),
      top = (screen.height / 2) - (height / 2);

  window.addEventListener("message", function(event) {
      var hash = JSON.parse(event.data);
      if (hash.type == 'access_token') {
          callback(hash.access_token);
      }
  }, false);
  
  var w = window.open(url,
                      'Spotify',
                      'menubar=no,location=no,resizable=no,scrollbars=no,status=no, width=' + width + ', height=' + height + ', top=' + top + ', left=' + left
                     );
  
}

function getUserData(accessToken) {
  return $.ajax({
      url: 'https://api.spotify.com/v1/me',
      headers: {
         'Authorization': 'Bearer ' + accessToken
      }
  });
}


document.getElementById('login').addEventListener('click', function() {
  login(function(accessToken) {
      getUserData(accessToken)
          .then(function(response) {
              document.getElementById('login').hidden = true 
              spotifyApi.setAccessToken(accessToken);
              spotifyApi.GetMySavedTracks({}, function(err, data){
                  if(err) console.error(err);
                  else {
                    var newSong = "", songName = "", songURI = "", i = 0;      
                    data.items.foreach(track => {
                        newSong = document.createElement("li");
                        songName = track.name;
                        songURI = track.uri;
                        newSong.appendChild(document.createTextNode(songName));
                        songView.appendChild(newSong);
                        newSong.classList.add("song");
                        songs[i] = songURI;
                        i++;
                    })
                }
              })
          });
      });
});




