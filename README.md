Inicializar un campo

```
[index.html]
<div class="combo multiselect">
	<input
		aria-activedescendant=""
		aria-autocomplete="none"
		aria-controls="listbox3"
		aria-expanded="false"
		aria-haspopup="listbox"
		aria-labelledby="combo3-label combo3-selected"
		id="combo3"
		class="combo-input"
		role="combobox"
		type="text"
	/>
	<div class="combo-menu">
		<div role="button" id="combo-add" class="hide"></div>
		<div role="listbox" id="listbox3"></div>
	</div>
	<div class="selected-wrapper">
		<span>Intereses</span>
		<ul  class="selected-options" id="combo3-selected"></ul>
	</div>
</div>

<script>
const  multiselectEl = document.querySelector('.multiselect');

const  multiselectComponent = new  Multiselect(multiselectEl, options);

multiselectComponent.init();
</script>
```

Para agregar un tag a la bd (ref: 167)

```
function  add(text) {
	return  fetch('/tags', {
		method:  'POST',
		headers: {
			'Content-Type':  'application/json',
		},
		body:  JSON.stringify({ tag:  text }),
	});
}
```

Para listar las opciones (ref:156)

```
function  refresh() {
	fetch('/tags')
		.then((res) =>  res.json())
		.then((data) => {
			options = data;
		});
}
```
