  /**
* EventEmitter with jQuery 1.7's $.Callbacks().
*/

  function EventEmitter() {
    this.topics = {};
  }

  /**
* Listen on the given `topic` event with `fn`.
*
* @param {String} topic
* @param {Function} fn
* @param {Mixed} ... options for $.Callbacks handling
*/

  EventEmitter.prototype.on = function(topic, fn){
    (this.topics[topic] = this.topics[topic] || $.Callbacks(Array.prototype.slice.call(arguments,2)))
      .add(fn);
    return this;
  };

  /**
* Emit `topic` event with the given args.
*
* @param {String} topic
* @param {Mixed} ...
*/

  EventEmitter.prototype.emit = function(topic){
    var args = Array.prototype.slice.call(arguments, 1)
      , callbacks = this.topics[topic];
    callbacks.fire(args);

    return this;
  };

