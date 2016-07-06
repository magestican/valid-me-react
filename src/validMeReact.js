/* eslint-disable import/default */

import React from 'react';
import ReactDom from 'react-dom';

export class ValidMeReact extends React.Component {

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
      resultElement = this.main(input);
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
      return <div>{copies} <div data-show={this.validMeItem.showErrorTemplate}>{this.validMeItem.errorTemplate}</div></div>;
    }
    main(input) {



      let props = this.props;
      if (props.validmeactions == "") {
        throw RegExp("Error : all validme references must have a validmeaction on which to be validated");
        return;
      }
      let element = $(input); //wrap input around jquery to have jquery helpers
      let validMeManager;

      if (!window.validMeReact)
        window.validMeReact = {
          validMeManager: {}
        };
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
                  result.message = validMeManager.ERROR.onlyAlphanumeric;
                  return result;
                } else if (value != "") {
                  result.good = true;
                  return result;
                } else {
                  result.good = false;
                  result.message = validMeManager.ERROR.cannotBeEmpty;
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
              let condition1 = validRules.rule.contains("$value") && condition2 ? eval(validRules.rule.replace("$value", value)) : true;
              let extraValidation = validRules.rule != undefined && regex.test(validRules.rule) ? true : false;

              if (value != "" && condition1 && condition2) {
                if (validRules.rule != undefined && validRules.rule != "") {
                  if (value == "0") {
                    result.good = false;
                    result.message = "0 is not a valid value for this field"
                    return result;
                  } else {
                    if (extraValidation && value.length > validRules.rule) {
                      result.good = false;
                      result.message = props.validmemessage != undefined ? props.validmemessage : "The limit of numbers in this field is " + validRules.rule + " please adjust it"
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
                  result.message = validMeManager.ERROR.cannotBeEmpty;
                else {
                  if (!condition1)
                    result.message = props.validmemessage != undefined ? props.validmemessage : "This field should contain only numbers";
                  else if (condition1 && !condition2) {
                    result.message = "This field should contain only numbers";

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
                  result.message = "This field should contain a valid URL";
                else
                  result.message = "This field should contain a valid URL";
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
                    result.message = validMeManager.ERROR.cannotBeEmpty;
                  else
                    result.message = "This field should contain only numbers";
                  result.good = false;
                  return result;
                }
              } else {
                throw RegExp("You specified a number validation but didnt provide which set of numbers to validate");
              }
            }
            if (validRules.type == "email") {

              if (value == "") {
                result.message = validMeManager.ERROR.cannotBeEmpty;
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
                result.message = "You should input a valid email";
                return result;
              }

            }
            if (validRules.type == "required") {
              if (value == "" || value == "No file selected") {
                result.message = validMeManager.ERROR.isRequired;
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
                result.message = "You must select an option";
                result.good = false;
                return result;
              } else if (value == "- Select -") {
                result.message = "You must select an option";
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
                  result.message = "You must check this option"
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
        })
      validMeManager.validMeQueue.push(newQueueEventTask);
      this.validMeItem = validMeManager.validMeQueue[index].element = element;
      validMeManager.validMeQueue[index].props = props;
      validMeManager.validMeQueue[index].index = index;
      validMeManager.validMeQueue[index].errorActionVisible = false;

      validMeManager.validMeQueue[index].toggleError = validMeManager.validMeQueue[index].showError = () => {
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
      validMeManager.validMeQueue[index].validmeactions = props.validmeactions != undefined ? props.validmeactions : "";
      validMeManager.validMeQueue[index].errorTemplate = <div data-show={validMeReact.validMeManager.validMeQueue[index.toString()].errorActionVisible} class="error-label"><label style="text-align:left" class="error-color control-label bold">{errorMessage + index.toString()}</label></div>;
      validMeManager.validMeQueue[index].errorCheckmarkTemplate = <i onClick={validMeManager.validMeQueue[index.toString()].toggleError} class="warning big circle icon error-checkmark">!!</i>;

      let codeInjector = (validMeAction) => {
        //check if the action we are asked to validate is undefined or if we already have wrapped ourself around it, in which case dont do it again
        if (typeof(validMeAction) === 'function') {
          if (validMeManager.validMeActionPreExecution == undefined) { //do not create the same unbiding/validation-triggering function twice
            //create an observer waiting for someone to raise a Checkups event
            validMeManager.validMeActionPreExecution = (event, parameters) => {
              debugger
              var targetButton = parameters[2][0] != undefined ? parameters[2][0].target : null;
              var errored = false;
              var firstErroredElement = [];
              if (parameters[2] && parameters[2][0] != "canceled") {
                //execute queue
                if (validMeManager.validMeQueue.forEach != undefined) {
                  var lastIndex = 0;

                  for (var i = 0; i < validMeManager.validMeQueue.length; i++) {
                    var validMeTask = validMeManager.validMeQueue[i];

                    if (validMeTask.validmeactions.indexOf(parameters[3]) > -1) {
                      var theresult = validationTask(validMeTask, undefined, true);
                      if (!theresult.good) {
                        //this is to make certain we are only marking as errored the optional values IF they have a value
                        if (validMeTask.props.validmeoptional != undefined) {
                          if (theresult.value != "") {
                            errored = true
                            if (firstErroredElement.length == 0)
                              firstErroredElement = validMeTask.element;
                          }
                        } else {
                          errored = true;
                          if (firstErroredElement.length == 0)
                            firstErroredElement = validMeTask.element;
                        }
                        //scroll to element
                      }

                    }
                    lastIndex = i;
                  }
                  //continue if errored false
                  if (!errored && validMeManager.validMeQueue.length == lastIndex + 1) {
                    parameters[0].apply(parameters[1], parameters[2])
                  } else {
                    targetButton.toggleClass("error-shaking", true)
                    setTimeout(function() {
                        targetButton.toggleClass("error-shaking", false);
                      }, 350)
                      //scroll to element
                    if (firstErroredElement.length > 0) {
                      if ($('.sidebar').length > 0)
                        $('.sidebar').scrollTo(firstErroredElement[0], {
                          offsetTop: '50'
                        })
                      else
                        $('body').scrollTo(firstErroredElement[0], {
                          offsetTop: '50'
                        })
                    }
                  }
                }
              } else {
                parameters[0].apply(parameters[1], parameters[2])
              }
            }
            debugger
            let name = "functionWrapper" + functionName(validMeAction);

            //**CODE INJECTION PROCESS**//

            //wrap function to inject emit at the previous to function execution
            let watchingFunction = eval(validMeAction);
            validMeManager.wrapper[name] = function functionWrapper(evt) {

                //execute validation before anything else, then execute method over which we are looking
                scope.$emit(validMeAction.replace('.', '') + "Checkups", [validMeManager.wrapper[name].watchingFunction, this, arguments, validMeAction]);
              }
              //set the watching function for nesting purposes
            validMeManager.wrapper[name].watchingFunction = watchingFunction;

            eval("scope." + validMeAction + ".modified = true");

            eval(members + " = validMeManager.wrapper." + name);
          }
        }
      }
      angular.forEach(props.validmeactions, codeInjector)

      //ugly jquery like stuff
      var validationTask = (validMeTask, reset, triggeredByButton, forceError, errorMessage) => {

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

              //do not append again
              if (validMeTask.element.parent().parent().find(".error-label").length == 0) {

                if (result.message != "") {
                  validMeTask.showErrorTemplate = true;
                  validMeTask.showErrorCheckmarkTemplate = true;
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
            validMeTask.element.parent().parent().find(".error-label").remove();
            validMeTask.element.parent().parent().find(".error-checkmark").remove();
            var possibleLabel = {}
            if (validMeTask.props.validmeoptional != undefined) {
              possibleLabel = validMeTask.element.parent().parent().find("label:first");
            } else {
              possibleLabel = validMeTask.element.parent().parent().parent().find("label:first");
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
          return result
        }
        //pre-emptive checkings
        //if (!(element.attr("type") == "checkbox")) {

      if (element.attr("datepicker") == undefined) {

         element.on('blur', function() {
          scope.safeApply();
          validMeManager.validMeQueue[index].blurhappened = true;
          validationTask(validMeManager.validMeQueue[index]);
        });
         element.on('input', function() {
          if (validMeManager.validMeQueue[index].blurhappened == true) {
            validationTask(validMeManager.validMeQueue[index]);
            scope.safeApply();
          }

        });
      }
      element.on('change', function() {

        if (validMeManager.validMeQueue[index].blurhappened == true) {
          validationTask(validMeManager.validMeQueue[index]);
          scope.safeApply();
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


      validMeManager.resetValidations = function(notUgly, smart, groupValidation, element) {

        if (notUgly) {
          if (validMeManager.validMeQueue.forEach != undefined) {

            for (var i = 0; i < validMeManager.validMeQueue.length; i++) {
              var validMeTask = validMeManager.validMeQueue[i];
              validationTask(validMeTask);
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
                  validationTask(validMeTask, true);
                }
              }
            }
            setTimeout(new timer(i).execute, 100)
          }

        } else if (groupValidation != undefined) {

          for (var i = 0; i < validMeManager.validMeQueue.length; i++) {

            var validMeTask = validMeManager.validMeQueue[i];
            if (validMeTask.element.attr("vttrigger") == groupValidation) {

              function timer(id) {
                var _this = this;
                this.id = id;
                this.execute = function() {
                  var validMeTask = validMeManager.validMeQueue[_this.id];
                  validationTask(validMeTask, true);
                }
              }
              setTimeout(new timer(i).execute, 100)
            }
          }
        } else if (element != undefined) {

          for (var i = 0; i < validMeManager.validMeQueue.length; i++) {

            var validMeTask = validMeManager.validMeQueue[i];

            if (validMeTask.props.ngModel != undefined) {
              if (validMeTask.props.ngModel.split(".name").join("") == element.attr("modelBind")) {
                validationTask(validMeTask, true);
              } else if (validMeTask.props.ngModel.split(".name").join("") == element.attr("ng-model")) {
                validationTask(validMeTask, true);
              } else if (validMeTask.props.ngModel.split(".name").join("") == element.attr("ngmodel")) {
                validationTask(validMeTask, true);
              }
            }
          }
        } else {
          if (validMeManager.validMeQueue.forEach != undefined) {

            for (var i = 0; i < validMeManager.validMeQueue.length; i++) {
              var validMeTask = validMeManager.validMeQueue[i];
              validationTask(validMeTask, true);
            }
          }
        }
      }

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
                return validationTask(validMeTask, false, false, true, message);
              } else if (validMeTask.props.ngModel.split(".name").join("") == element.attr("ng-model")) {
                return validationTask(validMeTask, false, false, true, message);
              } else if (validMeTask.props.ngModel.split(".name").join("") == element.attr("ngmodel")) {
                return validationTask(validMeTask, false, false, true, message);
              }
            }
          }
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
  return angular.isUndefined(val) || val === null
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
