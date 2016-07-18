/*
  rtable v1.0
  author : limodou@gmail.com

  options:
    cols(Must):           column definition
    data(Optional):       data source, could be DataSet instance, or just array or empty
    height(Optional):     height of grid, if no provided, it'll use parent height, if the value is 'auto', it'll
        increase grid     height automatically, so there will be no scroll-y at all
    width(Optional):      width of grid, if no provided, it'll use parent width
    rawHeight(Optional):  single row height. Default is 24px
    nameField(Optional):  Which value will be used for name of column, default is 'name'
    titleField(Optional): Which value will be used for title of column, default is 'title'
    start:                Starting index value, it'll be used for index column

  events:
    onUpdate:             When DataSet changed, it'll invoke function(dataset, action, changed)
*/
<rtable>

  <style scoped>
    .action {cursor:pointer;}

    .rtable-root {
      position:relative;
      border: 1px solid gray;
      box-sizing: border-box;
    }
    .rtable-header {
      position:absolute;
      box-sizing: border-box;
    }
    .rtable-header.rtable-fixed {
      left:0;
      top:0;
      /*border-right:1px solid gray;*/
    }
    .rtable-header.rtable-main {
      top:0;
      overflow:hidden;
      border-right:1px solid gray;
    }
    .rtable-cell {
      position:absolute;
      box-sizing: border-box;
      border-right:1px solid gray;
      border-bottom:1px solid gray;
      background-color: white;
    }
    .rtable-cell>* {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .rtable-cell > .rtable-resizer {
      width:4px;
      position:absolute;
      height:100%;
      cursor: col-resize;
      top:0px;
      right:0px;
    }
    .rtable-header .rtable-cell {
      text-align:center;
      vertical-align: middle;
    }
    .rtable-body {
      position:absolute;
      box-sizing: border-box;
    }
    .rtable-body.rtable-fixed {
      left:0;
      overflow: hidden;
    }
    .rtable-body.rtable-main {
      overflow: auto;
    }
  </style>

  <yield/>

  <div class="rtable-root" style="width:{width}px;height:{height}px">
    <div class="rtable-header rtable-fixed" style="width:{fix_width}px;height:{header_height}px">
      <div each={fix_columns} no-reorder class={rtable-cell:true}
        style="width:{width}px;height:{height}px;left:{left}px;top:{top}px;line-height:{height}px;">
        <div data-is="raw" content={title}></div>
        <div if={!fixed && leaf} class="rtable-resizer" onmousedown={colresize}></div>
      </div>
    </div>
    <div class="rtable-header rtable-main" style="width:{width-fix_width-1-scrollbar_width}px;height:{header_height}px;left:{fix_width}px;">
      <div each={main_columns} no-reorder class={rtable-cell:true}
        style="width:{width}px;height:{height}px;left:{left}px;top:{top}px;line-height:{height}px;">
        <div data-is="raw" content={title}></div>
        <div if={!fixed && leaf} class="rtable-resizer" onmousedown={colresize}></div>
      </div>
    </div>

    <div class="rtable-body rtable-fixed" style="width:{fix_width}px;bottom:{scrollbar_width}px;top:{header_height}px;">
      <!-- transform:translate3d(0px,{0-content.scrollTop}px,0px); -->
      <div class="rtable-content" style="width:{fix_width}px;height:{rows.length*rowHeight}px;">
        <div each={visCells.fixed} no-reorder class={rtable-cell:true}
          style="width:{width}px;height:{height}px;left:{left}px;top:{top}px;line-height:{height}px;">
          <div data-is="raw" if={!buttons} content={value}></div>
        </div>
      </div>
    </div>
    <div class="rtable-body rtable-main"  onscroll={scrolling}
      style="left:{fix_width}px;top:{header_height}px;right:0px;bottom:0px;">
      <!-- transform:translate3d({0-content.scrollLeft}px,{0-content.scrollTop}px,0px); -->
      <div class="rtable-content" style="width:{main_width}px;height:{rows.length*rowHeight}px;">
        <div each={col in visCells.main} no-reorder class="rtable-cell"
            style="width:{col.width}px;height:{col.height}px;left:{col.left}px;top:{col.top}px;line-height:{col.height}px;">
            <div data-is="raw" if={!col.buttons} content={col.value}></div>
            <virtual if={col.buttons} no-reorder each={btn in col.buttons}>
              <i if={ btn.icon } class="fa fa-{btn.icon} action" title={ btn.title }
                onclick={parent.parent.action_click(parent.col, btn)}></i>
              <a if={ btn.label } class="action" title={ btn.title }
                href={ btn.href || '#' }
                onclick={parent.parent.action_click(parent.col, btn)}>{ btn.label }</a>
            </virtual>
          </div>
        </div>
      </div>
    </div>
  </div>

  var self = this
  var EL = self.root
  this.cols = opts.cols
  this.nameField = opts.nameField || 'name'
  this.titleField = opts.titleField || 'title'
  this.onUpdate = opts.onUpdate || function(){}
  this.rowHeight = opts.rowHeight || 24
  this.visCells = []
  if (opts.data) {
    if (Array.isArray(opts.data)) {
      this.rows = new DataSet()
      this.rows.add(opts.data)
    }
    else
      this.rows = opts.data
  } else {
    this.rows = new DataSet()
  }

  this.bind = function (dataset) {
    // 绑定事件
    dataset.on('*', function(r, d){
        self.onUpdate(dataset, r, d)
      self.update()
    })
  }

  this.on('mount', function() {
    if (opts.width === 'auto' || !opts.width) {
      this.width = $(this.root).parent().width()
    } else {
      this.width = opts.width
    }
    if (opts.height === 'auto' || !opts.height) {
      this.height = $(this.root).parent().height()
    } else {
      this.height = opts.height
    }

    this.content = this.root.querySelectorAll(".rtable-body.rtable-main")[0]
    this.header = this.root.querySelectorAll(".rtable-header.rtable-main")[0]
    this.content_fixed = this.root.querySelectorAll(".rtable-body.rtable-fixed")[0]
    this.calHeader()
    this.bind(this.rows)
    this.update()
  })

  this.colresize = function (e) {
    var start = e.clientX
    var header = $(this.header)
    var root = $(document)
    var col = e.item
    var width = col.width, d

    //取消文字选择
    document.selection && document.selection.empty && ( document.selection.empty(), 1)
    || window.getSelection && window.getSelection().removeAllRanges();
    document.body.onselectstart = function () {
        return false;
    };
    header.css('-moz-user-select','none');

    root.on('mousemove', function(e){
      d = Math.max(width + e.clientX - start, 5)
      col.real_col.width = d
      self.calHeader()
      self.update()
    }).on('mouseup', function(e){
        document.body.onselectstart = function(){
            return true;//开启文字选择
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
    var columns = [], i, len, j, col,
      subs_len,
      path,
      rowspan, //每行平均层数，max_level/sub_len，如最大4层，当前总层数为2,则每行占两层
      colspan,
      parent, //上一层的结点为下一层的父结点
      new_col, //记录显示用的表头单元
      last_pos, //记录上一层的列数，用于判断是否当前层要和前一个结点合并
      left  //某层最左结点

    if (!cols || cols.length === 0)
      return []

    //初始化表头层
    for (i=0; i<max_level; i++) {
      columns.push([])
    }
    //处理多级表头
    for(i=0, len=cols.length; i<len; i++) {
      col = cols[i]
      subs_len = col.subs.length
      rowspan = 1//Math.floor(max_level / subs_len)
      last_pos = -1
      for (j=0; j<subs_len; j++) {
        path = col.subs[j]
        new_col = {}
        new_col.title = path
        if (j == subs_len - 1) {
          //如果是最后一层，则rowspan为最大值减其余层
          new_col.rowspan = max_level - (subs_len-1)*rowspan
          new_col.leaf = true
          //new_col.real_col = col
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

        //查找同层最左边的结点，判断是否title和rowspan一致
        //如果一致，进行合并，即colspan +1
        //如果不一致，则插入新的结点
        //对于一层以下的结点，还要看上一层是否同一个结点，如果是才合并，否则插入
        if (columns[j].length > 0)
          left = columns[j][columns[j].length-1]
        else
          left = null

        //取上一结点的col值
        if (j == 0) {
          last_pos = -1
          parent = null
        } else {
          //上一层的最后一个结点是父结点
          parent = columns[j-1][columns[j-1].length-1]
          last_pos = parent.col
        }

        //进行合并的判断，当left不为null，并且标题，层级，并且位置小于当前位置
        if (left && left.title==new_col.title && left.level==new_col.level && last_pos<i) {
          left.colspan ++
          left.width += new_col.width
        } else {
          columns[j].push(new_col)
          new_col.parent_col = parent
          if (i == 0) {
            new_col.left = 0
          } else {
            new_col.left = left.left + left.width
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

  /* 计算表头
  将 [a/b/c， a/b/d] 形式的表头处理为 [[{a, colspan=1}],[{b, colspan=1}], [{c, colspan=1}]]
  */
  this.calHeader = function () {
    var columns,
      fix_columns,
      col,
      max_level //最大行层数
      fix_cols = [],
      cols = [],
      cal_cols=[],
      width = 0;

    max_level = 0
    //第一次循环取最大的层数
    for (var i=0, len=self.cols.length; i<len; i++){
      col = self.cols[i]
      if (col.hidden)
        continue
      if (col.frozen)
        fix_cols.push(col)
      else
        cols.push(col)
      col.name = col[this.nameField]
      col.title = col[this.titleField] || col.name //如果没有设label，则使用name
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

    //console.log(fix_columns, columns)
    this.calPos()
  }

  /* 计算各种坐标
  */
  this.calPos = function() {
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
    this.main_width = main_width //内容区宽度
    this.has_yscroll = this.rows.length * this.rowHeight > (this.height - this.header_height)
    this.has_xscroll = this.main_width > (this.width - this.fix_width)
    this.scrollbar_width = getScrollbarWidth()

  }

  /* 计算可视单元格 */
  this.calVis = function() {
    var i, j, last, len, len1, r2, cols, row, col, new_row, value, d,
      visible, visiblefixed, visrows, top, h

    first = Math.max(Math.floor(this.content.scrollTop / this.rowHeight), 0)
    last = Math.ceil((this.content.scrollTop+this.height-this.header_height) / this.rowHeight)
    var b = new Date().getTime()

    visrows = this.rows.get().slice(first, last)
    visible = []
    visiblefixed = []
    h = this.rowHeight
    <!-- cols = this.fix_cols.concat(this.main_cols) -->
    cols = this.fix_columns.concat(this.main_columns)
    for (i = 0, len = visrows.length; i < len; i++) {
      row = visrows[i];
      top = h*(first+i)
      for (j=0, len1=cols.length; j<len1; j++) {
        col = cols[j]
        d = {top:top, width:col.width, height:h, left: col.left,
          value:this.get_col_data(col, row[col.name]), row:row,
          render:col.render, buttons:col.buttons}
        if (col.frozen)
          visiblefixed.push(d)
        else
          visible.push(d)
      }
    }
    this.visCells = {
      fixed: visiblefixed,
      main: visible
    }
  }

  this.scrolling = function(e) {
    e.preventUpdate = true
    this.header.scrollLeft = this.content.scrollLeft
    this.content_fixed.scrollTop = this.content.scrollTop
    return this.update()
  }


  EL.load = function(newrows){
    self.rows.clear()
    self.rows.add(newrows)
  }.bind(this);

  EL.change = function(newrows){
    self.rows.update(newrows)
  }.bind(this);

  EL.setData = function(dataset){
    self.rows = dataset
    self.bind(self.rows)
  }.bind(this);

  this.get_col_data = function(col, value) {
    if (col.render && typeof col.render === 'function') {
      return col.render(col.row, col, value)
    }
    if (col.name == '#') value = self.start + index + 1
    return value
  }

  this.action_click = function (col, btn) {
    return function (e) {
      if (btn.onclick && typeof btn.onclick === 'function') {
        //绑定this为e.target，即当前dom元素
        btn.onclick.call(e.target, col.row, self)
      }
    }
  }

</rtable>

<raw>
  <span></span>
  this.on('mount', function(){
    this.root.innerHTML = opts.content
  })
  this.on('update', function () {
    this.root.innerHTML = opts.content
  })
</raw>
