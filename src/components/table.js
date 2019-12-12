import React from 'react';
import 'bootstrap/dist/css/bootstrap.css';


class List extends React.Component {
  constructor(props){
    super(props)
  }

  
  render() {
    const {orderedActivities} = this.props
    return (
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
    );
  }
}



export default List;
