import React from 'react';
import './App.css';
import 'antd/dist/antd.css'; 
import 'bootstrap/dist/css/bootstrap.css';
import { Map, TileLayer } from 'react-leaflet';
import {locations} from './history.json'
import HeatmapLayer from 'react-leaflet-heatmap-layer';
import List from './components/table'
import { DatePicker,Select  } from 'antd';
import moment from 'moment';

const { Option } = Select;

class Heatmap extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      sf : "ANY",
      originalData : [],
      filteredData : [],
    }
  }
   componentDidMount(){
    this.setState({
      originalData : locations,
      filteredData : locations,
    })
   }

   getLocationPoins = (json)=>{
    return json.map(el => [el.longitudeE7/10000000,el.latitudeE7/10000000])
  }
  filterDate= (d)=>{
    const {originalData,filteredData} = this.state
    let filtered = filteredData.filter(el=>{
      return el.timestampMs >= d.valueOf()
    })
    this.setState({
      filteredData : filtered
    })
  }

  filterActivities = (el)=>{
    const {originalData,filteredData} = this.state
    let target = el
    let filtered = []
    filteredData.forEach(el=>{
      if(el.hasOwnProperty("activity")){
        el.activity.forEach(element=>{
          element.activity.forEach(final=>{
            if(final.type == target){
              filtered.push(el)
            }
          })
        })
      }
    })
    let toreturn = target == "ANY" ? originalData : filtered
    this.setState({
      filteredData : toreturn
    })
  }

   getActivityRecap = (json)=>{
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
  
   getActivityOcc = (name,arr)=>{
      return arr.reduce(function(n, val) {
        return n + (val === name);
    }, 0); 
  }
  
   getOrderedArray = (uniqueActivities,toalactivities)=>{
      let arr = uniqueActivities.map(el => {
        return {
          name : el,
          n : this.getActivityOcc(el,toalactivities)
        }
      })
      arr.sort((a, b)=>{
        let statement = a.n < b.n ? 1 : -1
        return statement;
    })
    return arr
  }
  
  render() {
    let date = new Date(parseInt(locations[0].timestampMs));
    let defaultStart = moment(parseInt(locations[0].timestampMs))
    let startDate = date.toString()
    const {originalData,filteredData} = this.state
    const data =  this.getLocationPoins(filteredData)
    let toalactivities = this.getActivityRecap(locations)
    let uniqueActivities = [... new Set(toalactivities)]
    let orderedActivities = this.getOrderedArray(uniqueActivities,toalactivities)
    return (
      <div className="App">
        <div className="container">
            <div className="row">
            <div className="col-md-12 mt-2">
              <h4>Geo Heatmap starting from {startDate}</h4>
            </div>
            <div className="col-md-12 mt-2">
              <Select defaultValue="ANY" style={{width : "100%"}}   onChange={(e)=>{this.filterActivities(e)}}>
              <Option value="ANY" key={-1}>ANY</Option>
              {
                    orderedActivities.map((el,index)=>{
                      return(
                           <Option value={el.name} key={index}>{el.name}</Option>
                        )
                  })
                }
              </Select >
            </div>
            <div className="col-md-12 mt-2">
              <DatePicker defaultValue={defaultStart} style={{width : "100%"}} onChange={(e)=>{this.filterDate(e)}} />
            </div>
              <div className="col-md-12 mt-3">
                <div  className="map">
                <Map style={{height:600}} center={[0,0]} zoom={12}>
                  <HeatmapLayer
                    fitBoundsOnLoad
                    fitBoundsOnUpdate
                    points={data}
                    longitudeExtractor={m =>  m[0] }
                    latitudeExtractor={m => m[1]}
                    intensityExtractor={m => parseFloat(1)} />
                  <TileLayer
                    url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                  />
                </Map>
                </div>
              </div>
              <div className="col-md-12">
                 <List orderedActivities={orderedActivities} />
              </div>
            </div>
        </div>
      </div>
    );
  }
}



export default Heatmap;
