const { Application, ApplicationSettings } = require("@nativescript/core");

// Apply saved theme when the app starts
function applyTheme() {
  const isDarkMode = ApplicationSettings.getBoolean("darkMode", false);
  const rootView = Application.getRootView();

  if (rootView) {
    rootView.className = isDarkMode ? "dark-mode" : "light-mode";
  }
}

Application.run({ moduleName: "app-root" });

// Apply theme immediately
applyTheme();
