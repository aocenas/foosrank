var util = require('util');
var EventEmitter = require('events').EventEmitter;

var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

var defHost = 'localhost';
var defPort = 27017;

var Store = function (host, port, db, cb) {
  EventEmitter.call(this);

  this.state = false;
  this.errorCbCalled = false;

  if (!host) { host = defHost; }
  if (!port) { port = defPort; }
  
  var server = new Server(host, port, {auto_reconnect: true}, {});
  this.db = new Db(db, server, {safe: true});
  
  var self = this;

  (function openDb () {
    self.db.open(function (err) {
      if (err) {
        console.log(err);
        if (!self.errorCbCalled){
          cb(err);
          self.errorCbCalled = true;
        }
        setTimeout(openDb, 1000 * 30);
      } else {
        self.state = true;
        self.emit('store.db.open');
        console.log('new Store('+host+','+port+','+db+','+cb+') opened');
        if (cb && typeof cb == 'function') cb();
      }
    });
  })();
};
util.inherits(Store, EventEmitter);

Store.prototype.getCollection = function(collectionArg, callback) {
  this.db.collection(collectionArg, function(err, collection) {
    callback(err, collection);
  });
};

Store.prototype.save = function (data, collectionArg, callback) {
  this.getCollection(collectionArg, function (err, collection) {
    if (err) {
      callback(err);
    } else {
      collection.insert(data, function(err) {
        callback(err);
      });
    }
  });
};

Store.prototype.findAll = function(collectionArg, callback) {
  this.getCollection(collectionArg, function(err, collection) {
    if (err) {
      callback(err);
    } else {
      collection.find().toArray(function(err, results) {
        callback(err, results);
      });
    }
  });
};

Store.prototype.searchAll = function (collectionArg, query, cb) {
  this.getCollection(collectionArg, function(err, collection) {
    if (err) {
      cb(err);
    } else {
      collection.find(query).toArray(function(err, results) {
        cb(err, results);
      });
    }
  });
  
}

module.exports = exports = Store;
