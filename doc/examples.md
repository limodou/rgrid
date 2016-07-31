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
  <button onclick="Add03()">Add</button>
  <button onclick="Remove03()">Remove</button>
  <button onclick="InsertBefore03()">Insert Before</button>
  <button onclick="InsertAfter03()">Insert After</button>
  <button onclick="Update03()">Update</button>
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
  function make_item () {
    var d = {}
    for(var j=0; j<c; j++){
      d['name'+(j+1)] = 'New-'+(begin+1)+'-'+(begin+1)
    }
    begin ++
    return d
  }
  function Add03 (e) {
    ex03.add(make_item())
  }

  function Remove03 (e) {
    var rows = ex03.get_selected()
    ex03.remove(rows)
  }

  function InsertBefore03 (e) {
    var rows = ex03.get_selected(), row
    if (rows) {
      row = rows[0]
      ex03.insertBefore(make_item(), row)
    }
  }

  function InsertAfter03 (e) {
    var rows = ex03.get_selected(), row
    if (rows) {
      row = rows[0]
      ex03.insertAfter(make_item(), row)
    }
  }

  function Update03 (e) {
    var rows = ex03.get_selected(), row
    if (rows) {
      row = rows[0]
      var d = make_item()
      d.id = row.id
      ex03.update(d)
    }
  }

</script>
{% endinclude-code %}

-- Javascript --

```
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
function make_item () {
  var d = {}
  for(var j=0; j<c; j++){
    d['name'+(j+1)] = 'New-'+(begin+1)+'-'+(begin+1)
  }
  begin ++
  return d
}
function Add03 (e) {
  ex03.add(make_item())
}

function Remove03 (e) {
  var rows = ex03.get_selected()
  ex03.remove(rows)
}

function InsertBefore03 (e) {
  var rows = ex03.get_selected(), row
  if (rows) {
    row = rows[0]
    ex03.insertBefore(make_item(), row)
  }
}

function InsertAfter03 (e) {
  var rows = ex03.get_selected(), row
  if (rows) {
    row = rows[0]
    ex03.insertAfter(make_item(), row)
  }
}

function Update03 (e) {
  var rows = ex03.get_selected(), row
  if (rows) {
    row = rows[0]
    var d = make_item()
    d.id = row.id
    ex03.update(d)
  }
}
```

-- HTML --

```
<div style="padding:5px 0px;">
  <button onclick="Add03()">Add</button>
  <button onclick="Remove03()">Remove</button>
  <button onclick="InsertBefore03()">Insert Before</button>
  <button onclick="InsertAfter03()">Insert After</button>
  <button onclick="Update03()">Update</button>
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
  <button onclick="Add04()">Add</button>
  <button onclick="Remove04()">Remove</button>
  <button onclick="InsertBefore04()">Insert Before</button>
  <button onclick="InsertAfter04()">Insert After</button>
  <button onclick="Update04()">Update</button>
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
  function make_item () {
    var d = {}
    for(var j=0; j<c; j++){
      d['name'+(j+1)] = 'New-'+(begin+1)+'-'+(begin+1)
    }
    begin ++
    return d
  }
  function Add04 (e) {
    ex04.add(make_item())
  }

  function Remove04 (e) {
    var rows = ex04.get_selected()
    ex04.remove(rows)
  }

  function InsertBefore04(e) {
    var rows = ex04.get_selected(), row
    if (rows) {
      row = rows[0]
      ex04.insertBefore(make_item(), row)
    }
  }

  function InsertAfter04(e) {
    var rows = ex04.get_selected(), row
    if (rows) {
      row = rows[0]
      ex04.insertAfter(make_item(), row)
    }
  }

  function Update04(e) {
    var rows = ex04.get_selected(), row
    if (rows) {
      row = rows[0]
      var d = make_item()
      d.id = row.id
      ex04.update(d)
    }
  }

</script>
{% endinclude-code %}

-- Javascript --

```
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
function make_item () {
  var d = {}
  for(var j=0; j<c; j++){
    d['name'+(j+1)] = 'New-'+(begin+1)+'-'+(begin+1)
  }
  begin ++
  return d
}
function Add04 (e) {
  ex04.add(make_item())
}

function Remove04 (e) {
  var rows = ex04.get_selected()
  ex04.remove(rows)
}

function InsertBefore04(e) {
  var rows = ex04.get_selected(), row
  if (rows) {
    row = rows[0]
    ex04.insertBefore(make_item(), row)
  }
}

function InsertAfter04(e) {
  var rows = ex04.get_selected(), row
  if (rows) {
    row = rows[0]
    ex04.insertAfter(make_item(), row)
  }
}

function Update04(e) {
  var rows = ex04.get_selected(), row
  if (rows) {
    row = rows[0]
    var d = make_item()
    d.id = row.id
    ex04.update(d)
  }
}
```

-- HTML --

```
<div style="padding:5px 0px;">
  <button onclick="Add04()">Add</button>
  <button onclick="Remove04()">Remove</button>
  <button onclick="InsertBefore04()">Insert Before</button>
  <button onclick="InsertAfter04()">Insert After</button>
  <button onclick="Update04()">Update</button>
</div>
<rtable id="ex04"></rtable>
```

{% endtabs %}




### Custom Tag

{% tabs %}

-- Result --

{% include-code %}
<script src="./static/tags/ex05.js"></script>
<rtable id="ex05"></rtable>

<script>
  var cols = [
    {name:'image', title:'Image', tag:'image', width:90, align:'center'},
    {name:'name', title:'Name', width: 120, align:'center'},
    {name:'progress', title:'progress', tag:'progress'}
  ]
  var randAge = function() { return Math.round(Math.random() * 99) + 1;}
  var randImage = function(){return "https://randomuser.me/api/portraits/thumb/men/"+Math.round(Math.random() * 99)+".jpg";}
  var randFirstname = function() {
        var names = ["Chloe", "Emily", "Megan", "Charlotte", "Jessica", "Lauren", "Sophie", "Olivia", "Hannah", "Lucy", "Georgia", "Rebecca", "Bethany", "Amy", "Ellie", "Katie", "Emma", "Abigail", "Molly", "Grace", "Courtney", "Shannon", "Caitlin", "Eleanor", "Jade", "Ella", "Leah", "Alice", "Holly", "Laura", "Anna", "Jasmine", "Sarah", "Elizabeth", "Amelia", "Rachel", "Amber", "Phoebe", "Natasha", "Niamh", "Zoe", "Paige", "Nicole", "Abbie", "Mia", "Imogen", "Lily", "Alexandra", "Chelsea", "Daisy", "Jack", "Thomas", "James", "Joshua", "Daniel", "Harry", "Samuel", "Joseph", "Matthew", "Callum", "Luke", "William", "Lewis", "Oliver", "Ryan", "Benjamin", "George", "Liam", "Jordan", "Adam", "Alexander", "Jake", "Connor", "Cameron", "Nathan", "Kieran", "Mohammed", "Jamie", "Jacob", "Michael", "Ben", "Ethan", "Charlie", "Bradley", "Brandon", "Aaron", "Max", "Dylan", "Kyle", "Robert", "Christopher", "David", "Edward", "Charles", "Owen", "Louis", "Alex", "Joe", "Rhyce"];
        return names[Math.round(Math.random() * (names.length - 1))];
      };
  var data = [], size=100, c=6, d
  for(var i=0; i<size; i++) {
    d = {}
    d.id = i+1
    d.image = randImage()
    d.name = randFirstname()
    d.progress = randAge()
    data.push(d)
  }

  $(function(){
    riot.mount('rtable#ex05', {
      cols:cols,
      data:data,
      indexCol:true,
      height:200,
      rowHeight: 50
    })    
  })

</script>
{% endinclude-code %}

-- Javascript --

```
var cols = [
  {name:'image', title:'Image', tag:'image', width:90},
  {name:'name', title:'Name', width: 120},
  {name:'progress', title:'progress', width: 200, tag:'progress'}
]
var randAge = function() { return Math.round(Math.random() * 99) + 1;}
var randImage = function(){return "https://randomuser.me/api/portraits/thumb/men/"+Math.round(Math.random() * 99)+".jpg";}
var randFirstname = function() {
      var names = ["Chloe", "Emily", "Megan", "Charlotte", "Jessica", "Lauren", "Sophie", "Olivia", "Hannah", "Lucy", "Georgia", "Rebecca", "Bethany", "Amy", "Ellie", "Katie", "Emma", "Abigail", "Molly", "Grace", "Courtney", "Shannon", "Caitlin", "Eleanor", "Jade", "Ella", "Leah", "Alice", "Holly", "Laura", "Anna", "Jasmine", "Sarah", "Elizabeth", "Amelia", "Rachel", "Amber", "Phoebe", "Natasha", "Niamh", "Zoe", "Paige", "Nicole", "Abbie", "Mia", "Imogen", "Lily", "Alexandra", "Chelsea", "Daisy", "Jack", "Thomas", "James", "Joshua", "Daniel", "Harry", "Samuel", "Joseph", "Matthew", "Callum", "Luke", "William", "Lewis", "Oliver", "Ryan", "Benjamin", "George", "Liam", "Jordan", "Adam", "Alexander", "Jake", "Connor", "Cameron", "Nathan", "Kieran", "Mohammed", "Jamie", "Jacob", "Michael", "Ben", "Ethan", "Charlie", "Bradley", "Brandon", "Aaron", "Max", "Dylan", "Kyle", "Robert", "Christopher", "David", "Edward", "Charles", "Owen", "Louis", "Alex", "Joe", "Rhyce"];
      return names[Math.round(Math.random() * (names.length - 1))];
    };
var data = [], size=100, c=6, d
for(var i=0; i<size; i++) {
  d = {}
  d.id = i+1
  d.image = randImage()
  d.name = randFirstname()
  d.progress = randAge()
  data.push(d)
}

riot.mount('rtable#ex05', {
  cols:cols,
  data:data,
  indexCol:true,
  checkCol:true,
  multiSelect:true,
  height:200,
  rowHeight: 50,
})
```

-- HTML --

```
<script src="./static/tags/ex05.js"></script>
<rtable id="ex05"></rtable>
```

-- ex05.tag --

```
<image>
  <img src="{opts.value}" style="" />
</image>
<progress>
  <div style="border:1px solid #ccc;margin:20px auto;top:0px;bottom:0px;background-color:white;width:90%;height:10px;">
    <div style="height:10px;background:#4d4;width:{opts.value}%"></div>
  </div>
</progress>
```

{% endtabs %}
