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

/**
 * Transformacion para espacios en blancos en tags
 */
function tagFormat(tag) {
  const parsed = tag.replace(/ /g, '_');

  const unparsed = tag.replace(/_/g, ' ');

  return {
    parsed,
    unparsed,
  };
}

/**
 * Formateador de texto para cuando se vaya a guardar o mostrar al agregar
 */
function formatText(text) {
  text = text.replace(/[^a-zA-Z\s]/g, '');
  text = text.replace(/\s+/g, ' ');
  text = text.toLowerCase();
  text = text.charAt(0).toUpperCase() + text.slice(1);
  return text;
}

// filter an array of options against an input string
// returns an array of options that begin with the filter string, case-independent
function filterOptions(options = [], filter, exclude = []) {
  return options.filter((option) => {
    const matches =
      option.text.toLowerCase().indexOf(filter.toLowerCase()) === 0;
    return matches && exclude.indexOf(option) < 0;
  });
}

// Devolver accion en el combobox desde tecla presionada
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

// Indice de una option que haga match con un string
function getIndexByLetter(options, filter) {
  const firstMatch = filterOptions(options, filter)[0];
  return firstMatch ? options.indexOf(firstMatch) : -1;
}

// Obtener indice actualizado al usar teclas
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

// Verificar si se puede scrollear
function isScrollable(element) {
  return element && element.clientHeight < element.scrollHeight;
}

// Asegurarse que el elemento hijo este visible en el elemento padre
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

/*
 * Multiselect code
 */
const Multiselect = function (el, options, settings) {
  // element refs
  this.el = el;
  this.inputEl = el.querySelector('input');
  this.listboxEl = el.querySelector('[role=listbox]');

  this.addEl = el.querySelector('#combo-add');
  this.idBase = this.inputEl.id;
  this.selectedEl = document.getElementById(`${this.idBase}-selected`);

  // data
  this.options = options;

  this.settings = settings;

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
    const toAdd = formatText(this.inputEl.value);

    /**
     * Agregar a db
     */
    this.settings.onAdd(toAdd);

    /**
     * Comentar esto
     */
    options.push({ tag: toAdd });

    /**
     * Refrescar opciones
     */
    this.settings.refresh();

    /**
     * Renderizar nuevas opciones
     */
    this.reset();

    this.onOptionClick(toAdd);
    document.getElementById('combo-add').classList.add('hide');
  });

  this.addEl.addEventListener('mousedown', this.onOptionMouseDown.bind(this));

  /**
   * Traer opciones de la db
   */
  this.settings.refresh();

  this.mapOptions.bind(this)(this.options);
};

Multiselect.prototype.reset = function () {
  this.inputEl.value = '';
  this.mapOptions(this.options);
  this.inputEl.focus();
};

Multiselect.prototype.mapOptions = function (options) {
  this.listboxEl.querySelectorAll('[role=option]').forEach((n, i) => {
    n.remove();
  });

  options.map((option) => {
    const optionEl = document.createElement('div');
    const { parsed, unparsed } = tagFormat(option.tag);

    const conditional = this.settings.selections.some(
      (selection) => selection === option.tag
    );
    optionEl.setAttribute('role', 'option');
    optionEl.id = `${this.idBase}-${parsed}`;

    optionEl.className = conditional
      ? 'combo-option option-selected'
      : 'combo-option';
    optionEl.setAttribute('aria-selected', conditional ? 'true' : 'false');
    optionEl.innerText = unparsed;

    optionEl.addEventListener('click', () => {
      this.onOptionClick(parsed);
    });
    optionEl.addEventListener('mousedown', this.onOptionMouseDown.bind(this));

    this.listboxEl.appendChild(optionEl);
  });
};

Multiselect.prototype.onInput = function () {
  const query = this.inputEl.value;

  function includes(str, query) {
    if (str === undefined) str = 'undefined';
    if (str === null) str = 'null';
    if (str === false) str = 'false';
    const text = str.toString().toLowerCase();
    return text.indexOf(query.trim()) !== -1;
  }

  const matches = query
    ? this.options
        .filter(({ tag }) => includes(tag, query.toLowerCase()))
        .sort((a, b) => a.tag.length - b.tag.length)
    : this.options;

  if (query) {
    this.mapOptions.bind(this)(matches);
  } else {
    this.mapOptions.bind(this)(this.options);
  }

  if (!matches.length) {
    this.addEl.className = '';
  } else {
    this.addEl.className = 'hide';
  }

  this.addEl.innerHTML = `<div id="combo-add-text" class="combo-new">${formatText(
    query
  )} (Agregar este producto)</div>`;

  // set activeIndex to first matching option
  // (or leave it alone, if the active option is already in the matching set)
  // const filterCurrentOption = matches.filter(
  //   (option) => option === this.options[this.activeIndex]
  // );
  // if (matches.length > 0 && !filterCurrentOption.length) {
  //   this.onOptionChange(this.options.indexOf(matches[0]));
  // }

  const menuState = this.options.length > 0 || query.length > 0;
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

Multiselect.prototype.onOptionChange = function (option) {
  const options = this.el.querySelectorAll('[role=option]');
  [...options].forEach((optionEl) => {
    optionEl.classList.remove('option-current');
  });

  if (typeof option === 'number') {
    if (options.length) {
      this.activeIndex = option;
      options[option].classList.add('option-current');
    }

    return;
  }

  const { parsed } = tagFormat(option);
  this.inputEl.setAttribute(
    'aria-activedescendant',
    `${this.idBase}-${parsed}`
  );

  const optionEl = this.el.querySelector(`#${this.idBase}-${parsed}`);
  optionEl.classList.add('option-current');

  // if (this.open && isScrollable(this.listboxEl)) {
  //   maintainScrollVisibility(options[index], this.listboxEl);
  // }
};

Multiselect.prototype.onOptionClick = function (option) {
  this.onOptionChange(option);
  this.updateOption(option);
  this.inputEl.focus();
};

Multiselect.prototype.onOptionMouseDown = function () {
  this.ignoreBlur = true;
};

Multiselect.prototype.selectOption = function (option) {
  const { parsed, unparsed } = tagFormat(option);
  this.settings.onSelect(unparsed);

  this.mapOptions(options);

  // Agregar boton para deseleccionar opcion
  const listItem = document.createElement('li');
  listItem.className = 'remove-option';

  const textEl = document.createElement('span');
  textEl.innerHTML = unparsed;

  const buttonEl = document.createElement('button');
  buttonEl.className = 'clear-button remove-option-x';
  buttonEl.type = 'button';
  buttonEl.id = `${this.idBase}-remove-${parsed}`;
  buttonEl.setAttribute('aria-describedby', `${this.idBase}-remove`);
  buttonEl.addEventListener('click', () => {
    this.removeOption(option);
  });
  buttonEl.innerHTML = `<svg viewBox="0 0 14 14" class="x-icon">
  //       <path d="M4 4l6 6m0-6l-6 6" />
  //     </svg>`;

  listItem.appendChild(textEl);
  listItem.appendChild(buttonEl);
  this.selectedEl.appendChild(listItem);
};

Multiselect.prototype.removeOption = function (option) {
  const { parsed } = tagFormat(option);
  this.settings.onRemove(option);

  this.mapOptions(options);

  // Boton para deseleccionar
  const buttonEl = document.getElementById(`${this.idBase}-remove-${parsed}`);
  this.selectedEl.removeChild(buttonEl.parentElement);
};

Multiselect.prototype.updateOption = function (option) {
  let optionEl;
  if (typeof option === 'number') {
    const options = this.el.querySelectorAll('[role=option]');

    if (!options.length) {
      this.addEl.click();
      return;
    }

    optionEl = options[option];
    option = optionEl.innerHTML;
  } else {
    const { parsed } = tagFormat(option);

    optionEl = this.el.querySelector(`#${this.idBase}-${parsed}`);
  }

  let isSelected;

  if (optionEl != null) {
    isSelected = optionEl.getAttribute('aria-selected') === 'true';
  }

  if (!isSelected) {
    this.selectOption(option);
  } else {
    this.removeOption(option);
  }
  this.reset();
};

Multiselect.prototype.updateMenuState = function (open, callFocus = true) {
  this.open = open;

  this.inputEl.setAttribute('aria-expanded', `${open}`);

  if (open) {
    this.el.classList.add('open');
  } else {
    this.el.classList.remove('open');
  }
  callFocus && this.inputEl.focus();
};

/**
 * Opciones para la listbox, los elementos deben tener el formato:
 * { tag: 'name' }
 */
let options = [];

/**
 * Tags seleccionados separados por comas: ['name', 'name2']
 */
let selections = [];

// init multiselect
const multiselectEl = document.querySelector('.js-multiselect');
const multiselectComponent = new Multiselect(multiselectEl, options, {
  async refresh() {
    fetch('/tags')
      .then((res) => res.json())
      .then((data) => {
        options = data;
      });
  },
  onAdd(text) {
    fetch('/tags', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tag: text }),
    });
  },
  onSelect(option) {
    selections.push(option);
  },
  onRemove(option) {
    const record = selections.findIndex((selection) => selection === option);
    selections.splice(record, 1);
  },
  selections,
});
multiselectComponent.init();
