# Documents

## rtable

### Options

<table class="table table-bordered">
<tr>
    <th>Name</th>
    <th>Must</th>
    <th>Data Type</th>
    <th>Description</th>
</tr>
<tr>
    <td>cols</td>
    <td>must</td>
    <td>Array</td>
    <td>Column Definition should be a plain object, the key contains:
        <ul>
            <li><b>name</b> Column name</li>
            <li><b>title</b> Column display value</li>
            <li><b>frozen</b> If true, the column will be displayed left pane, default is <b>false</b></li>
            <li><b>align</b> Column text align, the value is: center, left, right</li>
            <li><b>width</b> Width of the column, if not given, the width will be automatically calculated to fit the width of grid</li>
            <li><b>render</b> Custom render fucntion</li>
            <li><b>fixed</b> If true, the column can not be resized by drag and drop</li>
            <li><b>sort</b> If this column can be sortable, default is <b>false</b></li>
        </ul>
    </td>
</tr>
<tr>
    <td>data</td>
    <td>optional</td>
    <td>Array, DataSet</td>
    <td>If the data is array, it'll created dataset automatically.</td>
</tr>
<tr>
    <td>width</td>
    <td>optional</td>
    <td>int, string</td>
    <td>Width of grid, if no provided or `'auto'`, it'll use container's width, default is `undefined`</td>
</tr>
<tr>
    <td>height</td>
    <td>optional</td>
    <td>int, string</td>
    <td>Height of grid, if no provided, it'll use container's height, default is `undefined`.
    If `'auto'`, the height of grid will be growed automatically according the number of rows.
    </td>
</tr>
<tr>
    <td>maxHeight</td>
    <td>optional</td>
    <td>int</td>
    <td>When height is set to `'auto'`, if maxHeight is set, when real height is great than maxHeight, 
    the height will be always maxHeight
    </td>
</tr>
<tr>
    <td>minHeight</td>
    <td>optional</td>
    <td>int</td>
    <td>When height is set to `'auto'`, if minHeight is set, when there are no rows, 
    the height will be always minHeight
    </td>
</tr>
<tr>
    <td>container</td>
    <td>optional</td>
    <td>string</td>
    <td>It's element selector. Used for width is `undefined` or `'auto'`, or height is `undefined`.
    </td>
</tr>
<tr>
    <td>rowHeight</td>
    <td>optional</td>
    <td>int</td>
    <td>Single row height, default is `34`.
    </td>
</tr>
<tr>
    <td>nameField</td>
    <td>optional</td>
    <td>string</td>
    <td>Which value will be used for name of column, default is `'name'`
    </td>
</tr>
<tr>
    <td>nameField</td>
    <td>optional</td>
    <td>string</td>
    <td>Which value will be used for title of column, default is `'ttile'`
    </td>
</tr>
<tr>
    <td>start</td>
    <td>optional</td>
    <td>int</td>
    <td>Starting index value, it'll be used for index column, default is `0`
    </td>
</tr>
<tr>
    <td>indexCol</td>
    <td>optional</td>
    <td>boolean</td>
    <td>Display index column, starting value will be value of `start` option, default is `false`
    </td>
</tr>
<tr>
    <td>indexColWidth</td>
    <td>optional</td>
    <td>int</td>
    <td>Width of index column, default is `40`
    </td>
</tr>
<tr>
    <td>checkCol</td>
    <td>optional</td>
    <td>boolean</td>
    <td>Display checkbox column, default is `false`
    </td>
</tr>
<tr>
    <td>multiSelect</td>
    <td>optional</td>
    <td>boolean</td>
    <td>Multi selection, default is `false`
    </td>
</tr>
<tr>
    <td>clickSelect</td>
    <td>optional</td>
    <td>boolean</td>
    <td>If click can select row, default is `'row'`, others are: `'column'`, `null`
    </td>
</tr>
<tr>
    <td>remoteSort</td>
    <td>optional</td>
    <td>boolean</td>
    <td>If sort in remote, it'll invoke a callback onSort. Default is `false`
    </td>
</tr>
<tr>
    <td>noData</td>
    <td>optional</td>
    <td>string</td>
    <td>If there is no data, show a message, default is `'No Data'`
    </td>
</tr>
<tr>
    <td>options</td>
    <td>optional</td>
    <td>object</td>
    <td>Used to set above options easily via plain object
    </td>
</tr>

</table>


### Events

<table class="table table-bordered">
<tr>
    <th>Name</th>
    <th>Description</th>
</tr>
<tr>
    <td>onUpdate</td>
    <td>When DataSet changed, it'll invoke function(dataset, action, changed)</td>
</tr>
<tr>
    <td>onSort</td>
    <td>When click sort, it'll invoke function(sort_cols) return new data</td>
</tr>
<tr>
    <td>onRowClass</td>
    <td>Return row class</td>
</tr>
</table>


### Methods

method could be invoke via:

```
var grid = document.getElementById('grid')
grid.<method>
```

You can see just use doc element directly.

<table class="table table-bordered">
<tr>
    <th>Name</th>
    <th>Description</th>
</tr>
<tr>
    <td>add</td>
    <td>Add new records: add(row), row could be an array</td>
</tr>
<tr>
    <td>remove</td>
    <td>Remove records: remove(row), row could be an array</td>
</tr>
<tr>
    <td>update</td>
    <td>Update records: update(row), row could be an array</td>
</tr>
<tr>
    <td>get</td>
    <td>Get records: get(), get(id), get(ids), get(row)</td>
</tr>
<tr>
    <td>select</td>
    <td>Select rows: select(row), row could be an array</td>
</tr>
<tr>
    <td>deselect</td>
    <td>Deselect rows: deselect(row), row could be an array</td>
</tr>
<tr>
    <td>is_selected</td>
    <td>Test is a row is selected: is_selected(row)</td>
</tr>
<tr>
    <td>get_selected</td>
    <td>Get selected rows: get_selected()</td>
</tr>
</table>

