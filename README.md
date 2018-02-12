# <a href='https://magestican.github.io/valid-me-react/'><img src='http://i.imgur.com/Afhv7ao.png' height='60'></a>

## Modern validation for modern applications.

No more form validations, with valid-me-react you can validate groups of items, independently of which form they belong to.

# React sample using JSX :

```jsx
import ReactDOM from 'react-dom';
import {ValidMe,forceValidation,clearAllValidationErrors,phoneTypesEnum} from 'valid-me-react';

let doHi = () => {
  let areThereErrors = forceValidation(undefined, undefined, 'hi'); //validate elements belonging to group hi
  console.log(areThereErrors);
  if (!areThereErrors){
    clearAllValidationErrors();
  }
}
let handleChange = (event) => {
  console.log(event.target.value);
}

ReactDOM.render((
  <div>
    <div>
      <ValidMe validmefor="numeric" group="hi">
        <input type='text' onChange={handleChange}/>
      </ValidMe>
    </div>
    <button data-group="hi" onClick={doHi}> //The library will add/remove a class called "disable" to elements of the group
      Hi
    </button>
  </div>
), document.getElementById('app'));
```

*The styles available in the live-sample are on the sample-styles.css file*

## Required field + special condition ##

validmefor="required&condition" condition={function(value){})}

## Mandatory length + special condition ##

validmefor="text&condition@1-5" condition={function(value){})}

## Multiple groups validation : ##

<ValidMe group=firstGroupt&secondGroup validmefor="numeric" >



# Extra attributes you can pass to the ValidMe element : #

**validmemessage**

**validmefor**

**validmecondition**

**validmeconditionmessage**

**validmenocolor**

**validmeerror**

**validmesuccess**



