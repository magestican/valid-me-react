/* eslint-disable import/default */

import React from 'react';
import ReactDom from 'react-dom';
import {render} from 'react-dom';

class ValidMeReact extends React.Component {

    constructor(props) {
        super(props);
        this.init();
        this.main = this.main.bind(this);
        this.validMeItem = {};
      }
      //****Helpers****/

    init() {
      if (window.validMeExecuted != true) {
        window.validMeExecuted = true;
        $.fn.scrollTo = function(target, options, callback) {
          if (typeof options == 'function' && arguments.length == 2) {
            callback = options;
            options = target;
          }
          var settings = $.extend({
            scrollTarget: target,
            offsetTop: 50,
            duration: 500,
            easing: 'swing'
          }, options);
          return this.each(function() {
            var scrollPane = $(this);
            var scrollTarget = (typeof settings.scrollTarget == "number") ? settings.scrollTarget : $(settings.scrollTarget);
            var scrollY = (typeof scrollTarget == "number") ? scrollTarget : scrollTarget.offset().top + scrollPane.scrollTop() - parseInt(settings.offsetTop);
            scrollPane.animate({
              scrollTop: scrollY
            }, parseInt(settings.duration), settings.easing, function() {
              if (typeof callback == 'function') {
                callback.call(this);
              }
            });
          });
        }
      }
    }
    componentDidMount(asd) {
      let object = ReactDom.findDOMNode(this);
      let input = $(object).find('input');
      this.main(input);
      //let resultElement = this.main(input);
    }

    render() {
      let copies = React.Children.map(this.props.children, (child, i) => {
        let copy = React.cloneElement(child, {
          onChange: (event) => {
            console.log("i overrode the default behaviour");
            child.props.onChange(event);
          }
        });
        return copy;
      })
      return <div>{copies}</div>;
    }
    main(input) {

      let props = this.props;
      if (props.group == "") {
        throw RegExp("Error : all validme references must have a group on which to be validated");
        return;
      }
      let element = $(input); //wrap input around jquery to have jquery helpers
      let validMeManager;

      if (!window.validMeReact){
        if (window.APP && window.APP.LANGUAGE.Errors) {
          window.validMeReact = {
            validMeManager: {ERROR : window.APP.LANGUAGE.Errors}
          };
        }
        else {
          let errors = {
            IsRequired : "This field is required",
            CannotBeEmpty : "This field cannot be empty",
            OnlyAlphanumeric : "This field must contain letters and numbers",
            ZeroIsNotValid : "0 is not a valid value for this field",
            IncorrectSizeOfNumbersPartOne : "The limit of numbers in this field is",
            IncorrectSizeOfNumbersPartTwo : "please adjust it",
            OnlyNumbersAllowed :  "This field should contain only numbers",
            InvalidUrl : "This field should contain a valid URL",
            InvalidEmail : "You should input a valid email",
            SelectionRequired : "Selection cannot be empty",
            ToggleRequired : "You must check this option"
          }
          window.validMeReact = {
            validMeManager: {ERROR : errors}
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

      validMeManager.wrapper = validMeManager.wrapper == undefined ? [] : validMeManager.wrapper;
      validMeManager.validMeQueue = validMeManager.validMeQueue == undefined ? [] : validMeManager.validMeQueue;
      validMeManager.watcher = validMeManager.watcher == undefined ? {} : validMeManager.watcher;
      validMeManager.turnOf = validMeManager.turnOf == undefined ? {} : validMeManager.turnOf;
      var index = validMeManager.validMeQueue.length;

      let newQueueEventTask = (element, props) => { //add this validation item to the global queue

          const customMessageOrThis = (orMessage) => {
            return props.validmemessage != undefined ? props.validmemessage : orMessage;
          }
          var value = element.val(); //this means is a radio button or a  checkbox
          var result = {
            message: "",
            element: {},
            good: true,
            value: value
          }
          //a reference to an old element is kept sometimes by angular..
          //TODO : fix what the previous comment says
          if (!$.contains(document, element[0])) { //WE SHOULD REMOVE THIS FROM THE QUE RATHER THAN JUST RETURNING TRUE
            return result;
          }

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
            if (validRules.type == "numeric") {
              let part1 = "^[";
              let part2 = "]+$";

              let regex = new RegExp(part1 + "0-9" + part2);

              if (props.validmemessage != undefined && props.validmemessage != "")
                result.message = props.validmemessage;

              let condition2 = regex.test(value);
              let condition1 = validRules.rule.includes("$value") && condition2 ? eval(validRules.rule.replace("$value", value)) : true;
              let extraValidation = validRules.rule != undefined && regex.test(validRules.rule) ? true : false;

              if (value != "" && condition1 && condition2) {
                if (validRules.rule != undefined && validRules.rule != "") {
                  if (value == "0") {
                    result.good = false;
                    result.message = customMessageOrThis(validMeManager.ERROR.ZeroIsNotValid);
                    return result;
                  } else {
                    if (extraValidation && value.length > validRules.rule) {
                      result.good = false;
                      result.message = props.validmemessage != undefined ? props.validmemessage : validMeManager.ERROR.IncorrectSizeOfNumbersPartOne + ' ' + validRules.rule + ' ' + validMeManager.ERROR.IncorrectSizeOfNumbersPartTwo
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
                    result.message = customMessageOrThis( validMeManager.ERROR.OnlyNumbersAllowed);

                  }
                }
                result.good = false;
                return result;
              }
            }
            if (validRules.type == "url") {

              let urlValid = new RegExp(/^(?:(ht|f)tp(s?)\:\/\/)?[a-z0-9-\.]+\.[a-z]{2,4}\/?([^\s<>\#%"\,\{\}\\|\\\^\[\]`]+)?$/);
              if (value != "" && urlValid.test(value)) {
                result.message = "Value " + value + " is an email";
                result.good = true;
                return result;
              } else {
                if (value == "")
                  result.message = props.validmemessage != undefined ? props.validmemessage : validMeManager.ERROR.InvalidUrl;
                else
                  result.message = props.validmemessage != undefined ? props.validmemessage : validMeManager.ERROR.InvalidUrl;
                result.good = false;
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
                    result.message =  props.validmemessage != undefined ? props.validmemessage : validMeManager.ERROR.CannotBeEmpty;
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
                result.message = "Value " + value + " is an email";
                console.log(result.message);
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
                console.log(result.message);
                return result;
              } else {
                result.good = true;
                return result;
              }
            }
            if (validRules.type == "dropdown") {

              if (value == "") {
                result.message =  customMessageOrThis(validMeManager.ERROR.SelectionRequired);
                result.good = false;
                return result;
              } else if (value == "- Select -") {
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

            if (validRules.type == "condition") {

              if (validRules.rule != undefined) {
                if (eval(validRules.rule)) {
                  result.good = true;
                  return result;
                } else {
                  result.message = props.validmemessage != undefined ? props.validmemessage : "";
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
      this.validMeItem = validMeManager.validMeQueue[index].element = element;
      validMeManager.validMeQueue[index].props = props;
      validMeManager.validMeQueue[index].index = index;
      validMeManager.validMeQueue[index].errorActionVisible = false;

      validMeManager.validMeQueue[index].toggleError = validMeManager.validMeQueue[index].showError = () => {
        let possibleLabel = {};
        let el = validMeManager.validMeQueue[index.toString()].element
        if (isUorN(validMeManager.validMeQueue[index].props.validmeselectthirdparent))
          possibleLabel = el.parent().parent().parent().find("label:first");
        else if (isUorN(validMeManager.validMeQueue[index].props.validmeselectfourthparent))
          possibleLabel = el.parent().parent().parent().parent().find("label:first");
        else
          possibleLabel = el.parent().parent().find("label:first");
        if (possibleLabel.length > 0) {
          validMeManager.validMeQueue[index.toString()].errorActionVisible = true;
        }
      }
      element[0].onclick = validMeManager.validMeQueue[index].showError;
      validMeManager.validMeQueue[index].group = props.group != undefined ? props.group : "";
      validMeManager.validMeQueue[index].errorTemplate = props.template || '<div class="error-label"><label className="error-color">$ERRORHERE</label></div>';
      validMeManager.validMeQueue[index].errorCheckmarkTemplate = '<i onClick={validMeManager.validMeQueue[index.toString()].toggleError} class="warning big circle icon error-checkmark">!</i>';


      //ugly jquery like stuff
      if (validMeManager.validationTask == undefined){
      validMeManager.validationTask = (validMeTask, reset, triggeredByButton, forceError, errorMessage) => {

          if (!$.contains(document, validMeTask.element[0])) { //ignore invalid references
              return
          }
          else{
          if (validMeTask.element.attr("validmecondition") != undefined && !reset) {
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
          var result = validMeTask(validMeTask.element, validMeTask.props);

          var successEvent = props.validmesuccess;
          var errorEvent = props.validmeerror;

          if ((!result.good && reset == undefined) || forceError == true) {


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

              if (validMeTask.element.parent().find(".error-label").length == 0) {//do not append again
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
                validMeTask.element.parent().parent().find(".error-label").children().text(result.message); //FORCED TEXT UPDATE
              }
            }

          } else {
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
          }
          return result
        }
        }
        //pre-emptive checkings
        //if (!(element.attr("type") == "checkbox")) {

      if (element.attr("datepicker") == undefined) {

         element.on('blur', function() {
          validMeManager.validMeQueue[index].blurhappened = true;
          validMeManager.validationTask(validMeManager.validMeQueue[index]);
        });
         element.on('input', function() {
          if (validMeManager.validMeQueue[index].blurhappened == true) {
            validMeManager.validationTask(validMeManager.validMeQueue[index]);
          }

        });
      }
      element.on('change', function() {
        if (validMeManager.validMeQueue[index].blurhappened == true) {
          validMeManager.validationTask(validMeManager.validMeQueue[index]);
        }
      });
      //}
      //else {
      //    element.bind('change', function (asd) {

      //        //set this checbox and all checkboxes with same condition to true, thus eliminating all the error messages
      //        var task = scope.global.validMeQueue[index];
      //        if (task.element.is(":checked") == true) {
      //            validationTask(task);

      //            for (var i = 0; i < scope.global.validMeQueue.length; i++) {
      //                var validMeTask = scope.global.validMeQueue[i];

      //                if (validMeTask.props.validmefor == task.props.validmefor) {
      //                    validationTask(validMeTask, true);
      //                }

      //            }
      //        }
      //    });
      //}



      validMeManager.areThereErrors = function() {
        var res = document.getElementsByClassName("error-checkmark");
        return res != undefined && res != null && res.length > 0;
      }

      validMeManager.executeValidationOnElement = function(element, message) {
        for (var i = 0; i < validMeManager.validMeQueue.length; i++) {
          var validMeTask = validMeManager.validMeQueue[i];
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
  }


 let validate = (notUgly, smart, groupValidation, element) => {
          let validMeManager = window.validMeReact.validMeManager;
          if (notUgly) {
            if (validMeManager.validMeQueue.forEach != undefined) {

              for (var i = 0; i < validMeManager.validMeQueue.length; i++) {
                var validMeTask = validMeManager.validMeQueue[i];
                validMeManager.validationTask(validMeTask);
              }
            }
          } else if (smart) {
            for (var i = 0; i < validMeManager.validMeQueue.length; i++) {
              function timer(id) {
                var _this = this;
                this.id = id;
                this.execute = function() {
                  var validMeTask = validMeManager.validMeQueue[_this.id];
                  if (!$(validMeTask.element).is(':visible')) {
                    validMeManager.validationTask(validMeTask, true);
                  }
                }
              }
              setTimeout(new timer(i).execute, 100)
            }

          } else if (groupValidation != undefined) {
            validMeManager.validMeQueue.forEach(function (validMeTask,i) {
              if(validMeTask.group.includes(groupValidation)) {
                let res = validMeManager.validationTask(validMeTask);
              }
            })
          } else if (element != undefined) {

            for (var i = 0; i < validMeManager.validMeQueue.length; i++) {

              var validMeTask = validMeManager.validMeQueue[i];

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
          } else {
            if (validMeManager.validMeQueue.forEach != undefined) {

              for (var i = 0; i < validMeManager.validMeQueue.length; i++) {
                var validMeTask = validMeManager.validMeQueue[i];
                validMeManager.validationTask(validMeTask, true);
              }
            }
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
  that.exceptionOcurred = true;
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

export default {
  wrapper : ValidMeReact,
  validate : validate
}


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
