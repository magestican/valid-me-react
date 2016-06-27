/* eslint-disable import/default */

import React from 'react';
import {render} from 'react-dom';

class HelloWidget extends React.Component{
  constructor(props) {
    super(props);
  }

  render() {
    return <div className="widget">Hi </div>;
    }


      main(){
            return {
              restrict: 'A',
              scope: false,
              link: function(scope, element, attrs, controllers) {

                //dont do anything if the element wasnt compiled yet
                if (element[0].localName == "bttn")
                  return;
                if (element[0].localName == "text:area")
                  return;
                if (element[0].localName == "upload:button")
                  return;
                if (element[0].localName == "table:td")
                  return;
                if (element[0].localName == "upload-button")
                  return;
                if (attrs.validmeaction == "") {
                  throw RegExp("Error : all validme references must have a validmeaction on which to be validated");
                  return;
                }

                var model = globalService.currentControllerModel;
                //this is to avoid validating other pages than the current one
                if (globalService.currentController == undefined) {
                  globalService.currentController = scope.controllerName;
                } else if (globalService.currentController != scope.controllerName) {
                  globalService.currentController = scope.controllerName;
                  for (var property in globalService.watcher) {
                    if (globalService.watcher.hasOwnProperty(property)) {
                      globalService.watcher[property]();
                    }
                  }
                  delete globalService.wrapper;
                  delete globalService.watcher;
                  delete globalService.validMeQueue;
                  delete globalService.turnOf;
                }

                globalService.wrapper = globalService.wrapper == undefined ? [] : globalService.wrapper;
                globalService.validMeQueue = globalService.validMeQueue == undefined ? [] : globalService.validMeQueue;
                globalService.watcher = globalService.watcher == undefined ? {} : globalService.watcher;
                globalService.turnOf = globalService.turnOf == undefined ? {} : globalService.turnOf;
                var index = globalService.validMeQueue.length;

                //add this validation item to the global queue

                globalService.validMeQueue.push(function(element, attrs) {

                    var data = Helper.functionName(this);
                    //this means is a radio button or a  checkbox
                    var value = element.val();

                    var result = {
                      message: "",
                      element: {},
                      good: true,
                      value: value
                    }

                    if (element.attr("type") == "radio" || element.attr("type") == "checkbox") {
                      value = $(element)[0].checked.toString();
                      if (value == "true" && attrs.validmenotrue == undefined) {
                        return result;
                      }
                    }


                    if (attrs.validmefor != undefined && attrs.validmefor != "") {

                      var ruleArray = attrs.validmefor.replace(" ", "").split("@");
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
                      if (attrs.validmeoptional != undefined && value == "") {
                        return result;
                      }
                      //a reference to an old element is kept sometimes by angular..
                      //TODO : fix what the previous comment says
                      if (!$.contains(document, element[0])) {
                        return result;
                      }

                      if (validRules.type == "text") {

                        var regex = new RegExp("^[0-9(\\s)]+$");

                        if (validRules.rule != undefined && (validRules.rule == "" || validRules.rule == "alphanumeric")) {

                          if (regex.test(value)) {
                            result.good = false;
                            result.message = scope.currentLang.ERROR.onlyAlphanumeric;
                            return result;
                          } else if (value != "") {
                            result.good = true;
                            return result;
                          } else {
                            result.good = false;
                            result.message = scope.currentLang.ERROR.cannotBeEmpty;
                            return result;
                          }
                        }
                      }
                      if (validRules.type == "numeric") {
                        var part1 = "^[";
                        var part2 = "]+$";


                        var regex = new RegExp(part1 + "0-9" + part2);

                        if (attrs.validmemessage != undefined && attrs.validmemessage != "")
                          result.message = attrs.validmemessage;

                        var condition2 = regex.test(value);
                        var condition1 = validRules.rule.contains("$value") && condition2 ? eval(validRules.rule.replace("$value", value)) : true;
                        var extraValidation = validRules.rule != undefined && regex.test(validRules.rule) ? true : false;

                        if (value != "" && condition1 && condition2) {
                          if (validRules.rule != undefined && validRules.rule != "") {
                            if (value == "0") {
                              result.good = false;
                              result.message = "0 is not a valid value for this field"
                              return result;
                            } else {
                              if (extraValidation && value.length > validRules.rule) {
                                result.good = false;
                                result.message = attrs.validmemessage != undefined ? attrs.validmemessage : "The limit of numbers in this field is " + validRules.rule + " please adjust it"
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
                            result.message = scope.currentLang.ERROR.cannotBeEmpty;
                          else {
                            if (!condition1)
                              result.message = attrs.validmemessage != undefined ? attrs.validmemessage : "This field should contain only numbers";
                            else if (condition1 && !condition2) {
                              result.message = "This field should contain only numbers";

                            }
                          }
                          result.good = false;
                          return result;
                        }
                      }
                      if (validRules.type == "url") {

                        var urlValid = new RegExp(/^(?:(ht|f)tp(s?)\:\/\/)?[a-z0-9-\.]+\.[a-z]{2,4}\/?([^\s<>\#%"\,\{\}\\|\\\^\[\]`]+)?$/);
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

                          var part1 = "^[";
                          var part2 = "]+$";
                          var regex = new RegExp(part1 + validRules.rule + part2);
                          if (value != "" && regex.test(value)) {
                            result.message = "Value " + value + " is a number";

                            result.good = true;
                            return result;
                          } else {
                            if (value == "")
                              result.message = scope.currentLang.ERROR.cannotBeEmpty;
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
                          result.message = scope.currentLang.ERROR.cannotBeEmpty;
                          result.good = false;
                          return result;
                        }
                        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
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
                          result.message = scope.currentLang.ERROR.isRequired;
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
                          if (attrs.validmemessage != undefined && attrs.validmemessage != "")
                            result.message = attrs.validmemessage;
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
                            result.message = attrs.validmemessage != undefined ? attrs.validmemessage : "";
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
                  //inject data into function
                globalService.validMeQueue[index].element = element;
                globalService.validMeQueue[index].attrs = attrs;
                globalService.validMeQueue[index].index = index;
                globalService.validMeQueue[index].errorActionVisible = false;

                globalService.validMeQueue[index].toggleError = globalService.validMeQueue[index].showError = function() {
                  var el = globalService.validMeQueue[index.toString()].element
                  if (!angular.isUorN(globalService.validMeQueue[index].attrs.validmeselectthirdparent))
                    possibleLabel = el.parent().parent().parent().find("label:first");
                  else if (!angular.isUorN(globalService.validMeQueue[index].attrs.validmeselectfourthparent))
                    possibleLabel = el.parent().parent().parent().parent().find("label:first");
                  else
                    possibleLabel = el.parent().parent().find("label:first");

                  if (possibleLabel.length > 0) {
                    globalService.validMeQueue[index.toString()].errorActionVisible = true;
                    scope.safeApply();
                  }
                }
                element[0].onclick = globalService.validMeQueue[index].showError
                globalService.validMeQueue[index].validmeaction = attrs.validmeaction != undefined ? attrs.validmeaction : "";
                globalService.validMeQueue[index].errorTemplate = '<div ng-show="globalService.validMeQueue[' + index.toString() + '].errorActionVisible" class="error-label"><label style="text-align:left" class="error-color control-label bold" ng-cloak>{{errorMessage' + index.toString() + '}}</label></div>';
                globalService.validMeQueue[index].errorCheckmarkTemplate = '<i ng-click="globalService.validMeQueue[' + index.toString() + '].toggleError()" class="warning big circle icon error-checkmark"></i>';

                window.globalService = globalService;

                function codeInjector(validMeAction) {
                  //check if the action we are asked to validate is undefined or if we already have wrapped ourself around it, in which case dont do it again
                  if (eval("scope." + validMeAction) != undefined && eval("scope." + validMeAction).toString().indexOf("scope.$emit(validMeAction.replace(") < 0) {

                    //do not create the same unbiding/validation-triggering function twice
                    if (globalService.turnOf[validMeAction.replace('.', '')] == undefined) {
                      //create an observer waiting for someone to raise a Checkups event
                      globalService.turnOf[validMeAction.replace('.', '')] = scope.$on(validMeAction.replace('.', '') + "Checkups", function(event, parameters) {

                        var targetButton = parameters[2][0] != undefined ? parameters[2][0].target : null;
                        var errored = false;
                        var firstErroredElement = [];
                        if (parameters[2] && parameters[2][0] != "canceled") {
                          //execute queue
                          if (globalService.validMeQueue.forEach != undefined) {
                            var lastIndex = 0;

                            for (var i = 0; i < globalService.validMeQueue.length; i++) {
                              var validMeTask = globalService.validMeQueue[i];

                              if (validMeTask.validmeaction.indexOf(parameters[3]) > -1) {
                                var theresult = validationTask(validMeTask, undefined, true);
                                if (!theresult.good) {
                                  //this is to make certain we are only marking as errored the optional values IF they have a value
                                  if (validMeTask.attrs.validmeoptional != undefined) {
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
                            if (!errored && globalService.validMeQueue.length == lastIndex + 1) {
                              parameters[0].apply(parameters[1], parameters[2])
                            } else {
                              $(targetButton).toggleClass("error-shaking", true)
                              setTimeout(function() {
                                  $(targetButton).toggleClass("error-shaking", false);
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
                      });

                      var name = "functionWrapper" + validMeAction.split(".").join("");


                      if (globalService.wrapper[name] == undefined && eval("scope." + validMeAction).toString().indexOf("scope.$emit(validMeAction.replace(") < 0) {


                        //**CODE INJECTION PROCESS**//
                        var members = "scope";
                        angular.forEach(validMeAction.split('.'), function(member) {
                          members += '.' + member;
                        })

                        //wrap function to inject emit at the previous to function execution
                        var watchingFunction = eval(members);
                        globalService.wrapper[name] = function functionWrapper(evt) {

                            //execute validation before anything else, then execute method over which we are looking
                            scope.$emit(validMeAction.replace('.', '') + "Checkups", [globalService.wrapper[name].watchingFunction, this, arguments, validMeAction]);
                          }
                          //set the watching function for nesting purposes
                        globalService.wrapper[name].watchingFunction = watchingFunction;

                        eval("scope." + validMeAction + ".modified = true");

                        eval(members + " = globalService.wrapper." + name);
                      }
                    }
                  } else {
                    //wait until the function exists
                    if (globalService.watcher[validMeAction.replace(".", "") + "watcher"] == undefined) {
                      //EL BUG ES QUE ESTOY HACIEND WATCH SOLO SOBRE UNA VARIABLE AL MISMO TIEMPO NO MULTIPLES
                      var members = "scope";
                      angular.forEach(validMeAction.split('.'), function(member) {
                        members += '["' + member + '"]';
                      })

                      globalService.watcher[validMeAction.replace(".", "") + "watcher"] = scope.$watch(members, function(value) {

                        if (scope[validMeAction] != undefined && eval("scope." + validMeAction).toString().indexOf("scope.$emit(validMeAction.replace(") < 0) {
                          codeInjector(validMeAction);
                          globalService.watcher[validMeAction.replace(".", "") + "watcher"]();
                        } else {
                          setTimeout(function() {
                            if (eval(members) != undefined) {
                              codeInjector(validMeAction);
                            }
                          }, 500)
                        }
                      })
                    }
                  }
                }

                function waiter(handler, shouldRunHandlerOnce, isChild) {
                  var found = 'found';
                  var $this = $(this.selector);
                  var $elements = $this.not(function() {
                    return $(this).data(found);
                  }).each(handler).data(found, true);

                  if (!isChild) {
                    (window.waitUntilExists_Intervals = window.waitUntilExists_Intervals || {})[this.selector] =
                    window.setInterval(function() {
                      $this.waitUntilExists(handler, shouldRunHandlerOnce, true);
                    }, 500);
                  } else if (shouldRunHandlerOnce && $elements.length) {
                    window.clearInterval(window.waitUntilExists_Intervals[this.selector]);
                  }

                  return $this;
                }
                if (attrs.validmeaction != undefined) {
                  angular.forEach(attrs.validmeaction.split('@'), codeInjector)
                }
                //ugly jquery like stuff
                var validationTask = function(validMeTask, reset, triggeredByButton, forceError, errorMessage) {

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
                    var result = validMeTask(validMeTask.element, validMeTask.attrs);

                    var successEvent;
                    var errorEvent;
                    if (validMeTask.attrs.validmeevent != undefined) {
                      var events = validMeTask.attrs.validmeevent.split('@');
                      successEvent = events[0];
                      errorEvent = events[1];
                    }

                    if ((!result.good && reset == undefined) || forceError == true) {


                      var toContinue = true

                      //only add error markup if its really needed
                      if (triggeredByButton != undefined && validMeTask.attrs.validmeoptional != undefined) {
                        toContinue = false;
                      }
                      if (toContinue) {

                        if (validMeTask.attrs.validmenored == undefined)
                          validMeTask.element.toggleClass('error-border', true);


                        if (errorMessage != undefined)
                          result.message = errorMessage;

                        scope['errorMessage' + validMeTask.index.toString()] = result.message;


                        //do not append again
                        if (validMeTask.element.parent().parent().find(".error-label").length == 0) {

                          if (result.message != "") {
                            var errorTemplate = angular.element(validMeTask.errorTemplate);
                            $compile(errorTemplate)(scope);
                            validMeTask.element.parent().parent().append(errorTemplate);
                            var checkmarkTemplate = angular.element(validMeTask.errorCheckmarkTemplate);
                            $compile(checkmarkTemplate)(scope);
                            $(validMeTask.element).parent().append(checkmarkTemplate)
                          }

                          //change left label (if exists) to have a red color
                          var possibleLabel = {};

                          if (validMeTask.attrs.validmeselectthirdparent != undefined)
                            possibleLabel = validMeTask.element.parent().parent().parent().find("label:first");
                          else if (validMeTask.attrs.validmeselectfourthparent != undefined)
                            possibleLabel = validMeTask.element.parent().parent().parent().parent().find("label:first");
                          else
                            possibleLabel = validMeTask.element.parent().parent().find("label:first");

                          //if child exists
                          if (possibleLabel.length > 0) {
                            if (validMeTask.attrs.validmenocolor == undefined) {
                              possibleLabel.toggleClass('error-color', true);;
                              validMeTask.borderErrorAdded = true;
                            }
                          }
                        }
                        if (errorEvent != undefined && errorEvent != null) {
                          eval("scope." + errorEvent + "()");
                        }

                        //THIS IS A FIX BECAUSE ANGULAR DOESNT ALWAYS UPDATE THE VALUES IN THE SCOPE
                        if (validMeTask.element.parent().parent().find(".error-label") != undefined) {
                          if (errorMessage != undefined)
                            result.message = errorMessage;
                          validMeTask.element.parent().parent().find(".error-label").children().text(result.message);
                          scope.safeApply();
                        }

                      }

                    } else {
                      validMeTask.element.toggleClass('error-border', false);
                      validMeTask.element.parent().parent().find(".error-label").remove();
                      validMeTask.element.parent().parent().find(".error-checkmark").remove();
                      var possibleLabel = {}
                      if (validMeTask.attrs.validmeoptional != undefined) {
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
                        eval("scope." + successEvent + "()");
                      }

                    }
                    return result
                  }
                  //pre-emptive checkings
                  //if (!(element.attr("type") == "checkbox")) {

                if (element.attr("datepicker") == undefined) {

                  $(element).on('blur', function() {
                    scope.safeApply();
                    globalService.validMeQueue[index].blurhappened = true;
                    validationTask(globalService.validMeQueue[index]);
                  });
                  $(element).on('input', function() {

                    if (globalService.validMeQueue[index].blurhappened == true) {
                      validationTask(globalService.validMeQueue[index]);
                      scope.safeApply();
                    }

                  });
                }

                $(element).on('change', function() {

                  if (globalService.validMeQueue[index].blurhappened == true) {
                    validationTask(globalService.validMeQueue[index]);
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

                //                if (validMeTask.attrs.validmefor == task.attrs.validmefor) {
                //                    validationTask(validMeTask, true);
                //                }

                //            }
                //        }
                //    });
                //}


                globalService.resetValidations = function(notUgly, smart, groupValidation, element) {

                  if (notUgly) {
                    if (globalService.validMeQueue.forEach != undefined) {

                      for (var i = 0; i < globalService.validMeQueue.length; i++) {
                        var validMeTask = globalService.validMeQueue[i];
                        validationTask(validMeTask);
                      }
                    }
                  } else if (smart) {
                    for (var i = 0; i < globalService.validMeQueue.length; i++) {
                      function timer(id) {
                        var _this = this;
                        this.id = id;
                        this.execute = function() {
                          var validMeTask = globalService.validMeQueue[_this.id];
                          if (!$(validMeTask.element).is(':visible')) {
                            validationTask(validMeTask, true);
                          }
                        }
                      }
                      setTimeout(new timer(i).execute, 100)
                    }

                  } else if (groupValidation != undefined) {

                    for (var i = 0; i < globalService.validMeQueue.length; i++) {

                      var validMeTask = globalService.validMeQueue[i];
                      if (validMeTask.element.attr("vttrigger") == groupValidation) {

                        function timer(id) {
                          var _this = this;
                          this.id = id;
                          this.execute = function() {
                            var validMeTask = globalService.validMeQueue[_this.id];
                            validationTask(validMeTask, true);
                          }
                        }
                        setTimeout(new timer(i).execute, 100)


                      }
                    }
                  } else if (element != undefined) {

                    for (var i = 0; i < globalService.validMeQueue.length; i++) {

                      var validMeTask = globalService.validMeQueue[i];

                      if (validMeTask.attrs.ngModel != undefined) {
                        if (validMeTask.attrs.ngModel.split(".name").join("") == element.attr("modelBind")) {
                          validationTask(validMeTask, true);
                        } else if (validMeTask.attrs.ngModel.split(".name").join("") == element.attr("ng-model")) {
                          validationTask(validMeTask, true);
                        } else if (validMeTask.attrs.ngModel.split(".name").join("") == element.attr("ngmodel")) {
                          validationTask(validMeTask, true);
                        }
                      }
                    }
                  } else {
                    if (globalService.validMeQueue.forEach != undefined) {

                      for (var i = 0; i < globalService.validMeQueue.length; i++) {
                        var validMeTask = globalService.validMeQueue[i];
                        validationTask(validMeTask, true);
                      }
                    }
                  }
                }

                globalService.areThereErrors = function() {
                  var res = document.getElementsByClassName("error-checkmark");
                  return res != undefined && res != null && res.length > 0;
                }

                globalService.executeValidationOnElement = function(element, message) {

                  for (var i = 0; i < globalService.validMeQueue.length; i++) {

                    var validMeTask = globalService.validMeQueue[i];
                    if (validMeTask.attrs.ngModel != undefined) {
                      if (validMeTask.attrs != undefined && validMeTask.attrs.ngModel != undefined) {
                        if (validMeTask.attrs.ngModel.split(".name").join("") == element.attr("modelBind")) {
                          return validationTask(validMeTask, false, false, true, message);
                        } else if (validMeTask.attrs.ngModel.split(".name").join("") == element.attr("ng-model")) {
                          return validationTask(validMeTask, false, false, true, message);
                        } else if (validMeTask.attrs.ngModel.split(".name").join("") == element.attr("ngmodel")) {
                          return validationTask(validMeTask, false, false, true, message);
                        }
                      }
                    }
                  }
                }


              }
            };
      }
}

  render(
    <HelloWidget />,
    document.getElementById('app')
  );
