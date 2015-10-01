// Dependencies
var path = require('path');
var slug = require('slug');
var express = require('express')
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var PouchDB = require('pouchdb');

// Database 
var db = PouchDB('db');
// API server
var app = express();


// Express server configuration: handle static files, ensure
// that HTTP methods are properly handled, considered that body
// is always JSON and turn it into JS objects and logging.
app.use(express.static(path.join(__dirname, 'client', 'public')));
app.use(methodOverride());
app.use(bodyParser.json());
app.use(morgan('dev'));


// Here we define the controllers used by the Express server.
var controllers = {

  // Load the application entry point.
  base: {
    index: function (req, res) {
      res.send('My Bookmarks API');
    }
  },

  // Operation on bookmarks.
  bookmarks: {

    // Query the database to return all the bookmarks stored in 
    // in the database.
    all: function (req, res) {
      var allBookmarks = function (doc) {
        if (doc.type === 'bookmark') {
          emit(doc._id, null);
        };
      };

      db.query(allBookmarks, {include_docs: true}, function (err, data) {
        if (err) {
          console.log(err);
          res.status(500).send({msg: err});
        } else {
          var result = {
            rows: []
          };
          data.rows.forEach(function (row) {
            result.rows.push(row.doc);
          });
          res.send(result);
        }
      });
    },

    // Create a bookmark from sent body in the database.
    create: function (req, res) {
      var bookmark = req.body;

      console.log(bookmark);
      if (bookmark === undefined || bookmark.link === undefined) {
        res.status(400).send({msg: 'Bookmark malformed.'});

      } else {
        var id = slug(bookmark.link);
        db.get(id, function (err, doc) {

          if (err && !(err.status === 404)) {
            console.log(err);
            res.status(500).send({msg: err});

          } else if (doc !== undefined) {
            console.log(doc);
            res.status(400).send({msg: 'Bookmark already exists.'});

          } else {
            bookmark.type = 'bookmark';
            bookmark._id = id;
            db.put(bookmark, function (err, bookmark) {

              if (err) {
                console.log(err);
                res.status(500).send({msg: err});

              } else {
                res.send(bookmark);

              }
            });
          }
        });
      }
    },

    // Delete a bookmark with given ID.
    delete: function (req, res) {
      var id = req.params.id;
      db.get(id, function (err, doc) {

        if (err) {
          console.log(err);
          res.status(500).send({msg: err});

        } else if (doc === null) {
          res.status(404).send({msg: 'Bookmark does not exist.'});

        } else {

          db.remove(doc, function (err) {
            if (err) {
              console.log(err);
              res.status(500).send({msg: err});

            } else {
              res.sendStatus(204);
            };

          });
        }
      });
    }
  }

};


// Here we link routes and method to controllers.
app.get('/api', controllers.base.index);
app.get('/api/bookmarks', controllers.bookmarks.all);
app.post('/api/bookmarks', controllers.bookmarks.create);
app.delete('/api/bookmarks/:id', controllers.bookmarks.delete);


// Run the server with proper option (port and IP address binding).
var port = process.env.PORT || 9125;
var host = process.env.HOST || '0.0.0.0';
var server = app.listen(port, host, function () {
  console.log('Example app listening at http://%s:%s', host, port)
});
