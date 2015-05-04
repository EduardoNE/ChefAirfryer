
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services','ngCordova'])

.run(function($ionicPlatform, $cordovaSQLite) {
        $ionicPlatform.ready(function() {
            if(window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if(window.StatusBar) {
                StatusBar.styleDefault();
            }
            var db = $cordovaSQLite.openDB("chefAirfyer");

            $cordovaSQLite.execute(db, 
              "CREATE TABLE IF NOT EXISTS receita (id integer primary key, nome text,imagem text, receita text, ingredientes text, quantidades text, tempo text, temperatura text, serve text, categoria integer, like integer)"
            );
            $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS ingredientes (id integer primary key, nome text)");

        });
    })

.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider

  // setup an abstract state for the tabs directive
  .state('tab', {
    url: "/tab",
    abstract: true,
    templateUrl: "templates/tabs.html"
  })

  // Each tab has its own nav history stack:

  .state('tab.dash', {
    url: '/dash',
    views: {
      'tab-dash': {
        templateUrl: 'templates/tab-dash.html',
        controller: 'DashCtrl'
      }
    }
  })

  .state('tab.rreceitas', {
    url: '/receitas/:categ',
    views: {
      'tab-dash': {
        templateUrl: 'templates/categorias.html',
        controller: 'ReceitasCtrl'
      }
     }
   })
  .state('tab.update', {
    url: '/update',
    views: {
      'update': {
        templateUrl: 'templates/update.html',
        controller: 'UpdateCtrl'
      }
     }
   })
  
  .state('tab.bemVindo', {
    url: '/BemVindo',
    views: {
      'tab-link': {
        templateUrl: 'templates/bemvindo.html',
        controller: 'UpdateCtrl'
      }
     }
   })

  .state('tab.pesquisa', {
    url: '/pesquisa',
    views: {
      'tab-pesquisa': {
        templateUrl: 'templates/pesquisar.html',
        controller: 'PesquisaCtrl'
      }
     }
   })

  .state('tab.rreceita', {
    url: '/receita/:id',
    views: {
      'tab-dash': {
        templateUrl: 'templates/receita.html',
        controller: 'ReceitaCtrl'
      }
    }
  })

  .state('tab.receita', {
    url: '/Lreceita/:id',
    views: {
      'tab-link': {
        templateUrl: 'templates/receita.html',
        controller: 'ReceitaCtrl'
      }
    }
  })
  .state('tab.receitas', {
    url: '/Lreceitas/:categ',
    views: {
      'tab-link': {
        templateUrl: 'templates/categorias.html',
        controller: 'ReceitasCtrl'
      }
     }
   })
  .state('tab.geladeira', {
    url: '/geladeira',
    views: {
     'tab-geladeira': {
        templateUrl: 'templates/tab-geladeira.html',
        controller: 'GeladeiraCtrl'
      }
    }
  })
  .state('tab.receitag', {
    url: '/geladeira/receita/:id',
    views: {
      'tab-geladeira': {
        templateUrl: 'templates/receita.html',
        controller: 'ReceitaCtrl'
      }
    }
  })
  .state('tab.receitap', {
    url: '/pesquisa/receita/:id',
    views: {
      'tab-pesquisa': {
        templateUrl: 'templates/receita.html',
        controller: 'ReceitaCtrl'
      }
    }
  })

  .state('tab.favoritos', {
      url: '/favoritos',
      views: {
        'tab-favoritos': {
          templateUrl: 'templates/tab-favoritos.html',
          controller: 'FavoritosCtrl'
        }
      }
  })

  .state('tab.dicas', {
      url: '/dicas/:categ',
      views: {
        'tab-dash': {
          templateUrl: 'templates/dicas.html',
          controller: 'ReceitasCtrl'
        }
      }
  })
  
  .state('tab.dica', {
    url: '/dica/:id',
    views: {
      'tab-dash': {
        templateUrl: 'templates/dica.html',
        controller: 'ReceitaCtrl'
      }
    }
  })

  .state('tab.envie', {
      url: '/envie',
      views: {
        'tab-envie': {
          templateUrl: 'templates/tab-envie.html',
          controller: 'EnvieCtrl'
        }
      }
  });

      // if none of the above states are matched, use this as the fallback
      $urlRouterProvider.otherwise('/tab/dash');

});



