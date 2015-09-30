var React = require('react');
var request = require('superagent');
var slug = require('slug');


// Helpers to request the server API.
var data = {

  // Get all bookmarks stored on the server.
  getBookmarks: function(callback) {
    request
      .get('/api/bookmarks')
      .set('Accept', 'application/json')
      .end(function (err, res) {
        callback(err, res.body);
      });
  },

  // Creates a bookmark on server. Title and url are required.
  createBookmark: function(bookmark, callback) {
    request
      .post('/api/bookmarks')
      .send(bookmark)
      .end(function (err, res) {
        callback(err, res.body);
      });
  },

  // Delete a bookmark from the server. 
  // Build bookmark id from link by slugifying it.
  deleteBookmark: function(bookmark, callback) {
    request
      .del('/api/bookmarks/' + slug(bookmark.link))
      .end(callback);
  }

}


// Here we define the main component of the application.
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


// The component that describes the bookmark list. It will allow us to manage
// display of several bookmarks, and creation/deletion of a bookmark.
var BookmarkList = React.createClass({

  // We define here the initial state of the component. Given bookmarks
  // will become the "state" of the component.
  getInitialState: function() {
    return {bookmarks: this.props.bookmarks};
  },

  // When the add button is clicked the field values are grabbed (title and
  // link inputs). Then, we update the bookmark list by adding a new bookmark
  // to the bookmark list from the state. React will automatically render
  // the componenent again.
  onAddClicked: function() {
    var bookmarks = this.state.bookmarks;
    var title = this.refs.titleInput.getDOMNode().value;
    var link = this.refs.linkInput.getDOMNode().value;

    var bookmark = {title: title, link: link};
    bookmarks.push(bookmark);

    // Here we modify the state.
    this.setState({bookmarks: bookmarks});
    
    // Here we save the change to the server.
    data.createBookmark(bookmark, function () {});
  },

  // When we delete a line, we update the line list by removing the corresponding
  // bookmark. Then, React automatically render the component again (and this time
  // without the removed bookmark).
  // This function will be given as parameter of the bookmark components. It will
  // be called when the delete button of the line will be clicked.
  removeLine: function(line) {
    var bookmarks = this.state.bookmarks;
    var index = 0;
    while (index < bookmarks.length && bookmarks[index].link !== line.link) {
      index++;
    }
    if (index < bookmarks.length) {
      var bookmark = bookmarks.splice(index, 1)[0];

      // Here we modify the state.
      this.setState({ bookmarks: bookmarks });
      
      // Here we save the change to the server.
      data.deleteBookmark(bookmark, function () {});
    }
  },

  // Component rendering. This time the rendering is a little bit
  // different. It requires first that we define the list of Bookmark
  // components to render from the bookmark list stored in the component
  // state. Then with it we can build the current component JSX template.
  render: function() {
    var removeLine = this.removeLine;

    // Here we build the bookmark component list.
    var bookmarks = this.state.bookmarks.map(function(bookmark) {
      return (
        <Bookmark title={bookmark.title} link={bookmark.link}
                  removeLine={removeLine}>
        </Bookmark>
      );
    });
    
    // Full render.
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


// A simple component to describe our bookmark. 
var Bookmark = React.createClass({

  // When the delete button is clicked, it calls the removeLine
  // function given in parameter. In our case, it's the bookmark 
  // list component delete function that will be called.
  onDeleteClicked: function() {
    this.props.removeLine(this.props);
  },

  // Rendering of the component via a JSX template. 
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


// That's it! Let's start the application. First we load the 
// bookmarks, then we give the result to React so it can render our app!
data.getBookmarks(function(err, bookmarks) {
  React.render(<App bookmarks={bookmarks.rows}></App>,
               document.getElementById('app'));
});
