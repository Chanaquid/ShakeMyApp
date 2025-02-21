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

function toggleTheme() {
  const isDarkMode = ApplicationSettings.getBoolean("darkMode", false);

  // Toggle theme
  ApplicationSettings.setBoolean("darkMode", !isDarkMode);

  // Apply the new theme immediately
  applyTheme();
}

function applyTheme() {
  const isDarkMode = ApplicationSettings.getBoolean("darkMode", false);
  const rootView = Application.getRootView();

  if (rootView) {
    rootView.className = isDarkMode ? "dark-mode" : "light-mode";
  }
}

function goBack() {
  Frame.topmost().goBack();
}

exports.onNavigatingTo = onNavigatingTo;
exports.toggleTheme = toggleTheme;
exports.goBack = goBack;

// Apply theme on app startup
applyTheme();
