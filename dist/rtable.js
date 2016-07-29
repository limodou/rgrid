/*
  rtable v1.0
  author : limodou@gmail.com

  options:
    cols(Must):             column definition
    data(Optional):         data source, could be DataSet instance, or just array or empty
    height(Optional):       height of grid, if no provided, it'll use parent height, if the value is 'auto', it'll
                            increase grid height automatically, so there will be no scroll-y at all, default is null
    maxHeight(optional):    Max height, it set height is 'auto', when great than maxHeight, the height will be always maxHeight
    minHeight(optional):    Min height, it set height is 'auto', when less than minHeight, the height will be always minHeight
    width(Optional):        Width of grid, if no provided, it'll use parent width, default is null
    container(Optional):    Used to calculate the width and height, if width or height set to null, default is this.root
    rawHeight(Optional):    single row height. Default is 34
    nameField(Optional):    Which value will be used for name of column, default is 'name'
    titleField(Optional):   Which value will be used for title of column, default is 'title'
    start(Optional):        Starting index value, it'll be used for index column, default is 0
    indexCol(Optional):     Display index column, starting value will be this.start
    indexColWidth(Optional):Width of index column, default is 40
    checkCol(Optional):     Display checkbox column
    multiSelect(Optional):  Multi selection, default is false
    clickSelect(Optional):  If click can select row, default is 'row', others are: 'column', null
    remoteSort(Optional):   If sort in remote, it'll invoke a callback onSort. Default is false
    noData(Optional):       If there is no data, show a message, default is 'No Data'

    options(Optional):      Used to set above options easily via plain object
    theme(Optional):        Theme of grid

  events:
    onUpdate:             When DataSet changed, it'll invoke function(dataset, action, changed)
    onSort:               When click sort, it'll invoke function(sort_cols) return new data
    onRowClass:           Return row class

  methods:
    add:                  Add new records: add(row), add(rows)
    remove:               Remove records: remove(row), remove(rows)
    update:               Update records: update(row), update(rows)
    get:                  Get records: get(), get(id), get(ids), get(row)
    select:               Select rows: select(row), select(rows)
    deselect:             Deselect rows: deselect(row), deselect(rows)
    is_selected:          Test is a row is selected: is_selected(row)
    get_selected:         Get selected rows: get_selected()
*/
riot.tag2('rtable', '<yield></yield> <div class="{rtable-root:true, zebra:opts.theme==\'zebra\'}" riot-style="width:{width-1}px;height:{height-1}px"> <div class="rtable-header rtable-fixed" riot-style="width:{fix_width}px;height:{header_height}px"> <div each="{fix_columns}" no-reorder class="{rtable-cell:true}" riot-style="width:{width}px;height:{height}px;left:{left}px;top:{top}px;line-height:{height}px;"> <div if="{type!=\'check\'}" data-is="raw" content="{title}" riot-style="{sort?\'padding-right:22px\':\'\'}"></div> <input if="{type==\'check\' && parent.multiSelect}" type="checkbox" onclick="{checkall}" class="rtable-check" riot-style="margin-top:{rowHeight/2-7}px" __checked="{parent.selected_rows.length>0}"></input> <div if="{!fixed && leaf}" class="rtable-resizer" onmousedown="{colresize}"></div> <div if="{sort}" class="{rtable-sort:true, desc:get_sorted(name)==\'desc\', asc:get_sorted(name)==\'asc\'}" title="{sort}" onclick="{sort_handler}" riot-style="top:{get_sort_top(get_sorted(name))}px"></div> </div> </div> <div class="rtable-header rtable-main" riot-style="width:{width-fix_width-xscroll_width}px;right:0px;height:{header_height}px;left:{fix_width}px;"> <div each="{main_columns}" no-reorder class="{rtable-cell:true}" riot-style="width:{width}px;height:{height}px;left:{left}px;top:{top}px;line-height:{height}px;"> <div if="{type!=\'check\'}" data-is="raw" content="{title}" riot-style="{sort?\'padding-right:22px\':\'\'}"></div> <input if="{type==\'check\' && parent.multiSelect}" type="checkbox" onclick="{checkall}" class="rtable-check" riot-style="margin-top:{rowHeight/2-7}px" __checked="{parent.selected_rows.length>0}"></input> <div if="{!fixed && leaf}" class="rtable-resizer" onmousedown="{colresize}"></div> <div if="{sort}" class="{rtable-sort:true, desc:get_sorted(name)==\'desc\', asc:get_sorted(name)==\'asc\'}" title="{sort}" onclick="{sort_handler}" riot-style="top:{get_sort_top(get_sorted(name))}px;"></div> </div> </div> <div class="rtable-body rtable-fixed" riot-style="width:{fix_width}px;bottom:{xscroll_width}px;top:{header_height}px;height:{height-header_height-xscroll_width}px;"> <div class="rtable-content" riot-style="width:{fix_width}px;height:{rows.length*rowHeight}px;"> <div each="{row in visCells.fixed}" no-reorder class="{get_row_class(row.row, row.line)}"> <div each="{col in row.cols}" no-reorder class="{get_cell_class(col)}" riot-style="width:{col.width}px;height:{col.height}px;left:{col.left}px;top:{col.top}px;line-height:{col.height}px;text-align:{col.align};"> <div if="{col.type!=\'check\' && !col.buttons}" data-is="raw" content="{col.value}" class="rtable-cell-text" onclick="{parent.click_handler}" ondblclick="{parent.dbclick_handler}" riot-style="{col.indentWidth}"></div> <span if="{col.expander}" data-is="raw" content="{col.expander}" class="rtable-expander" riot-style="left:{col.indent-12}px;" onclick="{toggle_expand}"></span> <input if="{col.type==\'check\'}" type="checkbox" onclick="{checkcol}" __checked="{col.selected}" class="rtable-check" riot-style="margin-top:{rowHeight/2-7}px"></input> </div> </div> </div> </div> <div class="rtable-body rtable-main" onscroll="{scrolling}" riot-style="left:{fix_width}px;top:{header_height}px;bottom:0px;right:0px;width:{width-fix_width+yscroll_fix}px;height:{height-header_height+xscroll_fix}px;"> <div class="rtable-content" riot-style="width:{main_width}px;height:{rows.length*rowHeight}px;"> <div each="{row in visCells.main}" no-reorder class="{get_row_class(row.row, row.line)}"> <div each="{col in row.cols}" no-reorder class="{get_cell_class(col)}" riot-style="width:{col.width}px;height:{col.height}px;left:{col.left}px;top:{col.top}px;line-height:{col.height}px;text-align:{col.align};"> <div if="{col.type!=\'check\' && !col.buttons}" data-is="raw" content="{col.value}" class="rtable-cell-text" onclick="{parent.click_handler}" ondblclick="{parent.dbclick_handler}" riot-style="{col.indentWidth}"></div> <span if="{col.expander}" data-is="raw" content="{col.expander}" class="rtable-expander" riot-style="left:{col.indent-12}px;" onclick="{toggle_expand}"></span> <input if="{col.type==\'check\'}" type="checkbox" onclick="{checkcol}" __checked="{col.selected}" class="rtable-check" riot-style="margin-top:{rowHeight/2-7}px;"></input> <virtual if="{col.buttons}" no-reorder each="{btn in col.buttons}"> <i if="{btn.icon}" class="fa fa-{btn.icon} action" title="{btn.title}" onclick="{parent.parent.action_click(parent.col, btn)}"></i> <a if="{btn.label}" class="action" title="{btn.title}" href="{btn.href || \'#\'}" onclick="{parent.parent.action_click(parent.col, btn)}">{btn.label}</a> </virtual> </div> </div> </div> </div> <div if="{rows.length==0}" data-is="raw" content="{noData}" class="rtable-nodata"></div> </div> </div>', 'rtable .action,[riot-tag="rtable"] .action,[data-is="rtable"] .action{cursor:pointer;} rtable .rtable-root,[riot-tag="rtable"] .rtable-root,[data-is="rtable"] .rtable-root{ position:relative; border: 1px solid gray; overflow:hidden; } rtable .rtable-header,[riot-tag="rtable"] .rtable-header,[data-is="rtable"] .rtable-header{ position:absolute; box-sizing: border-box; } rtable .rtable-header.rtable-fixed,[riot-tag="rtable"] .rtable-header.rtable-fixed,[data-is="rtable"] .rtable-header.rtable-fixed{ left:0; top:0; } rtable .rtable-header.rtable-main,[riot-tag="rtable"] .rtable-header.rtable-main,[data-is="rtable"] .rtable-header.rtable-main{ top:0; overflow:hidden; } rtable .rtable-cell,[riot-tag="rtable"] .rtable-cell,[data-is="rtable"] .rtable-cell{ position:absolute; box-sizing: border-box; border-right:1px solid gray; border-bottom:1px solid gray; background-color: white; padding-left:4px; padding-right:4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } rtable .rtable-cell>*,[riot-tag="rtable"] .rtable-cell>*,[data-is="rtable"] .rtable-cell>*{ white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } rtable .rtable-cell > .rtable-resizer,[riot-tag="rtable"] .rtable-cell > .rtable-resizer,[data-is="rtable"] .rtable-cell > .rtable-resizer{ width:4px; position:absolute; height:100%; cursor: col-resize; top:0px; right:0px; } rtable .rtable-cell.selected,[riot-tag="rtable"] .rtable-cell.selected,[data-is="rtable"] .rtable-cell.selected{ background-color:#ffefd5; } rtable .rtable-cell .rtable-check,[riot-tag="rtable"] .rtable-cell .rtable-check,[data-is="rtable"] .rtable-cell .rtable-check{ vertical-align: text-bottom; margin-top: 5px; } rtable .rtable-cell .rtable-sort,[riot-tag="rtable"] .rtable-cell .rtable-sort,[data-is="rtable"] .rtable-cell .rtable-sort,rtable .rtable-cell .rtable-sort.desc,[riot-tag="rtable"] .rtable-cell .rtable-sort.desc,[data-is="rtable"] .rtable-cell .rtable-sort.desc,rtable .rtable-cell .rtable-sort.asc,[riot-tag="rtable"] .rtable-cell .rtable-sort.asc,[data-is="rtable"] .rtable-cell .rtable-sort.asc{ position: absolute; display: block; content: ""; background-color: transparent; border-left: 1px solid #ccc; border-bottom: 1px solid #ccc; height: 8px; width: 8px; right: 6px; top:6px; z-index: 102; cursor: pointer; -webkit-transform: rotate(45deg); -ms-transform: rotate(45deg); -o-transform: rotate(45deg); transform: rotate(45deg); } rtable .rtable-cell .rtable-sort.desc,[riot-tag="rtable"] .rtable-cell .rtable-sort.desc,[data-is="rtable"] .rtable-cell .rtable-sort.desc{ border-left: 1px solid black; border-bottom: 1px solid black; -webkit-transform: rotate(-45deg); -ms-transform: rotate(-45deg); -o-transform: rotate(-45deg); transform: rotate(-45deg); } rtable .rtable-cell .rtable-sort.asc,[riot-tag="rtable"] .rtable-cell .rtable-sort.asc,[data-is="rtable"] .rtable-cell .rtable-sort.asc{ border-left: 1px solid black; border-bottom: 1px solid black; -webkit-transform: rotate(135deg); -ms-transform: rotate(135deg); -o-transform: rotate(135deg); transform: rotate(135deg); } rtable .rtable-header .rtable-cell,[riot-tag="rtable"] .rtable-header .rtable-cell,[data-is="rtable"] .rtable-header .rtable-cell{ text-align:center; vertical-align: middle; } rtable .rtable-body,[riot-tag="rtable"] .rtable-body,[data-is="rtable"] .rtable-body{ position:absolute; box-sizing: border-box; } rtable .rtable-body.rtable-fixed,[riot-tag="rtable"] .rtable-body.rtable-fixed,[data-is="rtable"] .rtable-body.rtable-fixed{ left:0; overflow: hidden; } rtable .rtable-body.rtable-main,[riot-tag="rtable"] .rtable-body.rtable-main,[data-is="rtable"] .rtable-body.rtable-main{ overflow: auto; } rtable .rtable-nodata,[riot-tag="rtable"] .rtable-nodata,[data-is="rtable"] .rtable-nodata{ position: absolute; top: 0; bottom: 0; left: 0; right: 0; margin: auto; height: 34px; width: 150px; text-align: center; border:1px solid #ccc; color: #ccc; line-height: 34px; border-radius: 3px; } rtable .rtable-expander,[riot-tag="rtable"] .rtable-expander,[data-is="rtable"] .rtable-expander{ position:absolute; top:0px; cursor:pointer; font-size:14px; } rtable .rtable-root.zebra .rtable-row.even .rtable-cell,[riot-tag="rtable"] .rtable-root.zebra .rtable-row.even .rtable-cell,[data-is="rtable"] .rtable-root.zebra .rtable-row.even .rtable-cell{ background-color: #f2f2f2; border-bottom:none; border-right:1px dotted gray; } rtable .rtable-root.zebra .rtable-row.odd .rtable-cell,[riot-tag="rtable"] .rtable-root.zebra .rtable-row.odd .rtable-cell,[data-is="rtable"] .rtable-root.zebra .rtable-row.odd .rtable-cell{ border-bottom:none; border-right:1px dotted gray; } rtable .rtable-root.zebra .rtable-row.even .rtable-cell.selected,[riot-tag="rtable"] .rtable-root.zebra .rtable-row.even .rtable-cell.selected,[data-is="rtable"] .rtable-root.zebra .rtable-row.even .rtable-cell.selected{ background-color: #ffefd5; } rtable .rtable-root.zebra .rtable-header .rtable-cell,[riot-tag="rtable"] .rtable-root.zebra .rtable-header .rtable-cell,[data-is="rtable"] .rtable-root.zebra .rtable-header .rtable-cell{ background-color: #f2f2f2; }', '', function(opts) {

  var self = this
  this.root.instance = this

  if(opts.options) {
    for (var k in opts.options) {
      opts[k] = opts.options[k]
    }
  }

  this.nameField = opts.nameField || 'name'
  this.titleField = opts.titleField || 'title'
  this.onUpdate = opts.onUpdate || function(){}
  this.onSort = opts.onSort || function(){}
  this.onRowClass = opts.onRowClass || function(){}
  this.cols = opts.cols.slice()
  this.rowHeight = opts.rowHeight || 34
  this.indexColWidth = opts.indexColWidth || 40
  this.multiSelect = opts.multiSelect || false
  this.visCells = []
  this.selected_rows = []
  this.sort_cols = []
  this.clickSelect = opts.clickSelect === undefined ? 'row' : opts.clickSelect
  this.noData = opts.noData || 'No Data'
  this.container = opts.container || $(this.root).parent()

  this.tree = opts.tree
  this.showIcon = opts.showIcon === undefined ? true : opts.showIcon
  if (opts.useFontAwesome) {
    this.openIcon = '<i class="fa fa-minus-square-o"></i>'
    this.closeIcon = '<i class="fa fa-plus-square-o"></i>'
  } else {
    this.openIcon = opts.openIcon || '-'
    this.closeIcon = opts.closeIcon || '+'
  }
  this.iconInden = 16
  this.expanded = opts.expanded === undefined ? false: opts.expanded
  this.parents_expand_status = {}
  this.parentField = opts.parentField
  this.orderField = opts.orderField
  this.levelField = opts.levelField
  this.indentWidth = 22

  if (opts.data) {
    if (Array.isArray(opts.data)) {
      this._data = new DataSet()
      if (opts.tree)
        this._data.load_tree(opts.data, {parentField:opts.parentField,
          orderField:opts.orderField, levelField:opts.levelField, plain:true})
      else
        this._data.load(opts.data)
    }
    else
      this._data = opts.data
  } else {
    this._data = new DataSet()
  }

  this.bind = function () {

    self._data.on('*', function(r, d){
        self.onUpdate(self._data, r, d)
        if (r == 'remove') {
          var index, items = d.items
          for(var i=0, len=items.length; i<len; i++){
            index = self.selected_rows.indexOf(items[i].id)
            if (index !== -1) self.selected_rows.splice(index, 1)
          }
        }
        self.ready_data()
        self.calData()
      self.update()
    })
  }

  this.ready_data = function(){
    var order = []

    if (!opts.tree && !opts.remoteSort && this.sort_cols.length) {
      for(i=0, len=this.sort_cols.length; i<len; i++) {
        col = this.sort_cols[i]
        if (col.direction == 'desc')
          order.push('-'+col.name)
        else if (col.direction == 'asc')
          order.push(col.name)
      }
      this.rows = this._data.get({order:order})
    }
    else
      this.rows = this._data.get()
  }

  function test_browser () {
    var Sys = {};
    var ua = navigator.userAgent.toLowerCase();
    var s;
    (s = ua.match(/rv:([\d.]+)\) like gecko/)) ? Sys.ie = s[1] :
    (s = ua.match(/msie ([\d.]+)/)) ? Sys.ie = s[1] :
    (s = ua.match(/firefox\/([\d.]+)/)) ? Sys.firefox = s[1] :
    (s = ua.match(/chrome\/([\d.]+)/)) ? Sys.chrome = s[1] :
    (s = ua.match(/opera.([\d.]+)/)) ? Sys.opera = s[1] :
    (s = ua.match(/version\/([\d.]+).*safari/)) ? Sys.safari = s[1] : 0;
    return Sys
  }

  this.on('mount', function() {
    this.content = this.root.querySelectorAll(".rtable-body.rtable-main")[0]
    this.header = this.root.querySelectorAll(".rtable-header.rtable-main")[0]
    this.content_fixed = this.root.querySelectorAll(".rtable-body.rtable-fixed")[0]

    this.browser = test_browser()

    this._updated = false
    window.addEventListener('resize', function(){
      if (opts.width == 'auto' || !opts.width || !opts.height)
        self.resize()
    })

    this.content.addEventListener('mousewheel', function(e){
      self.mousewheel(e)
    })

    this.ready_data()
    this.calSize()
    this.calHeader()
    this.calData()
    this.calScrollbar()
    this.bind()
    this.update()
  })

  this.on('updated', function(){
    if (!this._updated) {
      this._updated = true
      this.resize()
    }
  })

  this.click_handler = function(e) {
    if ($(e.target).hasClass('rtable-cell-text')) {
      e.preventDefault()
      if (self.clickSelect === 'row') {
        self.toggle_select(e.item.col.row)
      } else if (self.clickSelect === 'column') {

      }
    }
  }

  this.dbclick_handler = function(e) {
    e.preventDefault()

  }

  this.sort_handler = function(e) {
    var name, dir, col

    e.preventDefault()
    name = e.item.name
    if (self.sort_cols.length == 0)
      dir = 'asc'
    else {
      col = self.sort_cols[0]
      if (col.direction == 'desc') {
        dir = false
      } else if (col.direction == 'asc') {
        dir = 'desc'
      } else {
        dir = 'asc'
      }
    }
    if (dir)
      self.sort_cols = [{name:name, direction:dir}]
    else
      self.sort_cols = []
    if (self.remoteSort)
      self._data.load(self.onSort.call(self, self.sort_cols))
    else {
      self.ready_data()
      self.calData()
    }
  }

  this.get_sort_top = function (dir) {
    var top
    if (dir == 'asc')
      top = (self.rowHeight - 16) / 2 + 4
    else if (dir == 'desc')
      top = (self.rowHeight - 16) / 2 + 2
    else
      top = (self.rowHeight - 16) / 2 + 4
    return top
  }

  this.colresize = function (e) {
    var start = e.clientX
    var header = $(this.header)
    var root = $(document)
    var col = e.item
    var width = col.width, d

    document.selection && document.selection.empty && ( document.selection.empty(), 1)
    || window.getSelection && window.getSelection().removeAllRanges();
    document.body.onselectstart = function () {
        return false;
    };
    header.css('-moz-user-select','none');

    root.on('mousemove', function(e){
      d = Math.max(width + e.clientX - start, 5)
      col.real_col.width = d
      self.resize()
    }).on('mouseup', function(e){
        document.body.onselectstart = function(){
            return true;
        };
        header.css('-moz-user-select','text');
        root.off('mousemove').off('mouseup')
    })
  }

  function getScrollbarWidth() {
      var oP = document.createElement('p'),
          styles = {
              width: '100px',
              height: '100px',
              overflowY: 'scroll'
          }, i, scrollbarWidth;
      for (i in styles) oP.style[i] = styles[i];
      document.body.appendChild(oP);
      scrollbarWidth = oP.offsetWidth - oP.clientWidth;
      document.body.removeChild(oP);
      return scrollbarWidth;
  }
  this.on('update', function(){
    this.start = opts.start || 0
    if (!this.content)
      return
    this.calVis()

  })

  function _parse_header(cols, max_level, frozen){
    var columns = [], i, len, j, jj, col,
      subs_len,
      path,
      rowspan,
      colspan,
      parent,
      new_col,
      last_pos,
      left

    if (!cols || cols.length === 0)
      return []

    for (i=0; i<max_level; i++) {
      columns.push([])
    }

    for(i=0, len=cols.length; i<len; i++) {
      col = cols[i]
      subs_len = col.subs.length
      rowspan = 1
      last_pos = -1
      for (j=0; j<subs_len; j++) {
        path = col.subs[j]
        new_col = {}
        new_col.title = path
        if (j == subs_len - 1) {

          new_col.rowspan = max_level - (subs_len-1)*rowspan
          new_col.leaf = true

        } else {
          new_col.rowspan = rowspan
        }
        new_col.colspan = 1
        new_col.level = j
        new_col.col = i
        new_col.width = col.width
        new_col.height = new_col.rowspan * self.rowHeight
        new_col.top = (self.rowHeight) * j
        new_col.frozen = frozen
        new_col.buttons = col.buttons
        new_col.render = col.render
        new_col.name = col.name
        new_col.real_col = col
        new_col.fixed = col.fixed
        new_col.style = col.style
        new_col.type = col.type
        new_col.sort = col.sort
        new_col.align = col.align || 'left'
        new_col['class'] = col['class']

        if (columns[j].length > 0)
          left = columns[j][columns[j].length-1]
        else {
          left = null
        }

        if (j == 0) {
          last_pos = -1
          parent = null
        } else {

          parent = columns[j-1][columns[j-1].length-1]
          last_pos = parent.col
        }

        if (left && left.title==new_col.title && left.level==new_col.level && last_pos<i) {
          left.colspan ++
          left.width += new_col.width
        } else {
          columns[j].push(new_col)
          new_col.parent_col = parent
          if (i == 0) {
            new_col.left = 0
          } else {
            if (left)
              new_col.left = left.left + left.width
            else if (parent)
              new_col.left = parent.left
            else
              new_col.left = 0
          }
        }
        col.left = new_col.left
      }
    }
    var r = []
    for (i=0; i<max_level; i++)
      r = r.concat(columns[i])
    return r
  }

  this.calHeader = function () {
    var columns,
      fix_columns,
      i, len,
      col,
      max_level,
      fix_cols = [],
      cols = [],
      cal_cols=[],
      width = 0,
      has_frozen,
      has_col, has_check;

    max_level = 0

    for (var x=0, _len=self.cols.length; x<_len; x++) {
      if(self.cols[x][self.nameField] == '__index_col__'){
        has_col = true
      } else if (self.cols[x][self.nameField] == '__check_col__'){
        has_check = true
      }
      if (has_col && has_check) break
    }

    if (opts.indexCol && !has_col) {
      col = {
        render:function(row, col, value){
          return col.index + 1
        },
        width:self.indexColWidth,
        frozen:true,
        align:'center'
      }
      col[this.nameField] = '__index_col__'
      col[this.titleField] = '#'
      this.cols.unshift(col)
    }

    for(i=0, len=self.cols.length; i<len; i++){
      if (this.cols[i].frozen){
        has_frozen = true
        break
      }
    }

    if (opts.checkCol && !has_check) {
      col = {
        type:'check',
        width:30,
        align:'center',
        frozen:has_frozen
      }
      col[this.nameField] = '__check_col__'
      col[this.titleField] = '_check'
      if (!opts.indexCol)
        this.cols.unshift(col)
      else
        this.cols.splice(1, 0, col)
    }

    for (i=0, len=this.cols.length; i<len; i++){
      col = this.cols[i]
      if (col.hidden)
        continue
      if (col.frozen)
        fix_cols.push(col)
      else
        cols.push(col)
      col.name = col[this.nameField]
      col.title = col[this.titleField] || col.name
      col.subs = col.title.split('/')
      max_level = Math.max(max_level, col.subs.length)
      if (!col.width)
        cal_cols.push(col)
      else
        width += col.width
    }

    if (cal_cols.length > 0) {
      var dw = Math.floor((this.width-width)/cal_cols.length)
      for(var i=0, len=cal_cols.length; i<len; i++) {
        cal_cols[i].width = dw
        if (i == cal_cols.length - 1)
          cal_cols[i].width = (this.width-width) - (cal_cols.length-1)*dw
      }
    }

    columns = _parse_header(cols, max_level, false)
    fix_columns = _parse_header(fix_cols, max_level, true)

    this.fix_cols = fix_cols
    this.main_cols = cols
    this.fix_columns = fix_columns
    this.main_columns = columns
    this.max_level = max_level

    var fix_width = 0, main_width = 0, col;
    for (var i=0, len=this.cols.length; i<len; i++) {
      col = this.cols[i]
      if (col.hidden)
        continue
      if (col.frozen)
        fix_width += col.width
      else
        main_width += col.width
    }
    this.header_height = this.max_level * this.rowHeight
    this.fix_width = fix_width
    this.main_width = main_width
  }

  this.calSize = function () {
    if (opts.width === 'auto' || !opts.width) {
      this.width = $(this.container).width()
    } else {
      this.width = opts.width
    }

    if (!opts.height) {
      this.height = $(this.container).height()
    } else if (opts.height == 'auto'){

    } else {
      this.height = opts.height
    }
  }

  this.calScrollbar = function () {
    this.scrollbar_width = getScrollbarWidth()
    this.has_yscroll = this.content.scrollHeight > this.content.clientHeight || (this.rows.length * this.rowHeight > (this.height - this.header_height))
    this.has_xscroll = this.content.scrollWidth > this.content.clientWidth || this.main_width > (this.width - this.fix_width)
    this.xscroll_width = this.has_xscroll ? this.scrollbar_width : 0
    this.yscroll_width = this.has_yscroll ? this.scrollbar_width : 0
    this.xscroll_fix = this.browser.ie && this.has_xscroll ? this.xscroll_width : 0
    this.yscroll_fix = this.browser.ie && this.has_yscroll ? this.yscroll_width : 0
  }

  this.calData = function() {

    if (opts.height == 'auto') {

      this.height = Math.max(1, this.rows.length) * this.rowHeight + this.header_height
      if (opts.maxHeight)
        this.height = Math.min(opts.maxHeight, this.height)
      if (this.rows.length==0 && opts.minHeight)
        this.height = Math.max(opts.minHeight, this.height)
    }
  }

  this.calVis = function() {
    var i, j, last, len, len1, r2, cols, row, col, new_row, value, d, index,
      visrows, top, h, r1, vis_rows, vis_fixed_rows, v_row, vf_row, indent,
      hidden_nodes = {}

      function is_hidden (data, row) {
        if (!self.tree) return false
        var parent, stack=[], i, len
        parent = row[self.parentField]
        if (!parent) return false
        while (parent) {
          if (hidden_nodes.hasOwnProperty(parent))
            return hidden_nodes[parent]
          else {
            if (self.opened(parent)) {
              stack.push(parent)
              parent = self._data.get(parent)[self.parentField]
            } else {
              hidden_nodes[parent] = true
              for(i=0, len=stack.length; i<len; i++) {
                hidden_nodes[stack[i]] = true
              }
              return true
            }
          }
        }
        for(i=0, len=stack.length; i<len; i++) {
          hidden_nodes[stack[i]] = false
        }
      }

    r1 = {}
    r1.top = this.content.scrollTop
    r1.left = this.content.scrollLeft
    r1.bottom = r1.top + this.height - this.header_height - this.scrollbar_width
    r1.right = r1.left + this.main_width - this.fix_width - this.scrollbar_width

    first = Math.max(Math.floor(this.content.scrollTop / this.rowHeight), 0)
    last = Math.ceil((this.content.scrollTop+this.height-this.header_height) / this.rowHeight)
    var b = new Date().getTime()

    len = last - first
    vis_rows = []
    vis_fixed_rows = []
    h = this.rowHeight
    cols = this.fix_columns.concat(this.main_columns)
    i = 0
    index = 0
    while (i<len && first+i<this.rows.length) {
      row = this.rows[first+i]

      if (is_hidden(this.rows, row)) {
        i++
        continue
      }
      v_row = {row:row, cols:[], line:first+index}
      vf_row = {row:row, cols:[], line:first+index}
      vis_rows.push(v_row)
      vis_fixed_rows.push(vf_row)

      top = h*(first+index)
      for (j=0, len1=cols.length; j<len1; j++) {
        col = cols[j]
        d = {
          top:top,
          width:col.width,
          height:h,
          left: col.left,
          row:row,
          style:col.style,
          type:col.type,
          selected:this.is_selected(row),
          render:col.render,
          buttons:col.buttons,
          index:first+i,
          sor:col.sort,
          align:col.align,
          class:col.class
        }
        if (opts.treeField == col.name && opts.tree) {
          indent = row.level || 0
          if (row.has_children) {
            if (self.opened(row))
              d.expander = self.openIcon
            else
              d.expander = self.closeIcon
          }
          indent ++
          d.indent = indent*self.indentWidth
          d.indentWidth = 'padding-left:' + d.indent + 'px'
        }
        d.value = this.get_col_data(d, row[col.name])
        if (col.frozen) {
          vf_row.cols.push(d)
        }
        else {

          if (!(d.left > r1.right || d.right < r1.left))
            v_row.cols.push(d)
        }
      }

      i++
      index++
    }
    this.visCells = {
      fixed: vis_fixed_rows,
      main: vis_rows
    }
  }

  this.get_sorted = function(name) {
    var col

    for(var i=0, len=this.sort_cols.length; i<len; i++) {
      col = this.sort_cols[i]
      if (col.name == name && col.direction)
        return col.direction
    }
  }

  this.toggle_expand = function(e) {
    var id = e.item.col.row.id, status = this.parents_expand_status[id]
    if (status === undefined) status = this.expanded
    this.parents_expand_status[id] = !status
    this.update()
  }

  this.opened = function(row) {
      var id , status
      if (row instanceof Object){
        id = row.id
      } else
        id = row
      status = this.parents_expand_status[id]
      if (status === true) return true
      else if (status === false) return false
      this.parents_expand_status[id] = this.expanded
      return this.expanded
  }

  this.scrolling = function(e) {
    e.preventUpdate = true
    this.header.scrollLeft = this.content.scrollLeft
    this.content_fixed.scrollTop = this.content.scrollTop
    return this.update()
  }

  var normalizeWheel = function (event) {
      var PIXEL_STEP = 10;
      var LINE_HEIGHT = 40;
      var PAGE_HEIGHT = 800;

      var sX = 0;
      var sY = 0;

      var pX = 0;
      var pY = 0;

      if ('detail' in event) {
          sY = event.detail;
      }
      if ('wheelDelta' in event) {
          sY = -event.wheelDelta / 120;
      }
      if ('wheelDeltaY' in event) {
          sY = -event.wheelDeltaY / 120;
      }
      if ('wheelDeltaX' in event) {
          sX = -event.wheelDeltaX / 120;
      }

      if ('axis' in event && event.axis === event.HORIZONTAL_AXIS) {
          sX = sY;
          sY = 0;
      }
      pX = sX * PIXEL_STEP;
      pY = sY * PIXEL_STEP;
      if ('deltaY' in event) {
          pY = event.deltaY;
      }
      if ('deltaX' in event) {
          pX = event.deltaX;
      }
      if ((pX || pY) && event.deltaMode) {
          if (event.deltaMode == 1) {
              pX *= LINE_HEIGHT;
              pY *= LINE_HEIGHT;
          }
          else {
              pX *= PAGE_HEIGHT;
              pY *= PAGE_HEIGHT;
          }
      }

      if (pX && !sX) {
          sX = (pX < 1) ? -1 : 1;
      }
      if (pY && !sY) {
          sY = (pY < 1) ? -1 : 1;
      }
      return { spinX: sX,
          spinY: sY,
          pixelX: pX,
          pixelY: pY };
  };

  this.mousewheel = function(e) {
    e.preventDefault()
    var wheelEvent = normalizeWheel(event);

    if (Math.abs(wheelEvent.pixelX) > Math.abs(wheelEvent.pixelY)) {
        this.header.scrollLeft = this.header.scrollLeft + wheelEvent.pixelX
        this.content.scrollLeft = this.content.scrollLeft + wheelEvent.pixelX
    }
    else {
        this.header.scrollTop = this.header.scrollTop + wheelEvent.pixelY
        this.content.scrollTop = this.content.scrollTop + wheelEvent.pixelY
    }
    return false;
  }

  this.checkall = function(e) {
    if (e.target.checked)
      self.selected_rows = self._data.getIds()
    else
      self.selected_rows = []
  }

  this.checkcol = function(e) {
    if (e.target.checked){
      self.select(e.item.col.row)
    } else
      self.deselect(e.item.col.row)
  }

  this.toggle_select = function (row) {
    if (this.is_selected(row)) {
      self.deselect(row)
    } else {
      self.select(row)
    }
  }

  this.select = function(rows) {
    var row, id

    if (!opts.multiSelect)
      self.selected_rows = []

    if (!rows) rows = this._data.get()
    if (!Array.isArray(rows)) {
      rows = [rows]
    }
    for(var i=0, len=rows.length; i<len; i++){
      row = rows[i]
      if (row instanceof Object) id = row.id
      else id = row
      if (this.selected_rows.indexOf(id) == -1)
        this.selected_rows.push(id)
    }
  }

  this.deselect = function(rows) {
    var r = [], row, selected_rows = this.selected_rows, index, items = [], id
    if (!rows) this.selected_rows = []
    else {
      if (!Array.isArray(rows))
        rows = [rows]
      for (var i=0, len=rows.length; i<len; i++) {
        if (rows[i] instanceof Object) id = rows[i].id
        else id = rows[i]
        items.push(id)
      }
      for(var i=selected_rows.length-1; i>-1; i--){
        row = selected_rows[i]
        index = items.indexOf(row)
        if (index != -1){
          selected_rows.splice(i, 1)
          items.splice(index, 1)
        }
        if (rows.length == 0)
          break
      }
    }
  }

  function proxy(funcname) {
    return function f(){
      return self[funcname].apply(self, arguments)
    }
  }

  this.is_selected = function (row) {
    var id
    if (!row) return
    if (row instanceof Object) id = row.id
    else id = row
    return self.selected_rows.indexOf(id) !== -1
  }
  this.root.is_selected = proxy('is_selected')

  this.get_selected = function(){
    return this._data.get({
      filter:function(item){
        return self.selected_rows.indexOf(item.id) !== -1
      }
    })
  }
  this.root.get_selected = proxy('get_selected')

  this.resize = function () {
    self.calSize()
    self.calHeader()
    self.calData()
    self.calScrollbar()
    self.header.scrollLeft = self.content.scrollLeft
    self.content_fixed.scrollTop = self.content.scrollTop
    self.update()
  }

  function data_proxy (funcname) {
    return function() { return self._data[funcname].apply(self._data, arguments)}
  }

  this.root.add = data_proxy('add')
  this.root.update = data_proxy('update')
  this.root.remove = data_proxy('remove')
  this.root.get = data_proxy('get')
  this.root.load = data_proxy('load')
  this.root.insertBefore = data_proxy('insertBefore')
  this.root.insertAfter = data_proxy('insertAfter')

  this.root.setData = function(dataset){
    self._data = dataset
    self.bind()
  }.bind(this);

  this.get_col_data = function(col, value) {
    if (col.render && typeof col.render === 'function') {
      value = col.render(col.row, col, value)
    }
    return value || ''
  }

  this.action_click = function (col, btn) {
    return function (e) {
      if (btn.onclick && typeof btn.onclick === 'function') {

        btn.onclick.call(e.target, col.row, self.root)
      }
    }
  }

  this.get_cell_class = function (col) {
    var klass = []
    klass.push('rtable-cell')
    if (col.selected) klass.push('selected')
    if (col['class']) klass.push(col['class'])
    return klass.join(' ')
  }

  this.get_row_class = function (row, index) {
    var klass = [], cls
    klass.push('rtable-row')
    if (index % 2 == 1) klass.push('even')
    else klass.push('odd')
    cls = this.onRowClass(row, index)
    if (cls)
      klass.push(cls)
    return klass.join(' ')
  }

  this.addClass = function(cls, add) {
    var clss = this[cls].split(/\s+/)
    if(clss.indexOf(add) < 0) clss.push(add)
    this[cls] = clss.join(' ')
  }

  this.removeClass = function(cls, rem) {
    if(!this.hasClass(cls, rem)) return;
    var clss = this[cls].split(/\s+/)
    clss.splice(clss.indexOf(rem), 1)
    this[cls] = clss.join(' ')
  }

  this.hasClass = function(haystack, needle) {
    return this[haystack].split(/\s+/).indexOf(needle) > -1
  }

});

riot.tag2('raw', '<span></span>', '', '', function(opts) {
  this.on('mount', function(){
    this.root.innerHTML = opts.content
  })
  this.on('update', function () {
    this.root.innerHTML = opts.content
  })
});
