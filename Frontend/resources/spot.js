window.onload = function(){

const { ipcRenderer } = require('electron')
const path = require('path');
const express = require('express');
const app = new express();
const router = express.Router();

router.get('/callback',function(req,res){
  res.sendFile(path.join(__dirname+'/localWebpage.html'));
  //__dirname : It will resolve to your project folder.
});

//add the router
app.use('/', router);
app.listen(process.env.port || 8888);
console.log('started server');

var Spotify = require('spotify-web-api-js');
var spotifyApi = new Spotify();
var songView = document.getElementById("Music");
var accessToken = "";
const clientId = 'dc9dbbb0da88417b9e2da982fb163709';
const clientSec = '463b923f1e8d4992ba595089a8222b33';
const redirectUri = 'http://localhost:8888/callback';
const scopes = 'streaming user-follow-modify user-follow-read playlist-read-private user-library-modify user-library-read playlist-modify-public user-read-playback-state';
const {BrowserWindow} = require('electron').remote;
	var songs = [];

function login(callback) {
 
  function getLoginURL() {
return 'https://accounts.spotify.com/authorize?client_id=' + clientId + '&redirect_uri=' + encodeURIComponent(redirectUri) + '&scope=' + encodeURIComponent(scopes) + '&response_type=token';
  }
  
  var url = getLoginURL();

  let mainWindow = new BrowserWindow({ 
      width: 450,
      height: 730,
      x: 0,
      y: 0,
      frame: false,
      resizable: true,
      webPreferences: {
      nodeIntegration: true	    
      }
  });

   mainWindow.loadURL(url);
   
   ipcRenderer.once('asynchronous-reply', (event, arg) => {
           console.log(arg); 
	   var hash = JSON.parse(arg);
            if (hash.type == 'access_token') {
                callback(hash.access_token);
            }
        });
    
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
login(
function(accessToken) {
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
                        newSong.setAttribute("id", i)
                        songs[i] = songURI;
                        i++;
                    })
                }
              })
          });
      });
});

}



