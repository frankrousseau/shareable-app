// Dépendances
var path = require('path');
var slug = require('slug');
var express = require('express')
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var PouchDB = require('pouchdb');

// On génère la base de données.
var db = PouchDB('db');
// On génère le serveur Express.
var app = express();


// Configuration du serveur Express.
app.use(express.static(path.join(__dirname, 'client', 'public')));
app.use(methodOverride());
app.use(bodyParser.json());
app.use(morgan('dev'));


// On définit les contrôleurs.
var controllers = {

  // L
  base: {
    index: function (req, res) {
      res.send('My Bookmarks API');
    }
  },

  bookmarks: {

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


// On associe à chaque contrôleur un chemin.
app.get('/api', controllers.base.index);
app.get('/api/bookmarks', controllers.bookmarks.all);
app.post('/api/bookmarks', controllers.bookmarks.create);
app.delete('/api/bookmarks/:id', controllers.bookmarks.delete);


// On démarre le serveur et on affiche un message d'information.
//
var port = process.env.PORT || 9125;
var host = process.env.HOST || '0.0.0.0';
var server = app.listen(port, host, function () {
  console.log('Example app listening at http://%s:%s', host, port)
});
