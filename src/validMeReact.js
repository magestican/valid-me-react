/* eslint-disable import/default */
import React from 'react';
import { render, findDOMNode } from 'react-dom';
let phoneNumberUtil = require('google-libphonenumber').PhoneNumberUtil;
class ValidMeComponent extends React.Component {

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
      if (child.props.dropdown)
        isDropdown = true;
    }
    )

    if (isDropdown) {
      input = window.$(object).find('.info span').last();
    } else {
      input = window.$(object).find('input').last();
      if (input.length == 0) {
        input = window.$(object).find('textarea');
      }
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

      if (!validMeManager.areThereErrors(validMeTask.group, false))
        enableActionButton(validMeTask.group);
      else
        disableActionButton(validMeTask.group);
    }
    let validMeTask = {};
    let copies = React.Children.map(this.props.children, (child, i) => {
      let copy = React.cloneElement(child, {
        onChange: (event) => {
          console.log("onchange")
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
            if (!validMeManager.areThereErrors(validMeTask.group, false))
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
          if (validMeTask.element.attr("datepicker") == undefined) {
            validMeTask = {};
            validMeTask = validMeManager.validMeQueue[this.state.index];
            if (validMeTask.blurhappened == true) { //|| validMeTask.element.val() != ''  //filled up fields which are being modified should continue
              if (validMeManager.validationTask(validMeTask, true).good) { //disable timeout validation if this is ok
                clearTimeout(validMeTask.element.typingTimer);
              }
              if (!validMeManager.areThereErrors(validMeTask.group, false))
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
          if (element.attr("datepicker") == undefined) {
            let validMeManager = window.validMeReact.validMeManager;
            validMeTask = {};
            validMeTask = validMeManager.validMeQueue[this.state.index];
            validMeTask.blurhappened = true;
            var isGood = validMeManager.validationTask(validMeTask, true).good;
            if (isGood) { //disable timeout validation if this is ok
              clearTimeout(validMeTask.element.typingTimer);
            }

            if (isGood && !validMeManager.areThereErrors(validMeTask.group, false))
              enableActionButton(validMeTask.group);
            else
              disableActionButton(validMeTask.group);
          }
          if (child.props.onBlur != undefined) {
            child.props.onBlur(event);
          }
        },
        onFocus: (event) => {
          console.log("onfocus exe")
          let validMeManager = window.validMeReact.validMeManager;
          validMeTask = {};
          validMeTask = validMeManager.validMeQueue[this.state.index];
          if (validMeTask.element.val() != '' && !validMeManager.areThereErrors(validMeTask.group, false)) {
            enableActionButton(validMeTask.group);
          }
          if (child.props.onFocus != undefined) {
            child.props.onFocus(event);
          }
        }

      });
      return copy;
    })
    return <div className={this.props.fieldClasses
      ? this.props.fieldClasses + ' field'
      : 'field'}>{copies}</div>;
  }

  main(input, isDropdown) {

    let props = this.props;
    if (props.group == "") {
      throw RegExp("Error : all validme references must have a group on which to be validated");
      return;
    }
    let element = window.$(input); //wrap input around jquery to have jquery helpers
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
          InvalidEmail: "You should input a valid email",
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

      var value = props.validmefor == 'dropdown'
        ? element.text()
        : findDOMNode(this).querySelector('input').value; //this means is a radio button or a  checkbox

      if (element.attr("type") == "radio" || element.attr("type") == "checkbox") {
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
        } else {
          let res = ruleArray[0].split('&');
          if (res.length > 1) {
            validRules.type = res[0];
            validRules.typeTwo = res[1];
          } else {
            validRules.type = ruleArray[0];
          }
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
              return result;
            } else if (value != "") {
              result.good = true;
              return result;
            } else {
              result.good = false;
              result.message = customMessageOrThis(validMeManager.ERROR.CannotBeEmpty);
              return result;
            }
          }
        }

        if (validRules.type.indexOf("length") >= 0) {

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
            return result;
          }
          var regex = new RegExp("^.{" + minLength + "," + maxLength + "}$"); //any type of character is allowed
          let condition = regex.test(value);
          if (!condition) {
            result.message = customMessageOrThis(validMeManager.ERROR.IncorrectSizeOfNumbersPartOne + ' ' + validRules.rule + ' ' + validMeManager.ERROR.IncorrectSizeOfNumbersPartTwo);
            result.good = false;
          } else
            result.good = true;
          return result;
        }
        if (validRules.type.indexOf("phoneNumber") >= 0) {
          let validatePhoneType = undefined;
          if (validRules.type.split('-').length > 1) {
            validatePhoneType = parseInt(validRules.type.split('-')[1]);
          }

          if (validRules.rule.includes('emptyok') && value == '') {
            result.good = true;
            return result;
          }
          try {
            if (0 > value.indexOf('+')) {//doesnt start with +
              let util = phoneNumberUtil.getInstance();
              let parsedNumber = util.parse(value, validMeManager.VALIDATION.CountryCode);
              if (util.isValidNumber(parsedNumber)) {
                let numberType = util.getNumberType(parsedNumber);
                if (!validatePhoneType || numberType == validatePhoneType) {
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

          return result;
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
                return result;
              } else {
                if (extraValidation && value.length > validRules.rule) {
                  result.good = false;
                  result.message = props.validmemessage != undefined
                    ? props.validmemessage
                    : validMeManager.ERROR.IncorrectSizeOfNumbersPartOne + ' ' + validRules.rule + ' ' + validMeManager.ERROR.IncorrectSizeOfNumbersPartTwo
                  return result;
                }
                result.good = true;
                return result;
              }
            } else {
              result.good = true;
              return result;
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
            return result;
          }
        }
        if (validRules.type.indexOf("url") >= 0) {
          let urlValid = /^(https:\/\/www\.|https:\/\/)[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/g; //for https url
          if (value != "" && urlValid.test(value)) {
            result.message = "Value " + value + " is a valid https url";
            result.good = true;
            return result;
          } else {

            if (value == "" && validRules.type == "urlOptional") {
              result.good = true;
              return result;
            } else if (value == "")
              result.message = props.validmemessage != undefined
                ? props.validmemessage
                : validMeManager.ERROR.InvalidUrl;
            else
              result.message = props.validmemessage != undefined
                ? props.validmemessage
                : validMeManager.ERROR.InvalidUrl;
            result.good = false;
            return result;
          }
        }
        if (validRules.type.indexOf("imageUrl") >= 0) {
          let urlValid = new RegExp("^https://(?:[a-z0-9\-]+\.)+[a-z]{2,6}(?:/[^/#?]+)+\.(?:jpg|gif|png|jpeg)$"); //copied from VCC for https
          if (value != "" && urlValid.test(value)) {
            result.message = props.validmemessage != undefined
              ? props.validmemessage
              : validMeManager.ERROR.InvalidUrl;
            result.good = true;
            return result;
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
              return result;
            } else {
              if (value == "")
                result.message = props.validmemessage != undefined
                  ? props.validmemessage
                  : validMeManager.ERROR.CannotBeEmpty;
              else
                result.message = customMessageOrThis(validMeManager.ERROR.OnlyNumbersAllowed);
              result.good = false;
              return result;
            }
          } else {
            throw RegExp("You specified a number validation but didnt provide which set of numbers to validate");
          }
        }
        if (validRules.type == "email") {
          if (value == "") {
            result.message = customMessageOrThis(validMeManager.ERROR.CannotBeEmpty);
            result.good = false;
            return result;
          }
          let re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          if (re.test(value)) {
            result.good = true;
            return result;
          } else {
            result.good = false;
            result.message = customMessageOrThis(validMeManager.ERROR.InvalidEmail);
            return result;
          }
        }
        if (validRules.type == "required") {
          if (value == "" || value == "No file selected") {
            result.message = customMessageOrThis(validMeManager.ERROR.IsRequired);
            result.good = false;
            return result;
          } else {
            result.good = true;
            if (validRules.typeTwo == undefined) { //only return if there are no other validations pending
              return result;
            }
          }
        }
        if (validRules.type == "dropdown") {

          if (value == "") {
            result.message = customMessageOrThis(validMeManager.ERROR.SelectionRequired);
            result.good = false;
            return result;
          } else if (value == props.defaulttext) {
            result.message = customMessageOrThis(validMeManager.ERROR.SelectionRequired);
            result.good = false;
            return result;
          } else {
            result.good = true;
            return result;
          }
        }

        if (validRules.type == "boolean") {

          if (value != validRules.rule) {
            if (props.validmemessage != undefined && props.validmemessage != "")
              result.message = props.validmemessage;
            else
              result.message = customMessageOrThis(validMeManager.ERROR.ToggleRequired);
            result.good = false;
            return result;
          } else {
            result.good = true;
            return result;
          }
        }
        if (validRules.type == "condition" || validRules.typeTwo == "condition") {
          if (validRules.rule !== undefined && validRules.rule !== null && validRules.rule !== "" || props.condition) {
            if (props.condition()) {
              result.good = true;
              return result;
            } else {
              result.message = props.validmemessagecondition != undefined
                ? props.validmemessagecondition
                : "";
              result.good = false;
              return result;
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
            validMeManager.validMeQueue[i].element.parent().find(".error-label").hide();
          }
          if (i == validMeManager.validMeQueue.length - 1) {
            validMeManager.validMeQueue[this.state.index].element.parent().find(".error-label").show();
          }
        })

      }

      if (isDropdown) {
        //TODO I HAVE TO FIX VALIDATION IN HERE !
        element.parent('.supa-dropdown').click(validMeManager.validMeQueue[this.state.index].showError);
      } else
        element[0].onclick = validMeManager.validMeQueue[this.state.index].showError;

      validMeManager.validMeQueue[this.state.index].errorTemplate = props.template || '<div style="display:none;" class="error-label"><span class="error-pointy-corner"></span><span className="error-color">$ERRORHERE</span>  </div>';
      validMeManager.validMeQueue[this.state.index].errorCheckmarkTemplate = '<i onclick="validMeReact.validMeManager.validMeQueue[' + index.toString() + '].toggleError();" class="warning big circle icon error-checkmark">!</i>';
      validMeManager.validMeQueue[this.state.index].isDropdown = isDropdown;

      //ugly jquery like stuff
      if (validMeManager.validationTask == undefined) {
        validMeManager.validationTask = (validMeTask, showErrorsIfNeeded, triggeredByButton, forceError, errorMessage) => {

          if (validMeTask.element.attr("validmecondition") != undefined && !showErrorsIfNeeded) {
            //check if condition is true
            if (!eval(validMeTask.element.attr("validmecondition"))) {
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

              if (validMeTask.props.validmenored == undefined)
                validMeTask.element.toggleClass('error-border', true);
              if (errorMessage != undefined)
                result.message = errorMessage;

              window[errorMessage + validMeTask.index.toString()] = result.message;

              if (validMeTask.element.parent().find(".error-label").length == 0) { //do not append again
                if (result.message != "") {
                  validMeTask.element.parent().append(validMeTask.errorTemplate);
                  validMeTask.element.parent().append(validMeTask.errorCheckmarkTemplate);
                }
                //change left label (if exists) to have a red color
                var possibleLabel = {};

                if (validMeTask.props.validmeselectthirdparent != undefined)
                  possibleLabel = validMeTask.element.parent().parent().parent().find("label:first");
                else if (validMeTask.props.validmeselectfourthparent != undefined)
                  possibleLabel = validMeTask.element.parent().parent().parent().parent().find("label:first");
                else
                  possibleLabel = validMeTask.element.parent().parent().find("label:first");

                //if child exists
                if (possibleLabel.length > 0) {
                  if (validMeTask.props.validmenocolor == undefined) {
                    possibleLabel.toggleClass('error-color', true);
                    validMeTask.borderErrorAdded = true;
                  }
                }
              }
              if (errorEvent != undefined && errorEvent != null) {
                errorEvent()
              }

              //THIS IS A FIX BECAUSE ANGULAR DOESNT ALWAYS UPDATE THE VALUES IN THE SCOPE
              if (validMeTask.element.parent().parent().find(".error-label") != undefined) {
                if (errorMessage != undefined)
                  result.message = errorMessage;
                validMeTask.element.parent().parent().find(".error-label").children().last().text(result.message); //FORCED TEXT UPDATE
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
          if (validMeTask.props.ngModel != undefined) {
            if (validMeTask.props != undefined && validMeTask.props.ngModel != undefined) {
              if (validMeTask.props.ngModel.split(".name").join("") == element.attr("modelBind")) {
                return validMeManager.validationTask(validMeTask, false, false, true, message);
              } else if (validMeTask.props.ngModel.split(".name").join("") == element.attr("ng-model")) {
                return validMeManager.validationTask(validMeTask, false, false, true, message);
              } else if (validMeTask.props.ngModel.split(".name").join("") == element.attr("ngmodel")) {
                return validMeManager.validationTask(validMeTask, false, false, true, message);
              }
            }
          }
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
  validMeTask.element.toggleClass('error-border', false);
  validMeTask.element.parent().find(".error-label").remove();
  validMeTask.element.parent().find(".error-checkmark").remove();
  var possibleLabel = {}
  if (validMeTask.props.validmeoptional != undefined) {
    possibleLabel = validMeTask.element.parent().find("label:first");
  } else {
    possibleLabel = validMeTask.element.parent().parent().find("label:first");
  }

  //if child exists
  if (possibleLabel.length > 0) {
    if (validMeTask.borderErrorAdded == true) {
      possibleLabel.toggleClass('error-color', false);;
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
  $('[data-group*="' + group + '"]').toggleClass('disable', false)
}
const disableActionButton = (group) => {
  $('[data-group*="' + group + '"]').toggleClass('disable', true)
}

export let forceValidation = (notUgly, smart, groupsToValidate, element) => { //force validation has to return true or false
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
    } else if (element != undefined) {

      for (var i = 0; i < validMeManager.validMeQueue.length; i++) {
        validMeTask = {};
        validMeTask = validMeManager.validMeQueue[i];
        if (validMeTask.props.ngModel != undefined) {
          if (validMeTask.props.ngModel.split(".name").join("") == element.attr("modelBind")) {
            validMeManager.validationTask(validMeTask, true);
          } else if (validMeTask.props.ngModel.split(".name").join("") == element.attr("ng-model")) {
            validMeManager.validationTask(validMeTask, true);
          } else if (validMeTask.props.ngModel.split(".name").join("") == element.attr("ngmodel")) {
            validMeManager.validationTask(validMeTask, true);
          }
        }
      }
    }
  }
  return areThereErrors;
}
export let clearAllValidationErrors = () => {

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

export const phoneTypesEnum = {
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


export let ValidMe = ValidMeComponent; //CONNECT IS A REACT HELPER FUNCTION

/* SAMPLE
  <text-area input iconleft icon="user" placeholder="{{currentLang.login.usernamePlaceHolder}}" ng-model="model.user.username" validme validmefor="email" validmeaction="login" validmemessage="You must enter all your details to continue"></text-area>
validmemessage
validmefor
validmeactions
validmecondition
validmenocolor
validmeerror
validmesuccess
  */
