/**
 * DataSet
 *
 * Usage:
 *     var dataSet = new DataSet({
 *         idField: '_id',
 *         type: {
 *             // ...
 *         }
 *     });
 *
 *     dataSet.add(item);
 *     dataSet.add(data); //array data
 *     dataSet.update(item);
 *     dataSet.update(data); //array data
 *     dataSet.remove(id);
 *     dataSet.remove(ids); //array data
 *     var data = dataSet.get();
 *     var data = dataSet.get(id);
 *     var data = dataSet.get(ids);
 *     var data = dataSet.get(ids, options, data);
 *     dataSet.clear();
 *
 * A data set can:
 * - add/remove/update data
 * - gives triggers upon changes in the data
 * - can  import/export data in various data formats
 *
 * @param {Array} [data]    Optional array with initial data
 * @param {Object} [options]   Available options:
 *                             {String} idField Field name of the id in the
 *                                              items, 'id' by default.
 *                             {Object.<String, String} type
 *                                              A map with field names as key,
 *                                              and the field type as value.
 *                             {Object} queue   Queue changes to the DataSet,
 *                                              flush them all at once.
 *                                              Queue options:
 *                                              - {number} delay  Delay in ms, null by default
 *                                              - {number} max    Maximum number of entries in the queue, Infinity by default
 * @constructor DataSet
 */
function DataSet(data, options) {
  // correctly read optional arguments
  if (data && !Array.isArray(data)) {
    options = data;
    data = null;
  }

  this._data = []; // map with data indexed by id
  this._ids = {};
  this.setOption(options);
  this.length = 0; // number of items in the DataSet
  this._type = {}; // internal field types (NOTE: this can differ from this._options.type)
  this._mute = false; //used to toggle event trigger status
  this._saved = [];   //saved data

  // all variants of a Date are internally stored as Date, so we can convert
  // from everything to everything (also from ISODate to Number for example)
  if (this._options.type) {
    for (var field in this._options.type) {
      if (this._options.type.hasOwnProperty(field)) {
        var value = this._options.type[field];
        if (value == 'Date' || value == 'ISODate' || value == 'ASPDate') {
          this._type[field] = 'Date';
        } else {
          this._type[field] = value;
        }
      }
    }
  }

  this._subscribers = {}; // event subscribers

  //init async function
  this.remove = this.async_call(remove);

  // add initial data when provided
  if (data) {
    this.add(data);
  }
}

DataSet.prototype.setOption = function(options) {
  this._options = options || {}
  this._idField = this._options.idField || 'id'; // name of the field containing id
  this._parentField = this._options.parentField || 'parent'; //name of the parent field containing id
  this._childField = this._options.childField || 'nodes';
  this._orderField = this._options.orderField || 'order';
  this._levelField = this._options.levelField || 'level';
  this._hasChildrenField = this._options.hasChildrenField || 'has_children';
  this._isTree = this._options.tree || false;
}

/**
 * Subscribe to an event, add an event listener
 * @param {String} event        Event name. Available events: 'put', 'update',
 *                              'remove'
 * @param {function} callback   Callback method. Called with three parameters:
 *                                  {String} event
 *                                  {Object | null} params
 *                                  {String | Number} senderId
 */
DataSet.prototype.on = function (event, callback) {
  var subscribers = this._subscribers[event];
  if (!subscribers) {
    subscribers = [];
    this._subscribers[event] = subscribers;
  }

  subscribers.push({
    callback: callback
  });
};

/**
 * Unsubscribe from an event, remove an event listener
 * @param {String} event
 * @param {function} callback
 */
DataSet.prototype.off = function (event, callback) {
  var subscribers = this._subscribers[event];
  if (subscribers) {
    this._subscribers[event] = subscribers.filter(function (listener) {
      return listener.callback != callback;
    });
  }
};

DataSet.prototype.mute = function (flag) {
  this._mute = flag === undefined ? true : flag
}

/**
 * Trigger an event
 * @param {String} event
 * @param {Object | null} params
 * @param {String} [senderId]       Optional id of the sender.
 * @private
 */
DataSet.prototype._trigger = function (event, params, senderId) {
  if (this._mute) return
  if (event == '*') {
    throw new Error('Cannot trigger event *');
  }

  var subscribers = [];
  if (event in this._subscribers) {
    subscribers = subscribers.concat(this._subscribers[event]);
  }
  if ('*' in this._subscribers) {
    subscribers = subscribers.concat(this._subscribers['*']);
  }

  for (var i = 0; i < subscribers.length; i++) {
    var subscriber = subscribers[i];
    if (subscriber.callback) {
      subscriber.callback(event, params, senderId || null);
    }
  }
};

/**
 * Get an item id
 * @param {Object | Number | String} item
 * @private
 */
DataSet.prototype.getId = function (item) {
    if (item instanceof Object)
      return item[this._idField]
    else {
      return item
    }
};

DataSet.prototype.async_call = function (f) {
  var me = this
  var _f = function (id, url) {
    var func

    if (url) {
      if (typeof url === 'string') {
        func = function(){
          return $.post(url)
        }
      } else if (typeof url === 'function') {
        func = url
      } else {
        throw new Error("url should be string or function type")
      }
      return $.when(func()).done(function(data){
        ret = f.call(me, data.data)
        return ret
      })
    } else {
      return f.call(me, id)
    }
  }
  return _f
};

DataSet.prototype.add = function (data, parent) {
  return this._add(data, parent, 'after')
}

DataSet.prototype.addFirstChild = function (data, parent) {
  return this._add(data, parent, 'first')
}

/**
 * Add data.
 * Adding an item will fail when there already is an item with the same id.
 * @param {Object | Array} data
 * @param {String} [parentId] Optional parent id
 * @return {Array} addedIds      Array with the ids of the added items
 */
DataSet.prototype._add = function (data, parent, position) {
  var addedIds = [],
      id,
      me = this, level, item, p;

  if (Array.isArray(data)) {
    // Array
    for (var i = 0, len = data.length; i < len; i++) {
      item = data[i]
      if (me._isTree && i>0 && item[me._parentField]) {
        p = me.get(item[me._parentField])
        if (!p)
            p = parent
        id = me._addItem(item, p, position)
      } else
        id = me._addItem(item, parent, position);
      addedIds.push(id);
      if (item[me._childField] && item[me._childField].length > 0) {
        addedIds.concat(me.add(item[me._childField], item[me._idField]))
      }
    }
  } else if (data instanceof Object) {
    // Single item
    id = me._addItem(data, parent, position);
    addedIds.push(id);
    if (data[me._childField] && data[me._childField].length > 0) {
      addedIds.concat(me.add(data[me._childField], data[me._idField]))
    }
  } else {
    throw new Error('Unknown dataType');
  }

  if (addedIds.length) {
    this._trigger('add', { items: addedIds });
  }

  return addedIds;
};

DataSet.prototype.insertBefore = function (data, index) {
  return this._insert(data, index, 'before')
}

DataSet.prototype.insertAfter = function (data, index) {
  return this._insert(data, index, 'after')
}

/**
 * Insert data.
 * Inserting an item will fail when there already is an item with the same id.
 * @param {Object | Array} data
 * @param {String} [parentId] Optional parent id
 * @return {Array} addedIds      Array with the ids of the added items
 */
DataSet.prototype._insert = function (data, target, position) {
  var addedIds = [],
      id,
      me = this, delta, parent;

  index = this.index(target);

  if (Array.isArray(data)) {
    // Array
    for (var i = 0, len = data.length; i < len; i++) {
      if (i==0) {
        if (me._isTree)
          delta = data[0][me._levelField] - target[me._levelField]
        else {
          delta = 0
        }
      } else {
        if (addedIds.indexOf(data[i][me._parentField])>=0)
          parent = data[i][me._parentField]
      }
      if (position == 'before')
        id = me._insertItem(data[i], index+i, 'before', delta, parent);
      else {
        id = me._insertItem(data[i], index, 'after', delta, parent);
        index = id.index
      }
      addedIds.push(id.id);
    }
  } else if (data instanceof Object) {
    // Single item
    if (position == 'before')
      id = me._insertItem(data, index, 'before');
    else {
      id = me._insertItem(data, index, 'after');
    }
    addedIds.push(id.id);
  } else {
    throw new Error('Unknown dataType');
  }
  this._resetIds(index)

  if (addedIds.length) {
    this._trigger('add', { items: addedIds });
  }

  return addedIds;
};

DataSet.prototype._findLastFirstLevelNode = function () {
  var i, len, node

  for(len=this._data.length, i=len-1; i>-1; i--) {
    node = this._data[i]
    if (!node[this._parentField] || node[this._parentField] == 0) {
      return node
    }
  }
}
/**
 * Insert a single item before index. Will fail when an item with the same id already exists.
 * @param {Object} item
 * @param {Number} index
 * @param {Number | String | Object} Parent id
 * @return {String} id
 * @private
 */
DataSet.prototype._insertItem = function (item, index, position, delta, parent) {
  var id = item[this._idField], node = this._data[index];
  delta = delta == undefined ? 0 : delta

  if (id != undefined) {
    // check whether this id is already taken
    if (this._ids.hasOwnProperty(id)) {
      // item already exists
      throw new Error('Cannot add item: item with id ' + id + ' already exists');
    }
  } else {
    // generate an id
    id = util.uuid.v4();
    item[this._idField] = id;
  }

  var d = {};
  for (var field in item) {
    if (item.hasOwnProperty(field)) {
      var fieldType = this._type[field]; // type may be undefined
      d[field] = util.convert(item[field], fieldType);
    }
  }

  if (position == 'before')
    this._data.splice(index, 0, d);
  else {
    index = this._findNext(index)
    if (index == -1) {
      this._data.push(d)
      index = this.length
    }
    else {
      this._data.splice(index, 0, d)
    }
  }
  this.length++;
  var last_order, level, x
  if (this._isTree) {
    if (node) {
      d[this._parentField] = parent || node[this._parentField]
      if (!d[this._levelField])
        d[this._levelField] = node[this._levelField]
      if (!d[this._orderField]) {
        if (position == 'after')
          d[this._orderField] = node[this._orderField] + 1
        else
          d[this._orderField] = node[this._orderField]
      }

      level = node[this._levelField]
      last_order = d[this._orderField]

      this._reOrder(index+1, level, last_order)

    } else {
      d[this._parentField] = 0
      if (!d[this._levelField])
        d[this._levelField] = 0
      if (!d[this._orderField]) {
        if (position == 'after') {
          node = this._findLastFirstLevelNode()
          if (node) {
            d[this._orderField] = node.order
          } else {
            d[this._orderField] = 1
          }
        } else
          d[this._orderField] = 1
      }
    }

  }

  return {id:id, index:index};
};

DataSet.prototype._reOrder = function (index, level, last_order) {
  var i, len, item, _l;
  for(i=index, len=this._data.length; i<len; i++) {
    item = this._data[i]
    _l = item[this._levelField]
    if (_l>level) continue
    else if (_l==level) {
      if(item[this._orderField]<=last_order) {
        last_order ++
        item[this._orderField] = last_order
      }
    } else {
      break
    }
  }
}

DataSet.prototype.move = function (item, target, position) {
  return this._move(item, target, position)
}

DataSet.prototype._resetLevel = function (items, level) {
  var delta, me=this

  for(var i=0, _len=items.length; i<_len; i++) {
    if (i== 0) {
      delta = items[i][me._levelField] - level
    }
    items[i][me._levelField] -= delta
  }
}

DataSet.prototype._move = function (item, target, position) {
  var me = this, updatedIds = [], addedIds = [], order, index, next, items, len,
    ids, level

  if (me.isChild(target, item))
    throw new Error('Target nodes could not be child')

  if (me.getId(item) == me.getId(target)) return
  me.mute(true)

  index = me.index(item)
  next = me._findNext(index)
  if (next == -1) {
    len = me.length - index
  } else {
    len = next - index
  }
  items = me._data.splice(index, len)
  me.length -= items.length
  me._resetParent(index)
  me._resetIds()
  //save level
  if (position == 'before') {
    level = target[me._levelField]
    me._resetLevel(items, level)
    ids = me.insertBefore(items, target)
  } else if (position == 'after') {
    level = target[me._levelField]
    me._resetLevel(items, level)
    ids = me.insertAfter(items, target)
  } else if (position == 'child') {
    level = target[me._levelField] + 1
    me._resetLevel(items, level)
    ids = me.add(items, target)
  }
  for(var i=0, _len=ids.length; i<_len; i++) {
    updatedIds.push(ids[i])
  }

  me.mute(false)

  if (updatedIds.length) {
    me._trigger('update', { items: updatedIds });
  }

  return updatedIds
}
/**
 * Find next element for tree
 * @param {Number} Index for element
 */
DataSet.prototype._findNext = function (index) {
  if (index === undefined) return -1
  var n = index + 1

  if (n >= this.length) return -1
  if (this._isTree) {
    var level, v, parent = this._data[index], i, len

    level = parent[this._levelField]
    for (i=n, len=this.length; i<len; i++) {
      v = this._data[i][this._levelField]
      if (v>level) continue
      else break
    }
    if (i >= this.length) return -1
    return i
  } else return n
}

/*
 * Test is a row has child node
 */
DataSet.prototype.has_child = function (row) {
  var me = this
  if (me._isTree) {
    var index = me.index(row)
    if (index+1 >= me.length) return false

    return (me._data[index+1][me._parentField] == me._data[index][me._idField])
  }
  return false
}

/**
 * Update existing items via ajax request or just plain data
 * @param {String} url if no url then it'll use options.url
 *                 require jquery
 * examples:
 *   load('abc/def')
 *   load('abc/def', {parent:1})
 *   load('abc/def', {parent:1}, function(){})
 *   load('abc/def', function(){})
 *   load(function(){})
 */
DataSet.prototype.load = function (url, param, callback) {
  var me = this
  this.url = url;
  if (typeof url === 'string') {
    if (typeof param === 'function') {
      callback = param
      param = {}
    }
    me._trigger('loading')
    return $.getJSON(url || this._options.url, param).done(function(r) {
        me.mute()
        me._data = [];
        me._ids = {};
        me.length = 0;
        if (callback) me.add(callback(r))
        else me.add(r)
        me.mute(false)
        me._trigger('load')
      })
  } else {
    me._trigger('loading')
    me.mute()
    me._data = [];
    me._ids = {};
    me.length = 0;
    if (callback) me.add(callback(url))
    else me.add(url)
    me.mute(false)
    me._trigger('load')
  }
}

DataSet.prototype.load_tree = function (url, param, callback) {
  var me = this, opts = {}
  var f
  this._data = [];
  this._ids = {};
  this.length = 0;
  this.url = url;

  var _post = function(){
    if (typeof callback != 'function' && callback instanceof Object) {
      opts = callback
    }
    opts.plain = true

    var d = me.tree(opts)
    me._data = [];
    me._ids = {};
    me.length = 0;
    me.mute()
    me.add(d);
    me.mute(false)
    me._trigger('load')
  }

  if (typeof url === 'string') {
    if (typeof param === 'function') {
      callback = param
      param = {}
    }

    me._trigger('loading')
    return $.getJSON(url || this._options.url, param).done(function(r) {
        me._isTree = false
        me.mute()
        if (callback) me.add(callback(r))
        else me.add(r)
        me.mute(false)
        me._isTree = true
        _post()
      })
  } else {
    me._trigger('loading')
    me._isTree = false
    me.mute()
    if (typeof callback == 'function')
      me.add(callback(url))
    else me.add(url)
    me.mute(false)
    me._isTree = true
    _post()
  }
}

/**
 * Test if a node is a child of parent
 * @param {Object} Node will be testing
 * @param {Object} Parent node
 */
DataSet.prototype.isChild = function(item, parent) {
  var me = this, p
  if (me._isTree) {
    p = item[me._parentField]
    while (p) {
      if (me.getId(p) == me.getId(parent)) return true
      p = p[me._parentField]
    }
  }
}
/**
 * Update existing items. When an item does not exist, it will be created
 * @param {Object | Array} data
 * @param {String} [senderId] Optional sender id
 * @return {Array} updatedIds     The ids of the added or updated items
 */
DataSet.prototype.update = function (data, senderId) {
  var addedIds = [];
  var updatedIds = [];
  var updatedData = [];
  var me = this;
  var idField = me._idField;

  var addOrUpdate = function addOrUpdate(item) {
    var id = item[idField];
    if (me._ids.hasOwnProperty(id)) {
      // update item
      id = me._updateItem(item);
      updatedIds.push(id);
      updatedData.push(item);
    } else {
      // add new item
      id = me._addItem(item);
      addedIds.push(id);
    }
  };

  if (Array.isArray(data)) {
    // Array
    for (var i = 0, len = data.length; i < len; i++) {
      addOrUpdate(data[i]);
    }
  } else if (data instanceof Object) {
    // Single item
    addOrUpdate(data);
  } else {
    throw new Error('Unknown dataType');
  }

  if (addedIds.length) {
    this._trigger('add', { items: addedIds }, senderId);
  }
  if (updatedIds.length) {
    this._trigger('update', { items: updatedIds, data: updatedData }, senderId);
  }

  return addedIds.concat(updatedIds);
};

/**
 * Get a data item or multiple items.
 *
 * Usage:
 *
 *     get()
 *     get(options: Object)
 *
 *     get(id: Number | String)
 *     get(id: Number | String, options: Object)
 *
 *     get(ids: Number[] | String[])
 *     get(ids: Number[] | String[], options: Object)
 *
 * Where:
 *
 * {Number | String} id         The id of an item
 * {Number[] | String{}} ids    An array with ids of items
 * {Object} options             An Object with options. Available options:
 * {String} [returnType]        Type of data to be returned.
 *                              Can be 'Array' (default) or 'Object'.
 * {Object.<String, String>} [type]
 * {String[]} [fields]          field names to be returned
 * {function} [filter]          filter items
 * {String | function} [order]  Order the items by a field name or custom sort function.
 * @throws Error
 */
DataSet.prototype.get = function (args) {
  var me = this;

  if (!args)
    return me._data

  // parse the arguments
  var id, ids, options;
  var firstType = util.getType(arguments[0]);
  if (firstType == 'String' || firstType == 'Number') {
    // get(id [, options])
    id = arguments[0];
    options = arguments[1];
  } else if (firstType == 'Array') {
    // get(ids [, options])
    ids = arguments[0];
    options = arguments[1];
  } else {
    // get([, options])
    options = arguments[0];
  }

  // determine the return type
  var returnType;
  if (options && options.returnType) {
    var allowedValues = ['Array', 'Object'];
    returnType = allowedValues.indexOf(options.returnType) == -1 ? 'Array' : options.returnType;
  } else {
    returnType = 'Array';
  }

  // build options
  var type = options && options.type || this._options.type;
  var filter = options && options.filter;
  var items = [],
      item,
      itemId,
      i,
      len;

  // convert items
  if (id != undefined) {
    // return a single item
    item = me._getItem(id, type);
    if (filter && !filter(item)) {
      item = null;
    }
  } else if (ids != undefined) {
    // return a subset of items
    for (i = 0, len = ids.length; i < len; i++) {
      item = me._getItem(ids[i], type);
      if (!filter || filter(item)) {
        items.push(item);
      }
    }
  } else {
    // return all items
    if (!filter)
      items = this._data.slice()
    else {
      for (itemId in this._ids) {
        item = me._getItem(itemId, type);
        if (!filter || filter(item)) {
          items.push(item);
        }
      }
    }
  }

  // order the results
  if (options && options.order && id == undefined) {
    this._sort(items, options.order);
  }

  // filter fields of the items
  if (options && options.fields) {
    var fields = options.fields;
    if (id != undefined) {
      item = this._filterFields(item, fields);
    } else {
      for (i = 0, len = items.length; i < len; i++) {
        items[i] = this._filterFields(items[i], fields);
      }
    }
  }

  // return the results
  if (returnType == 'Object') {
    var result = {};
    for (i = 0; i < items.length; i++) {
      result[items[i].id] = items[i];
    }
    return result;
  } else {
    if (id != undefined) {
      // a single item
      return item;
    } else {
      // just return our array
      return items;
    }
  }
};


DataSet.prototype.tree = function (options) {
  var me = this;

  // parse the arguments
  var id, item, itemx, ids={}, data=[], parentField, childrenField,
    parent, order = [], options = options || {};

  parentField = options.parentField || me._parentField
  childrenField = options.childrenField || me._childField
  idField = options.idField || me._idField
  orderField = options.orderField || me._orderField

  order.push(options.levelField || me._levelField)
  order.push(orderField)

  var items = this.get({order:order})
  for (var i=0, len=items.length; i<len; i++) {
    item = {}
    itemx = items[i]
    for (k in itemx) {
      item[k] = itemx[k]
    }
    id = item[idField]
    parentId = item[parentField] || 0
    if (parentId) {
      parent = ids[parentId]
      if (!parent){
        console.log(item)
        throw new Error(id + ' parent ' + parentId + ' is not existed')
      }
      if (parent.hasOwnProperty(childrenField)) {
        parent[childrenField].push(item)
      } else {
        parent[childrenField] = [item]
      }
    } else {
      data.push(item)
    }
    ids[id] = item
  }
  if (options.plain) {
    var s = [], has_children,
      levelField = options.levelField || me._levelField,
      hasChildrenField = options.hasChildrenField || me._hasChildrenField,
      order = options.order

    function iter(d, level) {
      var x, b, _o, last_order=1
      for(var i=0, len=d.length; i<len; i++) {
        x = d[i]
        x[levelField] = x[levelField] || level
        if (x[orderField]){
          if (last_order < x[orderField])
            last_order = x[orderField]
          else if (last_order == x[orderField])
            x[orderField]++
          else {
            x[orderField] = last_order
          }
        } else {
          x[orderField] = last_order
        }
        last_order ++
        s.push(x)
        b = x[childrenField]
        if (b && b.length > 0) {
          x[hasChildrenField] = true
          delete x[childrenField]
          iter(b, level+1)
        }
      }
    }
    iter(data, 0, 1)
    return s
  } else
    return data
}

/**
 * Get ids of all items or from a filtered set of items.
 * @param {Object} [options]    An Object with options. Available options:
 *                              {function} [filter] filter items
 *                              {String | function} [order] Order the items by
 *                                  a field name or custom sort function.
 * @return {Array} ids
 */
DataSet.prototype.getIds = function (options) {
  var data = this._data,
      filter = options && options.filter,
      order = options && options.order,
      type = options && options.type || this._options.type,
      i,
      len,
      id,
      item,
      items,
      ids = [];

  if (filter) {
    // get filtered items
    if (order) {
      // create ordered list
      items = [];
      for (id in data) {
        if (data.hasOwnProperty(id)) {
          item = this._getItem(id, type);
          if (filter(item)) {
            items.push(item);
          }
        }
      }

      this._sort(items, order);

      for (i = 0, len = items.length; i < len; i++) {
        ids[i] = items[i][this._idField];
      }
    } else {
      // create unordered list
      for (id in data) {
        if (data.hasOwnProperty(id)) {
          item = this._getItem(id, type);
          if (filter(item)) {
            ids.push(item[this._idField]);
          }
        }
      }
    }
  } else {
    // get all items
    if (order) {
      // create an ordered list
      items = [];
      for (id in data) {
        if (data.hasOwnProperty(id)) {
          items.push(data[id]);
        }
      }

      this._sort(items, order);

      for (i = 0, len = items.length; i < len; i++) {
        ids[i] = items[i][this._idField];
      }
    } else {
      // create unordered list
      for (id in data) {
        if (data.hasOwnProperty(id)) {
          item = data[id];
          ids.push(item[this._idField]);
        }
      }
    }
  }

  return ids;
};

/**
 * Returns the DataSet itself. Is overwritten for example by the DataView,
 * which returns the DataSet it is connected to instead.
 */
DataSet.prototype.getDataSet = function () {
  return this;
};

/**
 * Execute a callback function for every item in the dataset.
 * @param {function} callback
 * @param {Object} [options]    Available options:
 *                              {Object.<String, String>} [type]
 *                              {String[]} [fields] filter fields
 *                              {function} [filter] filter items
 *                              {String | function} [order] Order the items by
 *                                  a field name or custom sort function.
 */
DataSet.prototype.forEach = function (callback, options) {
  var filter = options && options.filter,
      type = options && options.type || this._options.type,
      data = this._data,
      ids = this._ids,
      item,
      id;

  if (options && options.order) {
    // execute forEach on ordered list
    var items = this.get(options);

    for (var i = 0, len = items.length; i < len; i++) {
      item = items[i];
      callback(item, i);
    }
  } else {
    // unordered
    for (var i=0, len = data.length; i < len; i++) {
      item = data[i]
      if (!filter || filter(item)) {
        callback(item, i);
      }
    }
  }
};

/**
 * Map every item in the dataset.
 * @param {function} callback
 * @param {Object} [options]    Available options:
 *                              {Object.<String, String>} [type]
 *                              {String[]} [fields] filter fields
 *                              {function} [filter] filter items
 *                              {String | function} [order] Order the items by
 *                                  a field name or custom sort function.
 * @return {Object[]} mappedItems
 */
DataSet.prototype.map = function (callback, options) {
  var filter = options && options.filter,
      type = options && options.type || this._options.type,
      mappedItems = [],
      data = this._data,
      item;

  // convert and filter items
  for (var i, len=data.length; i<len; i++) {
    item = data[i];
    if (!filter || filter(item)) {
      mappedItems.push(callback(item, id));
    }
  }

  // order items
  if (options && options.order) {
    this._sort(mappedItems, options.order);
  }

  return mappedItems;
};

/**
 * Filter the fields of an item
 * @param {Object | null} item
 * @param {String[]} fields     Field names
 * @return {Object | null} filteredItem or null if no item is provided
 * @private
 */
DataSet.prototype._filterFields = function (item, fields) {
  if (!item) {
    // item is null
    return item;
  }

  var filteredItem = {};

  if (Array.isArray(fields)) {
    for (var field in item) {
      if (item.hasOwnProperty(field) && fields.indexOf(field) != -1) {
        filteredItem[field] = item[field];
      }
    }
  } else {
    for (var field in item) {
      if (item.hasOwnProperty(field) && fields.hasOwnProperty(field)) {
        filteredItem[fields[field]] = item[field];
      }
    }
  }

  return filteredItem;
};

DataSet.prototype._by = function (name, desc, minor) {
  desc = desc || false;
  return function(o, p){
      var a, b;
      if (typeof o === "object" && typeof p === "object" && o && p) {
          a = o[name];
          b = p[name];
          if (a === b) {
              return typeof minor === 'function' ? minor(o,p):0;
          }
          if (typeof a === typeof b) {
              if (desc)
                  return a < b ? 1 : -1;
              else
                  return a < b ? -1 : 1;
          }
          // different type then return 0
          return 0
          // if (desc)
          //     return typeof a < typeof b ? 1 : -1;
          // else
          //     return typeof a < typeof b ? -1 : 1;
      }
      else {
          throw ("error");
      }
  }
}

var mergesort = function (array, /* optional */ cmp) {
    /*
        Merge sort.
        On average, two orders of magnitude faster than Array.prototype.sort() for
        large arrays, with potentially many equal elements.
        Note that the default comparison function does not coerce its arguments to strings.
    */

    if (cmp === undefined) {
        // Note: This is not the same as the default behavior for Array.prototype.sort(),
        // which coerces elements to strings before comparing them.
        cmp = function (a, b) {
            'use asm';
            return a < b ? -1 : a === b ? 0 : 1;
        };
    }

    function merge (begin, begin_right, end) {
        'use asm';
        // Create a copy of the left and right halves.
        var left_size = begin_right - begin, right_size = end - begin_right;
        var left = array.slice(begin, begin_right), right = array.slice(begin_right, end);
        // Merge left and right halves back into original array.
        var i = begin, j = 0, k = 0;
        while (j < left_size && k < right_size)
            if (cmp(left[j], right[k]) <= 0)
                array[i++] = left[j++];
            else
                array[i++] = right[k++];
        // At this point, at least one of the two halves is finished.
        // Copy any remaining elements from left array back to original array.
        while (j < left_size) array[i++] = left[j++];
        // Copy any remaining elements from right array back to original array.
        while (k < right_size) array[i++] = right[k++];
        return;
    }

    function msort (begin, end) {
        'use asm';
        var size = end - begin;
        if (size <= 8) {
            // By experimentation, the sort is fastest when using native sort for
            // arrays with a maximum size somewhere between 4 and 16.
            // This decreases the depth of the recursion for an array size where
            // O(n^2) sorting algorithms are acceptable.
            var sub_array = array.slice(begin, end);
            sub_array.sort(cmp);
            // Copy the sorted array back to the original array.
            for (var i = 0; i < size; ++i)
                array[begin + i] = sub_array[i];
            return;
        }

        var begin_right = begin + Math.floor(size/2);

        msort(begin, begin_right);
        msort(begin_right, end);
        merge(begin, begin_right, end);
    }

    msort(0, array.length);

    return array;
};

/**
 * Sort the provided array with items
 * @param {Object[]} items
 * @param {String | function} order      A field name or custom sort function.
 * @private
 */
DataSet.prototype._sort = function (items, order) {
  if (util.isString(order) || Array.isArray(order)) {
    var arr;
    var key;
    var f, desc, last=null;
    var me =  this
    if (util.isString(order)) arr = [order]
    else arr = order
    for(var i=arr.length-1; i>-1; i--){
        key = arr[i];
        if(key && key.charAt(0) === '-'){
            desc = true;
            key = key.substr(1)
        }
        else
            desc = false;
        if (last)
            f = me._by(key, desc, last);
        else
            f = me._by(key, desc);
        last = f;
    }
    return mergesort(items, f);
  } else if (typeof order === 'function') {
    // order by sort function
    return mergesort(items, order);
  }
  // TODO: extend order by an Object {field:String, direction:String}
  //       where direction can be 'asc' or 'desc'
  else {
    throw new TypeError('Order must be a function or a string');
  }
};

/**
 * Remove an object by pointer or by id
 * @param {String | Number | Object | Array} id Object or id, or an array with
 *                                              objects or ids to be removed
 * @param {String|Function} [url] Optional url, it'll be remote url or just callback
 *      return value should be {success:true|false, }
 * @return {Array} removedIds
 */
remove = function (id) {
  var removedIds = [],
      i,
      len,
      removedId, minIndex=0, me=this;

      var _remove = function (id) {
        var index, itemId, v, item, level, n;

        if (!id)
          return
        if (typeof id === 'string' || typeof id === 'number')
          item = me.get(id)
        else {
          item = id
        }
        if (!item)
          return
        id = item[me._idField]
        if (removedIds.indexOf(id) !== -1)
          return

        index = me.index(id)
        level = item[me._levelField]

        removedIds.push(id)
        me._data.splice(index, 1);
        me.length--;
        me._resetIds(minIndex)

        if (me._isTree) {
          for(var i=index, len=me.length; i<len; i++){
            n = me._data[index]
            if (n[me._levelField] > level) {
              removedIds.push(n[me._idField])
              me._data.splice(index, 1);
              me.length--;
            } else {
              break
            }
          }

          me._resetParent(index)
        }

      };


  if (Array.isArray(id)) {
    for (i = 0, len = id.length; i < len; i++) {
      removedId = _remove(id[i]);
    }
  } else {
    removedId = _remove(id);
  }

  this._resetIds(minIndex)

  if (removedIds.length) {
    this._trigger('remove', { items: removedIds });
  }
  return removedIds;

};

DataSet.prototype._resetParent = function (index) {
  var me = this, n
  if (index - 1 > -1) {
    n = me._data[index-1]
    if (n[me._hasChildrenField]) {
      if (index < me.length) {
        n[me._hasChildrenField] = me._data[index][me._levelField] > n[me._levelField]
      } else {
        n[me._hasChildrenField] = false
      }
    }
  }
}

/**
 * Reset ids
 * @param {Number | Object} begin   begin index, if undefined, process whole array
 * @returns null
 * @private
 */
DataSet.prototype._resetIds = function (begin) {
  if (begin instanceof Object) {
    begin = begin[this._idField];
  }
  if (!begin)
    begin = 0
  this._ids = {}
  for(var i=0, len=this.length; i<len; i++) {
    this._ids[this._data[i][this._idField]] = i
  }
};

/**
 * Clear the data
 * @param {String} [senderId] Optional sender id
 * @return {Array} removedIds    The ids of all removed items
 */
DataSet.prototype.clear = function (senderId) {
  var ids = Object.keys(this._ids);

  this._data = [];
  this._ids = {};
  this.length = 0;

  this._trigger('remove', { items: ids }, senderId);

  return ids;
};

/**
 * Add a single item. Will fail when an item with the same id already exists.
 * @param {Object} item
 * @param {Object} parent
 * @param {String} position, 'first'
 * @return {String} id
 * @private
 */
DataSet.prototype._addItem = function (item, parent, position) {
  var id = item[this._idField];

  if (id != undefined) {
    // check whether this id is already taken
    if (this._ids.hasOwnProperty(id)) {
      // item already exists
      throw new Error('Cannot add item: item with id ' + id + ' already exists');
    }
  } else {
    // generate an id
    id = util.uuid.v4();
    item[this._idField] = id;
  }

  var d = {};
  for (var field in item) {
    if (item.hasOwnProperty(field)) {
      var fieldType = this._type[field]; // type may be undefined
      d[field] = util.convert(item[field], fieldType);
    }
  }

  if (!parent || !this._isTree) {
    this._data.push(d);
    this.length++;
    this._ids[id] = this.length-1;
  }

  var child, index, node

  if (this._isTree) {
    if (parent) {
      index = this.index(parent)
      parent = this._data[index]
      d[this._parentField] = parent[this._idField]
      if (!d[this._levelField])
        d[this._levelField] = parent[this._levelField] + 1
      //parent is not the real element maybe
      parent[this._hasChildrenField] = true
      child = this._getFirstChild(parent)
      if (!child) {
        d[this._orderField] = 1
        this._data.splice(index+1, 0, d)
      } else {
        if (position == 'first') {
          d[this._orderField] = this._data[index+1][this._orderField]
          this._data.splice(index+1, 0, d)
          level = d[this._levelField]
          last_order = d[this._orderField]
          this._reOrder(index+2, level, last_order)
        } else {
          index = this._findNext(index)
          if (index == -1) {
            this._data.push(d)
            order = this._data[this.length-1][this._orderField] + 1
            index = this._data.length
          } else {
            order = this._data[index-1][this._orderField] + 1
            this._data.splice(index, 0, d)
          }
          d[this._orderField] = order
        }
      }
      this.length ++
      this._resetIds()
    } else {
      if (!d[this._levelField])
        d[this._levelField] = 0
      //查找最后的order
      order = 1
      for(var ii=this.length-2; ii>-1; ii--) {
        if (this._data[ii][this._levelField] == 0){
          order = this._data[ii][this._orderField] + 1
          break
        }
      }
      d[this._orderField] = order
    }
  }

  return id;
};

DataSet.prototype._getFirstChild = function (parent) {
  var level = parent[this._levelField]
  var i = this.index(parent)
  var next

  if (i+1 < this.length) {
    next = this._data[i+1]
    if (next[this._levelField] > level)
      return next
  }
}

DataSet.prototype.index = function (id) {
  var itemId;
  if (util.isNumber(id) || util.isString(id)) {
    itemId = id;
  }else if (id instanceof Object) {
    itemId = id[this._idField];
  }

  return this._ids[itemId];
}

/**
 * Get an item. Fields can be converted to a specific type
 * @param {String} id
 * @param {Object.<String, String>} [types]  field types to convert
 * @return {Object | null} item
 * @private
 */
DataSet.prototype._getItem = function (id, types) {
  var field, value;

  // get the item from the dataset
  var index = this._ids[id];
  var raw = this._data[index];
  if (!raw) {
    return null;
  }

  // convert the items field types
  var converted = {};
  if (types) {
    for (field in raw) {
      if (raw.hasOwnProperty(field)) {
        value = raw[field];
        converted[field] = util.convert(value, types[field]);
      }
    }
  } else {
    // no field types specified, no converting needed
    for (field in raw) {
      if (raw.hasOwnProperty(field)) {
        value = raw[field];
        converted[field] = value;
      }
    }
  }
  return converted;
};

DataSet.prototype.save = function () {
  this._saved = $.extend(true, [], this.get({order:[this._idField]}))
  return this._saved
}

function cmpObject(a, b) {
    // Of course, we can do it use for in
    // Create arrays of property names
    var aProps = Object.getOwnPropertyNames(a);
    var bProps = Object.getOwnPropertyNames(b);

    // If number of properties is different,
    // objects are not equivalent
    if (aProps.length != bProps.length) {
        return false;
    }

    for (var i = 0; i < aProps.length; i++) {
        var propName = aProps[i];

        // If values of same property are not equal,
        // objects are not equivalent
        if (a[propName] !== b[propName]) {
            return false;
        }
    }

    // If we made it this far, objects
    // are considered equivalent
    return true;
}

DataSet.prototype.diff = function (data) {
  data = data || this._saved
  var src = this.get({order:[this._idField]}),
    i=0, j=0, len=src.length, _len=data.length,
    x, y, updated=[], added=[], deleted=[], x_id, y_id
  while(i<len && j<_len) {
    x = src[i]
    y = data[j]
    x_id = x[this._idField]
    y_id = y[this._idField]
    if (x_id == y_id) {
      if (!cmpObject(x, y)) {
        updated.push(x)
      }
      i ++
      j ++
    } else if (x_id<y_id) {
      added.push(x)
      i ++
    } else {
      deleted.push(y)
      j ++
    }
  }
  for(; i<len; i++) {
    added.push(src[i])
  }
  for(; j<_len; j++) {
    deleted.push(data[j])
  }
  return {added:added, updated:updated, deleted:deleted}
}

/**
 * Update a single item: merge with existing item.
 * Will fail when the item has no id, or when there does not exist an item
 * with the same id.
 * @param {Object} item
 * @return {String} id
 * @private
 */
DataSet.prototype._updateItem = function (item) {
  var id = item[this._idField];
  if (id == undefined) {
    throw new Error('Cannot update item: item has no id (item: ' + JSON.stringify(item) + ')');
  }
  var index = this._ids[id];
  var d = this._data[index];
  if (!d) {
    // item doesn't exist
    throw new Error('Cannot update item: no item with id ' + id + ' found');
  }

  // merge with current item
  // according d property
  for (var field in item) {
    var fieldType = this._type[field]; // type may be undefined
    d[field] = util.convert(item[field], fieldType);
  }

  return id;
};

function Util(){
  var _rng;

  var globalVar = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : null;

  if (globalVar && globalVar.crypto && crypto.getRandomValues) {
    // WHATWG crypto-based RNG - http://wiki.whatwg.org/wiki/Crypto
    // Moderately fast, high quality
    var _rnds8 = new Uint8Array(16);
    _rng = function whatwgRNG() {
      crypto.getRandomValues(_rnds8);
      return _rnds8;
    };
  }

  if (!_rng) {
    // Math.random()-based (RNG)
    //
    // If all else fails, use Math.random().  It's fast, but is of unspecified
    // quality.
    var _rnds = new Array(16);
    _rng = function () {
      for (var i = 0, r; i < 16; i++) {
        if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
        _rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
      }

      return _rnds;
    };
  }

  //     uuid.js
  //
  //     Copyright (c) 2010-2012 Robert Kieffer
  //     MIT License - http://opensource.org/licenses/mit-license.php

  // Unique ID creation requires a high quality random # generator.  We feature
  // detect to determine the best RNG source, normalizing to a function that
  // returns 128-bits of randomness, since that's what's usually required

  //var _rng = require('./rng');

  // Maps for number <-> hex string conversion
  var _byteToHex = [];
  var _hexToByte = {};
  for (var i = 0; i < 256; i++) {
    _byteToHex[i] = (i + 0x100).toString(16).substr(1);
    _hexToByte[_byteToHex[i]] = i;
  }

  // **`parse()` - Parse a UUID into it's component bytes**
  function parse(s, buf, offset) {
    var i = buf && offset || 0,
        ii = 0;

    buf = buf || [];
    s.toLowerCase().replace(/[0-9a-f]{2}/g, function (oct) {
      if (ii < 16) {
        // Don't overflow!
        buf[i + ii++] = _hexToByte[oct];
      }
    });

    // Zero out remaining bytes if string was short
    while (ii < 16) {
      buf[i + ii++] = 0;
    }

    return buf;
  }

  // **`unparse()` - Convert UUID byte array (ala parse()) into a string**
  function unparse(buf, offset) {
    var i = offset || 0,
        bth = _byteToHex;
    return bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]] + '-' + bth[buf[i++]] + bth[buf[i++]] + '-' + bth[buf[i++]] + bth[buf[i++]] + '-' + bth[buf[i++]] + bth[buf[i++]] + '-' + bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]];
  }

  // **`v1()` - Generate time-based UUID**
  //
  // Inspired by https://github.com/LiosK/UUID.js
  // and http://docs.python.org/library/uuid.html

  // random #'s we need to init node and clockseq
  var _seedBytes = _rng();

  // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
  var _nodeId = [_seedBytes[0] | 0x01, _seedBytes[1], _seedBytes[2], _seedBytes[3], _seedBytes[4], _seedBytes[5]];

  // Per 4.2.2, randomize (14 bit) clockseq
  var _clockseq = (_seedBytes[6] << 8 | _seedBytes[7]) & 0x3fff;

  // Previous uuid creation time
  var _lastMSecs = 0,
      _lastNSecs = 0;

  // See https://github.com/broofa/node-uuid for API details
  function v1(options, buf, offset) {
    var i = buf && offset || 0;
    var b = buf || [];

    options = options || {};

    var clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq;

    // UUID timestamps are 100 nano-second units since the Gregorian epoch,
    // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
    // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
    // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
    var msecs = options.msecs !== undefined ? options.msecs : new Date().getTime();

    // Per 4.2.1.2, use count of uuid's generated during the current clock
    // cycle to simulate higher resolution clock
    var nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1;

    // Time since last uuid creation (in msecs)
    var dt = msecs - _lastMSecs + (nsecs - _lastNSecs) / 10000;

    // Per 4.2.1.2, Bump clockseq on clock regression
    if (dt < 0 && options.clockseq === undefined) {
      clockseq = clockseq + 1 & 0x3fff;
    }

    // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
    // time interval
    if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
      nsecs = 0;
    }

    // Per 4.2.1.2 Throw error if too many uuids are requested
    if (nsecs >= 10000) {
      throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
    }

    _lastMSecs = msecs;
    _lastNSecs = nsecs;
    _clockseq = clockseq;

    // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
    msecs += 12219292800000;

    // `time_low`
    var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
    b[i++] = tl >>> 24 & 0xff;
    b[i++] = tl >>> 16 & 0xff;
    b[i++] = tl >>> 8 & 0xff;
    b[i++] = tl & 0xff;

    // `time_mid`
    var tmh = msecs / 0x100000000 * 10000 & 0xfffffff;
    b[i++] = tmh >>> 8 & 0xff;
    b[i++] = tmh & 0xff;

    // `time_high_and_version`
    b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
    b[i++] = tmh >>> 16 & 0xff;

    // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
    b[i++] = clockseq >>> 8 | 0x80;

    // `clock_seq_low`
    b[i++] = clockseq & 0xff;

    // `node`
    var node = options.node || _nodeId;
    for (var n = 0; n < 6; n++) {
      b[i + n] = node[n];
    }

    return buf ? buf : unparse(b);
  }

  // **`v4()` - Generate random UUID**

  // See https://github.com/broofa/node-uuid for API details
  function v4(options, buf, offset) {
    // Deprecated - 'format' argument, as supported in v1.2
    var i = buf && offset || 0;

    if (typeof options == 'string') {
      buf = options == 'binary' ? new Array(16) : null;
      options = null;
    }
    options = options || {};

    var rnds = options.random || (options.rng || _rng)();

    // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
    rnds[6] = rnds[6] & 0x0f | 0x40;
    rnds[8] = rnds[8] & 0x3f | 0x80;

    // Copy bytes to buffer, if provided
    if (buf) {
      for (var ii = 0; ii < 16; ii++) {
        buf[i + ii] = rnds[ii];
      }
    }

    return buf || unparse(rnds);
  }

  // Export public API
  var uuid = v4;
  uuid.v1 = v1;
  uuid.v4 = v4;
  uuid.parse = parse;
  uuid.unparse = unparse;

  isNumber = function (object) {
    return object instanceof Number || typeof object == 'number';
  };

  /**
   * Test whether given object is a string
   * @param {*} object
   * @return {Boolean} isString
   */
  isString = function (object) {
    return object instanceof String || typeof object == 'string';
  };

  /**
   * Test whether given object is a Date, or a String containing a Date
   * @param {Date | String} object
   * @return {Boolean} isDate
   */
  isDate = function (object) {
    if (object instanceof Date) {
      return true;
    } else if (isString(object)) {
      // test whether this string contains a date
      var match = ASPDateRegex.exec(object);
      if (match) {
        return true;
      } else if (!isNaN(Date.parse(object))) {
        return true;
      }
    }

    return false;
  };

  /**
   * Convert an object to another type
   * @param {Boolean | Number | String | Date | Moment | Null | undefined} object
   * @param {String | undefined} type   Name of the type. Available types:
   *                                    'Boolean', 'Number', 'String',
   *                                    'Date', 'Moment', ISODate', 'ASPDate'.
   * @return {*} object
   * @throws Error
   */
  convert = function (object, type) {
    var match;

    if (object === undefined) {
      return undefined;
    }
    if (object === null) {
      return null;
    }

    if (!type) {
      return object;
    }
    if (!(typeof type === 'string') && !(type instanceof String)) {
      throw new Error('Type must be a string');
    }

    //noinspection FallthroughInSwitchStatementJS
    switch (type) {
      case 'boolean':
      case 'Boolean':
        return Boolean(object);

      case 'number':
      case 'Number':
        return Number(object.valueOf());

      case 'string':
      case 'String':
        return String(object);

      case 'Date':
        if (isNumber(object)) {
          return new Date(object);
        }
        if (object instanceof Date) {
          return new Date(object.valueOf());
        } else if (moment.isMoment(object)) {
          return new Date(object.valueOf());
        }
        if (isString(object)) {
          match = ASPDateRegex.exec(object);
          if (match) {
            // object is an ASP date
            return new Date(Number(match[1])); // parse number
          } else {
            return moment(object).toDate(); // parse string
          }
        } else {
          throw new Error('Cannot convert object of type ' + getType(object) + ' to type Date');
        }

      case 'Moment':
        if (isNumber(object)) {
          return moment(object);
        }
        if (object instanceof Date) {
          return moment(object.valueOf());
        } else if (moment.isMoment(object)) {
          return moment(object);
        }
        if (isString(object)) {
          match = ASPDateRegex.exec(object);
          if (match) {
            // object is an ASP date
            return moment(Number(match[1])); // parse number
          } else {
            return moment(object); // parse string
          }
        } else {
          throw new Error('Cannot convert object of type ' + getType(object) + ' to type Date');
        }

      case 'ISODate':
        if (isNumber(object)) {
          return new Date(object);
        } else if (object instanceof Date) {
          return object.toISOString();
        } else if (moment.isMoment(object)) {
          return object.toDate().toISOString();
        } else if (isString(object)) {
          match = ASPDateRegex.exec(object);
          if (match) {
            // object is an ASP date
            return new Date(Number(match[1])).toISOString(); // parse number
          } else {
            return new Date(object).toISOString(); // parse string
          }
        } else {
          throw new Error('Cannot convert object of type ' + getType(object) + ' to type ISODate');
        }

      case 'ASPDate':
        if (isNumber(object)) {
          return '/Date(' + object + ')/';
        } else if (object instanceof Date) {
          return '/Date(' + object.valueOf() + ')/';
        } else if (isString(object)) {
          match = ASPDateRegex.exec(object);
          var value;
          if (match) {
            // object is an ASP date
            value = new Date(Number(match[1])).valueOf(); // parse number
          } else {
            value = new Date(object).valueOf(); // parse string
          }
          return '/Date(' + value + ')/';
        } else {
          throw new Error('Cannot convert object of type ' + getType(object) + ' to type ASPDate');
        }

      default:
        throw new Error('Unknown type "' + type + '"');
    }
  };

  // parse ASP.Net Date pattern,
  // for example '/Date(1198908717056)/' or '/Date(1198908717056-0700)/'
  // code from http://momentjs.com/
  var ASPDateRegex = /^\/?Date\((\-?\d+)/i;

  /**
   * Get the type of an object, for example getType([]) returns 'Array'
   * @param {*} object
   * @return {String} type
   */
  getType = function (object) {
    var type = typeof object;

    if (type == 'object') {
      if (object === null) {
        return 'null';
      }
      if (object instanceof Boolean) {
        return 'Boolean';
      }
      if (object instanceof Number) {
        return 'Number';
      }
      if (object instanceof String) {
        return 'String';
      }
      if (Array.isArray(object)) {
        return 'Array';
      }
      if (object instanceof Date) {
        return 'Date';
      }
      return 'Object';
    } else if (type == 'number') {
      return 'Number';
    } else if (type == 'boolean') {
      return 'Boolean';
    } else if (type == 'string') {
      return 'String';
    } else if (type === undefined) {
      return 'undefined';
    }

    return type;
  };

  this.getType = getType;
  this.convert = convert;
  this.uuid = uuid;
  this.isNumber = isNumber;
  this.isString = isString;
}

var util = new Util();
