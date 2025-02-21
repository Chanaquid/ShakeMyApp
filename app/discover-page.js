const { Frame, Http, Dialogs, Application } = require("@nativescript/core");
const { knownFolders, File } = require("@nativescript/core/file-system");

let sensorManager = null;
let sensorListener = null;
let lastShakeTime = 0;
let SHAKE_THRESHOLD = 15; // Adjust sensitivity if needed
const FAVORITE_SONGS_FILE_PATH = knownFolders.documents().path + "/favoriteSongs.json";
const FAVORITE_SONGS_FILE = File.fromPath(FAVORITE_SONGS_FILE_PATH);

function onNavigatingTo(args) {
    if (Application.android) {
        startShakeDetection();
    }
}

function onNavigatingFrom() {
    if (Application.android) {
        stopShakeDetection();
    }
}

function startShakeDetection() {
    try {
        const context = Application.android.foregroundActivity || Application.android.startActivity;
        sensorManager = context.getSystemService(android.content.Context.SENSOR_SERVICE);
        const accelerometer = sensorManager.getDefaultSensor(android.hardware.Sensor.TYPE_ACCELEROMETER);

        if (!accelerometer) {
            console.error("🚨 No Accelerometer found.");
            Dialogs.alert("Accelerometer is not available on this device.");
            return;
        }

        sensorListener = new android.hardware.SensorEventListener({
            onSensorChanged: function (event) {
                const { values } = event;
                const acceleration = Math.sqrt(values[0] ** 2 + values[1] ** 2 + values[2] ** 2);

                if (acceleration > SHAKE_THRESHOLD) {
                    const now = Date.now();
                    if (now - lastShakeTime > 1000) {
                        lastShakeTime = now;
                        fetchRandomSong();
                    }
                }
            },
            onAccuracyChanged: function (sensor, accuracy) {
                // No action needed
            }
        });

        sensorManager.registerListener(
            sensorListener,
            accelerometer,
            android.hardware.SensorManager.SENSOR_DELAY_UI
        );
    } catch (error) {
        console.error("🚨 Error starting accelerometer updates:", error);
    }
}

function stopShakeDetection() {
    try {
        if (sensorManager && sensorListener) {
            sensorManager.unregisterListener(sensorListener);
            sensorManager = null;
            sensorListener = null;
        }
    } catch (error) {
        console.error("🚨 Error stopping accelerometer updates:", error);
    }
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
            title: "Recomended Song",
            message: `🎶 ${title}\n🧑🏽‍🎨 ${artist}`,
            okButtonText: "❤️",
            cancelButtonText: "❌",
        }).then((result) => {
            if (result) {
                saveToFavorites(title, artist);
            }
        });
    } catch (error) {
        console.error("🚨 Error fetching songs:", error);
        Dialogs.alert(
            "Failed to fetch songs. Please check your internet connection."
        );
    }
}

async function saveToFavorites(title, artist) {
    try {
        let favorites = [];

        // Check if the file exists
        const fileExists = File.exists(FAVORITE_SONGS_FILE_PATH);
        if (!fileExists) {
            console.log("Creating new favoriteSongs.json...");
            await FAVORITE_SONGS_FILE.writeText("[]");
        }

        // Read file content
        let fileContent = await FAVORITE_SONGS_FILE.readText();
        if (fileContent.trim() === "") {
            fileContent = "[]"; // Default empty array if file is empty
        }

        let parsedFavorites = JSON.parse(fileContent);

        // Check if song already exists
        const songExists = parsedFavorites.some(
            (song) => song.title === title && song.artist === artist
        );
        if (songExists) {
            Dialogs.alert("This song is already in your favorites! ❤️");
            return;
        }

        // Add new song to favorites
        parsedFavorites.push({ title, artist });

        // Save updated list to file
        await FAVORITE_SONGS_FILE.writeText(JSON.stringify(parsedFavorites, null, 2));

        Dialogs.alert("Song added to favorites! ❤️");
    } catch (error) {
        console.error("🚨 Error saving to favorites:", error);
        Dialogs.alert("Failed to save song.");
    }
}

function goBack() {
    Frame.topmost().goBack();
}

exports.onNavigatingTo = onNavigatingTo;
exports.onNavigatingFrom = onNavigatingFrom;
exports.goBack = goBack;
