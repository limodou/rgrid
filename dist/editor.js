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
      self.root.update(row)
      input.destory()
    } else if (e.keyCode == 27) {
      input.destory()
    }
  })
  // input.on('blur', function(e){
  //   input.destory()
  // })
  input.destory = function () {
    input.remove()
  }

  return input
}

var select_editor = function (parent, row, col) {
  var self = this
  var $p = $(parent), w=$p.width(), h=$p.height()
  var tmpl = [
    riot.util.tmpl('<select name={name} class="inline-editor">', {name:col.name})
  ]
  var item, choices=col.editor.choices
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
    self.root.update(row)
    input.destory()
  })

  input.destory = function () {
    input.remove()
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
      self.root.update(row)
      input.destory()
    }
  })

  input.pikaday('show')

  input.destory = function () {
    input.remove()
  }

  return input
}
