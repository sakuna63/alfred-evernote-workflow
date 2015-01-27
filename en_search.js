const RESULT_NUM = 10;

function run(args) {
  var app = Application('com.evernote.Evernote');
  var queries = args[0].split(' ');

  var query_item_find = buildNoteQuery(queries);
  var item_searching = new Item({
    title: 'Show in Evernote',
    subtitle: query_item_find,
    icon: 'icon.png',
    arg: '.|.' + query_item_find
  });
  var items = [item_searching];
  items = items.concat(queryToItem(app, queries));
  return item_to_result_xml(items);
}

function queryToItem(app, queries) {
  var query_last = queries[queries.length - 1];
  var query_sub = queries.slice(0, queries.length - 1).join(' ');
  var items = []

  if (query_last[0] === '@') {
    if (query_last.length == 1) return;
    var notebooks = searchNotebooks(app, query_last.substr(1));
    items = notebooks.map(function(notebook) {
      return notebookToItem(notebook, query_sub);
    });
  }
  else if (query_last[0] === '#') {
    if (query_last.length == 1) return;
    var tags = searchTags(app, query_last.substr(1));
    items = tags.map(function(tag) { return tagToItem(tag, query_sub); });
  }
  else if (query_last.length > 0) {
    var notes = searchNotes(app, queries);
    items = notes.map(noteToItem);
  }
  return items;
}

function searchNotebooks(app, query) {
  query = query.toLowerCase();
  return app.notebooks()
    .filter(function(notebook) {
      var name = notebook.name().toLowerCase();
      return name.indexOf(query) != -1;
    }).slice(0, RESULT_NUM);
}

function searchTags(app, query) {
  query = query.toLowerCase();
  return app.tags()
    .filter(function(tag) {
      var name = tag.name().toLowerCase();
      return name.indexOf(query) != -1;
    }).slice(0, RESULT_NUM);
}

function searchNotes(app, queries) {
  var query = buildNoteQuery(queries);
  console.log(query);
  try {
    return app.findNotes(query).slice(0, RESULT_NUM);
  } catch (e) {
    console.log(e);
    return [];
  }
}

function buildNoteQuery(queries) {
  var query = '', notebook;
  var tags = [];
  var words = [];
  queries.forEach(function(query) {
    if (query[0] === '@') {
      notebook = query.substr(1);
    }
    else if (query[0] === '#') {
      tags.push(query.substr(1));
    }
    else {
      words.push(query);
    }
  });
  if (notebook) query += 'notebook:"' + notebook + '" ';
  tags.forEach(function(tag) {
    query += 'tag:"' + tag + '" ';
  });
  words.forEach(function(word) {
    query += word + ' ';
  });
  return query;
}

function notebookToItem(notebook, query_sub) {
  return new Item({
    title: notebook.name(),
    icon: 'notebook.png',
    valid: 'yes',
    autocomplete: query_sub + '@' + notebook.name() + ' '
  });
}

function tagToItem(tag, query_sub) {
  return new Item({
    title: tag.name(),
    icon: 'tag.png',
    valid: 'yes',
    autocomplete: query_sub + '#' + tag.name() + ' '
  });
}

function noteToItem(note) {
  var subtitle = 'Info: @' + note.notebook().name();
  subtitle += note.tags().reduce(function(e, a) {
    return e + ' #' + a.name();
  }, '');

  return new Item({
    title: note.title(),
    subtitle: subtitle,
    icon: 'note.png',
    arg: note.noteLink()
  });
}


function Item(obj) {
  this.uid = obj['uid'];
  this.arg = obj['arg'];
  this.valid = obj['valid'];
  this.autocomplete = obj['autocomplete'];
  this.type = obj['type'];
  this.title = obj['title'];
  this.subtitle = obj['subtitle'];
  this.icon = obj['icon'];
  // var icon_type = obj['icon_type'];

  this.to_xml = function() {
    var xml = '<item ';
    if (this.uid) xml += 'uid=\'' + this.uid + '\' ';
    if (this.arg) xml += 'arg=\'' + this.arg + '\' ';
    if (this.valid) xml += 'valid=\'' + this.valid + '\' ';
    if (this.autocomplete) xml += 'autocomplete=\'' + this.autocomplete + '\' ';
    if (this.type) xml += 'type=\'' + this.type + '\' ';
    xml += '>';

    if (this.title) xml += '<title>' + this.title + '</title>';
    if (this.subtitle) xml += '<subtitle>' + this.subtitle + '</subtitle>';
    if (this.icon) xml += '<icon>' + this.icon + '</icon>';
    xml += '</item>';

    return xml
  }
}

function item_to_result_xml(items) {
  var xml = '<?xml version="1.0"?><items>';
  items.forEach(function(item) {
    xml += item.to_xml();
  });
  xml += '</items>';
  return xml;
}
