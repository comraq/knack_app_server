function main() {
  var dataType = document.getElementById("dataType");
  showEarnersForm("Earners");
  $("#dataType").on("change", function() {
    var type = dataType.options[dataType.selectedIndex].value;
    if (document.getElementsByClassName(type.toLowerCase()).length == 0) {
      removeForms();
      switch(type) {
        case "Badges":
          showBadgesForm(type);
          break;
        case "Earners":
          showEarnersForm(type);
          break;
        case "Tasks":
        case "Workshops":
          showActivitiesForm(type);
          break;
        default:
          alert("Input forms for '" + type + "' are not yet implemented");
      }
    }
  });

  $(".post-button").click(function() {
    var type = dataType.options[dataType.selectedIndex].value,
        del = document.getElementById("delCheck").checked,
        id = document.getElementById("dataId").value,
        name = document.getElementById("dataName").value,
        activityType;
    if (id == "" || isNaN(id)) {
      alert("Invalid ID! ID must be a positive number!");
      return;
    }

    var postObj = {id: parseInt(id)};
    if (del)
      postObj["delete"] = true;
    else {
      var fieldSets = document.getElementsByClassName(type.toLowerCase());
      
      for (var i = 0; i < fieldSets.length; ++i) {
        var key = fieldSets[i].childNodes[0].innerHTML;
        var inputVal = fieldSets[i].childNodes[1].value;
        if (inputVal != "") {
          if (fieldSets[i].childNodes[1].classList.contains("badgesList")) {
            inputVal = inputVal.split(",");
            for (var j = 0; j < inputVal.length; ++j) {
              var result = parseInt(inputVal[j].trim());
              if (isNaN(result)) {
                alert("Badge IDs must be positive numbers!");
                return;
              } else
                inputVal[j] = result;
            }
          }
          postObj[key.toLowerCase().replace(/ /g, "_")] = inputVal;
        }
      }
      if (name != "")
        postObj.name = name;
    }

    if (type == "Tasks" || type == "Workshops") {
      activityType = type;
      type = "activities"
    }

    $.ajax({
      type: "POST",
      url: (activityType)? (type + "?type=" + activityType.toLowerCase())
                           : type.toLowerCase(),
      data: JSON.stringify(postObj),
      success: function() {
        alert("POST Request Success!");
      },
      error: function(textStatus, err) {
        if (textStatus["status"] == 200)
          alert("POST Request Successful!");
        else
          alert("POST Request Error! " + JSON.stringify(textStatus));
      },
      contentType: "application/json",
      dataType: "json"
    });
  });
}

function showBadgesForm(classStr) {
  var form = document.getElementById("main-form");

  addDOM(classStr, "Img", "Enter Image Resource Name",
         createInputDOM, form);
  addDOM(classStr, "Description", "Enter Description",
         createTextareaDOM, form);
}

function showEarnersForm(classStr) {
  var form = document.getElementById("main-form");

  addDOM(classStr, "Img", "Enter Image Resource Name",
         createInputDOM, form);
  addDOM(classStr, "Location", "Enter Location/Address",
         createInputDOM, form);
  addDOM(classStr, "Contact", "Enter Contact Email",
         createInputDOM, form);

  // Adding badgesList input DOM separately
  var badgesList_fieldset = createFieldsetDOM(classStr.toLowerCase());
  var badgesList_input = createInputDOM(classStr.toLowerCase(),
                                        "Badges",
                                        "Enter List of Badge Ids "
                                        + "(example: 1, 2, 3, 4)");
  badgesList_input.setAttribute("class", "form-control badgesList");

  badgesList_fieldset.appendChild(createLabelDOM(classStr.toLowerCase(),
                                                 "Badges"));
  badgesList_fieldset.appendChild(badgesList_input);
  form.appendChild(badgesList_fieldset);
}

function showActivitiesForm(classStr) {
  var form = document.getElementById("main-form");

  addDOM(classStr, "Employer", "Enter Employer Name",
         createInputDOM, form);
  addDOM(classStr, "Contact", "Enter Contact Email",
         createInputDOM, form);
  addDOM(classStr, "Location", "Enter Location/Address",
         createInputDOM, form);

  var badgesLabelText;
  if (classStr == "Tasks") {
    addDOM(classStr, "Salary", "Enter Remuneration Rate",
           createInputDOM, form);
    badgesLabelText = "Required Badges";
  } else
    badgesLabelText = "Awarded Badges";

  // Adding badgesList input DOM separately
  var badgesList_fieldset = createFieldsetDOM(classStr.toLowerCase());
  var badgesList_input = createInputDOM(classStr.toLowerCase(),
                                        badgesLabelText,
                                        "Enter List of Badge Ids "
                                        + "(example: 1, 2, 3, 4)");
  badgesList_input.setAttribute("class", "form-control badgesList");

  badgesList_fieldset.appendChild(createLabelDOM(classStr.toLowerCase(),
                                                 badgesLabelText));
  badgesList_fieldset.appendChild(badgesList_input);
  form.appendChild(badgesList_fieldset);

  addDOM(classStr, "Description", "Enter Description",
         createTextareaDOM, form);
}

function removeForms() {
  var inputs = document.getElementsByTagName("input");
  for (var i = 0; i < inputs.length; ++i)
    inputs[i].value = "";

  var form = document.getElementById("main-form");
  var child = document.getElementsByClassName("badges");
  if (child !== null) {
    while (child.length > 0)
      form.removeChild(child[0]);
  }

  child = document.getElementsByClassName("earners");
  if (child !== null) {
    while (child.length > 0)
      form.removeChild(child[0]);
  }

  child = document.getElementsByClassName("tasks");
  if (child !== null) {
    while (child.length > 0)
      form.removeChild(child[0]);
  }

  child = document.getElementsByClassName("workshops");
  if (child !== null) {
    while (child.length > 0)
      form.removeChild(child[0]);
  }
}

function addDOM(classStr, labelText, hintText, createDOMFunc, parentDOM) {
  classStr = classStr.toLowerCase();
  var fieldset = createFieldsetDOM(classStr);
  fieldset.appendChild(createLabelDOM(classStr, labelText));
  fieldset.appendChild(createDOMFunc(classStr, labelText, hintText));
  parentDOM.appendChild(fieldset);
}

function createFieldsetDOM(classStr) {
  var fieldset = document.createElement("fieldset");
  fieldset.setAttribute("class", "form-group " + classStr);
  return fieldset;
}

function createLabelDOM(classStr, labelText) {
  var label = document.createElement("label");
  label.setAttribute("for", classStr + labelText);
  label.innerHTML = labelText;
  return label;
}

function createInputDOM(classStr, labelText, hintText) {
  var type = classStr + labelText;
  var input = document.createElement("input");
  input.setAttribute("type", type);
  input.setAttribute("class", "form-control");
  input.setAttribute("id", type + "Id");
  input.setAttribute("placeholder", hintText);
  return input;
}

function createTextareaDOM(classStr, labelText, hintText) {
  var textarea = document.createElement("textarea");
  textarea.setAttribute("class", "form-control");
  textarea.setAttribute("id", classStr + labelText + "Id");
  textarea.setAttribute("placeholder", hintText);
  textarea.setAttribute("rows", "5");
  return textarea;
}

$(document).ready(main);
