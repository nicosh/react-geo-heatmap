const express = require('express')
const next = require('next')
const jsonData = require('./public/history.json');
const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()
const Supercluster = require('supercluster');

const getActivityRecap = (json)=>{
  let result = []
  json.forEach(el=>{
    if(el.hasOwnProperty("activity")){
      el.activity.forEach(element=>{
        element.activity.forEach(final=>{
          result.push(final.type)
        })
      })
    }
  })
  return result
}

const getActivityOcc = (name,arr)=>{
  return arr.reduce(function(n, val) {
    return n + (val === name);
  }, 0); 
}


const getOrderedArray = (uniqueActivities,toalactivities)=>{
  let arr = uniqueActivities.map(el => {
    return {
      name : el,
      n : getActivityOcc(el,toalactivities)
    }
  })
  arr.sort((a, b)=>{
    let statement = a.n < b.n ? 1 : -1
    return statement;
  })
  return arr
}


const  getLocationPoins = (json)=>{
  return json.map(el => {
      const geo = [el.longitudeE7/10000000,el.latitudeE7/10000000]
      return {
          type : "Feature",
          geometry : {
              type : "Point",
              coordinates : geo,
          },
          properties : el
      }
  })
}

const data = getLocationPoins(jsonData.locations)
const index = new Supercluster({
  log: false,
  radius: 40,
  extent: 1024,
  nodeSize : 10,
  maxZoom: 17
}).load(data)

let filterIndex = index;

app.prepare().then(() => {
  const server = express()
  server.use(express.urlencoded({ extended: true }));
  server.use(express.json());

  // since supercluster once created is immutable we should reinitialize for filtering
  server.post('/set-index', (req, res) => {
    let {time,activity}  = req.body
    let filteredData = []
    // first we filter by date
    let filtered = jsonData.locations.filter(el=>{
      return el.timestampMs >= parseInt(time)
    })
    // then if activity we filter for activity
    if(activity !== "ANY"){
      filtered.forEach(el=>{
        if(el.hasOwnProperty("activity")){
          el.activity.forEach(element=>{
            element.activity.forEach(final=>{
              if(final.type == activity){
                filteredData.push(el)
              }
            })
          })
        }
      })
    }else{
      filteredData = filtered
    }
    let datax = getLocationPoins(filteredData)
    let neewindex = filterIndex = new Supercluster({
      log: false,
      radius: 40,
      extent: 1024,
      nodeSize : 10,
      maxZoom: 17
    }).load(datax)
    filterIndex = neewindex
    res.json("ok")
  })

  // get all  activities
  server.get('/get-activities', (req, res) => {
    let toalactivities = getActivityRecap(jsonData.locations)
    let uniqueActivities = [... new Set(toalactivities)]  
    let orderedActivities = getOrderedArray(uniqueActivities,toalactivities)
    res.json(orderedActivities)
  })

  // we initialize map with firs 1000 items
  server.get('/init', (req, res) => {
    let coordiantes = data.slice(0, 1000)
    res.json(coordiantes)
  })

  // on map move we get supercluster points
  server.post('/get-data', (req, res) => {
    let thebbox = req.body.bbox
    let zoom = req.body.zoom
    let clusters = filterIndex.getClusters(thebbox, zoom) 
    res.json(clusters)
  })

  server.all('*', (req, res) => {
    return handle(req, res)
  })

  server.listen(port, err => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
  })
})
