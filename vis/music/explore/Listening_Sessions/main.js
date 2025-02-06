var songplay_lib, song_lib;

async function getAccessToken() {
    const clientId = ''; // Replace with your client ID
    const clientSecret = ''; // Replace with your client secret
    const credentials = `${clientId}:${clientSecret}`;
    const encodedCredentials = btoa(credentials); // Base64 encode the credentials

    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${encodedCredentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials', // We use client credentials flow
    });

    const data = await response.json();
    return data.access_token; // This is the token you will use for the next request
}

async function getTrackInfo(spotifyId) {
    const token = await getAccessToken();
    
    const response = await fetch(`https://api.spotify.com/v1/tracks/${spotifyId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    
    const data = await response.json();
    return data;
}

async function getAlbumArtwork(spotID, albumName) {
    const spotifyId = spotID.split(":")[2]
    console.log(spotifyId)
    const trackData = await getTrackInfo(spotifyId);
    let albumImageUrl = null;

    // Check if album artwork is available
    if (trackData.album.images && trackData.album.images.length > 0) {
        albumImageUrl = trackData.album.images[0].url; // Use the first image (smallest size)
    }

    // Create the album art div
    const albumArt = document.createElement("div");
    albumArt.classList.add("album-art");

    if (albumImageUrl) {
        // If album artwork is available, set it as the background
        albumArt.style.backgroundImage = `url(${albumImageUrl})`;
        albumArt.style.backgroundSize = "cover"; // Ensure the image covers the div
        albumArt.style.backgroundPosition = "center"; // Center the image
    } else {
        // If no artwork is available, use the pastel color fallback
        albumArt.style.backgroundColor = stringToPastelColor(albumName);
    }

    // Set album name as text if no image is available (for fallback case)
    if (!albumImageUrl) {
        albumArt.textContent = albumName;
    }

    return albumArt;
}

function formatDuration(milliseconds) {
	let totalSeconds = Math.floor(milliseconds / 1000);
	let hours = Math.floor(totalSeconds / 3600);
	totalSeconds %= 3600;
	let minutes = Math.floor(totalSeconds / 60);
	let seconds = totalSeconds % 60;

	let result = "";
	if (hours > 0) {
		result += `${hours}h `;
	}
	if (minutes > 0 || hours > 0) {
		result += `${minutes}m `;
	}
	result += `${seconds}s`;

	return result.trim(); // Remove any trailing spaces
}


async function loadFiles() {
    songplay_lib = await d3.json("../data/songplay_library.json");
    song_lib = await d3.json("../data/song_library.json");
}

// Utility: Generate a pastel color based on a string
function stringToPastelColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = hash % 360; // Keep hue between 0 and 359
    return `hsl(${h}, 70%, 80%)`;
}

// Create a song tile dynamically
async function createSongTile(songplayId) {
    const songplay = songplay_lib[songplayId];
    const song = song_lib[songplay.song_id];

    if (!songplay || !song) {
        console.error("Invalid songplay or song ID");
        return;
    }

    // Extract song details
    const { title, artist_name, album_name, spotify_uri } = song;

    // Create the main tile container
    const tile = document.createElement("div");
    tile.classList.add("song-tile");

    tile.style.backgroundColor = stringToPastelColor(artist_name);

    console.log(songplay)
    if (songplay.skipped || songplay.ms_played<30000) {
        // Add a class or style for the grey overlay
        tile.classList.add("skipped");
    }
    // Create the album art square
    

        // console.log(spotify_uri)
    const albumArt = await getAlbumArtwork(spotify_uri, album_name);
    // document.createElement("div");
    // albumArt.classList.add("album-art");
    // albumArt.style.backgroundColor = stringToPastelColor(album_name);
    // albumArt.textContent = album_name;

    // Create the song info container
    const songInfo = document.createElement("div");
    songInfo.classList.add("song-info");

    const infoRow = document.createElement("div");
    infoRow.classList.add("info-row");

    const songTitle = document.createElement("p");
    songTitle.classList.add("song-title");
    songTitle.textContent = title;

    const playTime = document.createElement("p");
    playTime.classList.add("playtime");
    playTime.textContent = formatDuration(songplay.ms_played);


    const artistName = document.createElement("p");
    artistName.classList.add("artist-name");
    artistName.textContent = artist_name;

    infoRow.appendChild(artistName);
    infoRow.appendChild(playTime);
    // Append song title and artist name to song info
    songInfo.appendChild(songTitle);
    songInfo.appendChild(infoRow);

    // Append album art and song info to the tile
    tile.appendChild(albumArt);
    tile.appendChild(songInfo);

    // Append the tile to the container
    document.getElementById("song-container").appendChild(tile);
}

function generateTiles(songplayIds) {
    // Clear the container before appending new tiles
    const container = document.getElementById("song-container");
    container.innerHTML = "";

    // Loop through the songplayIds and generate tiles
    for (const songplayId of songplayIds) {
        createSongTile(songplayId);
    }
}

// Main function
async function main() {
    await loadFiles();

    let rand = Math.floor(Math.random() * (162009));

    console.log(rand);

    // Generate an array with the random number and the next 10 numbers
    let numbers = Array.from({ length: 10 }, (_, i) => rand + i);

    console.log(numbers); // This will log an array with 10 numbers starting from 'rand'

    // Now pass this array to your generateTiles function
    generateTiles(numbers);

    // displayAlbumArtwork('5ubHAQtKuFfiG4FXfLP804');

}

main();