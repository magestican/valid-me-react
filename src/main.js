/* eslint-disable import/default */
import React from 'react';
import {render} from 'react-dom';
import {ValidMeReact} from './validMeReact';

class HelloWidget extends React.Component{
  constructor(props) {
    super(props);
  }

  handleChange(event){
    console.log(event.target.value);
  }
  render() {
    return <div>
      <ValidMeReact validation="numeric">
        <input type='text' onChange={this.handleChange} placeholder='Type some sample'/>
        </ValidMeReact>
    </div>
    }
}
  render(
    <HelloWidget />,
    document.getElementById('app')
  );
