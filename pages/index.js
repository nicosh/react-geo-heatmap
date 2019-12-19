import React from 'react'
import Link from 'next/link'
import App from '../components/App'
import ReactDom from 'react-dom';
import dynamic from 'next/dynamic'
// we should not ssr otherwise window is undefined
const HeatmapLayer = dynamic(() => import('../components/heatMapLayer'), {
  ssr: false
})
import 'antd/dist/antd.css'; 
import 'bootstrap/dist/css/bootstrap.css';
import '../public/css/style.css'; 

import List from '../components/table'
import { DatePicker,Select  } from 'antd';
import moment from 'moment';
import axios from 'axios'
const { Option } = Select;
let Map,TileLayer,Leaflet

class Heatmap extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      loaded : false,
      sf : "ANY",
      originalData : [],
      filteredData : [],
      locations : [],
      orderedActivities : [],
      zoom : 12,
      filterTime : 0,
      filterActivity : "ANY",
    }
  }
    // since next.js is also serverside rendered we want to make sure to load leaflet in frontend
   async componentDidMount(){
    let RL = require('react-leaflet')
    Leaflet = require("leaflet")
    Map = RL.Map
    TileLayer = RL.TileLayer
    let that = this
    axios.get('/init').then(response=> {
      axios.get('/get-activities').then(resp=> {
        that.setState({
          loaded : true,
          originalData : response.data,
          filteredData : response.data,
          locations : response.data,
          orderedActivities : resp.data,
          center : [response.data[0].geometry.coordinates[1],response.data[0].geometry.coordinates[0]],
          zoom : 4
        })
      })
    }).catch(function (error) {
      console.log(error);
    });

   }

   async componentDidUpdate(prevProps, prevState, snapshot){
    let map = this.refs.map.leafletElement
  }

  
  filterActivities= (d=false,a=false)=>{
    let {filterTime,filterActivity} = this.state
    let time = d ?  d.valueOf() : filterTime
    let activity = a ? a : filterActivity
    let map = this.refs.map.leafletElement
    let bounds  = map.getBounds()
    let bbox = [
      bounds.getWest(),
      bounds.getSouth(), 
      bounds.getEast(), 
      bounds.getNorth(), 
    ]
    let zoom = map.getZoom()
    let that = this
    axios.post('/set-index', {
      time,
      activity
    }).then((response)=> {
      axios.post('/get-data', {
        zoom,
        bbox,
      }).then((r)=>{
        that.setState({
          filteredData : r.data,
          filterTime : time,
          filterActivity : activity
        })
      })
    }).catch(function (error) {
      console.log(error);
    });
  }


  
  handlezoom = (e)=>{
    let map = this.refs.map.leafletElement
    let bounds  = map.getBounds()
    let that = this
    let bbox = [
      bounds.getWest(),
      bounds.getSouth(), 
      bounds.getEast(), 
      bounds.getNorth(), 
    ]
    let zoom = map.getZoom()
    axios.post('/get-data', {
      zoom,
      bbox,
    }).then(response=> {
      that.setState({
        filteredData : response.data,
        zoom

      })
    }).catch(function (error) {
      console.log(error);
    });
  }
  handleClick= (e)=>{
    console.log(e.latlng )
  }
  render() {
    const {originalData,filteredData,loaded,locations,zoom,center,orderedActivities} = this.state
    if(!loaded){
      return <p>loading</p>
    }else{
      let date = new Date(parseInt(locations[0].properties.timestampMs));
      let defaultStart = moment(parseInt(locations[0].properties.timestampMs))
      let startDate = date.toString()

      return (
        <App>
          <section>
            <div className="container-fluid">
                <div className="row">
                  <div className="col-md-12 mt-2 text-center">
                    <h4>Geo Heatmap starting from {startDate}</h4>
                  </div>
                  <div className="col-md-12 mt-3">
                    <div  className="map">                  
                    <Map  onClick={this.handleClick} ref="map" onMoveend={(e)=>{this.handlezoom(e)}} style={{height:600}} center={center} zoom={16}>
                    <HeatmapLayer
                      fitBoundsOnLoad
                      points={filteredData}
                      longitudeExtractor={m => m.geometry.coordinates[0]}
                      latitudeExtractor={m => m.geometry.coordinates[1]}
                      intensityExtractor={m => {
                        return parseInt(m.properties.point_count)}
                      } 
                    />
                      <TileLayer
                        url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
                        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                      />
                    </Map>
                    </div>
                  </div>
                </div>
            </div>
          </section>
          <section>
            <div className="container">
              <div className="row searchbox">
                <div className="col-md-12 mt-2 text-center">
                  <p><strong>Filter</strong></p>
                </div>
                <div className="col-md-12 mt-2">
                  <Select defaultValue="ANY" style={{width : "100%"}}   onChange={(e)=>{this.filterActivities(false,e)}}>
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
                  <DatePicker defaultValue={defaultStart} style={{width : "100%"}} onChange={(e)=>{this.filterActivities(e)}} />
                </div>
            </div>
           </div>
          </section>
          <section>
            <div className="container">
              <div className="row">
                  <div className="col-md-12">
                    <List orderedActivities={orderedActivities} />
                  </div>
              </div>
            </div>
          </section>
        </App>
      );
    }

  }
}



export default Heatmap;
