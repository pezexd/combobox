Inicializar un campo (cambiar REF por cualquier identificador)

```
[index.html]
<div class="combo multiselectREF">
	<input
		aria-activedescendant=""
		aria-autocomplete="none"
		aria-controls="listbox3"
		aria-expanded="false"
		aria-haspopup="listbox"
		aria-labelledby="combo3-label combo3-selected"
		id="comboREF"
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
		<ul  class="selected-options" id="comboREF-selected"></ul>
	</div>
</div>

<script>
let options = [];
let selections = [];

const  multiselectEl = document.querySelector('.multiselectREF');

const  multiselectComponent = new  Multiselect(multiselectEl, options, {
	async  refresh() {
		fetch('/tags')
		.then((res) =>  res.json())
		.then((data) => {
			options = data;
		});
	},
	onAdd(text) {
		fetch('/tags', {
			method:  'POST',
			headers: {
				'Content-Type':  'application/json',
			},
			body:  JSON.stringify({ tag:  text }),
		});
	},
	onSelect(option) {
		selections.push(option);
	},
	onRemove(option) {
		const  record = selections.findIndex((selection) =>  selection === option);
		selections.splice(record, 1);
	},
	selections,
});

multiselectComponent.init();
</script>
```
