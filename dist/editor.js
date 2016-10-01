var string_editor = function (parent, row, col) {
  var self = this
  var $p = $(parent), w=$p.width(), h=$p.height()
  var input = $(riot.util.tmpl('<input type="text" name={name} value="{value}" placeholder="{placeholder}" class="inline-editor"></input>', col))
  input.css({
    position:'absolute',
    left:$p.css('paddingLeft'),
    top:0,
    width:w,
    height:h,
    margin:0,
    padding:0,
    border:'none',
    boxSizing:'border-box',
    zIndex:1000,
    fontSize:14,
    backgroundColor:'#ffefd5',
  })
  $p.append(input)
  input.focus().select()

  input.on('keyup', function(e){
    if (e.keyCode == 13) {
      var value = input.val()
      row[col.name] = value
      $.when(self.onEdited(row, col, value)).then(function(r){
        if (r) {
          self.root.update(row)
          input.destroy()
        }
      })
    } else if (e.keyCode == 27) {
      input.destroy()
    }
  })
  input.on('blur', function(e){
    input.destroy()
  })
  input.destroy = function () {
    input.remove()
    self.editor = null
  }

  return input
}

var select_editor = function (parent, row, col) {
  var self = this
  var $p = $(parent), w=$p.width(), h=$p.height()
  var tmpl = [
    '<select name="' + col.name + '" class="inline-editor" ' + (col.editor.multiple?'multiple="multiple"':'') + '>'
  ]
  var item, choices=col.editor.choices
  if (col.editor.placeholder) {
    tmpl.push('<option value="">'+col.editor.placeholder+'</option>')
  }
  for(var i=0, len=choices.length; i<len; i++) {
    item = {value:col.value, option_value:choices[i][0], option_text:choices[i][1]}
    tmpl.push(riot.util.tmpl('<option {value==option_value?"selected":""} value={option_value}>{option_text}</option>', item))
  }
  tmpl.push('</select>')
  var input = $(tmpl.join(''))
  input.css({
    position:'absolute',
    left:0,
    top:0,
    width:w,
    height:h,
    margin:0,
    padding:0,
    border:'none',
    boxSizing:'border-box',
    zIndex:1000,
    fontSize:14,
    backgroundColor:'#ffefd5'
  })
  $p.append(input)
  input.focus()

  input.on('change', function(e){
    var value = input.val()
    row[col.name] = value
    $.when(self.onEdited(row, col, value)).then(function(r){
      if (r) {
        self.root.update(row)
        input.destroy()
      }
    })
  })

  input.destroy = function () {
    input.remove()
    self.editor = null
  }

  return input
}

var date_editor = function (parent, row, col) {
  var self = this
  var $p = $(parent), w=$p.width(), h=$p.height()
  var input = $(riot.util.tmpl('<input type="text" name={name} value="{value}" placeholder="{placeholder}" class="inline-editor"></input>', col))
  input.css({
    position:'absolute',
    left:0,
    top:0,
    width:w,
    height:h,
    margin:0,
    padding:0,
    border:'none',
    boxSizing:'border-box',
    zIndex:1000,
    fontSize:14,
    backgroundColor:'#ffefd5'
  })
  $p.append(input)
  input.focus().select().pikaday({
    format: 'YYYY-MM-DD',
    showTime:false,
    onClose:function () {
      var value = input.val()
      row[col.name] = value
      $.when(self.onEdited(row, col, value)).then(function(r){
        if (r) {
          self.root.update(row)
          input.destroy()
        }
      })
    }
  })

  input.pikaday('show')

  input.destroy = function () {
    input.remove()
    self.editor = null
  }

  return input
}

var select2_editor = function (parent, row, col) {
  var self = this
  var $p = $(parent), w=$p.width(), h=$p.height()
  var tmpl = [
    '<select name="' + col.name + '" class="inline-editor" ' + (col.editor.multiple?'multiple="multiple"':'') + '>'
  ]
  var item
  var value, text=[], choices=[], value_from = col.editor.value_from
  if (col.editor.multiple) {
    if (value_from) {
      value = col.row[value_from]['value']
      if (Array.isArray(value)) {
        for(var j=0, _len=value.length; j<_len; j++) {
          choices.push([col.row[value_from]['value'][j], col.row[value_from]['text'][j]])
        }
      } else {
        choices = [[col.row[value_from]['value'], col.row[value_from]['text']]]
      }
    }
    else {
      value = col.value
      choices = [[value, value]]
    }
  } else {
    value = [col.value]
    choices = [[col.value, col.value]]
  }
  var choices = col.editor.choices ? col.editor.choices : choices
  if (col.editor.placeholder)
    tmpl.push('<option value="">'+col.editor.placeholder+'</option>')
  for(var i=0, len=choices.length; i<len; i++) {
    item = {value:value, option_value:choices[i][0], option_text:choices[i][1]}
    tmpl.push(riot.util.tmpl('<option {value.indexOf(option_value)>-1?"selected":""} value={option_value}>{option_text}</option>', item))
  }
  tmpl.push('</select>')
  var input = $(tmpl.join(''))
  input.css({
    position:'absolute',
    left:0,
    top:0,
    width:w,
    height:h,
    margin:0,
    padding:0,
    border:'none',
    boxSizing:'border-box',
    zIndex:1000,
    fontSize:14,
    backgroundColor:'#ffefd5'
  })
  $p.append(input)
  input.focus()
  if (col.editor.url)
    input.attr('url', col.editor.url)
  if (col.editor['data-url'])
    input.attr('url', col.editor['data-url'])
  if (col.editor.placeholder)
    input.attr('placeholder', col.editor.placeholder)
  _simple_select2(input)
  $p.find('.select2-container').css({
      zIndex: 2000,
      position: 'absolute',
      left: 0,
      top: 0
  })
  $p.css({
    overflow: 'visible',
    position: 'relative'
  })

  input.on('select2:close', function(e){
    input.destroy()
  })
  input.on('change', function(e){
    var value = input.val()
    row[col.name] = value
    if (col.editor.value_from) {
      if (col.editor.multiple) {
        for(var i=0, len=input.select2('data').length; i<len; i++) {
          text.push(input.select2('data')[i].text)
        }
        row[col.editor.value_from] = {value:value, text:text}
      } else {
        text = input.select2('data')[0].text
        row[col.editor.value_from] = {value:value, text:text}
      }
    }
    else row[col.name] = value
    $.when(self.onEdited(row, col, value)).then(function(r){
      if (r) {
        self.root.update(row)
        input.destroy()
      }
    })
  })

  input.destroy = function () {
    if (input.data('select2')) {
      input.select2('destroy')
    }
    input.remove()
    self.editor = null
  }

  return input
}

function _simple_select2 (el, options){
  var $el = $(el),
    url = $el.attr('data-url') || $el.attr('url'),
    placeholder = $el.attr('placeholder') || '请选择';
  options = options || {}
  if (typeof options === 'string') {
    url = options
    options = {}
  }
  var opts, data
  var limit = options.limit || 10
  if (url)
    opts = {
      minimumInputLength: 2,
      width: '100%',
      placeholder:{
        id:'',
        placeholder:placeholder
      },
      allowClear:true,
      language: 'zh-CN',
      ajax: {
          url: url,
          data: function (params) {
              return {
                  term: params.term,
                  label: 'text',
                  page:params.page,
                  limit:limit
              }
          },
          dataType: 'json',
          processResults: function (result, params) {
            // parse the results into the format expected by Select2
            // since we are using custom formatting functions we do not need to
            // alter the remote JSON data, except to indicate that infinite
            // scrolling can be used
            params.page = params.page || 1;

            if (!Array.isArray(result)) {
              data = result.rows
              total = result.total
            } else {
              data = result
              total = 0
            }
            return {
              results: data,
              pagination: {
                more: (params.page * limit) < total
              }
            }
          }
      }
    }
      /*,
      formatNoMatches: function () { return "找不到对应值"; },
      formatInputTooShort: function (input, min) { return "请输入至少 " + (min - input.length) + " 个字符"; },
      formatSelectionTooBig: function (limit) { return "你只能选 " + limit + " 条数据"; },
      formatLoadMore: function (pageNumber) { return "装入更多数据..."; },
      formatSearching: function () { return "搜索..."; }
      */

  else
    opts = {
      width: '100%',
      allowClear:true,
      placeholder:{
        id:'',
        placeholder:placeholder
      },
      language: 'zh-CN'
    }

  $el.select2($.extend(true, {}, opts, options));
}
