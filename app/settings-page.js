const {
  Frame,
  ApplicationSettings,
  Application,
} = require("@nativescript/core");

function onNavigatingTo(args) {
  const page = args.object;
  page.bindingContext = {
    isDarkMode: ApplicationSettings.getBoolean("darkMode", false),
  };
}

function toggleTheme(args) {
  const switchButton = args.object;
  const isDarkMode = switchButton.checked; // Get the new state of the switch

  // Save the theme preference
  ApplicationSettings.setBoolean("darkMode", isDarkMode);

  // Apply the theme immediately
  applyTheme();
}

function applyTheme() {
  const isDarkMode = ApplicationSettings.getBoolean("darkMode", false);
  const rootView = Application.getRootView();

  if (rootView) {
    rootView.className = isDarkMode ? "dark-mode" : "";
  }
}

function goBack() {
  Frame.topmost().goBack();
}

exports.onNavigatingTo = onNavigatingTo;
exports.toggleTheme = toggleTheme;
exports.goBack = goBack;
