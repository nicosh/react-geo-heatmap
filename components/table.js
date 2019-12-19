import React from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import {BarChart, Bar, XAxis, YAxis,ResponsiveContainer,Tooltip}  from 'Recharts';



class List extends React.Component {
  constructor(props){
    super(props)
  }

  
  render() {
    const {orderedActivities} = this.props
    const data = orderedActivities.map(el=>{
      return{
        name :el.name,
        n : parseInt(el.n)
      }
    })
    return (
      <div className="mt-4">
        <ResponsiveContainer width="100%" height={400}>
    	<BarChart
        margin={{top: 5, right: 30, left: 150, bottom: 5}}

       layout="vertical"
        data={data}
        >
      <XAxis type="number"/>
      <YAxis type="category"  interval={0} tick={{fontSize: 15}} dataKey="name" />
      <Tooltip />

        <Bar background label dataKey="n" fill="#8884d8" />
      </BarChart>
      </ResponsiveContainer>
      <table className="table">
        <thead>
          <tr>
            <th scope="col">Activity type</th>
            <th scope="col">N</th>
          </tr>
        </thead>
        <tbody>
          {
            orderedActivities.map((el,index)=>{
              return(
                <tr key={index}>
                   <td>{el.name}</td>
                   <td>{el.n}</td>
              </tr>
              )
            })
          }
        </tbody>
      </table>
      </div>

    );
  }
}



export default List;
