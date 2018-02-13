/* eslint-disable */

import React from 'react';
import { render, findDOMNode } from 'react-dom';
let phoneNumberUtil = require('google-libphonenumber').PhoneNumberUtil;

class ValidMe extends React.Component {

  constructor(props) {
    super(props);
    this.init();
    this.main = this.main.bind(this);
    this.validMeItem = {};
    this.state = {
      index: (window.validMeReact
        ? window.validMeReact.validMeManager.validMeQueue.length
        : 0)
    }
  }
  //****Helpers****/

  init() {
    if (window.validMeExecuted != true) {
      window.validMeExecuted = true;
    }
  }

  componentWillUnmount() {
    if (window.validMeReact) {
      window.validMeReact.validMeManager.validMeQueue.splice(this.state.index, 1);
    }
  }

  componentDidMount() {

    let object = findDOMNode(this);
    let input = "";
    let isDropdown = false;
    React.Children.map(this.props.children, (child, i) => {
      if (child.props.dropdown || (this.props.children && this.props.children.type &&  this.props.children.props.type == 'dropdown'))
        isDropdown = true;
    }
    )
    if (isDropdown) {
      input = Array.from(object.querySelectorAll('.info span')).pop(); //get the last item

      if (!input){
        input = Array.from(object.querySelectorAll('[type="dropdown"] .text')).pop()
      }
    } else {
      input = Array.from(object.querySelectorAll('input')).pop(); //get the last item
      if (!input) {
        input = Array.from(object.querySelectorAll('textarea')).pop();
      }
    }

    if (!input) {
      input = Array.from(object.querySelectorAll('.validation-box')).pop();
    }

    if (input !== null && input != undefined) {
      this.main(input, isDropdown);
    }

    //let resultElement = this.main(input);
  }

  render() {
    let doneTyping = () => {
      let validMeManager = window.validMeReact.validMeManager;

      if (isHidden(validMeManager.validMeQueue[this.state.index].element))
        return;
      validMeTask = {};
      validMeTask = validMeManager.validMeQueue[this.state.index];
      validMeManager.validationTask(validMeTask, true);

      let errors = false;
      validMeTask.group.split('&').forEach((o,i)=>{
        errors = validMeManager.areThereErrors(o, false);
        if (errors)
          return;
      })
      if (!errors)
        enableActionButton(validMeTask.group);
      else
        disableActionButton(validMeTask.group);
    }
    let validMeTask = {};
    let copies = React.Children.map(this.props.children, (child, i) => {
      let copy = React.cloneElement(child, {
        onChange: (event) => {
          let validMeManager = window.validMeReact.validMeManager;
          validMeTask = validMeManager.validMeQueue[this.state.index];

          validMeTask.element.typingTimer = 0; //timer identifier
          validMeTask.element.doneTypingInterval = 3100; //wait three seconds, then validate
          //on keyup, start the countdown
          validMeTask.element.typingTimer = setTimeout(doneTyping, validMeTask.element.doneTypingInterval);

          validMeTask = validMeManager.validMeQueue[this.state.index];
          if (validMeTask.isDropdown || validMeTask.blurhappened == true) {
            if (validMeManager.validationTask(validMeTask, true).good) { //disable timeout validation if this is ok
              clearTimeout(validMeTask.element.typingTimer);
            }

            let errors = false;
            validMeTask.group.split('&').forEach((o,i)=>{
              errors = validMeManager.areThereErrors(o, false);
              if (errors)
                return;
            })
            if (!errors)
              enableActionButton(validMeTask.group);
            else
              disableActionButton(validMeTask.group);
          }
          if (child.props.onChange != undefined) {
            child.props.onChange(event);
          }
        },
        onInput: (event) => {

          let validMeManager = window.validMeReact.validMeManager;
          let validMeTask = validMeManager.validMeQueue[this.state.index];
          if (validMeTask.element.datepicker == undefined) {
            validMeTask = {};
            validMeTask = validMeManager.validMeQueue[this.state.index];
            if (validMeTask.blurhappened == true) { //|| validMeTask.element.val() != ''  //filled up fields which are being modified should continue
              if (validMeManager.validationTask(validMeTask, true).good) { //disable timeout validation if this is ok
                clearTimeout(validMeTask.element.typingTimer);
              }
              let errors = false;
              validMeTask.group.split('&').forEach((o,i)=>{
                errors = validMeManager.areThereErrors(o, false);
                if (errors)
                  return;
              })
              if (!errors)
                enableActionButton(validMeTask.group);
              else
                disableActionButton(validMeTask.group);
            }
          }
          if (child.props.onInput != undefined) {
            child.props.onInput(event);
          }
        },
        onBlur: (event) => {

          let validMeManager = window.validMeReact.validMeManager;
          let element = validMeManager.validMeQueue[this.state.index].element;
          if (element.datepicker == undefined) {
            let validMeManager = window.validMeReact.validMeManager;
            validMeTask = {};
            validMeTask = validMeManager.validMeQueue[this.state.index];
            validMeTask.blurhappened = true;
            var isGood = validMeManager.validationTask(validMeTask, true).good;
            if (isGood) { //disable timeout validation if this is ok
              clearTimeout(validMeTask.element.typingTimer);
            }

            let errors = false;
            validMeTask.group.split('&').forEach((o,i)=>{
              errors = validMeManager.areThereErrors(o, false);
              if (errors)
                return;
            })
            if (!errors)
              enableActionButton(validMeTask.group);
            else
              disableActionButton(validMeTask.group);
          }
          if (child.props.onBlur != undefined) {
            child.props.onBlur(event);
          }
        },
        onFocus: (event) => {

          let validMeManager = window.validMeReact.validMeManager;
          validMeTask = {};
          validMeTask = validMeManager.validMeQueue[this.state.index];
          if (validMeTask.element.textContent != ''){
            let errors = false;

            validMeTask.group.split('&').forEach((o,i)=>{
              errors = validMeManager.areThereErrors(o, false);
              if (errors)
                return;
            })
            if (!errors)
              enableActionButton(validMeTask.group);
            }
          if (child.props.onFocus != undefined) {
            child.props.onFocus(event);
          }
        }

      });
      return copy;
    })

    return <div className={this.props.fieldclasses
      ? this.props.fieldclasses
      : 'field'}>{copies}</div>;
  }

  main(input, isDropdown) {

    let props = this.props;
    if (props.group == "") {
      throw RegExp("Error : all validme references must have a group on which to be validated");
      return;
    }

    let element = input;
    let validMeManager;

    if (!window.validMeReact) {
      if (window.APP && window.APP.LANGUAGE.Errors) {
        window.validMeReact = {
          validMeManager: {
            ERROR: window.APP.LANGUAGE.Errors,
            VALIDATION: window.APP.CONFIGURATION.VALIDATION
          }
        };
      } else {
        let errors = {
          IsRequired: "This field is required",
          CannotBeEmpty: "This field cannot be empty",
          OnlyAlphanumeric: "This field must contain letters and numbers",
          ZeroIsNotValid: "0 is not a valid value for this field",
          IncorrectSizeOfNumbersPartOne: "The limit of numbers in this field is",
          IncorrectSizeOfNumbersPartTwo: "please adjust it",
          OnlyNumbersAllowed: "This field should contain only numbers",
          InvalidUrl: "This field should contain a valid URL",
          InvalidEmail: "You should enter a valid email",
          SelectionRequired: "Selection cannot be empty",
          ToggleRequired: "You must check this option",
          NoValidPhoneNumber: "You have not specified a valid phone number"
        }
        let validation = {
          CountryCode: 'AU'
        }
        window.validMeReact = {
          validMeManager: {
            ERROR: errors,
            VALIDATION: validation
          }
        };

      }

    }
    validMeManager = window.validMeReact.validMeManager;
    // if (validMeManager._currentPageOrSection == undefined) { //this is to avoid validating other pages than the current one
    //   validMeManager._currentPageOrSection = validMeManager.currentPageOrSection;
    // } else if (validMeManager.currentPageOrSection != scope._currentPageOrSection) { //cleaning when we change section
    //   validMeManager._currentPageOrSection = validMeManager.currentPageOrSection;
    //   for (var property in validMeManager.watcher) {
    //     if (validMeManager.watcher.hasOwnProperty(property)) {
    //       validMeManager.watcher[property]();
    //     }
    //   }
    //   delete validMeManager.wrapper;
    //   delete validMeManager.watcher;
    //   delete validMeManager.validMeQueue;
    //   delete validMeManager.turnOf;
    // }

    validMeManager.wrapper = validMeManager.wrapper == undefined
      ? []
      : validMeManager.wrapper;
    validMeManager.validMeQueue = validMeManager.validMeQueue == undefined
      ? []
      : validMeManager.validMeQueue;
    validMeManager.watcher = validMeManager.watcher == undefined
      ? {}
      : validMeManager.watcher;
    validMeManager.turnOf = validMeManager.turnOf == undefined
      ? {}
      : validMeManager.turnOf;
    var index = validMeManager.validMeQueue.length;

    let newQueueEventTask = (element, props, showErrorsIfNeeded) => { //add this validation item to the global queue
      var result = {
        message: "",
        element: {},
        good: true,
        value: value
      }
      if (isHidden(element))
        return result;

      const customMessageOrThis = (orMessage) => {
        return props.validmemessage != undefined
          ? props.validmemessage
          : orMessage;
      }

      var value = '';

      if (props.validmefor == 'dropdown'){
        value = element.value;
        if (!value && value != ''){
          value = element.textContent
        }
      } else {
        value = element.value
      }

      if (value == '' && props.validmefor == 'dropdown') {
        value = element.textContent;
      }
      if (element.type == "radio" || element.type == "checkbox") {
        value = element[0].checked.toString();
        if (value == "true" && props.validmenotrue == undefined) {
          return result;
        }
      }
      if (props.validmefor != undefined && props.validmefor != "") {

        var ruleArray = props.validmefor.replace(" ", "").split("@");
        var validRules = {
          type: "",
          rule: ""
        };
        if (ruleArray.length > 1) {
          validRules.type = ruleArray[0];
          validRules.rule = ruleArray[1];
        }
        let res = ruleArray[0].split('&');
        if (res.length > 1) {
          validRules.type = res[0];
          validRules.typeTwo = res[1];
        } else {
          validRules.type = ruleArray[0];
        }

        //for optional items, if they are empty it is okay
        if (props.validmeoptional != undefined && value == "") {
          return result;
        }

        if (validRules.type == "text") {

          var regex = new RegExp("^[0-9(\\s)]+$");

          if (validRules.rule != undefined && (validRules.rule == "" || validRules.rule == "alphanumeric")) {
            if (regex.test(value)) {
              result.good = false;
              result.message = customMessageOrThis(validMeManager.ERROR.OnlyAlphanumeric);
            } else if (value != "") {
              result.good = true;
            } else {
              result.good = false;
              result.message = customMessageOrThis(validMeManager.ERROR.CannotBeEmpty);
            }
          }
        }

        if (validRules.rule.indexOf("-") >= 0 && validRules.type != 'phoneNumber' && validRules.typeTwo != 'phoneNumber') {

          var lengths = validRules.rule.split('-');
          let minLength = 0,
            maxLength = 0;
          if (lengths && lengths.length > 1) {
            minLength = lengths[0];
            maxLength = lengths[1];
          } else if (lengths != undefined & lengths.length == 1) {
            maxLength = lengths[0]
          }
          if (value == "" && validRules.type != "lengthOptional") { //if its a mandatory check
            result.message = customMessageOrThis(validMeManager.ERROR.CannotBeEmpty);
            result.good = false;
          }
          var regex = new RegExp("^.{" + minLength + "," + maxLength + "}$"); //any type of character is allowed
          let condition = regex.test(value);
          if (!condition) {
            result.message = customMessageOrThis(validMeManager.ERROR.IncorrectSizeOfNumbersPartOne + ' ' + validRules.rule + ' ' + validMeManager.ERROR.IncorrectSizeOfNumbersPartTwo);
            result.good = false;
          } else
            result.good = true;
        }


        if (validRules.type == "numeric") {
          let part1 = "^[";
          let part2 = "]+$";

          let regex = new RegExp(part1 + "0-9" + part2);

          if (props.validmemessage != undefined && props.validmemessage != "")
            result.message = props.validmemessage;

          let condition2 = regex.test(value);
          let condition1 = validRules.rule.includes("$value") && condition2
            ? eval(validRules.rule.replace("$value", value))
            : true;
          let extraValidation = validRules.rule != undefined && regex.test(validRules.rule)
            ? true
            : false;

          if (value != "" && condition1 && condition2) {
            if (validRules.rule != undefined && validRules.rule != "") {
              if (value == "0") {
                result.good = false;
                result.message = customMessageOrThis(validMeManager.ERROR.ZeroIsNotValid);
              } else {
                if (extraValidation && value.length > validRules.rule) {
                  result.good = false;
                  result.message = props.validmemessage != undefined
                    ? props.validmemessage
                    : validMeManager.ERROR.IncorrectSizeOfNumbersPartOne + ' ' + validRules.rule + ' ' + validMeManager.ERROR.IncorrectSizeOfNumbersPartTwo
                }
                result.good = true;
              }
            } else {
              result.good = true;
            }

          } else {
            if (value == "")
              result.message = customMessageOrThis(validMeManager.ERROR.CannotBeEmpty);
            else {
              if (!condition1)
                result.message = customMessageOrThis(validMeManager.ERROR.OnlyNumbersAllowed);
              else if (condition1 && !condition2) {
                result.message = customMessageOrThis(validMeManager.ERROR.OnlyNumbersAllowed);

              }
            }
            result.good = false;
          }
        }
        if (validRules.type.indexOf("url") >= 0) {
          let urlValid = /^(https:\/\/www\.|https:\/\/)[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/g; //for https url
          if (value != "" && urlValid.test(value)) {
            result.message = "Value " + value + " is a valid https url";
            result.good = true;
          } else {

            if (value == "" && validRules.type == "urlOptional") {
              result.good = true;
            } else if (value == "")
              result.message = props.validmemessage != undefined
                ? props.validmemessage
                : validMeManager.ERROR.InvalidUrl;
            else
              result.message = props.validmemessage != undefined
                ? props.validmemessage
                : validMeManager.ERROR.InvalidUrl;
            result.good = false;
          }
        }
        if (validRules.type.indexOf("imageUrl") >= 0) {
          let urlValid = new RegExp("^https://(?:[a-z0-9\-]+\.)+[a-z]{2,6}(?:/[^/#?]+)+\.(?:jpg|gif|png|jpeg)$"); //copied from VCC for https
          if (value != "" && urlValid.test(value)) {
            result.message = props.validmemessage != undefined
              ? props.validmemessage
              : validMeManager.ERROR.InvalidUrl;
            result.good = true;
          }
        }
        if (validRules.type == "number") {

          if (validRules.rule != undefined && validRules.rule != "") {

            let part1 = "^[";
            let part2 = "]+$";
            let regex = new RegExp(part1 + validRules.rule + part2);
            if (value != "" && regex.test(value)) {
              result.message = "Value " + value + " is a number";
              result.good = true;
            } else {
              if (value == "")
                result.message = props.validmemessage != undefined
                  ? props.validmemessage
                  : validMeManager.ERROR.CannotBeEmpty;
              else
                result.message = customMessageOrThis(validMeManager.ERROR.OnlyNumbersAllowed);
              result.good = false;
            }
          } else {
            throw RegExp("You specified a number validation but didnt provide which set of numbers to validate");
          }
        }

        if (validRules.type == "required") {
          if (value == "" || value == "No file selected") {
            result.message = customMessageOrThis(validMeManager.ERROR.IsRequired);
            result.good = false;
          } else {
            result.good = true;
          }
        }



        if (validRules.type == "dropdown") {
          if (value == "") {
            result.message = customMessageOrThis(validMeManager.ERROR.SelectionRequired);
            result.good = false;
          } else if (value == props.defaulttext) {
            result.message = customMessageOrThis(validMeManager.ERROR.SelectionRequired);
            result.good = false;
          } else if (props.customvalidation){
            if (props.customvalidation()) {
              result.good = true;
            }
          }
           else {
            result.good = true;
          }

        }

        if (validRules.type == "boolean") {

          if (value != validRules.rule) {
            if (props.validmemessage != undefined && props.validmemessage != "")
              result.message = props.validmemessage;
            else
              result.message = customMessageOrThis(validMeManager.ERROR.ToggleRequired);
            result.good = false;
          } else {
            result.good = true;
          }
        }

        if (validRules.type == "condition" || validRules.typeTwo == "condition" && result.good) {

          if (validRules.rule !== undefined && validRules.rule !== null && validRules.rule !== "" || props.condition) {
            if (props.condition(value)) {
              result.good = true;
            } else {
              result.message = props.validmemessagecondition != undefined
                ? props.validmemessagecondition
                : "";
              result.good = false;
            }
          }
        }

        if (validRules.type == 'phoneNumber' || validRules.typeTwo == 'phoneNumber' && result.good && !props.secondaryconditionpassed) {

          let validatePhoneTypes = [];
          if (validRules.rule) {
            validatePhoneTypes = validRules.rule.split('-');
          }

          if (validRules.rule.includes('emptyok') && value == '') {
            result.good = true;
          }
          try {
            if (0 > value.indexOf('+')) {//doesnt start with +
              let util = phoneNumberUtil.getInstance();
              let parsedNumber = util.parse(value, validMeManager.VALIDATION.CountryCode);
              if (util.isValidNumber(parsedNumber)) {
                let numberType = util.getNumberType(parsedNumber);
                
                if (!validatePhoneTypes || validatePhoneTypes.indexOf(numberType.toString()) > 0) {
                  //either not validatePhone type provided
                  //or if provided it matches the numberType
                  result.good = true;
                }
                else {
                  result.good = false;
                  result.message = customMessageOrThis(validMeManager.ERROR.NoValidPhoneNumber);
                }
              } else {
                result.good = false;
                result.message = customMessageOrThis(validMeManager.ERROR.NoValidPhoneNumber);
              }
            }
            else if (window.intlTelInputUtils.isValidNumber(value)) {
              let numberType = window.intlTelInputUtils.getNumberType(value);
              if (
                numberType == phoneTypesEnum.MOBILE ||
                numberType == phoneTypesEnum.FIXED_LINE ||
                numberType == phoneTypesEnum.FIXED_LINE_OR_MOBILE ||
                numberType == phoneTypesEnum.PERSONAL_NUMBER ||
                numberType == phoneTypesEnum.VOIP ||
                numberType == phoneTypesEnum.TOLL_FREE) {
                console.log('validatePhoneType', validatePhoneType, '   ', numberType);
                if (!validatePhoneType || (validatePhoneType == numberType)) {
                  result.good = true;
                }
                else {
                  result.good = false;
                  result.message = customMessageOrThis(validMeManager.ERROR.NoValidPhoneNumber);
                }
              } else {
                result.good = false;
                result.message = customMessageOrThis(validMeManager.ERROR.NoValidPhoneNumber);
              }
            }
            else {
              result.good = false;
              result.message = customMessageOrThis(validMeManager.ERROR.NoValidPhoneNumber);
            }
          } catch (ex) {
            result.good = false;
            result.message = customMessageOrThis(validMeManager.ERROR.NoValidPhoneNumber);
          }

          if (props.optional && value == '') {
            result.good = true;
            result.message = '';
          }
        }

        if (validRules.type == "email" || validRules.typeTwo == "email" && result.good && !props.secondaryconditionpassed) {
          if (value == "" && props.optional == undefined) {
            result.message = customMessageOrThis(validMeManager.ERROR.CannotBeEmpty);
            result.good = false;
          } else if (value == "" && props.optional != undefined){
            result.good = true;
          }
          else {
            let re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if (re.test(value)) {
              result.good = true;
            } else {
              result.good = false;
              result.message = customMessageOrThis(validMeManager.ERROR.InvalidEmail);
            }
          }
        }
        //just in case
        return result;
      } else {
        throw RegExp("You defined the valid-me attribute in an element but didnt define the \n " +
          "valid-me-for attribute. Some valid values for it are  \n " +
          "text \n" +
          "text @ letters \n" +
          "text @ alphanumeric \n" +
          "numeric\n" +
          "number @ 1-9 \n" +
          "number @ 1-9 \n" +
          "condition @ condition expression to be evaluated \n" +
          "email \n" +
          "required \n)")
      }
    }
    validMeManager.validMeQueue.push(newQueueEventTask);
    let cb = () => {

      if (validMeManager.validMeQueue[this.state.index] == null || validMeManager.validMeQueue[this.state.index] == undefined) {
        console.warn('Invalid element to validate', validMeManager.validMeQueue[this.state.index])
        return;
      }

      this.validMeItem = validMeManager.validMeQueue[this.state.index].element = element;
      validMeManager.validMeQueue[this.state.index].props = props;
      validMeManager.validMeQueue[this.state.index].index = index;
      validMeManager.validMeQueue[this.state.index].errorActionVisible = false;
      validMeManager.validMeQueue[this.state.index].group = props.group != undefined
        ? props.group
        : "";

      validMeManager.validMeQueue[this.state.index].toggleError = validMeManager.validMeQueue[this.state.index].showError = () => {
        validMeManager.validMeQueue.map((o, i) => {
          if (i != index) {
            /*let errorElement = validMeManager.validMeQueue[this.state.index].element.parentElement.querySelector(".error-label");
            if (errorElement.className.indexOf(hidden) < 0){
              errorElement.className = errorElement.className + 'hidden';
            }
            */
          }
          if (i == validMeManager.validMeQueue.length - 1) { //make visible
            let errorElement = validMeManager.validMeQueue[this.state.index].element.parentElement.querySelector(".error-label");
            if (errorElement){
              errorElement.className = errorElement.className.replace('hidden','');
            }
          }
        })

      }

      if (isDropdown) {
        //TODO I HAVE TO FIX VALIDATION IN HERE !
        getParents(element,'.supa-dropdown').onclick = validMeManager.validMeQueue[this.state.index].showError;
      } else
        element.onclick = validMeManager.validMeQueue[this.state.index].showError;

      validMeManager.validMeQueue[this.state.index].errorTemplate = props.template || '<div class="error-label"><span class="error-pointy-corner"></span><span class="error-color message">$ERRORHERE</span>  </div>';
      validMeManager.validMeQueue[this.state.index].errorCheckmarkTemplate = '<i onclick="validMeReact.validMeManager.validMeQueue[' + index.toString() + '].toggleError();" class="warning big circle icon error-checkmark"></i>';
      validMeManager.validMeQueue[this.state.index].isDropdown = isDropdown;

      //ugly jquery like stuff
      if (validMeManager.validationTask == undefined) {
        validMeManager.validationTask = (validMeTask, showErrorsIfNeeded, triggeredByButton, forceError, errorMessage) => {

          if ((validMeTask.element.validmecondition) != undefined && !showErrorsIfNeeded) {

            if (validMeTask.element.validmecondition(value)) {
              var res = {
                message: "DoNotValidate",
                element: {},
                good: true,
                value: ""
              }
              return res;
            }
          }
          var that = this;
          var result = validMeTask(validMeTask.element, validMeTask.props, showErrorsIfNeeded);
          if (!showErrorsIfNeeded) { }
          var successEvent = props.validmesuccess;
          var errorEvent = props.validmeerror;

          if ((!result.good && showErrorsIfNeeded == true) || forceError == true) {

            var toContinue = true

            //only add error markup if its really needed
            if (triggeredByButton != undefined && validMeTask.props.validmeoptional != undefined) {
              toContinue = false;
            }
            if (toContinue) {

              if (validMeTask.props.validmenored == undefined){
                  setTimeout(()=>{

                    if (validMeTask.element.className.indexOf('error-border') < 0){
                      if(validMeTask.isDropdown){
                        validMeTask.element.parentElement.className += ' ' + 'error-border'
                      } else {
                        validMeTask.element.className += ' ' + 'error-border'
                      }
                    }
                  },0)//do this in the next thread to bypass libraries that replace our styles
              }
              if (errorMessage != undefined)
                result.message = errorMessage;

              window[errorMessage + validMeTask.index.toString()] = result.message;

              if (!validMeTask.element.parentElement.querySelector('.error-label')) { //do not append again

                if (result.message != '' && validMeTask.isDropdown) {
                  validMeTask.element.parentElement.insertAdjacentHTML('beforeend',validMeTask.errorTemplate);
                  validMeTask.element.parentElement.insertAdjacentHTML('beforeend',validMeTask.errorCheckmarkTemplate);
                } else {
                  validMeTask.element.parentElement.insertAdjacentHTML('beforeend',validMeTask.errorTemplate);
                  validMeTask.element.parentElement.insertAdjacentHTML('beforeend',validMeTask.errorCheckmarkTemplate);
                }
                //change left label (if exists) to have a red color
                var possibleLabel = {};

                if (validMeTask.props.validmeselectthirdparent != undefined)
                  possibleLabel = validMeTask.element.parentElement.parentElement.parentElement.querySelector('label');
                else if (validMeTask.props.validmeselectfourthparent != undefined)
                  possibleLabel = validMeTask.element.parentElement.parentElement.parentElement.parentElement.querySelector('label');
                else
                  possibleLabel = validMeTask.element.parentElement.parentElement.querySelector('label');

                //if child exists
                if (possibleLabel) {
                  if (validMeTask.props.validmenocolor == undefined) {
                    if (possibleLabel.className.indexOf('error-color') < 0){
                      validMeTask.element.className += ' ' + 'error-color'
                    }
                    validMeTask.borderErrorAdded = true;
                  }
                }
              }
              if (errorEvent != undefined && errorEvent != null) {
                errorEvent()
              }

              //THIS IS A FIX BECAUSE ANGULAR DOESNT ALWAYS UPDATE THE VALUES IN THE SCOPE

              if (validMeTask.element.parentElement.parentElement.querySelector('.error-label') != undefined) {
                if (errorMessage != undefined)
                  result.message = errorMessage;

                validMeTask.element.parentElement.parentElement.querySelector('.error-label .error-color.message').textContent = result.message; //FORCED TEXT UPDATE
              }
            }
          } else if (showErrorsIfNeeded == true) { //this means the method who executed this is just checking for errors and doesnt want to remove errors of components
            removeErrors(validMeTask, successEvent);
          }
          return result
        }
      }
      //pre-emptive checkings
      //if (!(element.attr("type") == "checkbox")) {

      let validMeTask = {};

      validMeManager.areThereErrors = function (groupName, showErrorsIfNeeded) { // this is useful for when one input says everything is ok, but lets check all other inputs
        let res = false;
        let checkmarks = [];
        if (!groupName) {
          return;
        }

        res = groupValidation(groupName, showErrorsIfNeeded);
        if (res == false) { //if there are still no errors after iteration, then lets do a final check
          checkmarks = document.getElementsByClassName("error-checkmark");
          res = checkmarks != undefined && checkmarks != null && checkmarks.length > 0;
        }
        return res;
      }
      validMeManager.executeValidationOnElement = function (element, message) {
        for (var i = 0; i < validMeManager.validMeQueue.length; i++) {
          validMeTask = {};
          validMeTask = validMeManager.validMeQueue[i];

          //TODO IMPLEMENT THIS FUNCTION
        }
      }
    }
    this.setState({
      index: window.validMeReact.validMeManager.validMeQueue.length - 1
    }, cb);
  }
}

let isHidden = (el) => {
  return (el.offsetParent === null)
}

let isVisible = (el) => {
  return !isHidden(el);
}

let groupValidation = (groupsName, showErrorsIfNeeded) => {
  let errors = false;
  if (groupsName.split('&').length > 1) {

    groupsName.split('&').forEach((o, i) => {
      if (groupValidationLoop(o, showErrorsIfNeeded)) {
        if (groupsName.toLowerCase().indexOf('mandatory') < 0) { //if it is not mandatory to pass all validations
          disableActionButton(o);
        }
        errors = true;
        return false;
      } else
        enableActionButton(o);
    }
    )
    if (errors) {
      //TODO CONTINUE WORK HERE
    }
  } else {
    if (groupValidationLoop(groupsName, showErrorsIfNeeded)) {
      disableActionButton(groupsName);
      errors = true;
    } else
      enableActionButton(groupsName);
  }
  return errors;
}

let removeErrors = (validMeTask, successEvent) => {

  if (validMeTask.isDropdown){
    validMeTask.element.parentElement.className = validMeTask.element.parentElement.className.replace('error-border', '');
  } else {
    validMeTask.element.className = validMeTask.element.className.replace('error-border', '');
  }
  let errorLabelToRemove = validMeTask.element.parentElement.querySelector(".error-label");
  let errorCheckmarkToRemove = validMeTask.element.parentElement.querySelector(".error-checkmark");

  if (errorLabelToRemove)
    errorLabelToRemove.remove();
  if (errorCheckmarkToRemove)
    errorCheckmarkToRemove.remove()
  var possibleLabel = {}
  if (validMeTask.props.validmeoptional != undefined) {
    possibleLabel = validMeTask.element.parentElement.querySelector('label');
  } else {
    possibleLabel = validMeTask.element.parentElement.parentElement.querySelector('label');
  }

  //if child exists
  if (possibleLabel) {
    if (validMeTask.borderErrorAdded == true) {
      possibleLabel.className.replace('error-color', '');
      validMeTask.borderErrorAdded = false;
    }
  }

  if (successEvent != undefined && successEvent != null) {
    successEvent();
  }
}
let groupValidationLoop = (groupName, showErrorsIfNeeded) => {
  var errors = false;

  window.validMeReact.validMeManager.validMeQueue.forEach((validMeTask, i) => {
    if (validMeTask.group.includes(groupName)) {
      if (isVisible(validMeTask.element)) {
        var tempResult = window.validMeReact.validMeManager.validationTask(validMeTask, showErrorsIfNeeded).good;
        if (errors == false && !tempResult)
          errors = true
      }
    }
  })
  return errors;
}

const enableActionButton = (group) => {
  let buttonListToEnable = document.querySelectorAll('[data-group*="' + group + '"]');
  if (buttonListToEnable) {
    Array.from(buttonListToEnable).forEach((o,i)=>{
      o.className = o.className.replace('disabled','');
    })
  }
}
const disableActionButton = (group) => {
  let buttonListToDisable = document.querySelectorAll('[data-group*="' + group + '"]');
  if (buttonListToDisable){
    Array.from(buttonListToDisable).forEach((o,i)=>{
      if (o.className.indexOf('disabled') < 0){
        o.className += ' disabled';
      }
    })
  }
}

 let forceValidation = (notUgly, smart, groupsToValidate, element) => { //force validation has to return true or false

  var areThereErrors = false;
  let validMeTask = {};
  if (!window.validMeReact) {
    areThereErrors = true;
  } else {
    let validMeManager = window.validMeReact.validMeManager;
    if (notUgly) {
      if (validMeManager.validMeQueue.forEach != undefined) {

        for (var i = 0; i < validMeManager.validMeQueue.length; i++) {
          validMeTask = {};
          validMeTask = validMeManager.validMeQueue[i];
          validMeManager.validationTask(validMeTask, true);
        }
      }
    } else if (smart) {
      for (var i = 0; i < validMeManager.validMeQueue.length; i++) {
        function timer(id) {
          var _this = this;
          this.id = id;
          this.execute = function () {
            var validMeTask = validMeManager.validMeQueue[_this.id];
            if (isHidden(validMeTask.element)) {
              validMeManager.validationTask(validMeTask, true);
            }
          }
        }
        setTimeout(new timer(i).execute, 100)
      }
    } else if (groupsToValidate != undefined) {
      let showErrorsIfNeeded = true;
      areThereErrors = groupValidation(groupsToValidate, showErrorsIfNeeded);
    }
  }
  return areThereErrors;
}
  let clearAllValidationErrors = () => {

  if (!window.validMeReact) {
    return false;
  }
  var validMeManager = window.validMeReact.validMeManager;
  var validMeTask = {};
  if (validMeManager.validMeQueue.forEach != undefined) { //this means we want to reset the state
    for (var i = 0; i < validMeManager.validMeQueue.length; i++) {
      validMeTask = {};
      validMeTask = validMeManager.validMeQueue[i];
      validMeTask.blurhappened = false;
      removeErrors(validMeTask);
    }
    disableActionButton(validMeTask.group);
  }
}

let getParents = function (elem, selector) {

    // Element.matches() polyfill
    if (!Element.prototype.matches) {
        Element.prototype.matches =
            Element.prototype.matchesSelector ||
            Element.prototype.mozMatchesSelector ||
            Element.prototype.msMatchesSelector ||
            Element.prototype.oMatchesSelector ||
            Element.prototype.webkitMatchesSelector ||
            function(s) {
                var matches = (this.document || this.ownerDocument).querySelectorAll(s),
                    i = matches.length;
                while (--i >= 0 && matches.item(i) !== this) {}
                return i > -1;
            };
    }

    // Set up a parent array
    var parents = [];

    // Push each parent element to the array
    for ( ; elem && elem !== document; elem = elem.parentNode ) {
        if (selector) {
            if (elem.matches(selector)) {
                parents.push(elem);
            }
            continue;
        }
        parents.push(elem);
    }

    // Return our parent array
    return parents;

};


const random = (min, max) => {
  return Math.random() * (max - min) + min;
}
const randomString = (max) => {
  return Math.random().toString(36).substring(max)
}
const functionName = (fun) => {
  var ret = fun.toString();
  ret = ret.substr('function '.length);
  ret = ret.substr(0, ret.indexOf('('));
  return ret;
}
const exception = (message) => {
  throw new RegExp(message);
}
const escapeRegExp = (string) => {
  return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}
const replaceAll = (string, find, replace) => {
  return string.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}
const notNullNotEmpty = (string) => {
  return string != undefined && string != null && string != "";
}
const isUorN = (val) => { //undefined or null check
  return isUndefined(val) || val === null
}
const isUndefined = (val) => { //undefined or null check
  return val == undefined;
}

const phoneTypesEnum = {
  FIXED_LINE: 0,
  MOBILE: 1,
  // In some regions (e.g. the USA), it is impossible to distinguish between
  // fixed-line and mobile numbers by looking at the phone number itself.
  FIXED_LINE_OR_MOBILE: 2,
  // Freephone lines
  TOLL_FREE: 3,
  PREMIUM_RATE: 4,
  // The cost of this call is shared between the caller and the recipient, and
  // is hence typically less than PREMIUM_RATE calls. See
  // http://en.wikipedia.org/wiki/Shared_Cost_Service for more information.
  SHARED_COST: 5,
  // Voice over IP numbers. This includes TSoIP (Telephony Waiting Area over IP).
  VOIP: 6,
  // A personal number is associated with a particular person, and may be routed
  // to either a MOBILE or FIXED_LINE number. Some more information can be found
  // here: http://en.wikipedia.org/wiki/Personal_Numbers
  PERSONAL_NUMBER: 7,
  PAGER: 8,
  // Used for 'Universal Access Numbers' or 'Company Numbers'. They may be
  // further routed to specific offices, but allow one number to be used for a
  // company.
  UAN: 9,
  // Used for 'Voice Mail Access Numbers'.
  VOICEMAIL: 10,
  // A phone number is of type UNKNOWN when it does not fit any of the known
  // patterns for a specific region.
  UNKNOWN: -1
};


/* SAMPLE
  <text-area input iconleft icon="user" placeholder="{{currentLang.login.usernamePlaceHolder}}" ng-model="model.user.username" validme validmefor="email" validmeaction="login" validmemessage="You must enter all your details to continue"></text-area>

  import {ValidMe,forceValidation,clearAllValidationErrors,phoneTypesEnum} from 'valid-me-react';

  */

module.exports = {forceValidation : forceValidation,ValidMe : ValidMe,clearAllValidationErrors : clearAllValidationErrors,phoneTypesEnum : phoneTypesEnum};
