/* eslint-disable import/default */
import React from 'react';
import {render} from 'react-dom';
import ValidMeReact from './validMeReact';
class HelloWidget extends React.Component{
  constructor(props) {
    super(props);
  }

  doHi(){
    let validationResult = ValidMeReact.validate(undefined,undefined,"hi");
    console.log(validationResult);

  }

  handleChange(event){
    console.log(event.target.value);
  }
  render() {
    return <div>
      <ValidMeReact.wrapper validmefor="numeric" group="hi">
        <input type='text' onChange={this.handleChange}/>
      </ValidMeReact.wrapper>
        <button onClick={this.doHi}> Hi </button>
    </div>
    }
}
$(document).ready(function(){
  render(
    <HelloWidget />,
    document.getElementById('app')
  )})
