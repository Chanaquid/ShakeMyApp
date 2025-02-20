const { Frame } = require("@nativescript/core");

function goToDiscover() {
  Frame.topmost().navigate("discover-page");
}

function goToFavorite() {
  Frame.topmost().navigate("favorite-page");
}

function goToSettings() {
  Frame.topmost().navigate("settings-page");
}

exports.goToDiscover = goToDiscover;
exports.goToFavorite = goToFavorite;
exports.goToSettings = goToSettings;
