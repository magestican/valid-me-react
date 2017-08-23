
import ReactDOM from 'react-dom';
import {ValidMe,forceValidation} from './validMeReact';


let doHi = ()  => {
  let areThereErrors = forceValidation(undefined, undefined, 'hi'); //validate elements belonging to group hi
  console.log(areThereErrors);
}
let handleChange = (event)  => {
  console.log(event.target.value);
}
console.log(  document.getElementById('app'));
ReactDOM.render(
  (<div>
  <div>
      <ValidMe validmefor="numeric" group="hi">
          <input type='text' onChange={handleChange}/>
      </ValidMe>
      </div>
      <button onClick={doHi}> Hi </button>
  </div>),
  document.getElementById('app')
);
