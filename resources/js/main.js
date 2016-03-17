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
        default:
          // TODO: Need to implement POST request to DB
          //       for Tasks and Workshops
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
    if (type == "Tasks" || type == "Workshops") {
      // TODO: Need to implement POST request to DB for Tasks and Workshops
      activityType = type;
      type = "activities"
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
          if (fieldSets[i].childNodes[1].classList.contains("badgeList")) {
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
          postObj[key.toLowerCase()] = inputVal;
        }
      }
      if (name != "")
        postObj.name = name;
    }

    $.ajax({
      type: "POST",
      url: type.toLowerCase(),
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

  var img_fieldset = document.createElement("fieldset");
  img_fieldset.setAttribute("class",
                            "form-group " + classStr.toLowerCase());

  var img_label = document.createElement("label");
  img_label.setAttribute("for", "badgeImg");
  img_label.innerHTML = "Img";

  var img_input = document.createElement("input");
  img_input.setAttribute("type", "badgeImg");
  img_input.setAttribute("class", "form-control");
  img_input.setAttribute("id", "badgeImgId");
  img_input.setAttribute("placeholder", "Enter Image Resource Name");

  img_fieldset.appendChild(img_label);
  img_fieldset.appendChild(img_input);
  form.appendChild(img_fieldset);

  var desc_fieldset = document.createElement("fieldset");
  desc_fieldset.setAttribute("class",
                             "form-group " + classStr.toLowerCase());

  var desc_label = document.createElement("label");
  desc_label.setAttribute("for", "badgeDesc");
  desc_label.innerHTML = "Description";

  var desc_textarea = document.createElement("textarea");
  desc_textarea.setAttribute("class", "form-control");
  desc_textarea.setAttribute("id", "badgeDescId");
  desc_textarea.setAttribute("placeholder", "Enter Description");
  desc_textarea.setAttribute("rows", "5");

  desc_fieldset.appendChild(desc_label);
  desc_fieldset.appendChild(desc_textarea);
  form.appendChild(desc_fieldset);
}

function showEarnersForm(classStr) {
  var form = document.getElementById("main-form");

  var img_fieldset = document.createElement("fieldset");
  img_fieldset.setAttribute("class",
                            "form-group " + classStr.toLowerCase());

  var img_label = document.createElement("label");
  img_label.setAttribute("for", "earnersImg");
  img_label.innerHTML = "Img";

  var img_input = document.createElement("input");
  img_input.setAttribute("type", "earnersImg");
  img_input.setAttribute("class", "form-control");
  img_input.setAttribute("id", "earnersImgId");
  img_input.setAttribute("placeholder", "Enter Image Resource Name");

  img_fieldset.appendChild(img_label);
  img_fieldset.appendChild(img_input);
  form.appendChild(img_fieldset);

  var location_fieldset = document.createElement("fieldset");
  location_fieldset.setAttribute("class",
                                 "form-group " + classStr.toLowerCase());

  var location_label = document.createElement("label");
  location_label.setAttribute("for", "earnersLocation");
  location_label.innerHTML = "Location";

  var location_input = document.createElement("input");
  location_input.setAttribute("type", "earnersLocation");
  location_input.setAttribute("class", "form-control");
  location_input.setAttribute("id", "earnersLocationId");
  location_input.setAttribute("placeholder", "Enter Location/Address");

  location_fieldset.appendChild(location_label);
  location_fieldset.appendChild(location_input);
  form.appendChild(location_fieldset);

  var contact_fieldset = document.createElement("fieldset");
  contact_fieldset.setAttribute("class",
                                "form-group " + classStr.toLowerCase());

  var contact_label = document.createElement("label");
  contact_label.setAttribute("for", "earnersContact");
  contact_label.innerHTML = "Contact";

  var contact_input = document.createElement("input");
  contact_input.setAttribute("type", "earnersContact");
  contact_input.setAttribute("class", "form-control");
  contact_input.setAttribute("id", "earnersContactId");
  contact_input.setAttribute("placeholder", "Enter Contact Email");

  contact_fieldset.appendChild(contact_label);
  contact_fieldset.appendChild(contact_input);
  form.appendChild(contact_fieldset);

  var badgeList_fieldset = document.createElement("fieldset");
  badgeList_fieldset.setAttribute("class",
                                  "form-group " + classStr.toLowerCase());

  var badgeList_label = document.createElement("label");
  badgeList_label.setAttribute("for", "earnersBadgeList");
  badgeList_label.innerHTML = "Badges";

  var badgeList_input = document.createElement("input");
  badgeList_input.setAttribute("type", "earnersBadgeList");
  badgeList_input.setAttribute("class", "form-control badgeList");
  badgeList_input.setAttribute("id", "earnersBadgeListId");
  badgeList_input.setAttribute("placeholder", "Enter List of Badge Ids "
                               + "(example: 1, 2, 3, 4)");

  badgeList_fieldset.appendChild(badgeList_label);
  badgeList_fieldset.appendChild(badgeList_input);
  form.appendChild(badgeList_fieldset);
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

$(document).ready(main);
