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

const  multiselectEl = document.querySelector('.multiselectREF');

const  multiselectComponent = new  Multiselect(multiselectEl, options, {
	// Con refresh traemos las opciones desde la bd y se la pasamos a la variable options que es de donde el componente va a renderizar las opciones
	async  refresh() {
		fetch('/tags')
		.then((res) =>  res.json())
		.then((data) => {
			options = data;
		});
	},
	// onAdd puedes dejarlo en blanco si no necesitas agregar una opcion a la bd cada vez que le den agregar
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

Referencias

```

Opciones para la listbox, los elementos deben tener el formato: { tag: 'name' }
let options = [];

Tags seleccionados separados por comas: ['name', 'name2']
En la variable selections es donde se guardara las opciones que elije el usuario, de aca es que vas a sacar lo que selecciono el usuario para enviarlo al servidor
let selections = [];

let settings = {
	selections: array --> USO: Arreglo donde se guardaran las selecciones
	removeOnSelect: booleano --> true POR DEFECTO, USO: Remover seleccion al seleccionar de nuevo en listbox
refreshOnInput: booleano --> false POR DEFECTO, USO: Refrescar al escribir o eliminar caracteres
refresh: funcion(query) --> USO: Traemos las opciones desde la bd y le pasamos los datos a la variable options
onAdd: funcion(opcion) --> USO: Agregar opcion a la bd
onSelect: funcion(opcion) --> USO: Agregar opcion a la variable selections
onRemove: function(opcion) --> USO: Remover opcion en la variable selections
}

Multiselect (element, options, settings)

```
