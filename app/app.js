const { Application, ApplicationSettings } = require("@nativescript/core");

Application.on(Application.launchEvent, () => {
  applyTheme(); // Apply theme when the app launches
});

function applyTheme() {
  const isDarkMode = ApplicationSettings.getBoolean("darkMode", false);
  const rootView = Application.getRootView();

  if (rootView) {
    rootView.className = isDarkMode ? "dark-mode" : "";
  }
}

Application.run({ moduleName: "app-root" });
