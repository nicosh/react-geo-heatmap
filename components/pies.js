import React from 'react';
import axios from 'axios'
import Pie from './pie';

import {BarChart, Bar, XAxis, YAxis,ResponsiveContainer,Tooltip}  from 'Recharts';

class Pies extends React.Component {
  constructor(props){
    super(props)
    this.state = {
        data : []
    }
  }

  async componentDidMount(){
    axios.get('/grouped-by-year').then(resp=> { 
        this.setState({
            data : resp.data
        })
    })
  }
  
  render() {
    const {data} = this.state
    return (
      <div className="row text-center mt-4">
        <div className="col-md-12 text-center">
            <h4>Yearly activities</h4>
        </div>
          {Object.keys(data).map((el, index)=>{
              return <Pie key={index} name={el} data={data[el]} />
          })}
      </div>

    );
  }
}



export default Pies;
