![Valid-Me-React][http://i.imgur.com/Afhv7ao.png]

## Modern validation for modern applications.

No more form validations, with valid-me-react you can validate groups of items, independently of which form they belong to.

# React sample using JSX :

```jsx


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

```

*The styles available in the live-sample are on the sample-styles.css file*
