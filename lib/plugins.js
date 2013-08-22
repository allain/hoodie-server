/*jshint unused:false */


/**
 * Tools for starting Hoodie plugins
 */

var plugins_manager = require('hoodie-plugins-manager/lib/index'),
    config = require('./config'),
    async = require('async'),
    path = require('path'),
    fs = require('fs');


/**
 * Starts all plugins defined in the project's package.json file
 */

exports.startAll = function (cfg, callback) {
  // get couchdb admin password from config.json
  config.getCouchCredentials(cfg, function (err, username, password) {

    if (err) {
      return callback(err);
    }

    var pm_config = {
      couchdb: {
        url: cfg.couch.url,
        user: username,
        pass: password
      }
    };

    plugins_manager.start(pm_config, function (err, manager) {
      if (err) {
        return callback(err);
      }

      // loop through plugins and start
      var names = exports.getPluginNames(cfg.app);

      console.log('Names: %j', names);

      var plugins = async.map(names, function (name, callback) {
        var hoodie = manager.createAPI({name: name});

        console.log('starting %s', name);
        return exports.startPlugin(name, cfg.project_dir, hoodie, callback);
      },
      function (err) {
        if (err) {
          return callback(err);
        }
        console.log('All plugins started.');
        callback();
      });

    });

  });

};

/**
 * Starts the named Hoodie plugin
 */

exports.startPlugin = function (name, project_dir, hoodie, callback) {
  var p = exports.path(name, project_dir);

  if (exports.hasWorker(p)) {
    console.log('Starting: \'%s\'', name);
    var wmodule = require(p);
    return wmodule(hoodie, callback);
  }
  return process.nextTick(callback);
};

/**
 * Return the plugin name's package name / module id
 */

exports.id = function (name) {
  return 'hoodie-plugin-' + name;
};

/**
 * Returns the plugin package path
 */

exports.path = function (name, project_dir) {
  return path.resolve(project_dir, 'node_modules/' + exports.id(name));
};

/**
 * Returns true if the plugin path has a node.js worker module, false otherwise
 */

exports.hasWorker = function (path) {
  try {
    require.resolve(path);
    return true;
  }
  catch (e) {
    if (e.code === 'MODULE_NOT_FOUND') {
      return false;
    }
    else {
      throw e;
    }
  }
};

/**
 * Finds all the dependencies in the app's package.json which
 * start with 'plugin-'
 */

exports.getPluginModuleNames = function (pkg) {
  return Object.keys(pkg.dependencies).filter(function (d) {
    return (/^hoodie-plugin-/).test(d);
  });
};

/**
 * Converts an NPM package name to a Hoodie plugin name
 */

exports.pluginModuleToName = function (mod) {
  return mod.replace(/^hoodie-plugin-/, '');
};

/**
 * Finds all the dependencies in the app's package.json which
 * start with 'plugin-' and returns them with the hoodie-plugin part
 * of the name removed
 */

exports.getPluginNames = function (pkg) {
  var names = exports.getPluginModuleNames(pkg);
  return names.map(exports.pluginModuleToName);
};

/**
 * Returns the fs path to the plugin
 */

exports.pluginPath = function (cfg, mod) {
  return path.resolve(cfg.project_dir, 'node_modules', mod);
};

/**
 * Reads the plugin's package.json file returning plugin metadata from it
 */

exports.readMetadata = function (cfg, mod) {
  var p = path.resolve(exports.pluginPath(cfg, mod), 'package.json');
  var pkg = JSON.parse(fs.readFileSync(p).toString());
  var name = exports.pluginModuleToName(pkg.name);
  return {
    name: name,
    title: pkg.title || name,
    description: pkg.description || null,
    version: pkg.version
  };
};
