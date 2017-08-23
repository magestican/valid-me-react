import ReactDom from 'react-dom';
import ValidMe from './src/validMeReact';

doHi(){
  let validationResult = ValidMeReact.validate(undefined,undefined,"hi"); //validate elements belonging to group hi
}
handleChange(event){
  console.log(event.target.value);
}
render() {
  return <div>
    <ValidMe validmefor="numeric" group="hi">
      <input type='text' onChange={this.handleChange}/>
    </ValidMe>
      <button onClick={this.doHi}> Hi </button>
  </div>
};

ReactDOM.render(
  render(),
  document.getElementById('app')
);
