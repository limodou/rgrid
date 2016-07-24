# Examples

## rtable

### Base Example

{% tabs %}

-- Result --

{% include-code %}
<rtable id="ex01"></rtable>
<script>
  var cols = [
    {name:'id', title:'ID'},
    {name:'name', title:'Name'}
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
{name:'id', title:'ID'},
{name:'name', title:'Name'}
]
var data = [], size=100
for(var i=0; i<size; i++)
data.push({id:i+1, name:'Name'+(i+1)})
riot.mount('rtable#ex01', {cols:cols, data:data, height:200})
```

-- HTML --

```
<rtable></rtable>
```

{% endtabs %}

