const { Frame, Http, Dialogs } = require("@nativescript/core");
const { knownFolders, File } = require("@nativescript/core/file-system");

// Get the correct file path
const FAVORITE_SONGS_FILE_PATH =
  knownFolders.documents().path + "/favoriteSongs.json";
const FAVORITE_SONGS_FILE = File.fromPath(FAVORITE_SONGS_FILE_PATH);

function onNavigatingTo(args) {
  const page = args.object;
}

async function fetchRandomSong() {
  try {
    // Fetch songs from MusicBrainz API
    const response = await Http.getJSON(
      "https://musicbrainz.org/ws/2/recording/?query=*&limit=100&offset=0&fmt=json"
    );
    const recordings = response.recordings;

    if (!recordings || recordings.length === 0) {
      Dialogs.alert("No songs found. Try again.");
      return;
    }

    // Pick a random song
    const randomIndex = Math.floor(Math.random() * recordings.length);
    const song = recordings[randomIndex];

    const title = song.title || "Unknown Title";
    const artist =
      song["artist-credit"] && song["artist-credit"].length > 0
        ? song["artist-credit"][0].name
        : "Unknown Artist";

    // Show popup with favorite option
    Dialogs.confirm({
      title: "Random Song",
      message: `🎵 ${title}\n👤 ${artist}`,
      okButtonText: "❤️",
      cancelButtonText: "❌",
    }).then((result) => {
      if (result) {
        saveToFavorites(title, artist);
      }
    });
  } catch (error) {
    console.error("Error fetching songs:", error);
    Dialogs.alert(
      "Failed to fetch songs. Please check your internet connection."
    );
  }
}

async function saveToFavorites(title, artist) {
  try {
    let favorites = [];

    // Check if the file exists using File.exists()
    const fileExists = File.exists(FAVORITE_SONGS_FILE_PATH);
    if (!fileExists) {
      console.log("File does not exist. Creating new favoriteSongs.json...");
      await FAVORITE_SONGS_FILE.writeText("[]"); // Initialize with empty JSON array
    }

    // Read file content
    let fileContent = await FAVORITE_SONGS_FILE.readText();
    if (fileContent.trim() === "") {
      fileContent = "[]"; // Default empty array if file is empty
    }

    try {
      favorites = JSON.parse(fileContent);
    } catch (parseError) {
      console.error("Error parsing JSON file. Resetting file:", parseError);
      favorites = [];
    }

    // Check if song already exists to prevent duplicates
    const songExists = favorites.some(
      (song) => song.title === title && song.artist === artist
    );
    if (songExists) {
      Dialogs.alert("This song is already in your favorites! ❤️");
      return;
    }

    // Add new song to favorites
    favorites.push({ title, artist });

    // Save updated list to file
    await FAVORITE_SONGS_FILE.writeText(JSON.stringify(favorites, null, 2));

    Dialogs.alert("Song added to favorites! ❤️");
  } catch (error) {
    console.error("Error saving to favorites:", error);
    Dialogs.alert("Failed to save song.");
  }
}

function goBack() {
  Frame.topmost().goBack();
}

exports.onNavigatingTo = onNavigatingTo;
exports.fetchRandomSong = fetchRandomSong;
exports.goBack = goBack;
