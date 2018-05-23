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

## Possible validations : ## 
```
numeric
text
text@alphanumeric
email
phoneNumber
*(need to be passed in validmefor attribute)
```
*The styles available in the live-sample are on the sample-styles.css file*

## Required field + special condition ##

```jsx
<ValidMe validmefor="required&condition" condition={function(value){})} >
```
## Mandatory length + special condition ##
```jsx
<ValidMe validmefor="condition&text@1-5" condition={function(value){})} >
```
## US phone number ##
```jsx
window.validMeReact.validMeManager.VALIDATION.CountryCode = 'US';

const phoneTypesSupported = `${phoneTypesEnum.MOBILE}-${phoneTypesEnum.FIXED_LINE}-${phoneTypesEnum.FIXED_LINE_OR_MOBILE}-${phoneTypesEnum.PERSONAL_NUMBER}-${phoneTypesEnum.VOIP}-${phoneTypesEnum.TOLL_FREE}`

 <ValidMe validmefor={`phoneNumber@${phoneTypesSupported}`}  >
```

## Multiple groups validation : ##

```jsx
<ValidMe group=firstGroupt&secondGroup validmefor="numeric" >
```


# Extra attributes you can pass to the ValidMe element : #

**validmemessage**

**validmefor**

**validmecondition**

**validmeconditionmessage**

**validmenocolor**

**validmeerror**

**validmesuccess**



