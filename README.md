# react-geo-heatmap
Inspired by [geo-heatmap](https://github.com/luka1199/geo-heatmap), a very simple react app that creates an interactive geo heatmap from your Google location history.  
This app uses :  
[react-leaflet](https://github.com/PaulLeCam/react-leaflet)  
[react-leaflet-heatmap-layer](https://github.com/OpenGov/react-leaflet-heatmap-layer)  

![cattura3](https://user-images.githubusercontent.com/8511928/70744801-c89c4700-1d22-11ea-9728-d99ef3010a68.gif)

## Getting Started
### Get your location data
You can download  your location data here: https://takeout.google.com/  
You only need to select, and download, "Location History", choose Json as file format.  
Rename it to `history.json` and  move it to  `src/history.json`  

### Installation
Clone the repository and run `npm install` to install dependencies, then `npm start`  for development mode or `npm run build` for building the app for production
