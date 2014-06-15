var addNewShowing = false,
    editAccountName = "",
    accountList = [];

function onLoad() {
  var orgName = localStorage["organisation-name"];
  if (orgName) {
    connectToAccount(orgName);
  } else {
    document.getElementById("container").className = "error";
  }

  if(localStorage["organisation-list"]){
    accountList = JSON.parse(localStorage["organisation-list"]);
    for(var i=0; i < accountList.length; i++){
      insertSavedAccountToList(accountList[i].name, accountList[i].color);
    }
  }
  if (accountList.length < 1) showAddNewAccountEvent();

  document.getElementById("add_new_account").onclick=function(){
    showAddNewAccountEvent();
  };
  document.getElementById("cancel_new_project").onclick=function(){
    hideAddNewAccountEvent();
  };
  document.getElementById("curtain").onclick=function(){
    hideAddNewAccountEvent();
  };
  document.getElementById("remove_account").onclick=function(){
    removeAccount(editAccountName);
    hideAddNewAccountEvent();
  };

  document.getElementById("save_new_project").onclick=function(){
    addNewAccountEvent();
  };
  document.getElementById("new_project_name").onkeypress=function(evt){
    var evt  = (evt) ? evt : ((event) ? event : null); 
    if(evt.keyCode == 13){ addNewAccountEvent(); }
    if(evt.keyCode == 27){ hideAddNewAccountEvent(); }
  };

  document.getElementById("show_accounts_btn").onclick=function(){
    disconnectAccount();
  };

}
window.onload = onLoad();



function showAddNewAccountEvent(nameVal){
  if(!addNewShowing ){

      if(!nameVal){
        document.getElementById("create_project_title").textContent = "Add a New Account";
      } else {
        editAccountName = accountNameToID(nameVal);
        document.getElementById("create_project_title").textContent = "Edit Account";
        document.getElementById("deleteExisting").style.display = "block";
        document.getElementById("new_project_name").value = nameVal;
      }
      addNewShowing = true;
      
      slideAddNewAccount(true);
      fadeCurtain(true);
  }
}

function hideAddNewAccountEvent(){
	if( addNewShowing ){
      addNewShowing = false;
      slideAddNewAccount(false);
      fadeCurtain(false)
      editAccountName = "";
      document.getElementById("deleteExisting").style.display = "none";
  }
}

function fadeCurtain(fadeIn){
  var val = 0, delta = 0.1;
  if(!fadeIn) { val = 1; delta = -0.1; }
  else {
    document.getElementById("curtain").style.display = "block";
  }
  var interval = setInterval(function(){
    document.getElementById("curtain").style.opacity = val;
    val=val+delta;
    if(val <= 0) document.getElementById("curtain").style.display = "none";
    if(val >= 1 || val <= 0) { clearInterval(interval); }
  },1);
}

function slideAddNewAccount(slideIn){
  var val = -72, delta = 2;
  if(!slideIn) { val = 32; delta = -2; }
  var interval = setInterval(function(){
    document.getElementById("create_project").style.top = val+"px";
    val=val+delta;
    if(val >= 34 || val <= -72) { 
      if(val <= -70) document.getElementById("new_project_name").value = "";
      if(val >=  34) document.getElementById("new_project_name").focus();
      clearInterval(interval); 
    }
  },1);
}
                                        
function addNewAccountEvent(){
  var newAccountName = document.getElementById("new_project_name").value;
  newAccountName = newAccountName.replace("https://","").replace("http://","");
  newAccountName = newAccountName.split(".letsfreckle.com")[0];
  if((newAccountName != "" && GetElementInsideContainer("account-list", accountNameToID(newAccountName)) == null) || 
     (newAccountName != "" && accountNameToID(newAccountName) == accountNameToID(editAccountName)) ) {
    if(editAccountName == ""){
      addAccount(newAccountName);      
      hideAddNewAccountEvent();  
    } else {
      updateAccount(editAccountName, newAccountName);
      hideAddNewAccountEvent();
    }
    
  } else {
    accountNameErrorFlash();
  }
}

function GetElementInsideContainer(containerID, childID) {
    var elm = document.getElementById(childID);
    var parent = elm ? elm.parentNode : {};
    return (parent.id && parent.id === containerID) ? elm : null;
}

function accountNameErrorFlash(){
  var hexVal = 255, down = true, delta = 5;
  var interval = setInterval(function(){
    document.getElementById("new_project_name").style.backgroundColor = "rgb(255,"+hexVal+","+hexVal+")";
    if(down){
      hexVal=hexVal-delta;
      if(hexVal <= 150) down = false;
    } else {
      hexVal=hexVal+delta;
      if(hexVal >= 255) { 
        down = true; 
        document.getElementById("new_project_name").style.backgroundColor = "rgb(255,255,255)";
        document.getElementById("new_project_name").focus();
        clearInterval(interval);
      }        
    }
  },5);
}

function insertSavedAccountToList(name, color){
  var li = document.createElement("li");
  li.className = "project";
  li.id = accountNameToID(name);

  var div = document.createElement("div");
  div.className = "options";

  var a = document.createElement("a");
  a.className = "play icon-cog2";
  a.setAttribute("href","#");
  a.onclick = function(){
    showAddNewAccountEvent(this.parentNode.parentNode.getElementsByClassName("account-title")[0].textContent);
  }

  div.appendChild(a);
  li.appendChild(div);
  
  var h2 = document.createElement("h2");
  h2.onclick = function(){
    connectToAccount( this.parentNode.id.replace("id_","") );
  }
  h2.innerHTML = '<span class="project-name"><div class="color-box" style="background-color: '+color+'"></div><span class="account-title">'+name+'</span></span>';
  li.appendChild(h2);

  document.getElementById("account-list").appendChild(li);
}

var baseColors = ['#ef9655','#55c9ef','#ef5555','#f1f353','#bce162','#13a480','#ef63a2'];
function getRandomColor(name, color){
  return baseColors[getRandomInt(0,6)];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

Element.prototype.remove = function() {
  this.parentElement.removeChild(this);
}
NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
  for(var i = 0, len = this.length; i < len; i++) {
    if(this[i] && this[i].parentElement) {
      this[i].parentElement.removeChild(this[i]);
    }
  }
}


function addAccount(name){
  var randomColor = getRandomColor();
  insertSavedAccountToList(name, randomColor);
  accountList.push({name: name, color: randomColor});
  //Add to local storage.
  localStorage["organisation-list"] = JSON.stringify(accountList);
}

function removeAccount(name){
  document.getElementById(name).remove();
  for(var i=0; i<accountList.length; i++){
    if(accountNameToID(accountList[i].name) == name){
      accountList.splice(i, 1);
      break;
    }
  }
  //Remove from local storage.
  localStorage["organisation-list"] = JSON.stringify(accountList);
}

function updateAccount(oldName, newName){
  var updateID = oldName.split(' ').join('').toLowerCase()
  var liElement = document.getElementById(updateID);
  liElement.getElementsByClassName("account-title")[0].textContent = newName;
  liElement.id = accountNameToID(newName);
  //Update in local storage.
}

function accountNameToID(name){
  return "id_" + name.replace("https://","").replace(".letsfreckle.com/","").replace(".letsfreckle.com","")
             .split('!').join('').split(',').join('').split('/').join('').split('\\').join('')
             .split('[').join('').split(']').join('').split('{').join('').split('}').join('')
             .split('?').join('').split('.').join('').split(',').join('').split('$').join('')
             .split('#').join('').split('@').join('').split('%').join('').split('^').join('')
             .split('*').join('').split(' ').join('').toLowerCase();
}

function connectToAccount(name){
  document.getElementById("container").className = "";
  document.getElementById("timer").setAttribute("src","https://" + name + ".letsfreckle.com/timer");
  document.getElementById("show_accounts_btn").style.display = "block";
  localStorage["organisation-name"] = name;
}

function disconnectAccount(){
  document.getElementById("container").className = "error";
  document.getElementById("timer").setAttribute("src","");
  document.getElementById("show_accounts_btn").style.display = "none";
  localStorage["organisation-name"] = "";
}







