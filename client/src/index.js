var React = require('react');
var request = require('superagent');
var slug = require('slug');


var data = {

  getBookmarks: function(callback) {
    request
      .get('/api/bookmarks')
      .set('Accept', 'application/json')
      .end(function (err, res) {
        callback(err, res.body);
      });
  },

  createBookmark: function(bookmark, callback) {
    request
      .post('/api/bookmarks')
      .send(bookmark)
      .end(function (err, res) {
        callback(err, res.body);
      });
  },

  deleteBookmark: function(bookmark, callback) {
    console.log(bookmark);
    request
      .del('/api/bookmarks/' + slug(bookmark.link))
      .end(callback);
  }

}


var Bookmark = React.createClass({

  onDeleteClicked: function() {
    this.props.removeLine(this.props);
  },

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


var BookmarkList = React.createClass({

  getInitialState: function() {
    return {bookmarks: this.props.bookmarks};
  },

  onAddClicked: function() {
    var bookmarks = this.state.bookmarks;

    var title = this.refs.titleInput.getDOMNode().value;
    var link = this.refs.linkInput.getDOMNode().value;
    var bookmark = {title: title, link: link};
    bookmarks.push(bookmark);

    this.setState({bookmarks: bookmarks});
    data.createBookmark(bookmark, function () {});
  },

  removeLine: function(line) {
    var bookmarks = this.state.bookmarks;
    var index = 0;
    while (index < bookmarks.length && bookmarks[index].link !== line.link) {
      index++;
    }
    if (index < bookmarks.length) {
      var bookmark = bookmarks.splice(index, 1)[0];
      this.setState({ bookmarks: bookmarks });
      data.deleteBookmark(bookmark, function () {});
    }
  },

  render: function() {
    var removeLine = this.removeLine;
    var bookmarks = this.props.bookmarks.map(function(bookmark) {
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


data.getBookmarks(function(err, bookmarks) {
  React.render(
    <div>
    <h1>My Single Page Application</h1>
    <BookmarkList bookmarks={bookmarks.rows}></BookmarkList>
    </div>,
    document.body);
});
