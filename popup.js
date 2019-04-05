let addNewShowing = false;
let editAccountName = "";
let accountList = [];

function onLoad() {
  const orgName = localStorage['organization-name'];
  if (orgName) {
    connectToAccount(orgName);
  } else {
    document.querySelector('#container').className = "error";
  }

  if (localStorage['organization-list']) {
    accountList = JSON.parse(localStorage['organization-list']);
    for (let i=0; i < accountList.length; i++) {
      insertSavedAccountToList(accountList[i].name, accountList[i].color);
    }
  }
  if (accountList.length < 1) showAddNewAccountEvent({});

  document.querySelector('#add_new_account').onclick = showAddNewAccountEvent;
  document.querySelector('#cancel_new_project').onclick = hideAddNewAccountEvent;
  document.querySelector('#curtain').onclick = hideAddNewAccountEvent;
  document.querySelector('#save_new_project').onclick = addNewAccountEvent;
  document.querySelector('#show_accounts_btn').onclick = disconnectAccount;

  document.querySelector('#remove_account').onclick = (event) => {
    removeAccount(editAccountName);
    hideAddNewAccountEvent();
  };

  document.querySelector('#new_project_name').onkeypress = (event) => {
    if (event.keyCode === 13) {
      addNewAccountEvent();
    } else if (event.keyCode === 27) {
      hideAddNewAccountEvent();
    }
  };
}
window.onload = onLoad();

const getRandomInt = (min, max) => (Math.floor(Math.random() * (max - min + 1)) + min);

function showAddNewAccountEvent({ name }) {
  if (!addNewShowing) {
    if (!name) {
      document.querySelector('#create_project_title').textContent = "Add a New Account";
    } else {
      editAccountName = accountNameToID(name).replace("id_", "");
      document.querySelector('#create_project_title').textContent = "Edit Account";
      document.querySelector('#deleteExisting').style.display = "block";
      document.querySelector('#new_project_name').value = name;
    }
    addNewShowing = true;
    slideAddNewAccount(true);
    fadeCurtain(true);
  }
}

function hideAddNewAccountEvent() {
	if (addNewShowing) {
    addNewShowing = false;
    slideAddNewAccount(false);
    fadeCurtain(false)
    editAccountName = "";
    document.querySelector('#deleteExisting').style.display = "none";
  }
}

function fadeCurtain(fadeIn) {
  let val = 0;
  let delta = 0.1;
  if (!fadeIn) {
    val = 1;
    delta = -0.1;
  } else {
    document.querySelector('#curtain').style.display = "block";
  }
  const interval = setInterval(function(){
    document.querySelector('#curtain').style.opacity = val;
    val = val + delta;
    if(val <= 0) document.querySelector('#curtain').style.display = "none";
    if(val >= 1 || val <= 0) clearInterval(interval);
  }, 1);
}

function slideAddNewAccount(slideIn) {
  let val = -72;
  let delta = 2;
  if (!slideIn) {
    val = 32;
    delta = -2;
  }
  const interval = setInterval(function(){
    document.querySelector('#create_project').style.top = `${val}px`;
    val = val + delta;
    if (val >= 34 || val <= -72) { 
      if (val <= -70) document.querySelector('#new_project_name').value = "";
      if (val >=  34) document.querySelector('#new_project_name').focus();
      clearInterval(interval); 
    }
  }, 1);
}

function addNewAccountEvent() {
  let newAccountName = document.querySelector('#new_project_name').value;
  newAccountName = newAccountName.replace("https://", "").replace("http://", "");
  newAccountName = newAccountName.split(".letsfreckle.com")[0];
  newAccountName = newAccountName.split(".nokotime.com")[0];
  if (newAccountName !== "" && (
      GetElementInsideContainer('account-list', accountNameToID(newAccountName)) === null ||
      accountNameToID(newAccountName) === accountNameToID(editAccountName)
  )) {
    if(editAccountName === ""){
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
  const element = document.getElementById(childID);
  const parent = element ? element.parentNode : {};
  return (parent.id && parent.id === containerID) ? element : null;
}

function accountNameErrorFlash() {
  let hexVal = 255;
  let down = true;
  let delta = 5;

  const interval = setInterval(function(){
    document.querySelector('#new_project_name').style.backgroundColor = `rgb(255,${hexVal},${hexVal})`;
    if (down) {
      hexVal = hexVal - delta;
      if(hexVal <= 150) down = false;
    } else {
      hexVal = hexVal + delta;
      if(hexVal >= 255) { 
        down = true; 
        document.querySelector('#new_project_name').style.backgroundColor = "rgb(255,255,255)";
        document.querySelector('#new_project_name').focus();
        clearInterval(interval);
      }        
    }
  }, 5);
}

function insertSavedAccountToList(name, color) {
  const li = document.createElement('li');
  li.className = "project";
  li.id = accountNameToID(name);

  const div = document.createElement('div');
  div.className = "options";

  const a = document.createElement('a');
  a.className = "play icon-cog2";
  a.setAttribute("href", "#");

  a.onclick = (e) => {
    showAddNewAccountEvent({
      name: e.target.closest('li').getElementsByClassName('account-title')[0].textContent,
    });
  };

  div.appendChild(a);
  li.appendChild(div);
  
  const h2 = document.createElement("h2");
  h2.onclick = (e) => connectToAccount(e.target.closest('li').id.replace("id_", ""));
  h2.innerHTML = `
    <span class="project-name">
      <div class="color-box" style="background-color: ${color}"></div>
      <span class="account-title">${name}</span>
    </span>
  `;

  li.appendChild(h2);

  document.querySelector('#account-list').appendChild(li);
}

function getRandomColor(name, color) {
  const baseColors = ['#ef9655','#55c9ef','#ef5555','#f1f353','#bce162','#13a480','#ef63a2'];
  return baseColors[getRandomInt(0, 6)];
}

function addAccount(name) {
  const randomColor = getRandomColor();
  insertSavedAccountToList(name, randomColor);
  accountList.push({name: name, color: randomColor});

  //Add to local storage.
  localStorage["organization-list"] = JSON.stringify(accountList);
}

function removeAccount(name) {
  console.log(name);
  document.getElementById(accountNameToID(name)).remove();
  for (let i = 0; i < accountList.length; i++) {
    if (accountNameToID(accountList[i].name) === accountNameToID(name)) {
      accountList.splice(i, 1);
      break;
    }
  }

  //Remove from local storage.
  localStorage["organization-list"] = JSON.stringify(accountList);
}

function updateAccount(oldName, newName) {
  const updateID = oldName.split(' ').join('').toLowerCase()
  const liElement = document.getElementById(accountNameToID(oldName));
  liElement.getElementsByClassName('account-title')[0].textContent = newName;
  liElement.id = accountNameToID(newName);

  for (let i = 0; i < accountList.length; i++) {
    if (accountNameToID(accountList[i].name) === accountNameToID(oldName)) {
      accountList[i].name = newName;
      break;
    }
  }
  //Update in local storage.
  localStorage["organization-list"] = JSON.stringify(accountList);
}

function accountNameToID(name) {
  return "id_" + name
    .replace("https://", "")
    .replace(".letsfreckle.com/", "")
    .replace(".letsfreckle.com", "")
    .replace(".nokotime.com/", "")
    .replace(".nokotime.com", "")
    .split('!').join('').split(',').join('')
    .split('/').join('').split('\\').join('')
    .split('[').join('').split(']').join('')
    .split('{').join('').split('}').join('')
    .split('?').join('').split('.').join('')
    .split(',').join('').split('$').join('')
    .split('#').join('').split('@').join('')
    .split('%').join('').split('^').join('')
    .split('*').join('').split(' ').join('')
    .toLowerCase();
}

function connectToAccount(name) {
  document.querySelector('#container').className = "";
  document.querySelector('#timer').setAttribute("src", `https://${name}.nokotime.com/timer`);
  document.querySelector('#show_accounts_btn').style.display = "block";
  localStorage["organization-name"] = name;
}

function disconnectAccount() {
  document.querySelector('#container').className = "error";
  document.querySelector('#timer').setAttribute("src", "");
  document.querySelector('#show_accounts_btn').style.display = "none";
  localStorage["organization-name"] = "";
}

Element.prototype.remove = function() {
  this.parentElement.removeChild(this);
}

NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
  for (let i = 0, len = this.length; i < len; i++) {
    if (this[i] && this[i].parentElement) {
      this[i].parentElement.removeChild(this[i]);
    }
  }
}

// Add the header to allow content to be iframed
chrome.webRequest.onBeforeSendHeaders.addListener(
  (details) => {
    details.requestHeaders.push({ name: "X-Freckle-Flags", value: "allow-iframe" });
    return { requestHeaders: details.requestHeaders };
  },
  { urls: ["<all_urls>"] },
  ["blocking", "requestHeaders"]
);