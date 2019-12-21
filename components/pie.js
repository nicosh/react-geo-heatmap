import React from 'react';
import {PieChart, Pie, Sector, YAxis,ResponsiveContainer,Tooltip}  from 'Recharts';




class Barchart extends React.Component {
  constructor(props){
    super(props)
    let data = Object.keys(props.data).map(el=>{
        return {name : el, value : props.data[el]}
    })
    this.state = {
        activeIndex: 0,
        data : data
    }
  }

  renderActiveShape = (props) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
      fill, payload, percent, value } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';
  
    return (
      <g>
        <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>{this.props.name}</text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none"/>
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none"/>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`${payload.name} ${value}`}</text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
          {`(Rate ${(percent * 100).toFixed(2)}%)`}
        </text>
      </g>
    );
  }

  onPieEnter = (data, index) => {
    this.setState({
      activeIndex: index,
    });
  };
   handleChange = (value)=> {
    this.setState({dataKey : value})

  }
  render() {
      const {data} = this.state
    return (
      <div className="col-md-6">
        <ResponsiveContainer  width="100%" height={250}  className="peicontainer" >
        <PieChart >
                <Pie
                activeIndex={this.state.activeIndex}
                activeShape={this.renderActiveShape}
                data={data}
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                onMouseEnter={this.onPieEnter}
                />
        </PieChart> 
        </ResponsiveContainer>
      </div>

    );
  }
}



export default Barchart;
