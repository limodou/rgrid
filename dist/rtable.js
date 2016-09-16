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
    rowHeight(Optional):    single row height. Default is 34
    headerRowHeight(Optonal)Header row height. Default is 34
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
    editable(Optional):     If the table cell can be editable.

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
/*
  rtable v1.0.0.1
  author : lvyangg@gmail.com

  ADD-options:
    combineCols(Optional): list of cols's name, the index of list means grouping-level
*/
riot.tag2('rtable', '<yield></yield> <div class="rtable-root {theme}" riot-style="width:{width-1}px;height:{height-1}px"> <div class="rtable-header rtable-fixed" riot-style="width:{fix_width}px;height:{header_height}px"> <div each="{fix_columns}" no-reorder class="{rtable-cell:true}" riot-style="width:{width}px;height:{height}px;left:{left}px;top:{top}px;line-height:{height}px;"> <div if="{type!=\'check\'}" data-is="rtable-raw" class="rtable-cell-text" value="{title}" riot-style="{sort?\'padding-right:22px\':\'\'}" title="{tooltip}"></div> <i if="{type==\'check\' && parent.multiSelect}" onclick="{checkall}" class="fa {parent.selected_rows.length>0 ? \'fa-check-square-o\' : \'fa-square-o\'}"></i> <div if="{!fixed && leaf}" class="rtable-resizer" onmousedown="{colresize}"></div> <div if="{sort}" class="{rtable-sort:true, desc:get_sorted(name)==\'desc\', asc:get_sorted(name)==\'asc\'}" title="{sort}" onclick="{sort_handler}" riot-style="top:{get_sort_top(get_sorted(name))}px"></div> </div> </div> <div class="rtable-header rtable-main" riot-style="width:{width-fix_width-xscroll_width}px;right:0px;height:{header_height}px;left:{fix_width}px;"> <div each="{main_columns}" no-reorder class="{rtable-cell:true}" riot-style="width:{width}px;height:{height}px;left:{left}px;top:{top}px;line-height:{height}px;"> <div if="{type!=\'check\'}" data-is="rtable-raw" class="rtable-cell-text" value="{title}" riot-style="{sort?\'padding-right:22px\':\'\'}" title="{tooltip}"></div> <input if="{type==\'check\' && parent.multiSelect}" type="checkbox" onclick="{checkall}" class="rtable-check" riot-style="margin-top:{headerRowHeight/2-7}px" __checked="{parent.selected_rows.length>0}"></input> <div if="{!fixed && leaf}" class="rtable-resizer" onmousedown="{colresize}"></div> <div if="{sort}" class="{rtable-sort:true, desc:get_sorted(name)==\'desc\', asc:get_sorted(name)==\'asc\'}" title="{sort}" onclick="{sort_handler}" riot-style="top:{get_sort_top(get_sorted(name))}px;"></div> </div> </div> <div class="rtable-body rtable-fixed" riot-style="width:{fix_width}px;bottom:{xscroll_width}px;top:{header_height}px;height:{height-header_height-xscroll_width}px;"> <div class="rtable-content" riot-style="width:{fix_width}px;height:{rows.length*rowHeight}px;"> <div each="{row in visCells.fixed}" no-reorder class="{get_row_class(row.row, row.line)}"> <div if="{col.height!=0}" each="{col in row.cols}" no-reorder class="{get_cell_class(col)}" riot-style="width:{col.width}px;height:{col.height}px;left:{col.left}px;top:{col.top}px;line-height:{col.height}px;text-align:{col.align};"> <div data-is="rtable-cell" if="{col.type!=\'check\' && !col.buttons}" tag="{col.tag}" value="{col.__value__}" row="{col.row}" col="{col}" riot-style="{col.indentWidth}" title="{col.tooltip}"></div> <span if="{col.expander}" data-is="rtable-raw" content="{col.expander}" class="rtable-expander" riot-style="left:{col.indent-12}px;" onclick="{toggle_expand}"></span> <i if="{col.type==\'check\' && onCheckable(col.row)}" onclick="{checkcol}" class="fa {is_selected(col.row)?\'fa-check-square-o\':\'fa-square-o\'}"></i> </div> </div> </div> </div> <div class="rtable-body rtable-main" onscroll="{scrolling}" riot-style="left:{fix_width}px;top:{header_height}px;bottom:0px;right:0px;width:{width-fix_width+yscroll_fix}px;height:{height-header_height+xscroll_fix}px;"> <div class="rtable-content" riot-style="width:{main_width}px;height:{rows.length*rowHeight}px;"> <div each="{row in visCells.main}" no-reorder class="{get_row_class(row.row, row.line)}"> <div if="{col.height!=0}" each="{col in row.cols}" no-reorder class="{get_cell_class(col)}" riot-style="width:{col.width}px;height:{col.height}px;left:{col.left}px;top:{col.top}px;line-height:{col.height}px;text-align:{col.align};"> <div data-is="rtable-cell" if="{col.type!=\'check\' && !col.buttons}" tag="{col.tag}" value="{col.__value__}" row="{col.row}" col="{col}" riot-style="{col.indentWidth}" title="{col.tooltip}"></div> <span if="{col.expander}" data-is="rtable-raw" value="{col.expander}" class="rtable-expander" riot-style="left:{col.indent-12}px;" onclick="{toggle_expand}"></span> <i if="{col.type==\'check\' && onCheckable(col.row)}" onclick="{checkcol}" class="fa {is_selected(col.row)?\'fa-check-square-o\':\'fa-square-o\'}"></i> <virtual if="{col.buttons}" no-reorder each="{btn in col.buttons}"> <i if="{btn.icon}" class="fa fa-{btn.icon} action" title="{btn.title}" onclick="{parent.parent.action_click(parent.col, btn)}"></i> <a if="{btn.label}" class="action" title="{btn.title}" href="{btn.href || \'#\'}" onclick="{parent.parent.action_click(parent.col, btn)}">{btn.label}</a> </virtual> </div> </div> </div> </div> <div if="{rows.length==0}" data-is="rtable-raw" value="{noData}" class="rtable-nodata" riot-style="top:{height/2-header_height/2+rowHeight/2}px;"></div> <div riot-style="display:none;top:{height/2-header_height/2+rowHeight/2}px" class="rtable-loading"></div> </div> </div>', 'rtable .action,[riot-tag="rtable"] .action,[data-is="rtable"] .action{cursor:pointer;} rtable .rtable-root,[riot-tag="rtable"] .rtable-root,[data-is="rtable"] .rtable-root{ position:relative; border: 1px solid gray; overflow:hidden; } rtable .rtable-header,[riot-tag="rtable"] .rtable-header,[data-is="rtable"] .rtable-header{ position:absolute; box-sizing: border-box; } rtable .rtable-header.rtable-fixed,[riot-tag="rtable"] .rtable-header.rtable-fixed,[data-is="rtable"] .rtable-header.rtable-fixed{ left:0; top:0; } rtable .rtable-header.rtable-main,[riot-tag="rtable"] .rtable-header.rtable-main,[data-is="rtable"] .rtable-header.rtable-main{ top:0; overflow:hidden; } rtable .rtable-content,[riot-tag="rtable"] .rtable-content,[data-is="rtable"] .rtable-content{ overflow: hidden; } rtable .rtable-cell,[riot-tag="rtable"] .rtable-cell,[data-is="rtable"] .rtable-cell{ position:absolute; box-sizing: border-box; border-right:1px solid gray; border-bottom:1px solid gray; background-color: white; white-space: nowrap; text-overflow: ellipsis; } rtable .rtable-cell-text-wrapper,[riot-tag="rtable"] .rtable-cell-text-wrapper,[data-is="rtable"] .rtable-cell-text-wrapper{ height: 100%; } rtable .rtable-cell-text,[riot-tag="rtable"] .rtable-cell-text,[data-is="rtable"] .rtable-cell-text{ position:relative; padding-left:4px; padding-right:4px; height: 100%; } rtable .rtable-cell-text,[riot-tag="rtable"] .rtable-cell-text,[data-is="rtable"] .rtable-cell-text,rtable .rtable-cell-text>*,[riot-tag="rtable"] .rtable-cell-text>*,[data-is="rtable"] .rtable-cell-text>*{ white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } rtable .rtable-cell > .rtable-resizer,[riot-tag="rtable"] .rtable-cell > .rtable-resizer,[data-is="rtable"] .rtable-cell > .rtable-resizer{ width:4px; position:absolute; height:100%; cursor: col-resize; top:0px; right:0px; } rtable .rtable-cell.selected,[riot-tag="rtable"] .rtable-cell.selected,[data-is="rtable"] .rtable-cell.selected{ background-color:#ffefd5; } rtable .rtable-cell .rtable-check,[riot-tag="rtable"] .rtable-cell .rtable-check,[data-is="rtable"] .rtable-cell .rtable-check{ vertical-align: text-bottom; margin-top: 5px; } rtable .rtable-cell .rtable-sort,[riot-tag="rtable"] .rtable-cell .rtable-sort,[data-is="rtable"] .rtable-cell .rtable-sort,rtable .rtable-cell .rtable-sort.desc,[riot-tag="rtable"] .rtable-cell .rtable-sort.desc,[data-is="rtable"] .rtable-cell .rtable-sort.desc,rtable .rtable-cell .rtable-sort.asc,[riot-tag="rtable"] .rtable-cell .rtable-sort.asc,[data-is="rtable"] .rtable-cell .rtable-sort.asc{ position: absolute; display: block; content: ""; background-color: transparent; border-left: 1px solid #ccc; border-bottom: 1px solid #ccc; height: 8px; width: 8px; right: 6px; top:6px; z-index: 102; cursor: pointer; -webkit-transform: rotate(45deg); -ms-transform: rotate(45deg); -o-transform: rotate(45deg); transform: rotate(45deg); } rtable .rtable-cell .rtable-sort.desc,[riot-tag="rtable"] .rtable-cell .rtable-sort.desc,[data-is="rtable"] .rtable-cell .rtable-sort.desc{ border-left: 1px solid black; border-bottom: 1px solid black; -webkit-transform: rotate(-45deg); -ms-transform: rotate(-45deg); -o-transform: rotate(-45deg); transform: rotate(-45deg); } rtable .rtable-cell .rtable-sort.asc,[riot-tag="rtable"] .rtable-cell .rtable-sort.asc,[data-is="rtable"] .rtable-cell .rtable-sort.asc{ border-left: 1px solid black; border-bottom: 1px solid black; -webkit-transform: rotate(135deg); -ms-transform: rotate(135deg); -o-transform: rotate(135deg); transform: rotate(135deg); } rtable .rtable-header .rtable-cell,[riot-tag="rtable"] .rtable-header .rtable-cell,[data-is="rtable"] .rtable-header .rtable-cell{ text-align:center; vertical-align: middle; } rtable .rtable-body,[riot-tag="rtable"] .rtable-body,[data-is="rtable"] .rtable-body{ position:absolute; box-sizing: border-box; } rtable .rtable-body.rtable-fixed,[riot-tag="rtable"] .rtable-body.rtable-fixed,[data-is="rtable"] .rtable-body.rtable-fixed{ left:0; overflow: hidden; } rtable .rtable-body.rtable-main,[riot-tag="rtable"] .rtable-body.rtable-main,[data-is="rtable"] .rtable-body.rtable-main{ overflow: auto; } rtable .rtable-nodata,[riot-tag="rtable"] .rtable-nodata,[data-is="rtable"] .rtable-nodata{ position:relative; margin: auto; height: 34px; text-align: center; color: #ccc; line-height: 34px; } rtable .rtable-loading,[riot-tag="rtable"] .rtable-loading,[data-is="rtable"] .rtable-loading{ position:relative;; margin: auto; height: 34px; text-align: center; color: black; line-height: 34px; border: 1px solid gray; width: 100px; background-color: antiquewhite; z-index: 9999; } rtable .rtable-expander,[riot-tag="rtable"] .rtable-expander,[data-is="rtable"] .rtable-expander{ position:absolute; top:0px; cursor:pointer; font-size:14px; } rtable .rtable-root.zebra .rtable-row.even .rtable-cell,[riot-tag="rtable"] .rtable-root.zebra .rtable-row.even .rtable-cell,[data-is="rtable"] .rtable-root.zebra .rtable-row.even .rtable-cell{ background-color: #f2f2f2; border-bottom:none; border-right:1px solid #ddd; } rtable .rtable-root.zebra .rtable-row.odd .rtable-cell,[riot-tag="rtable"] .rtable-root.zebra .rtable-row.odd .rtable-cell,[data-is="rtable"] .rtable-root.zebra .rtable-row.odd .rtable-cell{ border-bottom:none; border-right:1px solid #ddd; } rtable .rtable-root.zebra .rtable-row.even .rtable-cell.selected,[riot-tag="rtable"] .rtable-root.zebra .rtable-row.even .rtable-cell.selected,[data-is="rtable"] .rtable-root.zebra .rtable-row.even .rtable-cell.selected{ background-color: #ffefd5; } rtable .rtable-root.zebra .rtable-header .rtable-cell,[riot-tag="rtable"] .rtable-root.zebra .rtable-header .rtable-cell,[data-is="rtable"] .rtable-root.zebra .rtable-header .rtable-cell{ background-color: #f2f2f2; } rtable .rtable-root.simple .rtable-row.even .rtable-cell,[riot-tag="rtable"] .rtable-root.simple .rtable-row.even .rtable-cell,[data-is="rtable"] .rtable-root.simple .rtable-row.even .rtable-cell{ } rtable .rtable-root.simple .rtable-row.odd .rtable-cell,[riot-tag="rtable"] .rtable-root.simple .rtable-row.odd .rtable-cell,[data-is="rtable"] .rtable-root.simple .rtable-row.odd .rtable-cell{ } rtable .rtable-root.simple .rtable-row.even .rtable-cell.selected,[riot-tag="rtable"] .rtable-root.simple .rtable-row.even .rtable-cell.selected,[data-is="rtable"] .rtable-root.simple .rtable-row.even .rtable-cell.selected{ } rtable .rtable-root.simple .rtable-header .rtable-cell,[riot-tag="rtable"] .rtable-root.simple .rtable-header .rtable-cell,[data-is="rtable"] .rtable-root.simple .rtable-header .rtable-cell{ background-color: #f2f2f2; } rtable .rtable-root.table,[riot-tag="rtable"] .rtable-root.table,[data-is="rtable"] .rtable-root.table{ border: none; } rtable .rtable-root.table .rtable-row.even .rtable-cell,[riot-tag="rtable"] .rtable-root.table .rtable-row.even .rtable-cell,[data-is="rtable"] .rtable-root.table .rtable-row.even .rtable-cell{ } rtable .rtable-root.table .rtable-row.odd .rtable-cell,[riot-tag="rtable"] .rtable-root.table .rtable-row.odd .rtable-cell,[data-is="rtable"] .rtable-root.table .rtable-row.odd .rtable-cell{ } rtable .rtable-root.table .rtable-row.even .rtable-cell.selected,[riot-tag="rtable"] .rtable-root.table .rtable-row.even .rtable-cell.selected,[data-is="rtable"] .rtable-root.table .rtable-row.even .rtable-cell.selected{ } rtable .rtable-root.table .rtable-header .rtable-cell,[riot-tag="rtable"] .rtable-root.table .rtable-header .rtable-cell,[data-is="rtable"] .rtable-root.table .rtable-header .rtable-cell{ } rtable .rtable-root.table .rtable-cell,[riot-tag="rtable"] .rtable-root.table .rtable-cell,[data-is="rtable"] .rtable-root.table .rtable-cell{ border-right:none; border-bottom:1px solid #ddd; } rtable .rtable-root.table .rtable-header .rtable-cell,[riot-tag="rtable"] .rtable-root.table .rtable-header .rtable-cell,[data-is="rtable"] .rtable-root.table .rtable-header .rtable-cell{ border-bottom: 2px solid #ddd; } rtable .rtable-root.table-striped,[riot-tag="rtable"] .rtable-root.table-striped,[data-is="rtable"] .rtable-root.table-striped{ border: none; } rtable .rtable-root.table-striped .rtable-row.even .rtable-cell,[riot-tag="rtable"] .rtable-root.table-striped .rtable-row.even .rtable-cell,[data-is="rtable"] .rtable-root.table-striped .rtable-row.even .rtable-cell{ background-color: #f2f2f2; border-bottom:none; } rtable .rtable-root.table-striped .rtable-row.odd .rtable-cell,[riot-tag="rtable"] .rtable-root.table-striped .rtable-row.odd .rtable-cell,[data-is="rtable"] .rtable-root.table-striped .rtable-row.odd .rtable-cell{ border-bottom:none; } rtable .rtable-root.table-striped .rtable-row.even .rtable-cell.selected,[riot-tag="rtable"] .rtable-root.table-striped .rtable-row.even .rtable-cell.selected,[data-is="rtable"] .rtable-root.table-striped .rtable-row.even .rtable-cell.selected{ } rtable .rtable-root.table-striped .rtable-header .rtable-cell,[riot-tag="rtable"] .rtable-root.table-striped .rtable-header .rtable-cell,[data-is="rtable"] .rtable-root.table-striped .rtable-header .rtable-cell{ } rtable .rtable-root.table-striped .rtable-cell,[riot-tag="rtable"] .rtable-root.table-striped .rtable-cell,[data-is="rtable"] .rtable-root.table-striped .rtable-cell{ border-right:none; border-bottom:1px solid #ddd; } rtable .rtable-root.table-striped .rtable-header .rtable-cell,[riot-tag="rtable"] .rtable-root.table-striped .rtable-header .rtable-cell,[data-is="rtable"] .rtable-root.table-striped .rtable-header .rtable-cell{ border-bottom: 2px solid #ddd; }', '', function(opts) {

  var self = this
  this.observable = opts.observable
  this.root.instance = this

  if(opts.options) {
    for (var k in opts.options) {
      opts[k] = opts.options[k]
    }
  }

  this.nameField = opts.nameField || 'name'
  this.titleField = opts.titleField || 'title'
  this.cols = opts.cols.slice()
  this.combineCols = opts.combineCols || []
  this.headerRowHeight = opts.headerRowHeight || 34
  this.rowHeight = opts.rowHeight || 34
  this.indexColWidth = opts.indexColWidth || 40
  this.multiSelect = opts.multiSelect || false
  this.visCells = []
  this.selected_rows = []
  this.sort_cols = []
  this.clickSelect = opts.clickSelect === undefined ? 'row' : opts.clickSelect
  this.noData = opts.noData || 'No Data'
  this.loading = opts.loading || 'Loading... <i class="fa fa-spinner fa-pulse fa-spin"></i>'
  this.container = opts.container || $(this.root).parent()
  this.editable = opts.editable || false
  this.draggable = opts.draggable || false
  this.theme = opts.theme || 'zebra'
  this.minColWidth = opts.minColWidth || 5
  this.contextMenu = opts.contextMenu || []

  this.onUpdate = opts.onUpdate || function(){}
  this.onSort = opts.onSort || function(){}
  this.onRowClass = opts.onRowClass || function(){}
  this.onEdit = opts.onEdit || function(){return true}
  this.onEdited = opts.onEdited || function(){return true}
  this.onSelected = opts.onSelected || function(){}
  this.onSelect = opts.onSelect || function(){return true}
  this.onDeselected = opts.onDeselected || function(){}
  this.onLoadData = opts.onLoadData || function(parent){}
  this.onCheckable = opts.onCheckable || function(row){return true}

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
  this.loaded_status = {}
  this.idField = opts.idField || 'id'
  this.parentField = opts.parentField || 'parent'
  this.orderField = opts.orderField || 'order'
  this.levelField = opts.levelField || 'level'
  this.hasChildrenField = opts.hasChildrenField || 'has_children'
  this.indentWidth = 16

  var _opts = {tree:opts.tree, idField:this.idField, parentField:this.parentField,
    levelField:this.levelField, orderField:this.orderField, hasChildrenField:this.hasChildrenField}
  var d
  if (opts.data) {
    if (Array.isArray(opts.data)) {
      this._data = new DataSet()
      d = opts.data
    }
    else {
      var d = opts.data.get()
      this._data = opts.data
    }
    if (opts.tree) {
      this._data.setOption(_opts)
      this._data.load_tree(d, {parentField:this.parentField,
        orderField:this.orderField, levelField:this.levelField,
        hasChildrenField:this.hasChildrenField, plain:true})
    } else
      this._data.load(d)

  } else {
    this._data = new DataSet(_opts)
  }

  this.show_loading = function (flag) {
    if (flag)
      $(this.root).find('.rtable-loading').html(this.loading).show()
    else
      $(this.root).find('.rtable-loading').hide()
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
      if (r == 'loading') {
        self.show_loading(true)
        self.parents_expand_status = {}
        self.loaded_status = {}
      } else if (r == 'load'){
        self.show_loading(false)
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

    $(this.content).on('click', '.rtable-cell', this.click_handler)
      .on('dblclick', '.rtable-cell', this.dblclick_handler)
    $(this.content_fixed).on('click', '.rtable-cell', this.click_handler)
      .on('dblclick', '.rtable-cell', this.dblclick_handler)
    this.dnd()

    this.bind_contextmenu()
    this.scrollbar_width = getScrollbarWidth()
    this.ready_data()
    this.calSize()
    this.calHeader()
    this.calData()
    this.calScrollbar()
    this.bind()
    this.update()
  })

  this.dnd = function (reset) {
    var el = $(this.root)
    if (reset) {
      el.off('dragstart', '.rtable-cell-text[draggable]', this.handleDragStart)
        .off('dragover', '.rtable-cell-text[draggable]', this.handleDragOver)
        .off('drop', '.rtable-cell-text[draggable]', this.handleDrop)
      if (this.browser.ie) {
        el.off('selectstart', '.rtable-cell-text[draggable]', this.handleSelectStart)
      }
    }
    if (this.draggable) {
      el.on('dragstart', '.rtable-cell-text[draggable]', this.handleDragStart)
        .on('dragover', '.rtable-cell-text[draggable]', this.handleDragOver)
        .on('drop', '.rtable-cell-text[draggable]', this.handleDrop)
      if (this.browser.ie) {
        el.on('selectstart', '.rtable-cell-text[draggable]', this.handleSelectStart)
      }
    }
  }

  this.handleDragStart = function(e) {
    var col = e.target._tag.opts.col
    self.drag_start_element = e.target
    self.drag_src = col.row
    e.originalEvent.dataTransfer.effectAllowed = 'move'
  }

  this.handleSelectStart = function(e){
    e.preventDefault()
    e.stopPropagation()
    this.dragDrop();
    return false
  }

  function in_rect(r, v) {
    return (v.x>r.left && v.x<r.right && v.y>r.top && v.y<r.bottom)
  }

  function draw_rect(el, r, pos) {
    el.style.width = (r.right-r.left) + 'px'
    if (pos == 'before') {
      el.style.left = r.left + 'px'
      el.style.top = '0px'
      el.style.bottom = ''
    } else {
      el.style.top = ''
      el.style.left = r.left + 'px'
      el.style.bottom = '0px'
    }
  }
  this.handleDragOver = function(e) {
    if (e.preventDefault) {
      e.preventDefault();
    }

    if (e.target.isSameNode(self.drag_start_element)) return
    if (!e.target._tag) return
    var col = e.target._tag.opts.col
    if (!col.treeField) return false
    var w = col.width,
      h = col.height, r_up, r_d_left, r_d_right, helper = e.target.querySelector('.rtable-draggable-helper')

    if (self._data.isChild(col.row, self.drag_src)) {
      return false
    }

    r_up = {top:0, left:0, right:w, bottom:h/2}
    r_d_left = {top:h/2, left:0, right:w*2/5, bottom:h}
    r_d_right = {top:h/2, left:w*2/5, right:w, bottom:h}

    var pos = {x: e.originalEvent.offsetX, y: e.originalEvent.offsetY}
    var up = in_rect(r_up, pos), left = in_rect(r_d_left, pos), right = in_rect(r_d_right, pos)
    if (up || left || right) {
      if (!helper){
        helper = document.createElement('div')
        helper.style.position = 'absolute'
        helper.className = 'rtable-draggable-helper'
        helper.style.zIndex = 1000
        helper.style.borderTop = '2px solid green'
        e.target.appendChild(helper)
        if (self.drag_helper) {
          $(self.drag_helper).remove()
          self.drag_helper = null
        }
        self.drag_helper = helper
      }
      if (up && self.drag_last_pos != 'before') {
        self.drag_last_pos = 'before'
        draw_rect(helper, r_up, self.drag_last_pos)
      } else if (left && self.drag_last_pos != 'after') {
        self.drag_last_pos = 'after'
        draw_rect(helper, r_d_left, self.drag_last_pos)
      } else if (right) {
        self.drag_last_pos = 'child'
        draw_rect(helper, r_d_right, self.drag_last_pos)
      }
    }

    col = e.target._tag.opts.col
    e.originalEvent.dataTransfer.dropEffect = 'move';

    return false;
  }

  this.handleDrop = function(e) {
    var last_pos = self.drag_last_pos
    if (!last_pos) return

    if (self.drag_helper) {
      $(self.drag_helper).remove()
      self.drag_helper = null
      self.drag_last_pos = ''
    }
    if (!e.currentTarget._tag) return
    var col = e.currentTarget._tag.opts.col
    var src_item = self.drag_src, to_item = col.row
    if (self.opts.onMove)
      self.opts.onMove(src_item, to_item, last_pos)

  }

  this.bind_contextmenu = function() {

    for (var i=0, len=this.contextMenu.length; i<len; i++) {
      item = this.contextMenu[i]
      item._fn = item.fn
    }

    var init_menus = function(row, col) {
      var item
      for (var i=0, len=self.contextMenu.length; i<len; i++) {
        item = self.contextMenu[i]
        var onclick = function(item, row, col) {
          return function(){
            item._fn.call(self, row, col)
          }
        }
        if (item.type != 'separator')
          item.fn = onclick(item, row, col)
      }
    }
    $(this.content).on('contextmenu', ".rtable-cell", function(e){
      var col = e.target._tag.opts.col
      var row = col.row
      self.select(row)
      self.update()
      e.preventDefault()
      init_menus(row, col)
      basicContext.show(self.contextMenu, e)
    })
  }

  this.on('updated', function(){
    if (!this._updated) {
      this._updated = true
      this.resize()
    }
    console.log('update')
  })

  this.click_handler = function(e) {
    var ret, tag = e.target._tag
    if (self.editable && self.editor) {
      return
    }
    if (!tag) return
    var col = tag.opts.col
    if (opts.onClick) {
      ret = opts.onClick(col.row, col)
    }
    if (!ret && $(e.target).hasClass('rtable-cell-text')) {
      e.preventDefault()
      if (self.clickSelect === 'row') {
        self.toggle_select(col.row)
        self.update()
      } else if (self.clickSelect === 'column') {

      }
    }
  }

  this.dblclick_handler = function(e) {

    var ret, el = $(e.target), item
    if (el.hasClass('rtable-cell-text'))
      item = e.target
    else {
      item = el.parents('.rtable-cell-text')[0]
    }
    if (!item) return
    var tag = item._tag
    if (!tag) return
    var col = item._tag.opts.col
    if (opts.onDblclick)
      ret = opts.onDblclick(col.row, col)
    if (!ret) {
      e.preventDefault()
      if (opts.editable) {
        if (!col.editor) return
        e.preventUpdate = true
        document.selection && document.selection.empty && ( document.selection.empty(), 1)
        || window.getSelection && window.getSelection().removeAllRanges();
        create_editor($(item).parent()[0], col.row, col)
      }
    }
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
    if (opts.remoteSort)
      self.onSort.call(self, self.sort_cols)
    else {
      self.ready_data()
      self.calData()
    }
  }

  this.get_sort_top = function (dir) {
    var top
    if (dir == 'asc')
      top = (self.headerRowHeight - 16) / 2 + 4
    else if (dir == 'desc')
      top = (self.headerRowHeight - 16) / 2 + 2
    else
      top = (self.headerRowHeight - 16) / 2 + 4
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
      d = Math.max(width + e.clientX - start, self.minColWidth)
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
    var columns = [],
      columns_width = {},
      i, len, j, jj, col, jl,
      subs_len,
      path,
      rowspan,
      colspan,
      parent,
      new_col,
      left

    if (!cols || cols.length === 0)
      return []

    for (i=0; i<max_level; i++) {
      columns[i] = []
      columns_width[i] = 0
    }

    for(i=0, len=cols.length; i<len; i++) {
      col = cols[i]
      subs_len = col.subs.length
      rowspan = 1
      for (j=0; j<subs_len; j++) {
        path = col.subs[j]
        new_col = {}
        new_col.title = path.replace('%%', '/')
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
        new_col.height = new_col.rowspan * self.headerRowHeight
        new_col.top = (self.headerRowHeight) * j
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
        new_col.class = col.class
        new_col.tag = col.tag || 'rtable-raw'
        new_col.editor = col.editor
        new_col.leaf = true
        if (col.headerTooltip) {
          if (typeof col.headerTooltip === 'string')
            new_col.tooltip = col.headerTooltip
          else if (typeof col.headerTooltip === 'function')
            new_col.tooltip = col.headerTooltip()
        }
        new_col.columnTooltip = col.columnTooltip

        if (columns[j].length > 0)
          left = columns[j][columns[j].length-1]
        else {
          left = null
        }

        if (left && left.title==new_col.title && left.level==new_col.level) {
          left.colspan ++
          left.width += new_col.width
          columns_width[j] += new_col.width
          left.leaf = false
        } else {

          columns[j].push(new_col)
          new_col.left = columns_width[j]
          columns_width[j] += new_col.width
          for (jl=1; jl<new_col.rowspan; jl++) {
            columns_width[j+jl] += new_col.width
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
      var w = this.width-width-this.scrollbar_width
      var dw = Math.floor(w/cal_cols.length)
      for(var i=0, len=cal_cols.length; i<len; i++) {
        cal_cols[i].width = dw
        if (i == cal_cols.length - 1)
          cal_cols[i].width = w - (cal_cols.length-1)*dw
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
    this.header_height = this.max_level * this.headerRowHeight
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
    r1.right = r1.left + this.width - this.fix_width - this.scrollbar_width

    first = Math.max(Math.floor(this.content.scrollTop / this.rowHeight), 0)
    last = Math.ceil((this.content.scrollTop+this.height-this.header_height) / this.rowHeight)
    var b = new Date().getTime()

    len = last - first
    vis_rows = []
    vis_fixed_rows = []
    h = this.rowHeight
    cols = this.fix_columns.concat(this.main_columns)

    var last_val = {}
    var last_col_index = {}
    var now_row_combine_flag = []
    for (var key in this.combineCols) {
      last_col_index[key] = -1
      now_row_combine_flag.push(false)
    }

    i = 0
    index = 0

    while (i<this.rows.length && index<first) {
      row = this.rows[i]
      if (is_hidden(this.rows, row)) {
        i ++
        continue
      }
      index ++
    }

    index = 0
    while (index<len && first+i<this.rows.length) {
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
        if (!col.leaf) continue
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
          class:col.class,
          tag:col.tag,
          editor:col.editor,
          name:col.name
        }

        if (opts.treeField == col.name && opts.tree) {
          indent = row.level || 0
          if (row.has_children) {
            if (self.opened(row))
              d.expander = self.openIcon
            else
              d.expander = self.closeIcon
          }
          d.treeField = true
          indent ++
          d.indent = indent*self.indentWidth
          d.indentWidth = 'padding-left:' + d.indent + 'px'
        }
        d.value = row[col.name]
        d.__value__ = this.get_col_data(d, row[col.name])

        if (col.columnTooltip) {
          if (typeof col.columnTooltip === 'string')
            d.tooltip = col.columnTooltip
          if (typeof col.columnTooltip === 'function')
            d.tooltip = col.columnTooltip(row, d, d.value)
        }

        if (this.combineCols.indexOf(col.name) > -1) {

          var now_col_level = this.combineCols.indexOf(col.name)

          var before_col_combine_flag = ((now_col_level - 1) >= 0) ? now_row_combine_flag[now_col_level - 1] : true

          if (before_col_combine_flag && last_val[col.name] && (last_val[col.name].value == d.value)){

            now_row_combine_flag[now_col_level] = true

            d.height = 0

            last_val[col.name].height += h
          } else {

            now_row_combine_flag[now_col_level] = false

            last_col_index[col.name] = first+i

            last_val[col.name] = d
          }
        }

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

  this.getId = function(row) {
    return self._data.getId(row)
  }

  this.toggle_expand = function(e) {
    var id = self.getId(e.item.col.row), status = self.parents_expand_status[id]
    if (status === undefined)

      status = true
    self._expand(e.item.col.row, !status)
  }

  this.expand = function (row) {
    self._expand(row, true)
    self.update()
  }

  this.collapse = function (row) {
    self._expand(row, false)
    self.update()
  }

  this._expand = function(row, expanded) {
    var item, i, len, id, self=this

    if (!row) {
      for(id in self.parents_expand_status) {
        self.parents_expand_status[id] = expanded
        if (expanded)
          self.load_node(row)
      }
    } else {
      if (Array.isArray(row)) {
        for(i=0, len=row.length; i<len; i++) {
          id = self.getId(row[i])
          if (self.parents_expand_status.hasOwnProperty(id))
            self.parents_expand_status[id] = expanded
            if (expanded)
              self.load_node(row)
        }
      } else {
        id = self.getId(row)
        if (self.parents_expand_status.hasOwnProperty(id))
          self.parents_expand_status[id] = expanded
          if (expanded)
            self.load_node(row)
      }
    }

  }

  this.load_node = function(row) {
    var id = self.getId(row), index
    var status = self.loaded_status[id]

    if (status) return

    if (self._data.has_child(row)) {
      self.loaded_status[row[self.idField]] = true
      return
    }
    self.onLoadData.call(self, row)
  }

  this.opened = function(row) {
      var id , status
      if (row instanceof Object){
        id = row.id
      } else
        id = row
      status = self.parents_expand_status[id]
      if (status === true) return true
      else if (status === false) return false
      self.parents_expand_status[id] = self.expanded
      return self.parents_expand_status[id]
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
    e.preventUpdate = true
    var status = true
    if (self.selected_rows.length > 0)
      status = false
    var ids = self._data.getIds()
    for (var i=0, len=ids.length; i<len; i++) {
      if (status)
        self.select(self._data.get(ids[i]))
      else
        self.deselect(self._data.get(ids[i]))
    }
    self.update()
  }

  this.checkcol = function(e) {
    self.toggle_select(e.item.col.row)
    e.target.checked = self.is_selected(e.item.col.row)

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

    if (!rows) rows = this._data.get()
    if (!Array.isArray(rows)) {
      rows = [rows]
    }
    for(var i=0, len=rows.length; i<len; i++){
      row = rows[i]
      if (!self.onCheckable(row)) return
      if (row instanceof Object) id = row.id
      else id = row
      if (this.selected_rows.indexOf(id) == -1) {
        if (this.onSelect(row)) {
          if (!opts.multiSelect)
            self.selected_rows = []
          this.selected_rows.push(id)
          this.onSelected(row)
          if (this.observable)
            this.observable.trigger('selected', row)
        }
      }
    }

  }

  this.deselect = function(rows) {
    var r = [], row, selected_rows = this.selected_rows, index, items = [], id
    if (!rows) {
      this.selected_rows = []
      this.onDeselected()
      if (this.observable)
        this.observable.trigger('deselected')
    }
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
        if (!self.onCheckable(row)) return
        index = items.indexOf(row)
        if (index != -1){
          selected_rows.splice(i, 1)
          items.splice(index, 1)
          this.onDeselected(this._data.get(row))
          if (this.observable)
            this.observable.trigger('deselected', this._data.get(row))
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
  this.root.expand = proxy('expand')
  this.root.collapse = proxy('collapse')
  this.root.show_loading = proxy('show_loading')

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
  this.root.addFirstChild = data_proxy('addFirstChild')
  this.root.update = data_proxy('update')
  this.root.remove = data_proxy('remove')
  this.root.get = data_proxy('get')
  this.root.load = data_proxy('load')
  this.root.insertBefore = data_proxy('insertBefore')
  this.root.insertAfter = data_proxy('insertAfter')
  this.root.move = function () {
    var result = self._data.move.apply(self._data, arguments)
    self.expand(arguments[1])
    return result
  }
  this.root.diff = data_proxy('diff')
  this.root.save = data_proxy('save')
  this.root.refresh = proxy('update')

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
    var klass = [], cls
    klass.push('rtable-cell')
    if (col.selected) klass.push('selected')
    if (col['class']) {
      if (typeof col['class'] == 'function') {
        cls = col['class'](col.row, col, col.value)
      } else
        cls = col['class']
      if (cls)
        klass.push(cls)
    }
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

  this.testing = function () {
    console.log('testing', arguments)
    return true
  }

  var create_editor = function (target, row, col) {
    var name

    if (typeof col.editor === 'string')
      name = col.editor
    else
      name = col.editor.name
    if (self.editor) {
      self.editor.destroy()
      self.editor = null
    }
    var editor = window[name+'_editor']
    if (editor) {
      $.when(self.onEdit()).then(function(r){
        if (r)
          self.editor = editor.call(self, target, row, col)
      })
    }
  }
});

riot.tag2('rtable-cell', '<div class="rtable-cell-text {rtable-tree-field:opts.col.treeField}" draggable="{parent.draggable && (!parent.tree || parent.tree && opts.col.treeField) ? ⁗true⁗ : false}"> <yield></yield> </div>', 'rtable-cell [draggable],[riot-tag="rtable-cell"] [draggable],[data-is="rtable-cell"] [draggable]{ -moz-user-select: none; -khtml-user-select: none; -webkit-user-select: none; user-select: none; -khtml-user-drag: element; -webkit-user-drag: element; }', 'class="rtable-cell-text-wrapper"', function(opts) {

  var self = this
  this.prevtag = null

  this.on('mount', function() {
    if (!opts.tag) {
      return
    }

  });

  this.on('update', function() {
    var _opts = $.extend({}, opts)

    if (this.mountedTag) this.mountedTag.unmount(true)
    var tag = this.mountedTag = riot.mount(this.root.querySelector('div'), opts.tag, opts)[0]
    return tag

  });

  this.on('unmount', function() {
    if (this.mountedTag) {
      return this.mountedTag.unmount(true)
    }
  })
});

riot.tag2('rtable-raw', '<span></span>', '', '', function(opts) {
  this.on('mount', function(){
    this.root.innerHTML = opts.value
  })
  this.on('update', function () {
    this.root.innerHTML = opts.value
  })
});
