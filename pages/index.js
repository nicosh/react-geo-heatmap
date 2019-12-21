import React from 'react'
import Link from 'next/link'
import App from '../components/App'
import ReactDom from 'react-dom';
import dynamic from 'next/dynamic'
import 'antd/dist/antd.css'; 
import 'bootstrap/dist/css/bootstrap.css';
import '../public/css/style.css'; 
import Bar from '../components/bar'
import Pies from '../components/pies'
import { DatePicker,Select,Spin,Collapse,Icon,InputNumber  } from 'antd';
import moment from 'moment';
import axios from 'axios'
const { Option } = Select;
const { Panel } = Collapse;
// we should not ssr otherwise window is undefined
const HeatmapLayer = dynamic(() => import('../components/heatMapLayer'), {
  ssr: false
})

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
      defaultSettings : {
        radius : 40,
        extent : 1024,
        nodeSize : 10,
        maxZoom : 17,
      }
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

  changeSettings = (e,type)=>{
    let {defaultSettings} = this.state
    defaultSettings[type] = e 
    this.setState({defaultSettings})
  }

  updateSettings = async (e)=>{
    e.preventDefault()
    let that = this
    let {defaultSettings} = this.state
    axios.post('/update-cfg', {
      cfg : defaultSettings,
    }).then(response=> {
      that.handlezoom(false)
    }).catch(function (error) {
      console.log(error);
    });
  }

  render() {
    const {originalData,filteredData,loaded,locations,zoom,center,orderedActivities,defaultSettings} = this.state
    if(!loaded){
      return (
        <div className="flexbox-centering">
            <Spin tip="Loading..." />
        </div>
      )
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
                    <a target="_blank" className="Header-link" href="https://github.com/nicosh/react-geo-heatmap" data-hotkey="g d" aria-label="Homepage" data-ga-click="Header, go to dashboard, icon:logo">
                        <svg className="octicon octicon-mark-github v-align-middle" height="32" viewBox="0 0 16 16" version="1.1" width="32" aria-hidden="true"><path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg>
                    </a>                    
                    <h4 className="mt-2">Geo Heatmap starting from {startDate}</h4>
                  </div>
                  <div className="col-md-12 mt-3">
                    <div className="map">                  
                    <Map scrollWheelZoom={false} onClick={this.handleClick} ref="map" onMoveend={(e)=>{this.handlezoom(e)}} style={{height:600}} center={center} zoom={16}>
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
                <div className="col-md-12 text-center">
                  <p><strong>Filter</strong></p>
                </div>
                <div className="col-md-12">
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
                <div className="col-md-12 mt-2">
                  <Collapse expandIcon={({ isActive }) => <Icon type="setting" />} >
                    <Panel header="Settings" key="1">
                      <label className="mr-3 ml-3">radius</label>
                      <InputNumber min={1}  defaultValue={defaultSettings.radius} onChange={(e)=>{this.changeSettings(e,"radius")}} />
                      <label className="mr-3 ml-3">extent</label>
                      <InputNumber min={1}  defaultValue={defaultSettings.extent} onChange={(e)=>{this.changeSettings(e,"extent")}} /><br/>
                      <label className="mr-3 ml-3">nodeSize</label>
                      <InputNumber min={1}  defaultValue={defaultSettings.nodeSize} onChange={(e)=>{this.changeSettings(e,"nodeSize")}} />
                      <label className="mr-3 ml-3">maxZoom</label>
                      <InputNumber min={1}  defaultValue={defaultSettings.maxZoom} onChange={(e)=>{this.changeSettings(e,"maxZoom")}} />
                      <button onClick={(e)=>{this.updateSettings(e)}} className="btn btn-success mt-2 d-block mx-auto"><Icon type="reload" /> Update</button>
                    </Panel>
                  </Collapse>
                </div>
            </div>
           </div>
          </section>
          <section>
            <div className="container">
              <Pies  />
              <div className="row">
              <div className="col-md-12 text-center">
                  <h4>Overall activities</h4>
              </div>
                <div className="col-md-12">
                  <Bar orderedActivities={orderedActivities} />
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
