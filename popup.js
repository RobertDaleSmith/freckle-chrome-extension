let addedAccounts = [];

let editShowing = null;

let editingId = null;

const accountList = document.querySelector('#account-list');

const addButton = document.querySelector('#add-button');

const backButton = document.querySelector('#back-button');

const bodyWrapper = document.querySelector('#body-wrapper');

const editMenu = document.querySelector('#edit-menu');

const editMenuCancelButton = document.querySelector('#edit-menu-cancel-button');

const editMenuDiscardOption = document.querySelector('#edit-menu-discard-option');

const editMenuDiscardButton = document.querySelector('#edit-menu-discard-button');

const editMenuInput = document.querySelector('#edit-menu-input');

const editMenuLabel = document.querySelector('#edit-menu-label');

const editMenuSaveButton = document.querySelector('#edit-menu-save-button');

const overlayMask = document.querySelector('#overlay-mask');

const timerFrame = document.querySelector('#timer-frame');

const colors = ['#ef9655','#55c9ef','#ef5555','#f1f353','#bce162','#13a480','#ef63a2'];

const getRandomInt = (min, max) => (Math.floor(Math.random() * (max - min + 1)) + min);

const getRandomColor = () => colors[getRandomInt(0, 6)];

const replaceRegex = `https?://|(nokotime)?(letsfreckle)?.com|[!@#$%^&*(){}\\[\\]?,./\\\:;\`\~\\'\\"\\|]`;

const nameToId = (name) => {
  const match = new RegExp(`${replaceRegex}|\\s`, 'g');
  return `id_${name.replace(match, "").toLowerCase()}`;
}

function onLoad() {
  const accountName = localStorage['account-name'];
  if (accountName) {
    openAccount(accountName);
  } else {
    bodyWrapper.className = "show-accounts";
  }

  if (localStorage['account-list']) {
    addedAccounts = JSON.parse(localStorage['account-list']);
    for (let i=0; i < addedAccounts.length; i++) {
      addAccountListItem(addedAccounts[i]);
    }
  }
  if (addedAccounts.length < 1) showAccountEdit();

  addButton.onclick = showAccountEdit;
  backButton.onclick = showAccounts;
  editMenuCancelButton.onclick = hideAccountEdit;
  editMenuSaveButton.onclick = saveAccountEdit;
  overlayMask.onclick = hideAccountEdit;

  editMenuDiscardButton.onclick = (event) => {
    removeAccount(editingId);
    hideAccountEdit();
  };

  editMenuInput.onkeypress = (event) => {
    if (event.keyCode === 13) saveAccountEdit();
    else if (event.keyCode === 27) hideAccountEdit();
  };
}

window.onload = onLoad();

function animateAccountEditInputError() {
  let hexVal = 255;
  let down = true;
  let delta = 5;

  const interval = setInterval(function(){
    editMenuInput.style.backgroundColor = `rgb(255, ${hexVal}, ${hexVal})`;
    if (down) {
      hexVal = hexVal - delta;
      if(hexVal <= 150) down = false;
    } else {
      hexVal = hexVal + delta;
      if(hexVal >= 255) {
        down = true;
        editMenuInput.style.backgroundColor = "rgb(255, 255, 255)";
        editMenuInput.focus();
        clearInterval(interval);
      }
    }
  }, 5);
}

function animateOverlayMaskVisibility(show = true) {
  let val = 0;
  let delta = 0.1;

  if (!show) {
    val = 1;
    delta = -0.1;
  } else {
    overlayMask.style.display = "block";
  }

  const interval = setInterval(function(){
    overlayMask.style.opacity = val;
    val = val + delta;
    if(val <= 0) overlayMask.style.display = "none";
    if(val >= 1 || val <= 0) clearInterval(interval);
  }, 5);
}

function animateAccountEditVisibility(show = true) {
  let val = -72;
  let delta = 2;
  if (!show) {
    val = 32;
    delta = -2;
  }
  const interval = setInterval(function(){
    editMenu.style.top = `${val}px`;
    val = val + delta;
    if (val >= 34 || val <= -72) { 
      if (val <= -70) editMenuInput.value = "";
      if (val >=  34) editMenuInput.focus();
      clearInterval(interval); 
    }
  }, 1);
}

function hideAccountEdit() {
  if (editShowing) {
    editingId = null;
    editShowing = false;
    animateAccountEditVisibility(false);
    animateOverlayMaskVisibility(false);
    editMenuDiscardOption.style.display = "none";
  }
}

function saveAccountEdit() {
  const value = editMenuInput.value || "";
  const match = new RegExp(replaceRegex, 'g');
  const name = value.replace(match, "");
  const newId = nameToId(name);

  if (name && (!document.querySelector(`#${newId}`) || editingId === newId)) {
    if(!editingId){
      addAccount({ name });
      hideAccountEdit();
    } else {
      updateAccount({ id: editingId, name });
      hideAccountEdit();
    }
  } else {
    animateAccountEditInputError();
  }
}

function addAccount({ name }) {
  if (!name) return;

  const newAccount = { name, color: getRandomColor() };
  addAccountListItem(newAccount);
  addedAccounts.push(newAccount);

  //Add to local storage.
  localStorage['account-list'] = JSON.stringify(addedAccounts);
}

function addAccountListItem({ name, color }) {
  if (!name) return;
  if (!color) color = getRandomColor();

  const li = document.createElement('li');
  li.className = "account";
  li.id = nameToId(name);

  const div = document.createElement('div');
  div.className = "options";

  const a = document.createElement('a');
  a.className = "play icon-cog2";
  a.setAttribute("href", "#");

  a.onclick = (e) => {
    const name = e.target.closest('li').querySelector('.account-title').textContent || null;
    showAccountEdit({ name });
  };

  div.appendChild(a);
  li.appendChild(div);
  
  const h2 = document.createElement("h2");
  h2.onclick = (e) => openAccount(e.target.closest('li').id.replace("id_", ""));
  h2.innerHTML = `
    <span class="account-name">
      <div class="color-box" style="background-color: ${color}"></div>
      <span class="account-title">${name}</span>
    </span>
  `;

  li.appendChild(h2);
  accountList.appendChild(li);
}

function openAccount(name) {
  bodyWrapper.className = "";
  timerFrame.setAttribute("src", `https://${name}.nokotime.com/timer`);
  backButton.style.display = "block";
  localStorage['account-name'] = name;
}

function showAccounts() {
  bodyWrapper.className = "show-accounts";
  timerFrame.setAttribute("src", "");
  backButton.style.display = "none";
  localStorage['account-name'] = "";
}

function showAccountEdit(options = {}) {
  const { name, color } = options;

  if (!editShowing) {
    if (!name) {
      editMenuLabel.textContent = "Add a New Account";
    } else {
      editingId = nameToId(name);
      editMenuLabel.textContent = "Edit Account";
      editMenuDiscardOption.style.display = "block";
      editMenuInput.value = name;
    }
    editShowing = true;
    animateAccountEditVisibility();
    animateOverlayMaskVisibility();
  }
}

function removeAccount(id) {
  console.log(id);
  document.querySelector(`#${id}`).remove();
  for (let i = 0; i < addedAccounts.length; i++) {
    if (nameToId(addedAccounts[i].name) === id) {
      addedAccounts.splice(i, 1);
      break;
    }
  }

  //Remove from local storage.
  localStorage['account-list'] = JSON.stringify(addedAccounts);
}

function updateAccount(options = {}) {
  const { id, name } = options;
  if (!id || !name) return;

  const liElement = document.querySelector(`#${id}`);
  liElement.querySelector('.account-title').textContent = name;
  liElement.id = nameToId(name);

  for (let i = 0; i < addedAccounts.length; i++) {
    if (nameToId(addedAccounts[i].name) === id) {
      addedAccounts[i].name = name;
      break;
    }
  }
  //Update in local storage.
  localStorage['account-list'] = JSON.stringify(addedAccounts);
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
