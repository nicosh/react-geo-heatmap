# react-geo-heatmap
Inspired by [geo-heatmap](https://github.com/luka1199/geo-heatmap), a very simple next.js / react app that creates an interactive geo heatmap from your Google location history.   
This app uses :  
[next.js](https://github.com/zeit/next.js)  
[react-leaflet](https://github.com/PaulLeCam/react-leaflet)  
[react-leaflet-heatmap-layer](https://github.com/OpenGov/react-leaflet-heatmap-layer)  
[supercluster](https://github.com/mapbox/supercluster#readme)  to manage such large files and prevent map to lag.

![cattura3](https://user-images.githubusercontent.com/8511928/70744801-c89c4700-1d22-11ea-9728-d99ef3010a68.gif)

## Getting Started
### Get your location data
You can download  your location data here: https://takeout.google.com/  
You only need to select, and download, "Location History", choose Json as file format.  
Rename it to `history.json` and  move it to  `public/history.json`  

### Installation
Clone the repository and run `npm install` to install dependencies, then `npm run dev`  for development mode or  follow next.js [instructions](https://nextjs.org/learn/basics/deploying-a-nextjs-app) for building the app for production

### Testing
You can test the app with random geo-data, run `node randomData.js` by default it  generate 1000000 points (~200MB) , you can override this number passing `count` as argoument ex. `node randomData.js --count=1000`.  
Note that this command will overwrite any existing `history.json` file.
