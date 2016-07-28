# Examples

## rtable

### Base Example

{% tabs %}

-- Result --

An simple rtable could be created by

```
riot.mount('rtable#ex01', {cols:cols, data:data, height:200})
```

`cols` should be columns definition, it should be defined as an array, like:

```
{
    name: 'column name',
    title: 'column title',
    frozen: 'left frozen pane',
    align: 'center' | 'left' | 'right',
    width: 'width' (optional),
    render: custom render function, just like function(row, col, value)
    fixed: 'the column width could not be resized'
}
```

If the width of column is not given, it'll be calculted automatically to fit the width
of the grid.

`data` is an array or `dataset` object. Each element is a plain object, and the key
should be matched with name of a column.

`height` is the height of the grid.

`width` is the wdith of the grid. If no given, it'll be the parent's width.

{% include-code %}
<rtable id="ex01"></rtable>
<script>
  var cols = [
    {name:'id', title:'ID', width:300},
    {name:'name', title:'Name', width:200}
  ]
  var data = [], size=100
  for(var i=0; i<size; i++)
    data.push({id:i+1, name:'Name'+(i+1)})
  riot.mount('rtable#ex01', {cols:cols, data:data, height:200})
</script>
{% endinclude-code %}

-- Javascript --

```
var cols = [
  {name:'id', title:'ID', width:300},
  {name:'name', title:'Name', width:200}
]
var data = [], size=100
for(var i=0; i<size; i++)
  data.push({id:i+1, name:'Name'+(i+1)})
riot.mount('rtable#ex01', {cols:cols, data:data, height:200})
```

-- HTML --

```
<rtable id="ex01"></rtable>
```

{% endtabs %}








### Multi Header

{% tabs %}

-- Result --

rtable support multi header.

{% include-code %}
<rtable id="ex02"></rtable>
<script>
  var cols = [
    {name:'name1', title:'A/B', width:60},
    {name:'name2', title:'A/C', width:200},
    {name:'name3', title:'C/E/F', width:200},
    {name:'name4', title:'C/E/H', width:200},
    {name:'name5', title:'C/F/G', width:300},
    {name:'name6', title:'C/F/I', width:200}
  ]
  var data = [], size=100, c=6, d
  for(var i=0; i<size; i++) {
    d = {id:i+1}
    for(var j=0; j<c; j++){
      d['name'+(j+1)] = 'Name-'+(i+1)+'-'+(j+1)
    }
    data.push(d)
  }
  riot.mount('rtable#ex02', {cols:cols, data:data, height:200})
</script>
{% endinclude-code %}

-- Javascript --

```
var cols = [
  {name:'name1', title:'A/B', width:60},
  {name:'name2', title:'A/C', width:200},
  {name:'name3', title:'C/E/F', width:200},
  {name:'name4', title:'C/E/H', width:200},
  {name:'name5', title:'C/F/G', width:300},
  {name:'name6', title:'C/F/I', width:200}
]
var data = [], size=100, c=6, d
for(var i=0; i<size; i++) {
  d = {id:i+1}
  for(var j=0; j<c; j++){
    d['name'+(j+1)] = 'Name-'+(i+1)+'-'+(j+1)
  }
  data.push(d)
}
riot.mount('rtable#ex02', {cols:cols, data:data, height:200})
```

-- HTML --

```
<rtable id="ex02"></rtable>
```

{% endtabs %}






### Modify Grid

{% tabs %}

-- Result --

Modify grid, such as: add, remote.

{% include-code %}
<div style="padding:5px 0px;">
  <button onclick="Add()">Add</button>
  <button onclick="Remove()">Remove</button>
</div>
<rtable id="ex03"></rtable>

<script>
  var cols = [
    {name:'name1', title:'This is a long title', width:40},
    {name:'name2', title:'B', width: 120},
    {name:'name3', title:'This is a very long column name'},
    {name:'name4', title:'D'},
    {name:'name5', title:'E'},
    {name:'name6', title:'F'}
  ]
  var data = [], size=5, c=6, d
  for(var i=0; i<size; i++) {
    d = {id:i+1}
    for(var j=0; j<c; j++){
      d['name'+(j+1)] = 'Name-'+(i+1)+'-'+(j+1)
    }
    data.push(d)
  }
  riot.mount('rtable#ex03', {
    cols:cols,
    data:data,
    height:'auto',
    indexCol:true,
    checkCol:true,
    multiSelect:true
  })

  var ex03 = document.getElementById('ex03')
  var begin = 100
  function Add (e) {
    var d = {}
    for(var j=0; j<c; j++){
      d['name'+(j+1)] = 'New-'+(begin+1)+'-'+(begin+1)
    }
    begin ++
    ex03.add(d)
  }

  function Remove (e) {
    var rows = ex03.get_selected()
    ex03.remove(rows)
  }
</script>
{% endinclude-code %}

-- Javascript --

```
var cols = [
  {name:'name1', title:'A/B', width:60},
  {name:'name2', title:'A/C', width:200},
  {name:'name3', title:'C/E/F', width:200},
  {name:'name4', title:'C/E/H', width:200},
  {name:'name5', title:'C/F/G', width:300},
  {name:'name6', title:'C/F/I', width:200}
]
var data = [], size=100, c=6, d
for(var i=0; i<size; i++) {
  d = {id:i+1}
  for(var j=0; j<c; j++){
    d['name'+(j+1)] = 'Name-'+(i+1)+'-'+(j+1)
  }
  data.push(d)
}
riot.mount('rtable#ex03', {
  cols:cols,
  data:data,
  height:'auto',
  indexCol:true,
  checkCol:true,
  multiSelect:true
})

var ex03 = document.getElementById('ex03')
var begin = 100
function Add (e) {
  var d = {}
  for(var j=0; j<c; j++){
    d['name'+(j+1)] = 'New-'+(begin+1)+'-'+(begin+1)
  }
  begin ++
  ex03.add(d)
}

function Remove (e) {
  var rows = ex03.get_selected()
  ex03.remove(rows)
}
```

-- HTML --

```
<div style="padding:5px 0px;">
  <button onclick="Add()">Add</button>
  <button onclick="Remove()">Remove</button>
</div>

<rtable id="ex03"></rtable>
```

{% endtabs %}



### Tree Grid

{% tabs %}

-- Result --

Tree grid.

{% include-code %}
<div style="padding:5px 0px;">
  <button onclick="Add()">Add</button>
  <button onclick="Remove()">Remove</button>
</div>
<rtable id="ex04"></rtable>

<script>
  var cols = [
    {name:'name1', title:'This is a long title', width:40},
    {name:'name2', title:'B', width: 120},
    {name:'name3', title:'This is a very long column name'},
    {name:'name4', title:'D'},
    {name:'name5', title:'E'},
    {name:'name6', title:'F'}
  ]
  var data = [], size=5, c=6, d
  for(var i=0; i<size; i++) {
    d = {id:i+1}
    for(var j=0; j<c; j++){
      d['name'+(j+1)] = 'Name-'+(i+1)+'-'+(j+1)
    }
    data.push(d)
  }
  data[1].parent = data[0].id
  data[3].parent = data[2].id
  data[4].parent = data[3].id

  riot.mount('rtable#ex04', {
    cols:cols,
    data:data,
    indexCol:true,
    checkCol:true,
    multiSelect:true,
    height:200,

    tree:true,
    expanded:true,
    parentField:'parent',
    orderField:'order',
    levelField:'level',
    treeField:'name2',
    useFontAwesome:true
  })

  var ex04 = document.getElementById('ex04')
  var begin = 100
  function Add (e) {
    var d = {}
    for(var j=0; j<c; j++){
      d['name'+(j+1)] = 'New-'+(begin+1)+'-'+(begin+1)
    }
    begin ++
    ex04.add(d)
  }

  function Remove (e) {
    var rows = ex04.get_selected()
    ex04.remove(rows)
  }
</script>
{% endinclude-code %}

-- Javascript --

```
var cols = [
  {name:'name1', title:'A/B', width:60},
  {name:'name2', title:'A/C', width:200},
  {name:'name3', title:'C/E/F', width:200},
  {name:'name4', title:'C/E/H', width:200},
  {name:'name5', title:'C/F/G', width:300},
  {name:'name6', title:'C/F/I', width:200}
]
var data = [], size=100, c=6, d
for(var i=0; i<size; i++) {
  d = {id:i+1}
  for(var j=0; j<c; j++){
    d['name'+(j+1)] = 'Name-'+(i+1)+'-'+(j+1)
  }
  data.push(d)
}
riot.mount('rtable#ex02', {cols:cols, data:data, height:200})
```

-- HTML --

```
<div style="padding:5px 0px;">
  <button onclick="Add()">Add</button>
  <button onclick="Remove()">Remove</button>
</div>

<rtable id="ex04"></rtable>
```

{% endtabs %}
