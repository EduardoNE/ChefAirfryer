angular.module('starter.services', ['ionic','ngCordova'])
  .factory('Update', function($ionicPlatform,$cordovaSQLite,$cordovaNetwork,$http) {
      return {
        all: function() {
          $ionicPlatform.ready(function() {
            var db = $cordovaSQLite.openDB("chefAirfyer");
            if ($cordovaNetwork.isOnline()) {
              $http.get('http://bastidor.com.br/airfry/ajax/0/0/0/NumRows')
                .success(
                  function(data, status, headers, config) {
                    var query = "SELECT * FROM receita";
                    $cordovaSQLite.execute(db, query, []).then(function(res) {
                      console.log('local - pratos-number', res.rows.length);
                      console.log('serv - pratos-number', data.prato);
                      if (res.rows.length != data.prato) {
                        $http.get('http://bastidor.com.br/airfry/ajax/prato')
                  .success(function(data, status, headers, config) {
                    var db = $cordovaSQLite.openDB("chefAirfyer");
                    $cordovaSQLite.execute(db, 'Delete from receita;', [])
                      .then(function(res) {
                        console.log("Delete * ", res);
                      }, function(err) {
                        console.error(err);
                      });
                    var query = 'INSERT INTO receita (id , nome,imagem, receita, ingredientes, quantidades, tempo, temperatura, serve, categoria) VALUES (?,?,?,?,?,?,?,?,?,?)';
                    for (var i = 0; i < data.length; i++) {
                      console.log(i + " - prato", data[i]);
                      $cordovaSQLite.execute(db, query, [data[i].id, data[i].nome, data[i].imagem, data[i].receita, data[i].ingredientes, data[i].quantidades, data[i].tempo, data[i].temperatura, data[i].serve, data[i].categoria[0].categoria_id])
                        .then(function(res) {
                          console.log("INSERTed prato -> " + res.insertId, res);
                        }, function(err) {
                          console.error(err);
                        });
                    };
                  }).error(function(data, status, headers, config) {
                    console.log('Falhou ', data);
                    console.log('Status ', status);
                  });
                $http.get('http://bastidor.com.br/airfry/ajax/prato/ingredientes/0/options')
                  .success(function(data, status, headers, config) {
                    //console.log('data~prato',data);
                    var db = $cordovaSQLite.openDB("chefAirfyer");
                    $cordovaSQLite.execute(db, 'Delete from ingredientes;', [])
                      .then(function(res) {
                        console.log("Delete * ", res);
                      }, function(err) {
                        console.error(err);
                      });
                    var query = 'INSERT INTO ingredientes (id , nome) VALUES (?,?)';
                    for (var i = 0; i < data.length; i++) {
                      console.log(i + " - ingredientes", data[i]);
                      $cordovaSQLite.execute(db, query, [i + 1, data[i].text])
                        .then(function(res) {
                          console.log("INSERTed ingr -> " + res.insertId, res);
                        }, function(err) {
                          console.error(err);
                        });
                    };
                  }).error(function(data, status, headers, config) {
                    console.log('Falhou ', data);
                    console.log('Status ', status);
                  });
                      } else {
                        console.log("Same with server.");
                        alert("Sua versao e a ultima disponvel.");
                      }
                    }, function(err) {
                      console.error(err);
                    });
                  },
                  function(err) {
                    console.error(err);
                  }
                );
            }
          });
        },
        numbers: function() {
          $ionicPlatform.ready(function() {
                var db = $cordovaSQLite.openDB("chefAirfyer");
                if ($cordovaNetwork.isOnline()) {
                  $http.get('http://bastidor.com.br/airfry/ajax/0/0/0/NumRows')
                    .success(
                      function(data, status, headers, config) {
                        var query = "SELECT * FROM receita";
                        $cordovaSQLite.execute(db, query, []).then(function(res) {
                          console.log('local - pratos-number', res.rows.length);
                          console.log('serv - pratos-number', data.prato);
                          return data.prato - res.rows.length;
                        }, function(err) {
                          return 0;
                        });
                      },
                      function(err) {
                        return 0;
                      }
                    );
                }
              });
            }
        }
      })
    /**
     * A simple example service that returns some data.
     */
    .factory('Categoria', function() {
      var categorias = 
          [{
              "id":13,
              "nome": "Amigos do Chef"
          }, {
              "id":12,
              "nome": "Descubra"
          }, {
              "id":11,
              "nome": "Dicas"
          }, {
              "id":10,
              "nome": "Kids"
          }, {
              "id":9,
              "nome": "Fitness"
          }, {
              "id":8,
              "nome": "P\u00e3es, Bolos e Muffins"
          }, {
              "id":7,
              "nome": "Acompanhamentos"
          }, {
              "id":6,
              "nome": "Industrializado"
          }, {
              "id":5,
              "nome": "Salgados e Petiscos"
          }, {
              "id":4,
              "nome": "Doces e Sobremesas"
          }, {
              "id":3,
              "nome": "Abc"
          }, {
              "id":2,
              "nome": "Peixes e Frutos do Mar"
          }, {
              "id":1,
              "nome": "Carnes"
          }];
      return {
        all: function() {
          return categorias;
        },
        get: function(id) {
          for (var i = 0; i < categorias.length; i++) {
            if (categorias[i].id === parseInt(id)) {
              return categorias[i].nome;
            }
          }
          return "Receitas";
        }
      }
    })

.factory('$localstorage', ['$window', function($window) {
  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
      return null;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || '[]');
    }
  }
}])

.factory('$analytcs', ['$cordovaGoogleAnalytics','$cordovaDevice', function($cordovaGoogleAnalytics,$cordovaDevice) {
  return {
    start: function(){
      $cordovaGoogleAnalytics.debugMode();
      $cordovaGoogleAnalytics.startTrackerWithId('UA-62380044-1');
      $cordovaGoogleAnalytics.setUserId($cordovaDevice.getModel() + " - " + $cordovaDevice.getVersion());
    },
    view: function(value) {
      $cordovaGoogleAnalytics.trackView(value);
      return null;
    },
    event: function(page,subpage, ext1, ext2){
      $cordovaGoogleAnalytics.trackEvent(page,subpage, ext1, ext2);
    }
  }
}])

.factory('favoritos', ['$localstorage', function($localstorage) {
  return {
    add: function(id) {
      vari = $localstorage.getObject('favoritos');
      if (vari.indexOf(id) == -1)
        vari.unshift(id);
      $localstorage.setObject('favoritos',vari);
    },
    del: function(id) {
      vari = $localstorage.getObject('favoritos');
      index = vari.indexOf(id);
      if (index > -1) {
          vari.splice(index, 1);
      }
      $localstorage.setObject('favoritos',vari);
    },
    check: function(id) {
      vari = $localstorage.getObject('favoritos');
      if (vari.indexOf(id) == -1)
        return false;
      return true;
    },
    getAll: function() {
      return $localstorage.getObject('favoritos');
    }
  }
}]);


















