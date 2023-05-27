const Keys = {
  Backspace: 'Backspace',
  Clear: 'Clear',
  Down: 'ArrowDown',
  End: 'End',
  Enter: 'Enter',
  Escape: 'Escape',
  Home: 'Home',
  Left: 'ArrowLeft',
  PageDown: 'PageDown',
  PageUp: 'PageUp',
  Right: 'ArrowRight',
  Space: ' ',
  Tab: 'Tab',
  Up: 'ArrowUp',
};

const MenuActions = {
  Close: 0,
  CloseSelect: 1,
  First: 2,
  Last: 3,
  Next: 4,
  Open: 5,
  Previous: 6,
  Select: 7,
  Space: 8,
  Type: 9,
};

// function formatText(text) {
//   // text = text.trim();
//   // pattern="^[a-zA-Z]+(?: [a-zA-Z]+)*$"
//   text = text.replace(/[^a-zA-Z\s]/g, '');
//   text = text.replace(/\s+/g, ' ');
//   text = text.toLowerCase();
//   text = text.charAt(0).toUpperCase() + text.slice(1);
//   return text;
// }

// filter an array of options against an input string
// returns an array of options that begin with the filter string, case-independent
function filterOptions(options = [], filter, exclude = []) {
  return options.filter((option) => {
    const matches =
      option.text.toLowerCase().indexOf(filter.toLowerCase()) === 0;
    return matches && exclude.indexOf(option) < 0;
  });
}

// return an array of exact option name matches from a comma-separated string
function findMatches(options, search) {
  const names = search.split(',');

  return names
    .map((name) => {
      const match = options.filter(
        (option) => name.trim().toLowerCase() === option.toLowerCase()
      );
      return match.length > 0 ? match[0] : null;
    })
    .filter((option) => option !== null);
}

// return combobox action from key press
function getActionFromKey(event, menuOpen) {
  const { key, altKey, ctrlKey, metaKey } = event;
  // handle opening when closed
  if (
    !menuOpen &&
    (key === Keys.Down || key === Keys.Enter || key === Keys.Space)
  ) {
    return MenuActions.Open;
  }

  // handle keys when open
  if (key === Keys.Down) {
    return MenuActions.Next;
  } else if (key === Keys.Up) {
    return MenuActions.Previous;
  } else if (key === Keys.Home) {
    return MenuActions.First;
  } else if (key === Keys.End) {
    return MenuActions.Last;
  } else if (key === Keys.Escape) {
    return MenuActions.Close;
  } else if (key === Keys.Enter) {
    return MenuActions.CloseSelect;
  } else if (key === Keys.Space) {
    return MenuActions.Space;
  } else if (
    key === Keys.Backspace ||
    key === Keys.Clear ||
    (key.length === 1 && !altKey && !ctrlKey && !metaKey)
  ) {
    return MenuActions.Type;
  }
}

// get index of option that matches a string
function getIndexByLetter(options, filter) {
  const firstMatch = filterOptions(options, filter)[0];
  return firstMatch ? options.indexOf(firstMatch) : -1;
}

// get updated option index
function getUpdatedIndex(current, max, action) {
  switch (action) {
    case MenuActions.First:
      return 0;
    case MenuActions.Last:
      return max;
    case MenuActions.Previous:
      return Math.max(0, current - 1);
    case MenuActions.Next:
      return Math.min(max, current + 1);
    default:
      return current;
  }
}

// check if an element is currently scrollable
function isScrollable(element) {
  return element && element.clientHeight < element.scrollHeight;
}

// ensure given child element is within the parent's visible scroll area
function maintainScrollVisibility(activeElement, scrollParent) {
  const { offsetHeight, offsetTop } = activeElement;
  const { offsetHeight: parentOffsetHeight, scrollTop } = scrollParent;

  const isAbove = offsetTop < scrollTop;
  const isBelow = offsetTop + offsetHeight > scrollTop + parentOffsetHeight;

  if (isAbove) {
    scrollParent.scrollTo(0, offsetTop);
  } else if (isBelow) {
    scrollParent.scrollTo(0, offsetTop - parentOffsetHeight + offsetHeight);
  }
}

const options = [
  { text: 'HTML', value: 0 },
  { text: 'CSS', value: 1 },
  { text: 'JS', value: 2 },
  { text: 'PHP', value: 3 },
];

const selecteds = [];

/*
 * Multiselect code
 */
const Multiselect = function (el, options) {
  // element refs
  this.el = el;
  this.inputEl = el.querySelector('input');
  this.listboxEl = el.querySelector('[role=listbox]');

  this.addEl = el.querySelector('#combo-add');
  this.idBase = this.inputEl.id;
  this.selectedEl = document.getElementById(`${this.idBase}-selected`);

  // data
  this.options = options;

  // state
  this.activeIndex = 0;
  this.open = false;
};

Multiselect.prototype.init = function () {
  this.inputEl.addEventListener('input', this.onInput.bind(this));
  this.inputEl.addEventListener('blur', this.onInputBlur.bind(this));
  this.inputEl.addEventListener('click', () => this.updateMenuState(true));
  this.inputEl.addEventListener('keydown', this.onInputKeyDown.bind(this));

  this.listboxEl.addEventListener('blur', this.onInputBlur.bind(this));

  this.addEl.addEventListener('click', (e) => {
    console.log('ADD TO DATABASE');

    options.push({ text: this.inputEl.value, value: this.inputEl.value });

    this.mapOptions.bind(this)(options);
    this.inputEl.value = '';
    this.inputEl.focus();
    document.getElementById('combo-add').classList.add('hide');
  });

  this.addEl.addEventListener('mousedown', this.onOptionMouseDown.bind(this));

  this.mapOptions.bind(this)(options);
};

Multiselect.prototype.mapOptions = function (options) {
  this.listboxEl.querySelectorAll('[role=option]').forEach((n, i) => {
    n.remove();
  });

  options.map((option, index) => {
    const optionEl = document.createElement('div');
    const conditional = selecteds.some(
      (selection) => selection === option.value
    );
    optionEl.setAttribute('role', 'option');
    optionEl.id = `${this.idBase}-${index}`;

    optionEl.className = conditional
      ? 'combo-option option-selected'
      : 'combo-option';
    optionEl.setAttribute('aria-selected', conditional ? 'true' : 'false');
    optionEl.innerText = option.text;

    optionEl.addEventListener('click', () => {
      this.onOptionClick(index);
    });
    optionEl.addEventListener('mousedown', this.onOptionMouseDown.bind(this));

    this.listboxEl.appendChild(optionEl);
  });
};

Multiselect.prototype.onInput = function () {
  const curValue = this.inputEl.value;
  const query = this.inputEl.value;

  // const formated = formatText(curValue);
  // this.inputEl.value = formated;

  // const matches = filterOptions(this.options, curValue);

  function includes(str, query) {
    if (str === undefined) str = 'undefined';
    if (str === null) str = 'null';
    if (str === false) str = 'false';
    const text = str.toString().toLowerCase();
    return text.indexOf(query.trim()) !== -1;
  }

  const matches = query
    ? this.options
        .filter(({ text }) => includes(text, query.toLowerCase()))
        .sort((a, b) => a.text.length - b.text.length)
    : this.options;

  if (query) {
    this.mapOptions.bind(this)(matches);
  } else {
    this.mapOptions.bind(this)(this.options);
  }

  if (this.inputEl.checkValidity()) {
    document.getElementById('error').classList.add('hide');
  } else {
    document.getElementById('error').classList.remove('hide');
  }

  if (!matches.length) {
    document.getElementById('combo-add').classList.remove('hide');
  } else {
    document.getElementById('combo-add').classList.add('hide');
  }

  document.getElementById('combo-add-text').innerText = curValue;

  // set activeIndex to first matching option
  // (or leave it alone, if the active option is already in the matching set)
  // const filterCurrentOption = matches.filter(
  //   (option) => option === this.options[this.activeIndex]
  // );
  // if (matches.length > 0 && !filterCurrentOption.length) {
  //   this.onOptionChange(this.options.indexOf(matches[0]));
  // }

  const menuState = this.options.length > 0;
  if (this.open !== menuState) {
    this.updateMenuState(menuState, false);
  }
};

Multiselect.prototype.onInputKeyDown = function (event) {
  const max = this.options.length - 1;

  const action = getActionFromKey(event, this.open);

  switch (action) {
    case MenuActions.Next:
    case MenuActions.Last:
    case MenuActions.First:
    case MenuActions.Previous:
      event.preventDefault();
      return this.onOptionChange(
        getUpdatedIndex(this.activeIndex, max, action)
      );
    case MenuActions.CloseSelect:
      event.preventDefault();
      return this.updateOption(this.activeIndex);
    case MenuActions.Close:
      event.preventDefault();
      return this.updateMenuState(false);
    case MenuActions.Open:
      return this.updateMenuState(true);
  }
};

Multiselect.prototype.onInputBlur = function () {
  if (this.ignoreBlur) {
    this.ignoreBlur = false;
    return;
  }

  if (this.open) {
    this.updateMenuState(false, false);
  }
};

Multiselect.prototype.onOptionChange = function (index) {
  this.activeIndex = index;
  this.inputEl.setAttribute('aria-activedescendant', `${this.idBase}-${index}`);

  // update active style
  const options = this.el.querySelectorAll('[role=option]');
  [...options].forEach((optionEl) => {
    optionEl.classList.remove('option-current');
  });
  options[index].classList.add('option-current');

  if (this.open && isScrollable(this.listboxEl)) {
    maintainScrollVisibility(options[index], this.listboxEl);
  }
};

Multiselect.prototype.onOptionClick = function (index) {
  this.onOptionChange(index);
  this.updateOption(index);
  this.inputEl.focus();
};

Multiselect.prototype.onOptionMouseDown = function () {
  this.ignoreBlur = true;
};

Multiselect.prototype.removeOption = function (index) {
  const option = this.options[index];
  removeOfSelecteds(this.options, index);

  // update aria-selected
  const options = this.el.querySelectorAll('[role=option]');
  options[index].setAttribute('aria-selected', 'false');
  options[index].classList.remove('option-selected');

  // remove button
  const buttonEl = document.getElementById(`${this.idBase}-remove-${index}`);
  this.selectedEl.removeChild(buttonEl.parentElement);
};

const addToSelecteds = (options, index) => {
  selecteds.push(options[index].value);
  // document.getElementById('arr').innerHTML = selecteds;
};

const removeOfSelecteds = (options, index) => {
  const record = selecteds.findIndex(
    (selected) => selected == options[index].value
  );

  selecteds.splice(record, 1);

  // document.getElementById('arr').innerHTML = selecteds;
};

Multiselect.prototype.selectOption = function (index) {
  const selected = this.options[index];
  addToSelecteds(this.options, index);
  this.activeIndex = index;

  // update aria-selected
  const options = this.el.querySelectorAll('[role=option]');
  options[index].setAttribute('aria-selected', 'true');
  options[index].classList.add('option-selected');

  // add remove option button
  const buttonEl = document.createElement('button');
  const listItem = document.createElement('li');
  buttonEl.className = 'remove-option';
  buttonEl.type = 'button';
  buttonEl.id = `${this.idBase}-remove-${index}`;
  buttonEl.setAttribute('aria-describedby', `${this.idBase}-remove`);
  buttonEl.addEventListener('click', () => {
    this.removeOption(index);
  });
  buttonEl.innerHTML = selected.text + ' ';

  listItem.appendChild(buttonEl);
  this.selectedEl.appendChild(listItem);
};

Multiselect.prototype.updateOption = function (index) {
  const optionEl = this.el.querySelectorAll('[role=option]')[index];
  const isSelected = optionEl.getAttribute('aria-selected') === 'true';

  if (isSelected) {
    this.removeOption(index);
  } else {
    this.selectOption(index);
  }

  this.inputEl.value = '';
};

Multiselect.prototype.updateMenuState = function (open, callFocus = true) {
  this.open = open;

  this.inputEl.setAttribute('aria-expanded', `${open}`);

  if (open) {
    this.el.classList.add('open');
  } else {
    this.el.classList.remove('open');
  }
  // open ? this.el.classList.add('open') : this.el.classList.remove('open');
  callFocus && this.inputEl.focus();
};

// init multiselect
const multiselectEl = document.querySelector('.js-multiselect');
const multiselectComponent = new Multiselect(multiselectEl, options);
multiselectComponent.init();
