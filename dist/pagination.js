
riot.tag2('pagination', '<ul class="pagination"> <li if="{totalMessage}" class="disabled total"><a>{totalMessage}</a></li> <li if="{has_first}" class="first"><a href="#" onclick="{go(1)}"><raw content="{first}"></raw></a></li> <li if="{has_prev}" class="prev"><a href="#" onclick="{go(page-1)}"><raw content="{prev}"></raw></a></li> <li class="{page:true, active:p==page}" each="{p in pages}"><a href="#" onclick="{go(p)}">{p}</a></li> <li if="{has_next}" class="next"><a href="#" onclick="{go(page+1)}"><raw content="{next}"></raw></a></li> <li if="{has_last}" class="last"><a href="#" onclick="{go(totalPages)}"><raw content="{last}"></raw></a></li> <li if="{refresh}" class="refresh"><a href="#" onclick="{go(page)}"><raw content="{refresh}"></raw></a></li> </ul>', '', '', function(opts) {

  var self = this

  this.total = opts.total
  this.page = opts.page || 1
  this.limit = opts.limit || 10
  this.url = opts.url
  this.data = opts.data
  this.limits = opts.limits || [10, 20, 30, 40, 50]
  this.size = opts.size || 10
  this.pages = []
  this.onpage = opts.onpage || function () {
    return self.data.load(self.get_url(), function(data){
      self.total = data.total
      return data.rows
    })
  }
  this.onpagechanged = opts.onpagechanged

  this._totalMessage = opts.totalMessage || '共 $pages 页 / $records 条记录'
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

  this.get_url = function(page) {
    return get_url(self.url, {page:page||self.page, limit:self.limit})
  }

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

  this.show = function (page) {
    self.total = opts.total || self.total
    self.page = page || self.page
    self.totalPages = parseInt(self.total / self.limit)
    if (self.total % self.limit > 0) self.totalPages++;
    if (self._totalMessage){
      self.totalMessage = self._totalMessage.replace('$pages', self.totalPages);
      self.totalMessage = self.totalMessage.replace('$records', self.total);
    }

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

});

riot.tag2('raw', '<span></span>', '', '', function(opts) {
  this.on('update', function () {
    this.root.innerHTML = opts.content
  })
});
