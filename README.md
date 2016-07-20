This is a validation library for react, usage :

```jsx
doHi(){
  let validationResult = ValidMeReact.validate(undefined,undefined,"hi"); //validate elements belonging to group hi
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
```
