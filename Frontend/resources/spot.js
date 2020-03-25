window.onload = function(){

const { ipcRenderer } = require('electron')
const path = require('path');

//Server for accepting the callback
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

//Spotify
var SpotifyWebApi = require('spotify-web-api-node');
var songView = document.getElementById("Music");
var accessToken = "";
var currentUser = "";
const clientId = 'dc9dbbb0da88417b9e2da982fb163709';
const clientSec = '463b923f1e8d4992ba595089a8222b33';
const directUri = 'http://localhost:8888/callback';
const scopes = 'streaming user-follow-modify user-follow-read playlist-read-private user-library-modify user-library-read playlist-modify-public user-read-playback-state user-read-email user-read-private';

const {BrowserWindow} = require('electron').remote;

//Initialize Spotify
var spotifyApi = new SpotifyWebApi({
	clientId: clientId,
	clientSecret: clientSec,
	redirectUri: directUri
});

//Login function:
function login(callback) {
 
//Getting the login URL
  function getLoginURL() {
return 'https://accounts.spotify.com/authorize?client_id=' + clientId + '&redirect_uri=' + encodeURIComponent(directUri) + '&scope=' + encodeURIComponent(scopes) + '&response_type=token';
  }
  
  var url = getLoginURL();

//New window to accept callback
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
  
//When message comes from main.js from the webserver accept the access_token
   ipcRenderer.once('asynchronous-reply', (event, arg) => {
	   var hash = JSON.parse(arg);
	   if (hash.type == 'access_token') {
                callback(hash.access_token);
           }
        });
    
}

//Function to display songs
function displaySongs(data) {
	$('#Music').empty();
        var newSong = "", songName = "", i = 0;
	data.body.items.forEach(function(track, i){
        newSong = document.createElement("li");
        songName = data.body.items[i].track.name;
        newSong.appendChild(document.createTextNode(songName));
        songView.appendChild(newSong);
        newSong.classList.add("song");
	newSong.classList.add("btn");
	newSong.classList.add("btn-primary");
        newSong.setAttribute("id", i);
	i++;
	})

}

function displayPlaylists(data){
	$('#Music').empty()
	var playlistName = "", newPlaylist = "";
	data.body.items.forEach(function(track,i){
	newPlaylist = document.createElement("li");
	playlistName = data.body.items[i].name;
	newPlaylist.appendChild(document.createTextNode(playlistName));
	songView.appendChild(newPlaylist);
	newPlaylist.classList.add("playlist");
	newPlaylist.classList.add("btn");
	newPlaylist.classList.add("btn-primary");
	newPlaylist.setAttribute("id", data.body.items[i].id);
	newPlaylist.addEventListener("click", function(){
	spotifyApi.getPlaylistTracks(this.id, null, function(err, data){
	if(err == null){
	displaySongs(data);
	} else { 
	console.error(err);
	}
	})
	})
	i++;
	})

}


//Getting the user's data from accesstoken from login function
function getUserData(accessToken) {  
return $.ajax({
      url: 'https://api.spotify.com/v1/me',
      headers: {
         'Authorization': 'Bearer ' + accessToken
      }
  });
}

document.getElementById('userLikes').addEventListener('click', function(){

spotifyApi.getMySavedTracks().then(
function(data) {
       displaySongs(data);
},
function(err) {
       console.error(err);
});

})

document.getElementById('userPlaylists').addEventListener('click', function(){

spotifyApi.getUserPlaylists(currentUser, null,function(err, data){
if(err == null){

displayPlaylists(data)

} else {

console.error(err)

}

})

})

document.getElementById('Search').addEventListener('click', function(){
searchTerm = document.getElementById('textBox').value

spotifyApi.search(searchTerm,['track', 'artist' ] ,function(err, data){
if(err == null){

displaySongs(data);

}else{

console.error(err)

}

})

})
//When login button is pressed.
document.getElementById('login').addEventListener('click', function() {  
login(
function(accessToken) {
	      //Hide login button
	      document.getElementById('login').hidden = true 
              document.getElementById('Search').hidden = false
	      document.getElementById('Menu').hidden = false
	      //Setting accessToken gotten from main.js
	      spotifyApi.setAccessToken(accessToken);
	      //Displaying all of the tracks from the signed in user's profile   
	      spotifyApi.getMySavedTracks().then(
  	      function(data) {
                displaySongs(data);
	      },
  	      function(err) {
    		console.error(err);
  	      });
 
	      spotifyApi.getMe(function(err, data){
	      if(err == null){

	      currentUser = data.body.uri
	      currentUser = currentUser.split(":")
	      currentUser = currentUser[2]
	      console.log(currentUser)
	      } else {

	      console.error(err)	

	      }
	      } )
      });
});
}

