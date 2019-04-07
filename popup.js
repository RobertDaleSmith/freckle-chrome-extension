let accounts = [];
let editingId = null;
let isEditing = null;

const accountList = document.querySelector('#account-list');
const addButton = document.querySelector('#add-button');
const backButton = document.querySelector('#back-button');
const bodyWrapper = document.querySelector('#body-wrapper');
const cancelButton = document.querySelector('#edit-menu-cancel-button');
const discardOption = document.querySelector('#edit-menu-discard-option');
const discardButton = document.querySelector('#edit-menu-discard-button');
const editBlock = document.querySelector('#edit-menu');
const editInput = document.querySelector('#edit-menu-input');
const editLabel = document.querySelector('#edit-menu-label');
const overlayMask = document.querySelector('#overlay-mask');
const saveButton = document.querySelector('#edit-menu-save-button');
const timerFrame = document.querySelector('#timer-frame');

const colors = ['#ef9655','#55c9ef','#ef5555','#f1f353','#bce162','#13a480','#ef63a2'];
const cleanR = `https?://|(nokotime)?(letsfreckle)?.com|[!@#$%^&*(){}\\[\\]?,./\\\:;\`\~\\'\\"\\|]`;
const nameToId = (name) => `id_${name.replace(new RegExp(`${cleanR}|\\s`, 'g'), "").toLowerCase()}`;
const randomInt = (min, max) => (Math.floor(Math.random() * (max - min + 1)) + min);
const randomColor = () => colors[randomInt(0, 6)];

function init() {
  const accountName = localStorage['account-name'];

  if (!accountName) onShowAccounts();
  else onOpenAccount(accountName);

  if (localStorage['account-list']) {
    accounts = JSON.parse(localStorage['account-list']);
    for (let i=0; i < accounts.length; i++) {
      renderAccount(accounts[i]);
    }
  }

  if (accounts.length < 1) onEditAccount();

  addButton.onclick = onEditAccount;
  backButton.onclick = onShowAccounts;
  cancelButton.onclick = onCancelEdit;
  discardButton.onclick = onDiscardAccount;
  editInput.onkeypress = onEditInput;
  overlayMask.onclick = onCancelEdit;
  saveButton.onclick = onSaveAccount;
}

window.onload = init();

function onAddAccount(options = {}) {
  const { name } = options;
  if (!name) return;

  const newAccount = { name, color: randomColor() };
  renderAccount(newAccount);
  accounts.push(newAccount);

  //Add to local storage.
  localStorage['account-list'] = JSON.stringify(accounts);
}

function onCancelEdit() {
  if (isEditing) {
    editingId = null;
    isEditing = false;
    toggleEditAccount(false);
    toggleOverlayMask(false);
    discardOption.style.display = "none";
  }
}

function onDiscardAccount() {
  const id = editingId;
  console.log(id);

  document.querySelector(`#${id}`).remove();

  for (let i = 0; i < accounts.length; i++) {
    if (nameToId(accounts[i].name) === id) {
      accounts.splice(i, 1);
      break;
    }
  }

  //Remove from local storage.
  localStorage['account-list'] = JSON.stringify(accounts);

  onCancelEdit();
}

function onEditAccount(options = {}) {
  const { name } = options;

  if (!isEditing) {
    if (!name) {
      editLabel.textContent = "Add a New Account";
    } else {
      editingId = nameToId(name);
      editLabel.textContent = "Edit Account";
      discardOption.style.display = "block";
      editInput.value = name;
    }
    isEditing = true;
    toggleEditAccount();
    toggleOverlayMask();
  }
}

function onEditInput(event) {
  if (event.keyCode === 13) onSaveAccount();
  else if (event.keyCode === 27) onCancelEdit();
}

function onOpenAccount(name) {
  bodyWrapper.className = "";
  timerFrame.setAttribute("src", `https://${name}.nokotime.com/timer`);
  backButton.style.display = "block";
  localStorage['account-name'] = name;
}

function onSaveAccount() {
  const value = editInput.value || "";
  const match = new RegExp(cleanR, 'g');
  const name = value.replace(match, "");
  const newId = nameToId(name);

  if (name && (!document.querySelector(`#${newId}`) || editingId === newId)) {
    if(!editingId){
      onAddAccount({ name });
      onCancelEdit();
    } else {
      onUpdateAccount({ id: editingId, name });
      onCancelEdit();
    }
  } else {
    strobeError();
  }
}

function onShowAccounts() {
  bodyWrapper.className = "show-accounts";
  timerFrame.setAttribute("src", "");
  backButton.style.display = "none";
  localStorage['account-name'] = "";
}

function onUpdateAccount(options = {}) {
  const { id, name } = options;
  if (!id || !name) return;

  const liElement = document.querySelector(`#${id}`);
  liElement.querySelector('.account-title').textContent = name;
  liElement.id = nameToId(name);

  for (let i = 0; i < accounts.length; i++) {
    if (nameToId(accounts[i].name) === id) {
      accounts[i].name = name;
      break;
    }
  }
  //Update in local storage.
  localStorage['account-list'] = JSON.stringify(accounts);
}

function renderAccount(options = {}) {
  let { name, color } = options;

  if (!name) return;
  if (!color) color = randomColor();

  const id = nameToId(name);

  const listItem = document.createElement('li');
  listItem.className = "account";
  listItem.id = id;

  const optionsBlock = document.createElement('div');
  optionsBlock.className = "options";

  const editButton = document.createElement('a');
  editButton.onclick = (e) => onEditAccount({ name });
  editButton.className = "play icon-cog2";
  editButton.setAttribute("href", "#");
  
  const titleBlock = document.createElement("h2");
  titleBlock.onclick = (e) => onOpenAccount(id.replace("id_", ""));
  titleBlock.innerHTML = `
    <span class="account-name">
      <div class="color-box" style="background-color: ${color}"></div>
      <span class="account-title">${name}</span>
    </span>
  `;

  optionsBlock.appendChild(editButton);
  listItem.appendChild(optionsBlock);
  listItem.appendChild(titleBlock);
  accountList.appendChild(listItem);
}

function strobeError() {
  let hexVal = 255;
  let down = true;
  let delta = 5;

  const interval = setInterval(function(){
    editInput.style.backgroundColor = `rgb(255, ${hexVal}, ${hexVal})`;
    if (down) {
      hexVal = hexVal - delta;
      if(hexVal <= 150) down = false;
    } else {
      hexVal = hexVal + delta;
      if(hexVal >= 255) {
        down = true;
        editInput.style.backgroundColor = "rgb(255, 255, 255)";
        editInput.focus();
        clearInterval(interval);
      }
    }
  }, 5);
}

function toggleOverlayMask(show = true) {
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

function toggleEditAccount(show = true) {
  let val = -72;
  let delta = 2;
  if (!show) {
    val = 32;
    delta = -2;
  }
  const interval = setInterval(function(){
    editBlock.style.top = `${val}px`;
    val = val + delta;
    if (val >= 34 || val <= -72) { 
      if (val <= -70) editInput.value = "";
      if (val >=  34) editInput.focus();
      clearInterval(interval); 
    }
  }, 1);
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
