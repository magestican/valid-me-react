let isHidden = (el) => {
  return (el.offsetParent === null)
}

let isVisible = (el) => {
  return !isHidden(el);
}

let enableActionButton = (group) => {
  $('[data-group*="' + group + '"]').toggleClass('disable', false)
}
let disableActionButton = (group) => {
  $('[data-group*="' + group + '"]').toggleClass('disable', true)
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

module.exports= {
  isHidden,
  isVisible,
  groupValidation
}
