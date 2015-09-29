var React = require('react');
var request = require('superagent');
var slug = require('slug');


// Utilitaires pour requêter notre serveur.
var data = {

  // On récupère les bookmarks.
  getBookmarks: function(callback) {
    request
      .get('/api/bookmarks')
      .set('Accept', 'application/json')
      .end(function (err, res) {
        callback(err, res.body);
      });
  },

  // On crée une bookmark.
  createBookmark: function(bookmark, callback) {
    request
      .post('/api/bookmarks')
      .send(bookmark)
      .end(function (err, res) {
        callback(err, res.body);
      });
  },

  // On supprimme une bookmark. On récree son identifiant à partir du lien.
  deleteBookmark: function(bookmark, callback) {
    request
      .del('/api/bookmarks/' + slug(bookmark.link))
      .end(callback);
  }

}


// C'est le composant principal de l'application.
var App = React.createClass({
  render: function() {
    return (
      <div>
      <h1>My Single Page Application</h1>
      <BookmarkList bookmarks={this.props.bookmarks}></BookmarkList>
      </div>
    )
  }
});



// Le composant liste de bookmark.
var BookmarkList = React.createClass({

  // On définit l'état du composant bookmarks cela est utile pour le rendu
  // dynamique.
  getInitialState: function() {
    return {bookmarks: this.props.bookmarks};
  },

  // Quand le bouton ajout est cliqué, on récupère les valeurs des
  // différents champs.
  // Puis on met à jour la liste des composants. Enfin on provoque un nouveau
  // rendu en changeant l'état et on envoie une requête de création au serveur.
  onAddClicked: function() {
    var bookmarks = this.state.bookmarks;
    var title = this.refs.titleInput.getDOMNode().value;
    var link = this.refs.linkInput.getDOMNode().value;

    var bookmark = {title: title, link: link};
    bookmarks.push(bookmark);

    // Changement d'état.
    this.setState({bookmarks: bookmarks});
    // Requête au server.
    data.createBookmark(bookmark, function () {});
  },

  // Quand on supprime une ligne, on met à jour la liste des lignes. Puis on
  // provoque le rendu du composant en changeant l'état. Pour enfin envoyer une
  // requête de suppression au serveur.
  removeLine: function(line) {
    var bookmarks = this.state.bookmarks;
    var index = 0;
    while (index < bookmarks.length && bookmarks[index].link !== line.link) {
      index++;
    }
    if (index < bookmarks.length) {
      var bookmark = bookmarks.splice(index, 1)[0];

      // Changement d'état.
      this.setState({ bookmarks: bookmarks });
      // Requête au server.
      data.deleteBookmark(bookmark, function () {});
    }
  },

  // Rendu du composant.
  render: function() {
    var removeLine = this.removeLine;

    // Ici on prépare la liste à partir des proprités.
    var bookmarks = this.state.bookmarks.map(function(bookmark) {
      return (
        <Bookmark title={bookmark.title} link={bookmark.link}
                  removeLine={removeLine}>
        </Bookmark>
      );
    });
    return (
      <div>
        <div>
          <label>title</label>
          <input ref="titleInput" type="text" ></input>
        </div>
        <div>
          <label>url</label>
          <input ref="linkInput" type="text"></input>
        </div>
        <div>
          <button onClick={this.onAddClicked}>+</button>
        </div>
        <div>
          {bookmarks}
        </div>
      </div>
    );
  }
});


// Le composant qui va définir une ligne de bookmark.
var Bookmark = React.createClass({

  // On supprime la ligne courante du parent quand le bouton supprimé est
  // cliqué.
  onDeleteClicked: function() {
    this.props.removeLine(this.props);
  },

  // Le rendu se fait grâce à un format de template appelé JSX.
  render: function() {
    return (
      <div>
        <p class="title">{this.props.title}</p>
        <p class="link">
          <a href={this.props.link}>{this.props.link}</a>
        </p>
        <p>
          <button onClick={this.onDeleteClicked}>X</button>
        </p>
      </div>
    );
  }
});


// Ici on démarre !
data.getBookmarks(function(err, bookmarks) {
  React.render(<App bookmarks={bookmarks.rows}></App>,
               document.getElementById('app'));
});
