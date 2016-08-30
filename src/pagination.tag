<!-- 分页控件 -->
<pagination>

  <ul class="pagination">
    <li if={totalMessage} class="disabled total"><a>{totalMessage}</a></li>
    <li if={has_first} class="first"><a href="#" onclick={go(1)}><raw content={first}></raw></a></li>
    <li if={has_prev} class="prev"><a href="#" onclick={go(page-1)}><raw content={prev}></raw></a></li>
    <li class={page:true, active:p==page} each={p in pages}><a href="#" onclick={go(p)}>{p}</a></li>
    <li if={has_next} class="next"><a href="#" onclick={go(page+1)}><raw content={next}></raw></a></li>
    <li if={has_last} class="last"><a href="#" onclick={go(totalPages)}><raw content={last}></raw></a></li>
    <li if={refresh} class="refresh"><a href="#" onclick={go(page)}><raw content={refresh}></raw></a></li>
  </ul>

  var self = this

  this.total = opts.total       //记录总数
  this.page = opts.page || 1    //当前页号
  this.limit = opts.limit || 10 //每页记录条数，当值为 <=0 时，不限制
  this.url = opts.url           //数据展示URL
  this.data = opts.data         //数据源
  this.limits = opts.limits || [10, 20, 30, 40, 50] //每次最大条数
  this.size = opts.size || 10   //页号范围
  this.pages = []
  this.onpage = opts.onpage || function () {
    return self.data.load(self.get_url(), function(data){
      self.total = data.total   //根据反回值修改total
      return data.rows
    })
  }    //页面事件回调,缺省使用data作为数据源
  this.onpagechanged = opts.onpagechanged

  this._totalMessage = opts.totalMessage || '共 $pages 页 / $records 条记录'  //'Total $pages pages / $records records'
  this.prev = opts.prev || '上一页'
  this.has_prev = false
  this.next = opts.next || '下一页'
  this.has_next = false
  this.first = opts.first || '首页'
  this.has_first = false
  this.last = opts.last || '尾页'
  this.has_last = false
  this.refresh = opts.refresh || '刷新'

  this.on('update', function(){
    this.total = opts.total
    self.show()
  })

  /* 获得指定页的URL
   * @param page: 指定页号，如果未提供则直接使用 this.page, 需要有uliweb-ui的
   *              query_string的支持
   *              将添加 page= & limit= 两个参数
   */
  this.get_url = function(page) {
    return get_url(self.url, {page:page||self.page, limit:self.limit})
  }

  /* 跳转指定页
   * @param page: 指定页号，如果未提供则直接使用 this.page，并且设置当前页号
   *               如果opts中有onpage回调，则通过promise来先处理onpage，
   *               然后再调用show，需要有jquery的支持
   */
  this.go = function (page) {
    f = function (e) {
      self.page = page
      if (self.onpage && typeof self.onpage === 'function') {
        $.when(self.onpage.call(self, page)).done(function(data){
          self.show(page)
          if (self.onpagechanged) {
            self.onpagechanged(page)
          }
        })
      } else {
        self.show()
      }
    }
    return f
  }

  /* 显示指定页
   * @param start: 指定页号，如果未提供则直接使用 this.page，并且设置当前页号
   */
  this.show = function (page) {
    self.total = opts.total || self.total
    self.page = page || self.page
    self.totalPages = parseInt(self.total / self.limit)
    if (self.total % self.limit > 0) self.totalPages++;
    if (self._totalMessage){
      self.totalMessage = self._totalMessage.replace('$pages', self.totalPages);
      self.totalMessage = self.totalMessage.replace('$records', self.total);
    }

    //计算显示页号
    var page = self.page;
    var mid = self.size / 2;
    if (self.size % 2 > 0) mid = (self.size + 1) / 2;
    var startIndex = 1;
    if (page >= 1 && page <= self.totalPages) {
      if (page >= mid) {
        if (self.totalPages - page >= mid) startIndex = page - (mid - 1);
        else startIndex = Math.max(self.totalPages - self.size + 1, 1);
      }
    }

    self.pages = []
    for(var i=startIndex, len=Math.min(startIndex+self.size-1, self.totalPages); i<=len; i++) {
      self.pages.push(i)
    }

    if (self.size > 1) {
      self.has_prev = self.prev && page > 1
      self.has_next = self.next && page < self.totalPages
      self.has_first = startIndex !== 1
      self.has_last = self.pages[self.pages.length-1] < self.totalPages
    } else {
      self.has_prev = false
      self.has_next = false
      self.has_last = false
      self.has_first = false
    }

    self.update()
  }


</pagination>

<raw>
  <span></span>
  this.on('update', function () {
    this.root.innerHTML = opts.content
  })
</raw>
