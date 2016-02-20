(function() {
  'use strict';

  var globals = typeof window === 'undefined' ? global : window;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = ({}).hasOwnProperty;

  var endsWith = function(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
  };

  var _cmp = 'components/';
  var unalias = function(alias, loaderPath) {
    var start = 0;
    if (loaderPath) {
      if (loaderPath.indexOf(_cmp) === 0) {
        start = _cmp.length;
      }
      if (loaderPath.indexOf('/', start) > 0) {
        loaderPath = loaderPath.substring(start, loaderPath.indexOf('/', start));
      }
    }
    var result = aliases[alias + '/index.js'] || aliases[loaderPath + '/deps/' + alias + '/index.js'];
    if (result) {
      return _cmp + result.substring(0, result.length - '.js'.length);
    }
    return alias;
  };

  var _reg = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (_reg.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var require = function(name, loaderPath) {
    var path = expand(name, '.');
    if (loaderPath == null) loaderPath = '/';
    path = unalias(name, loaderPath);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has.call(cache, dirIndex)) return cache[dirIndex].exports;
    if (has.call(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '" from '+ '"' + loaderPath + '"');
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  require.register = require.define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          modules[key] = bundle[key];
        }
      }
    } else {
      modules[bundle] = fn;
    }
  };

  require.list = function() {
    var result = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        result.push(item);
      }
    }
    return result;
  };

  require.brunch = true;
  require._cache = cache;
  globals.require = require;
})();
/* jshint ignore:start */
(function() {
  var WebSocket = window.WebSocket || window.MozWebSocket;
  var br = window.brunch = (window.brunch || {});
  var ar = br['auto-reload'] = (br['auto-reload'] || {});
  if (!WebSocket || ar.disabled) return;

  var cacheBuster = function(url){
    var date = Math.round(Date.now() / 1000).toString();
    url = url.replace(/(\&|\\?)cacheBuster=\d*/, '');
    return url + (url.indexOf('?') >= 0 ? '&' : '?') +'cacheBuster=' + date;
  };

  var browser = navigator.userAgent.toLowerCase();
  var forceRepaint = ar.forceRepaint || browser.indexOf('chrome') > -1;

  var reloaders = {
    page: function(){
      window.location.reload(true);
    },

    stylesheet: function(){
      [].slice
        .call(document.querySelectorAll('link[rel=stylesheet]'))
        .filter(function(link) {
          var val = link.getAttribute('data-autoreload');
          return link.href && val != 'false';
        })
        .forEach(function(link) {
          link.href = cacheBuster(link.href);
        });

      // Hack to force page repaint after 25ms.
      if (forceRepaint) setTimeout(function() { document.body.offsetHeight; }, 25);
    }
  };
  var port = ar.port || 9485;
  var host = br.server || window.location.hostname || 'localhost';

  var connect = function(){
    var connection = new WebSocket('ws://' + host + ':' + port);
    connection.onmessage = function(event){
      if (ar.disabled) return;
      var message = event.data;
      var reloader = reloaders[message] || reloaders.page;
      reloader();
    };
    connection.onerror = function(){
      if (connection.readyState) connection.close();
    };
    connection.onclose = function(){
      window.setTimeout(connect, 1000);
    };
  };
  connect();
})();
/* jshint ignore:end */
;require.register("src/actions/evilhelper", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getMacInfo = getMacInfo;
function getMacInfo() {
    return fetch('http://10.59.9.60').then(function (response) {
        if (response.status == 200) {
            return response.json();
        }
    }).then(function (json) {
        console.log(json);
        return json;
    });
}
});

;require.register("src/actions/userinfo", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.setName = setName;
exports.takePicture = takePicture;
exports.pictureTaken = pictureTaken;
exports.fetchUserinfo = fetchUserinfo;

var _evilhelper = require('./evilhelper');

var _ActionTypes = require('../constants/ActionTypes');

function getMacRequest() {
    return {
        type: _ActionTypes.GET_MAC_REQUEST
    };
}

function getMacSuccess(json) {
    return {
        type: _ActionTypes.GET_MAC_SUCCESS,
        helperJson: json
    };
}

function getMacFailure(error) {
    return {
        type: _ActionTypes.GET_MAC_FAILURE,
        error: error.toString()
    };
}

function getMac() {
    return function (dispatch) {
        dispatch(getMacRequest());

        return (0, _evilhelper.getMacInfo)().then(function (result) {
            return dispatch(getMacSuccess(result));
        }).catch(function (error) {
            return dispatch(getMacFailure(error));
        });
    };
}

function setName(name) {
    return {
        type: _ActionTypes.SET_NAME,
        name: name
    };
}

function takePicture() {
    return {
        type: _ActionTypes.TAKE_PICTURE
    };
}

function pictureTaken(pictureId) {
    return {
        type: _ActionTypes.PICTURE_TAKEN,
        pictureId: pictureId
    };
}

function fetchUserinfo() {
    return function (dispatch, getState) {
        return dispatch(getMac());
    };
}
});

;require.register("src/components/evilform", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRouter = require('react-router');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var EvilForm = function (_Component) {
    _inherits(EvilForm, _Component);

    function EvilForm(props) {
        _classCallCheck(this, EvilForm);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(EvilForm).call(this, props));
    }

    _createClass(EvilForm, [{
        key: 'render',
        value: function render() {
            var _props = this.props;
            var value = _props.value;
            var _onChange = _props.onChange;

            var other = _objectWithoutProperties(_props, ['value', 'onChange']);

            return _react2.default.createElement('input', { type: 'text', placeholder: 'Hva heter du?', value: value, onChange: function onChange(e) {
                    return _onChange(e.target.value);
                } });
        }
    }]);

    return EvilForm;
}(_react.Component);

EvilForm.propTypes = {
    value: _react.PropTypes.string.isRequired,
    onChange: _react.PropTypes.func.isRequired
};

exports.default = EvilForm;
});

require.register("src/components/index", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EvilForm = undefined;

var _evilform = require('./evilform');

var _evilform2 = _interopRequireDefault(_evilform);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.EvilForm = _evilform2.default;
});

require.register("src/constants/ActionTypes", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var GET_MAC_REQUEST = exports.GET_MAC_REQUEST = 'GET_MAC_REQUEST';
var GET_MAC_SUCCESS = exports.GET_MAC_SUCCESS = 'GET_MAC_SUCCESS';
var GET_MAC_FAILURE = exports.GET_MAC_FAILURE = 'GET_MAC_FAILURE';
var SET_NAME = exports.SET_NAME = 'SET_NAME';
var TAKE_PICTURE = exports.TAKE_PICTURE = 'TAKE_PICTURE';
var PICTURE_TAKEN = exports.PICTURE_TAKEN = 'PICTURE_TAKEN';
});

require.register("src/containers/App", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

var _reactRouter = require('react-router');

var _components = require('../components');

var _userinfo = require('../actions/userinfo');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var App = function (_Component) {
    _inherits(App, _Component);

    function App(props) {
        _classCallCheck(this, App);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(App).call(this, props));

        _this.handleChange = _this.handleChange.bind(_this);
        return _this;
    }

    _createClass(App, [{
        key: 'render',
        value: function render() {
            var userName = this.props.userName;


            return _react2.default.createElement(_components.EvilForm, { value: userName, onChange: this.handleChange });
        }
    }, {
        key: 'handleChange',
        value: function handleChange(text) {
            this.props.dispatch((0, _userinfo.setName)(text));
        }
    }]);

    return App;
}(_react.Component);

App.propTypes = {
    title: _react.PropTypes.string,
    dispatch: _react.PropTypes.func.isRequired
};

// Which props do we want to inject, given the global state?
// Note: use https://github.com/faassen/reselect for better performance.
function select(state) {
    var name = state.userinfo.name;

    return {
        userName: name
    };
}

exports.default = (0, _reactRedux.connect)(select)(App);
});

require.register("src/index", function(exports, require, module) {
'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactRedux = require('react-redux');

var _reactRouter = require('react-router');

var _history = require('history');

var _routes = require('./routes');

var _routes2 = _interopRequireDefault(_routes);

var _configureStore = require('./store/configureStore');

var _configureStore2 = _interopRequireDefault(_configureStore);

var _userinfo = require('./actions/userinfo');

var _ActionTypes = require('./constants/ActionTypes');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var appHistory = (0, _reactRouter.useRouterHistory)(_history.createHashHistory)({ queryKey: false });
var routes = (0, _routes2.default)();
var store = (0, _configureStore2.default)(appHistory);

(0, _reactDom.render)(_react2.default.createElement(
    _reactRedux.Provider,
    { store: store },
    _react2.default.createElement(
        _reactRouter.Router,
        { history: appHistory },
        routes
    )
), document.getElementById('root'));

var sock = {
    proxy: null,
    signalDispatcher: function signalDispatcher() {
        var _store$getState = store.getState();

        var lastAction = _store$getState.lastAction;
        var userinfo = _store$getState.userinfo;


        if (sock.proxy) {
            switch (lastAction.type) {
                case _ActionTypes.TAKE_PICTURE:
                    return sock.proxy.server.takePicture(connectionId);
                case _ActionTypes.SET_NAME:
                case _ActionTypes.GET_MAC_SUCCESS:
                case _ActionTypes.PICTURE_TAKEN:
                    return sock.proxy.server.saveIdentity(userinfo.hwaddr, userinfo.name, userinfo.pictureId);
                default:
                    return;
            }
        } else {
            return;
        }
    },
    startSignalServer: function startSignalServer(connectionId) {
        console.log('Starting signal server', connectionId);
        if (connectionId) {
            sock.proxy = $.connection.evilHub;

            sock.proxy.client.pictureTaken = function (accessPointConnectionId, pictureId) {
                console.log("EVENT PictureTaken");
                if (accessPointConnectionId == connectionId) {
                    store.dispatch((0, _userinfo.pictureTaken)(pictureId));
                }
            };

            $.connection.hub.url = 'http://evil-signalhub.azurewebsites.net/signalr/hubs';
            //$.connection.hub.url = 'http://localhost:5781/signalr/hubs';
            $.connection.hub.start().done(function () {
                console.log('Now connected, connection ID=' + $.connection.hub.id);
                store.dispatch((0, _userinfo.fetchUserinfo)());
                store.dispatch((0, _userinfo.takePicture)());
            }).fail(function (err) {
                console.log('Could not connect to server.', err);
            });
        }
    }
};

var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = window.location.hash.substring(3),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};

var connectionId = getUrlParameter('connectionId');
sock.startSignalServer(connectionId);
store.subscribe(function () {
    return sock.signalDispatcher();
});
});

require.register("src/reducers/index", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _redux = require('redux');

var _reactRouterRedux = require('react-router-redux');

var _userinfo = require('./userinfo');

var _ui = require('./ui');

var _lastAction = require('./lastAction');

var rootReducer = (0, _redux.combineReducers)({
    userinfo: _userinfo.userinfo,
    ui: _ui.ui,
    routes: _reactRouterRedux.routeReducer,
    lastAction: _lastAction.lastAction
});

exports.default = rootReducer;
});

require.register("src/reducers/lastAction", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.lastAction = lastAction;
function lastAction() {
  var state = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
  var action = arguments[1];

  return action;
}
});

;require.register("src/reducers/ui", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ui = ui;
function ui() {
    var state = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    var action = arguments[1];

    return state;
}
});

;require.register("src/reducers/userinfo", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.userinfo = userinfo;

var _ActionTypes = require('../constants/ActionTypes');

//const defaultState = { items: { subscriptions: [], receivers: [] }};
function userinfo() {
    var state = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    var action = arguments[1];

    switch (action.type) {
        case _ActionTypes.GET_MAC_REQUEST:
            return state;
        case _ActionTypes.GET_MAC_SUCCESS:
            return Object.assign({}, state, {
                hwaddr: action.helperJson.hwaddr,
                ip: action.helperJson.ip
            });
        case _ActionTypes.SET_NAME:
            return Object.assign({}, state, {
                name: action.name
            });
        case _ActionTypes.TAKE_PICTURE:
            return state;
        case _ActionTypes.PICTURE_TAKEN:
            return Object.assign({}, state, {
                pictureId: action.pictureId
            });
        default:
            return state;
    }
}
});

;require.register("src/routes", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRouter = require('react-router');

var _App = require('./containers/App');

var _App2 = _interopRequireDefault(_App);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
    return _react2.default.createElement(_reactRouter.Route, { path: '/', component: _App2.default });
};
});

;require.register("src/store/configureStore", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = configureStore;

var _redux = require('redux');

var _reduxThunk = require('redux-thunk');

var _reduxThunk2 = _interopRequireDefault(_reduxThunk);

var _reduxLogger = require('redux-logger');

var _reduxLogger2 = _interopRequireDefault(_reduxLogger);

var _reactRouterRedux = require('react-router-redux');

var _initialState = require('./initialState');

var _initialState2 = _interopRequireDefault(_initialState);

var _reducers = require('../reducers');

var _reducers2 = _interopRequireDefault(_reducers);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function configureStore(history) {
    var router = (0, _reactRouterRedux.syncHistory)(history);
    var logger = (0, _reduxLogger2.default)();

    var middleware = [_reduxThunk2.default, router, logger];

    var finalCreateStore = _redux.applyMiddleware.apply(undefined, middleware)(_redux.createStore);
    var store = finalCreateStore(_reducers2.default, _initialState2.default);

    return store;
}
});

;require.register("src/store/initialState", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = {
    userinfo: {
        ip: '',
        hwaddr: '',
        name: '',
        imageId: ''
    },
    ui: {
        name: 'EvilCorp - Data harvester'
    },
    lastAction: {
        action: ''
    }
};
});

;
//# sourceMappingURL=app.js.map