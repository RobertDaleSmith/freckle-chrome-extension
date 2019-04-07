'use strict';

let accounts = [];
let editingId = false;
let isEditing = false;
let sortBySet = false;

const accountList = document.querySelector('#account-list');
const addButton = document.querySelector('#add-button');
const backButton = document.querySelector('#back-button');
const barUnderlay = document.querySelector('#toolbar-underlay');
const bodyWrapper = document.querySelector('#body-wrapper');
const cancelButton = document.querySelector('#edit-menu-cancel-button');
const discardOption = document.querySelector('#edit-menu-discard-option');
const discardButton = document.querySelector('#edit-menu-discard-button');
const editBlock = document.querySelector('#edit-menu');
const editInput = document.querySelector('#edit-menu-input');
const editLabel = document.querySelector('#edit-menu-label');
const overlayMask = document.querySelector('#overlay-mask');
const saveButton = document.querySelector('#edit-menu-save-button');
const searchInput = document.querySelector('#search-input');
const sortNameButton = document.querySelector('#sort-name-button');
const sortRecentButton = document.querySelector('#sort-recent-button');
const timerFrame = document.querySelector('#timer-frame');

const colors = ['#ef9655','#55c9ef','#ef5555','#f1f353','#bce162','#13a480','#ef63a2'];
const cleanR = `https?://|(nokotime)?(letsfreckle)?.com|[!@#$%^&*(){}\\[\\]?,./\\\:;\`\~\\'\\"\\|]`;
const nameToId = (name) => `id_${name.replace(new RegExp(`${cleanR}|\\s`, 'g'), "").toLowerCase()}`;
const randomInt = (min, max) => (Math.floor(Math.random() * (max - min + 1)) + min);
const randomColor = () => colors[randomInt(0, 6)];

function init() {
  const accountName = localStorage['account-name'];

  initFrameHeader();
  localStorageFix();
  if (!accountName) onShowAccounts();
  else onOpenAccount(accountName);

  addButton.onclick = onEditAccount;
  backButton.onclick = onShowAccounts;
  cancelButton.onclick = onCancelEdit;
  discardButton.onclick = onDiscardAccount;
  editInput.onkeypress = onEditInput;
  overlayMask.onclick = onCancelEdit;
  saveButton.onclick = onSaveAccount;
  searchInput.onkeyup = onSearchInput;
  sortNameButton.onclick = onSortAccounts;
  sortRecentButton.onclick = onSortAccounts;
}

window.onload = init();

function initFrameHeader() {
  // add the header to allow content to be iframed
  chrome.webRequest.onBeforeSendHeaders.addListener((details) => {
    details.requestHeaders.push({ name: "X-Freckle-Flags", value: "allow-iframe" });
    return { requestHeaders: details.requestHeaders };
  }, { urls: ["<all_urls>"] }, ["blocking", "requestHeaders"]);
}

function localStorageFix() {
  if (localStorage['organisation-list'] && !localStorage['account-list']) {
    localStorage['account-list'] = localStorage['organisation-list'];
  }
  if (localStorage['organisation-name'] && !localStorage['account-name']) {
    localStorage['account-name'] = localStorage['organisation-name'];
  }
  delete localStorage['organisation-list'];
  delete localStorage['organisation-name'];
}

function onAddAccount(options = {}) {
  const { name } = options;
  if (!name) return;

  const newAccount = { name, color: randomColor() };
  accounts.unshift(newAccount);

  //Add to local storage.
  localStorage['account-list'] = JSON.stringify(accounts);

  renderAccounts();
}

function onCancelEdit() {
  if (isEditing) {
    editingId = false;
    isEditing = false;
    toggleEdit(false);
    toggleOverlay(false);
    discardOption.style.display = "none";
  }
}

function onDiscardAccount() {
  const id = editingId;
  console.log(id);

  accountList.querySelector(`#${id}`).remove();

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
    toggleEdit();
    toggleOverlay();
  }
}

function onEditInput(event) {
  if (event.keyCode === 13) {
    onSaveAccount();
  } else if (event.keyCode === 27) {
    onCancelEdit();
  }
}

function onOpenAccount(name) {
  bodyWrapper.className = "";
  timerFrame.setAttribute("src", `https://${name}.nokotime.com/timer`);
  backButton.style.display = "block";
  barUnderlay.style.display = "block";
  localStorage['account-name'] = name;
}

function onSaveAccount() {
  const value = editInput.value || "";
  const match = new RegExp(cleanR, 'g');
  const name = value.replace(match, "");
  const newId = nameToId(name);

  if (name && (!accountList.querySelector(`#${newId}`) || editingId === newId)) {
    if(!editingId){
      onAddAccount({ name });
      onCancelEdit();
    } else {
      onUpdateAccount({ id: editingId, name });
      onCancelEdit();
    }
  } else {
    throbError();
  }
}

function onSearchInput(event) {
  if (event.keyCode) {
    renderAccounts();
  }
}

function onShowAccounts() {
  onSortAccounts();
  bodyWrapper.className = "show-accounts";
  timerFrame.setAttribute("src", "");
  backButton.style.display = "none";
  barUnderlay.style.display = "none";
  localStorage['account-name'] = "";
}

function onSortAccounts(event = {}) {
  let { target } = event;

  sortBySet = localStorage['sort-by-name'] === "true";

  if (!target) target = sortBySet ? sortNameButton : sortRecentButton;

  const { previousElementSibling, nextElementSibling } = target;

  const sibling = previousElementSibling || nextElementSibling;

  sortBySet = (target.id.indexOf('name') > -1);

  localStorage['sort-by-name'] = sortBySet;

  target.className = "pill active";
  sibling.className = "pill";

  renderAccounts();
}

function onUpdateAccount(options = {}) {
  const { id, name } = options;
  if (!id || !name) return;

  const liElement = accountList.querySelector(`#${id}`);
  liElement.querySelector('.account-title').textContent = name;
  liElement.id = nameToId(name);
  liElement.title = name;

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

  const listItem = document.createElement('li');
  listItem.className = "account";
  listItem.id = nameToId(name);
  listItem.title = name;

  const optionsBlock = document.createElement('div');
  optionsBlock.className = "options";

  const editButton = document.createElement('a');
  editButton.onclick = (e) => onEditAccount({ name: listItem.title });
  editButton.className = "play icon-cog2";
  editButton.setAttribute("href", "#");
  
  const titleBlock = document.createElement("h2");
  titleBlock.onclick = (e) => onOpenAccount(listItem.id.replace("id_", ""));
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

function renderAccounts() {
  let filter = searchInput.value || "";
  filter = filter.toLowerCase();

  accountList.innerHTML = "";

  if (localStorage['account-list']) {
    accounts = JSON.parse(localStorage['account-list']) || [];

    let sortedAccounts = accounts;
    if (sortBySet) {
      sortedAccounts = accounts.sort((a, b) => (a.name < b.name) ? -1 : ((a.name > b.name) ? 1 : 0));
    }

    sortedAccounts.forEach((account) => {
      const name = account.name.toLowerCase();
      const match = name.indexOf(filter) > -1;
      if (filter && !match) return;
      renderAccount(account);
    });
  }

  if (accounts.length < 1) onEditAccount();
}

function throbError() {
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

function toggleOverlay(show = true) {
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

function toggleEdit(show = true) {
  let val = -72;
  let delta = 2;
  if (!show) {
    val = 32;
    delta = -2;
  }
  const interval = setInterval(function(){
    editBlock.style.top = `${val}px`;
    val = val + delta;
    if (val >= 34 || val <= -74) { 
      if (val <= -70) editInput.value = "";
      if (val >=  34) editInput.focus();
      clearInterval(interval); 
    }
  }, 1);
}
