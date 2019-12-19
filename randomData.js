const randomLocation = require('random-location')
const moment = require('moment');
const fs = require('fs');
const {randomPoints} = require('./utils')
const dateTo = moment().valueOf()
const dateFrom = moment().subtract(4, 'years').valueOf()
const args = process.argv.slice(2);
const offset = args.length > 0 ? parseInt(args[0].replace('--count=','')) : 1000000
const  randomIntFromInterval = (min, max) => { 
    return Math.floor(Math.random() * (max - min + 1) + min);
}
const coherceToE7 = n => parseInt(n*10000000)
const activities = ["IN_VEHICLE","TILTING","STILL","IN_RAIL_VEHICLE","WALKING","ON_FOOT","ON_BICYCLE","RUNNING"]
let points = []
for (i=0;i<offset;i++) {
    let randomdate = randomIntFromInterval(dateTo,dateFrom)
    let random_boolean = Math.random() >= 0.5;
    let randomStartingPoint = randomPoints[Math.floor(Math.random()*randomPoints.length)];
    let randomDistance =  randomIntFromInterval(500,3000)
    let randomPoint = randomLocation.randomCirclePoint(randomStartingPoint,randomDistance)
    let lati = coherceToE7(randomPoint.latitude)
    let lng = coherceToE7(randomPoint.longitude)
    let obj = {
        timestampMs : randomdate,
       latitudeE7 : lati,
       longitudeE7 : lng,
       accuracy :  randomIntFromInterval(1,100)
    }
    if(random_boolean){
        let temp = []
        let itemsN =  randomIntFromInterval(1,5)
        for(let i = 0; i<= itemsN; i++){
            let randomItem = activities[Math.floor(Math.random()*activities.length)];
            let activityObj = {
                timestampMs : randomdate,
                activity : [{
                    type : randomItem,
                    accuracy :  randomIntFromInterval(1,100)
                }]
            }
            temp.push(activityObj)
        }
        obj.activity = temp
    }
    points.push(obj)
}
let data = {locations:points}
let json = JSON.stringify(data);
fs.writeFileSync('./public/history.json', json);

                               