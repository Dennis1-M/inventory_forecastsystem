Frontend recommended structure applied

Summary of main folders created/updated:

- `src/Assets/Images` - images used by the UI (place `.gitkeep` here for now).
- `src/Assets/icons` - svg/icon assets.
- `src/components/forecast/ForecastChart.jsx` - moved forecast chart component here; root `src/components/ForecastChart.jsx` now re-exports this file for compatibility.
- `src/components/index.js` - updated to export from `./forecast/ForecastChart`.

If you want me to scaffold the remaining folders and boilerplate files (App, routes, services, store slices, pages, layouts), tell me which subset to create and I'll generate them.
