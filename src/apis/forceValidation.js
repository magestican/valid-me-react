
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
module.exports = {
  forceValidation : forceValidation
}
