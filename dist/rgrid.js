riot.tag2('rgrid', '<query-condition if="{has_query}" rules="{query_ules}" fields="{query_fields}" layout="{query_layout}" data="{query_data}"></query-condition> <div class="btn-toolbar"> <div if="{left_tools}" class="rgrid-tools pull-left"> <div each="{btn_group in left_tools}" class="{btn_group_class}"> <button each="{btn in btn_group}" data-is="rgrid-button" btn="{btn}"></button> </div> </div> <div if="{right_tools}" class="rgrid-tools pull-right"> <div each="{btn_group in right_tools}" class="{btn_group_class}"> <button each="{btn in btn_group}" data-is="rgrid-button" btn="{btn}"></button> </div> </div> </div> <rtable cols="{cols}" options="{rtable_options}" data="{data}" start="{start}" observable="{observable}"></rtable> <div class="clearfix tools"> <pagination if="{pagination}" data="{data}" url="{url}" page="{page}" total="{total}" limit="{limit}" onpagechanged="{onpagechanged}" onbeforepage="{onbeforepage}"></pagination> <div if="{footer_tools}" class="pull-right {btn_group_class}"> <button each="{btn in footer_tools}" data-is="rgrid-button" btn="{btn}"></button> </div> </div>', 'rgrid .rgrid-tools,[riot-tag="rgrid"] .rgrid-tools,[data-is="rgrid"] .rgrid-tools{margin-bottom:5px;padding-left:5px;} rgrid .btn-toolbar .btn-group,[riot-tag="rgrid"] .btn-toolbar .btn-group,[data-is="rgrid"] .btn-toolbar .btn-group{margin-right:8px;}', '', function(opts) {


  var self = this

  this.observable = riot.observable()

  if (opts.data) {
    if (Array.isArray(opts.data)) {
      this.data = new DataSet(opts.data)
    } else
      this.data = opts.data
  } else
    this.data = new DataSet()
  this.cols = opts.cols
  this.url = opts.url
  this.page = opts.page || 1
  this.limit = opts.limit || 10
  this.total = opts.total || 0
  this.pagination = opts.pagination == undefined ? true : opts.pagination
  this.has_query = opts.query !== undefined
  this.query = opts.query || {}
  this.query_rules = this.query.rules || {}
  this.query_fields = this.query.fields || []
  this.query_layout = this.query.layout || []
  this.query_data = this.query.data || {}
  this.start = (this.page - 1) * this.limit
  this.footer_tools = opts.footer_tools || []
  this.left_tools = opts.left_tools || opts.tools || []
  this.right_tools = opts.right_tools || []
  this.btn_group_class = opts.btn_group_class || 'btn-group btn-group-sm'
  this.onLoaded = opts.onLoaded
  this.autoLoad = opts.audoLoad || true

  this.onpagechanged = function (page) {
    self.start = (page - 1) * self.limit
    self.update()
  }

  this.onloaddata = function (parent) {
    var param = {parent:parent[opts.idField || 'id']}
    $.getJSON(self.url, param).done(function(r){
      if (r.rows.length > 0) {
        self.data.add(r.rows, parent)
      }
      else {
        parent.has_children = false
        self.update()
      }
    })
  }

  this.onbeforepage = function () {
    self.table.show_loading(true)
  }

  this.rtable_options = {
    theme : opts.theme,
    combineCols : opts.combineCols,
    nameField : opts.nameField || 'name',
    labelField : opts.labelField || 'title',
    indexCol: opts.indexCol,
    checkCol: opts.checkCol,
    multiSelect: opts.multiSelect,
    maxHeight: opts.maxHeight,
    minHeight: opts.minHeight,
    height: opts.height,
    width: opts.width,
    rowHeight: opts.rowHeight,
    container: $(this.root).parent(),
    noData: opts.noData,
    tree: opts.tree,
    expanded: opts.expanded === undefined ? true : opts.expanded,
    useFontAwesome: opts.useFontAwesome === undefined ? true : opts.useFontAwesome,
    idField: opts.idField,
    parentField: opts.parentField,
    orderField: opts.orderField,
    levelField: opts.levelField,
    treeField: opts.treeField,
    onDblclick: opts.onDblclick,
    onClick: opts.onClick,
    onMove: opts.onMove,
    onEdit: opts.onEdit,
    onEdited: opts.onEdited,
    onSelect: opts.onSelect,
    onSelected: opts.onSelected,
    onDeselected: opts.onDeselected,
    onLoadData: opts.onLoadData || this.onloaddata,
    draggable: opts.draggable,
    editable: opts.editable,
    onSort: opts.onSort,
    remoteSort: opts.remoteSort
  }

  this.on('mount', function(){
    var item, items
    var tools = this.left_tools.concat(this.right_tools).concat([this.footer_tools])
    for(var i=0, len=tools.length; i<len; i++){
        items = tools[i]
        for(var j=0, _len=items.length; j<_len; j++) {
          item = items[j]
          var onclick = function(btn) {
              return function(e) {
                if (btn.onClick)
                  return btn.onClick.call(self, e)
                if (btn.url)
                  window.location.href = btn.url
              }
          }
          item.onclick = onclick(item)

          item.disabled = function(btn) {
              if (btn.onDisabled)
                return btn.onDisabled.call(self)
              if (btn.checkSelected)
                return self.table.get_selected().length == 0
          }
          item.class = 'btn btn-sm ' + (item.class || 'btn-primary')
        }
    }
    this.table = this.root.querySelector('rtable')
    this.root.add = this.table.add
    this.root.addFirstChild = this.table.addFirstChild
    this.root.update = this.table.update
    this.root.remove = this.table.remove
    this.root.get = this.table.get
    this.root.load = this.load
    this.root.insertBefore = this.table.insertBefore
    this.root.insertAfter = this.table.insertAfter
    this.root.get_selected = this.table.get_selected
    this.root.expand = this.table.expand
    this.root.collapse = this.table.collapse
    this.root.is_selected = this.table.is_selected
    this.root.move = this.table.move
    this.root.save = this.table.save
    this.root.diff = this.table.diff
    this.root.getButton = this.getButton
    this.root.refresh = this.update
    this.root.instance = this
    if (this.url && this.autoLoad) {
      this.table.show_loading(true)
      this.load()
    }

    this.observable.on('selected deselected', function(row) {
      self.update()
    })

    self.data.on('*', function(r, d){
      if (self.pagination) {
        if (r == 'remove') self.total -= d.items.length
        else if (r == 'add') self.total += d.items.length
      } else
        self.total = self.data.length
    })

  })

  this.load = function(url, param){
    var f
    param = param || {}
    var _f = function(r){
      return r.rows
    }

    self.url = url || self.url
    if (opts.tree) f = self.data.load_tree(self.url, param, _f)
    else f = self.data.load(self.url, param, this.onLoaded || _f)
    f.done(function(r){
      self.total = r.total
      self.update()
      self.data.save()
    })
  }

  this.getButton = function(id) {
    return document.getElementById(id)
  }
});

riot.tag2('rgrid-button', '<i if="{opts.btn.icon}" class="{opts.btn.icon}"></i> <span>{opts.btn.label}</span>', '', 'class="{opts.btn.class}" id="{opts.btn.id}" type="button" __disabled="{opts.btn.disabled(btn)}" onclick="{opts.btn.onclick}"', function(opts) {
});
