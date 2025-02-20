const {
  Frame,
  Dialogs,
  ObservableArray,
  Observable,
} = require("@nativescript/core");
const { knownFolders, File } = require("@nativescript/core/file-system");

// Define the path to the favorites JSON file
const FAVORITE_SONGS_FILE_PATH =
  knownFolders.documents().path + "/favoriteSongs.json";
const FAVORITE_SONGS_FILE = File.fromPath(FAVORITE_SONGS_FILE_PATH);

// ViewModel to manage favorites
let viewModel = new Observable();
viewModel.favoriteSongs = new ObservableArray();

async function onNavigatingTo(args) {
  const page = args.object;
  await loadFavoriteSongs();
  page.bindingContext = viewModel;
}

async function loadFavoriteSongs() {
  try {
    // Check if the file exists
    if (!File.exists(FAVORITE_SONGS_FILE_PATH)) {
      console.log("No favorites file found. Creating empty list.");
      await FAVORITE_SONGS_FILE.writeText("[]");
    }

    // Read favorites file
    let fileContent = await FAVORITE_SONGS_FILE.readText();
    if (fileContent.trim() === "") {
      fileContent = "[]"; // Default to an empty array if file is empty
    }

    let favorites = JSON.parse(fileContent);
    viewModel.favoriteSongs.splice(0); // Clear existing data

    // Add `removeFromFavorites` function binding to each item
    favorites = favorites.map((song, index) => ({
      ...song,
      removeFromFavorites: function () {
        removeFromFavorites(index);
      },
    }));

    viewModel.favoriteSongs.push(...favorites); // Load new data into ObservableArray
  } catch (error) {
    console.error("Error loading favorite songs:", error);
    Dialogs.alert("Failed to load favorites.");
  }
}

async function removeFromFavorites(index) {
  try {
    const song = viewModel.favoriteSongs.getItem(index);

    // Confirm deletion
    const confirm = await Dialogs.confirm({
      title: "Remove Favorite",
      message: `Remove "${song.title}" from favorites?`,
      okButtonText: "Yes",
      cancelButtonText: "No",
    });

    if (!confirm) return;

    // Remove from array
    viewModel.favoriteSongs.splice(index, 1);

    // Save updated favorites
    await FAVORITE_SONGS_FILE.writeText(
      JSON.stringify(viewModel.favoriteSongs, null, 2)
    );

    Dialogs.alert("Song removed from favorites.");
  } catch (error) {
    console.error("Error removing song:", error);
    Dialogs.alert("Failed to remove song.");
  }
}

function goBack() {
  Frame.topmost().goBack();
}

exports.onNavigatingTo = onNavigatingTo;
exports.goBack = goBack;
