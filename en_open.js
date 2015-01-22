function run(args) {
  var app = Application('com.evernote.Evernote');
  console.log(args);
  var query = args[0];
  console.log(query);
  if (query.indexOf('.|.') == 0) {
    query = query.substr(3);
    try {
      var window = app.windows[0];
      window.queryString = query;
      delay(0.1);
      app.activate();
    } catch(e) {
      var window = app.openCollectionWindow({queryString: query});
      window.queryString = query;
    }
  }
  else {
    var note = app.findNote(query);
    app.openNoteWindow({with: note});
    delay(0.1);
    app.activate();
  }
}
