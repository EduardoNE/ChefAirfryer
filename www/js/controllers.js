angular.module('starter.controllers', ['ionic', 'starter.controllers', 'starter.services', 'ngCordova'])
	.controller('DashCtrl', function($ionicPlatform, $scope, $http, $cordovaInAppBrowser, $ionicSlideBoxDelegate, $analytcs, $state, $localstorage, $rootScope, $cordovaNetwork, $cordovaSQLite) {
		$scope.hasUpdate = "";
		if ($localstorage.get("firstRun", 0) == 0) {
			console.log("In");
			$localstorage.set("firstRun", 1);
			$localstorage.setObject("favoritos", []);
			$localstorage.setObject("euFiz", []);
		}
		$scope.slides = [];
		var options = {
			location: 'yes',
			clearcache: 'yes',
			toolbar: 'yes'
		};

		$ionicPlatform.ready(function() {
			if ($cordovaNetwork.isOnline()) {
			$analytcs.start();
			$analytcs.view("Home");
			var db = $cordovaSQLite.openDB("chefAirfyer");
			$http.get('http://bastidor.com.br/airfry/ajax/banner/')
				.success(function(data, status, headers, config) {
					$scope.slides = data;
					$ionicSlideBoxDelegate.update();
					
				}).error(function(data, status, headers, config) {
					console.log('Falhou ', data);
					console.log('Status ', status);
				});
			}

			chamaBemVindo = function() {
				var query = "SELECT * FROM receita";
				$cordovaSQLite.execute(db, query, []).then(function(res) {
					console.log('local - pratos-number', res.rows.length);
					if (res.rows.length == 0) {
						console.log("Bem Vindo");
						$state.go("tab.bemVindo", {});
					}
				});
			};
			chamaBemVindo();
		})		
		$scope.SendOut = function(id, link) {
			if (link.indexOf("#") != 0)
				$cordovaInAppBrowser.open(link, "_blank", options);
			else {
				arrLink = link.split("/");
				$state.go(arrLink[1] + "." + arrLink[2], {
					'id': arrLink[3],
					"categ": arrLink[3]
				});
			}
		};
		$scope.$on('$ionicView.enter', function() {
			$ionicSlideBoxDelegate.update();
		});
			
		
	})
	.controller('UpdateCtrl', function($ionicPlatform, $http, $scope, $cordovaSQLite, $cordovaNetwork) {
		var attI = 1;
		var attP = 1;
		var totI = 1;
		var totP = 1;
		var time = 0;
		var timeout = null;

		$scope.updates = 0;
		$scope.visao = {};
		$scope.visao.carregando = "";
		$scope.visao.atrasado = "hide";
		$scope.visao.atualizado = "hide";
		$scope.visao.atualizando = "hide";
		$scope.visao.semInternet = "hide";
		$scope.porcent = "00:00";
		$ionicPlatform.ready(function() {
			var db = $cordovaSQLite.openDB("chefAirfyer");
			if ($cordovaNetwork.isOnline()) {
				$scope.visao.semInternet = "hide";
				$http.get('http://bastidor.com.br/airfry/ajax/0/0/0/NumRows')
					.success(
						function(data, status, headers, config) {
							$scope.visao.carregando = "hide";
							var query = "SELECT * FROM receita";
							$cordovaSQLite.execute(db, query, []).then(function(res) {
								console.log('local - pratos-number', res.rows.length);
								console.log('serv - pratos-number', data.prato);
								falta = data.prato - res.rows.length;
								console.log("faltam - ", falta);
								$scope.updates = falta;
								if (falta > 0)
									$scope.visao.atrasado = "";
								else
									$scope.visao.atualizado = "";
							}, function(err) {
								$scope.updates = 0;
							});
						},
						function(err) {
							$scope.updates = 0;
							$scope.visao.atualizado = "";
						}
					);
			} else {
				$scope.visao.semInternet = "";
			}

			$scope.update = function() {
				$scope.visao.atrasado = "hide";
				$scope.visao.atualizado = "hide";
				$scope.visao.atualizando = "";
				

				var timer = function() {
					time+=1;
					
					minutos = Math.floor(time / 60);
					if(minutos < 10)
						minutos = "0" + minutos;
					
					segundos = time - Math.round(minutos *60);
					if(segundos < 10)
						segundos = "0" + segundos;
					
					$scope.$apply(function () {
			            $scope.porcent = (minutos + ":" + segundos);
			        });
					
					timeout = setTimeout(timer, 1000);
				}
				
				timer();

				$http.get('http://bastidor.com.br/airfry/ajax/prato')
					.success(function(data, status, headers, config) {
						attP = data.length;
						totP = data.length;
						$cordovaSQLite.execute(db, 'Delete from receita;', [])
							.then(function(res) {
								console.log("Delete * ", res);
							}, function(err) {
								console.error(err);
							});
						var query = 'INSERT INTO receita (id , nome,imagem, receita, ingredientes, quantidades, tempo, temperatura, serve, categoria,like) VALUES (?,?,?,?,?,?,?,?,?,?,?)';
						for (var i = 0; i < data.length; i++) {
							console.log(i + " - prato", data[i]);
							$cordovaSQLite.execute(db, query, [data[i].id, data[i].nome, data[i].imagem, data[i].receita, data[i].ingredientes, data[i].quantidades, data[i].tempo, data[i].temperatura, data[i].serve, data[i].categoria[0].categoria_id, data[i].like])
								.then(function(res) {
									finished("P");
									console.log("INSERTed prato -> " + res.insertId, res);
								}, function(err) {
									finished("P");
									console.error(err);
								});
						};
					}).error(function(data, status, headers, config) {
						console.log('Falhou ', data);
						console.log('Status ', status);
					});
				$http.get('http://bastidor.com.br/airfry/ajax/prato/ingredientes/0/options')
					.success(function(data, status, headers, config) {
						attI = data.length;
						totI = data.length;
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
									finished("I");
									console.log("INSERTed ingr -> " + res.insertId, res);
								}, function(err) {
									finished("I");
									console.error(err);
								});
						};
					}).error(function(data, status, headers, config) {
						console.log('Falhou ', data);
						console.log('Status ', status);
					});
			};
			finished = function(who) {
				if (who == "I")
					attI--;
				else
					attP--;
				//$scope.porcent = (Math.ceil((100 - ((attI * 100) / totI)) / 2) + Math.ceil((100 - ((attP * 100) / totP)) / 2)) + "%";
				if (attI == 0 && attP == 0) {
					clearTimeout(timeout);
					$scope.visao.carregando = "hide";
					$scope.visao.atrasado = "hide";
					$scope.visao.atualizado = "";
					$scope.visao.atualizando = "hide";
					$scope.visao.semInternet = "hide";

					setTimeout($state.go("tab.dash", {}), 4000);
					
				}
				return true;
			};
			
		})
	})
	.controller('ReceitasCtrl', function($ionicPlatform, $scope, $stateParams, $cordovaSQLite, Categoria, $analytcs) {
		$scope.receitas = [];
		$scope.titulo = "";
		$ionicPlatform.ready(function() {
			$analytcs.start();
			$analytcs.view("Categoria - " + Categoria.get($stateParams.categ));
			var db = $cordovaSQLite.openDB("chefAirfyer");
			$scope.titulo = Categoria.get($stateParams.categ);
			var query = "SELECT * FROM receita WHERE categoria=" + $stateParams.categ;
			console.log(query);
			$cordovaSQLite.execute(db, query, []).then(function(res) {
				console.log('res.rows', res.rows);
				if (res.rows.length > 0) {
					for (var i = res.rows.length - 1; i >= 0; i--) {
						console.log('rows(' + i + ').c', res.rows.item(i));
						$scope.receitas.push(res.rows.item(i));
					}
				} else {
					console.log("No results found");
				}
			}, function(err) {
				console.error(err);
			});
		})
	})
	.controller('ReceitaCtrl', function($ionicPlatform, $analytcs, $scope, $stateParams,$ionicNavBarDelegate, $cordovaSQLite, $localstorage, $cordovaSocialSharing, $http, favoritos) {
		$scope.receita = {};
		$scope.favoritos = favoritos;
		$scope.feito = "ion-fork";
		$scope.titulo = "";
		var item = {};
		$ionicPlatform.ready(function() {
			$analytcs.start();
			var db = $cordovaSQLite.openDB("chefAirfyer");
			var query = "SELECT * FROM receita WHERE id =" + $stateParams.id;
			console.log(query);
			var likes = $localstorage.getObject('euFiz');
			$cordovaSQLite.execute(db, query, []).then(function(res) {
				if (res.rows.length > 0) {
					item = res.rows.item(0);
					$scope.titulo = item.nome;
					//$ionicNavBarDelegate.update();
					$analytcs.view("Receita - " + item.nome);
					console.log('res.rows', item.nome);
					$scope.receita = item;
					if (likes.indexOf(item.id) == -1)
						$scope.feito = "ion-fork";
					else
						$scope.feito = "ion-checkmark";
					if (favoritos.check($stateParams.id))
						$scope.favoritado = "";
					else
						$scope.favoritado = "-outline";
				} else {
					console.log("No results found");
				}
			}, function(err) {
				console.error(err);
			});
			
			$scope.favoritar = function() {
				if (favoritos.check($stateParams.id)) {
					$analytcs.event("Receita", $scope.titulo, "Desfavoritou", -1);
					$scope.favoritado = "-outline";
					favoritos.del($stateParams.id);
					console.log("del", favoritos.getAll());
				} else {
					$scope.favoritado = "";
					$analytcs.event("Receita", $scope.titulo, "Favoritou", 1);
					favoritos.add($stateParams.id);
					console.log("add", favoritos.getAll());
				}
			};

			$scope.euFiz = function() {
				$analytcs.event("Receita", $scope.titulo, "Fez", 1);
				var url = "http://bastidor.com.br/airfry/ajax/prato";
				love = item.id;
				console.log('btn_id', love);
				var likes = $localstorage.getObject('euFiz');
				if (likes.indexOf(love) == -1) {
					console.log('opa');
					$http.get(url + "/" + love + "/id/heart").then(function(resp) {
						console.log('HeartSuccess', resp);
						if (resp.data != false) {
							likes = $localstorage.getObject('euFiz');
							console.log(love, likes);
							likes.push(love);
							$localstorage.setObject('euFiz', likes);
							dados = [];
							if (likes.indexOf(item.id) == -1)
								$scope.feito = "ion-fork";
							else
								$scope.feito = "ion-checkmark";
							console.log(item);
						}
					})
				}
			};

			$scope.Email = function() {
				var img = item.imagem != "data:image/;base64," ? item.imagem : "";
				var text = 	item.nome + "<br>"+
				"<img src='"+ img +"'>"+ 
				"<br><br>Ingredientes: <br>" + 
				item.quantidades.replace(/<br>/gi, "<br>") + 
				"<br><br>Como fazer: <br>" + 
				item.receita.replace(/<br>/gi, "<br>") + 
				"<br><br> Essa e muitas outras receitas você pode encontrar no App Chef Airfryer para iOS e Android<br> http://chefairfryer.com.br";

				console.log(text);
				$cordovaSocialSharing.shareViaEmail(text, item.nome,null,null, img, 
						function() {console.log('share ok')}, 
						function(errormsg){alert(errormsg)}
				);
			}

			$scope.Facebook = function() {
				var img = item.imagem != "data:image/;base64," ? item.imagem : "";
				var text = item.nome + 
				"\r\n\r\nIngredientes: \r\n" + 
				item.quantidades.replace(/<br>/gi, "\r\n") + 
				"\r\n\r\nComo fazer: \r\n" + 
				item.receita.replace(/<br>/gi, "\r\n") + 
				"\r\n\r\n Essa e muitas outras receitas você pode encontrar no App Chef Airfryer para iOS e Android"+
				"\r\nhttp://chefairfryer.com.br";

				console.log(text);
				$cordovaSocialSharing.shareViaFacebookWithPasteMessageHint(
					text,  img , "http://chefairfryer.com.br" , 'Click aqui para copiar a receita e depois cole no campo de compartilhamento.', 
						function() { console.log('share ok') }, 
						function(errormsg) { alert(errormsg) }
				)
			}

			$scope.Whatsapp = function() {
				var img = item.imagem != "data:image/;base64," ? item.imagem : "";
				var text = item.nome + 
				"\r\n\r\nIngredientes: \r\n" + 
				item.quantidades.replace(/<br>/gi, "\r\n") + 
				"\r\n\r\nComo fazer: \r\n" + 
				item.receita.replace(/<br>/gi, "\r\n") + 
				"\r\n\r\n Essa e muitas outras receitas você pode encontrar no App Chef Airfryer para iOS e Android"+
				"\r\nhttp://chefairfryer.com.br";

				$cordovaSocialSharing.shareViaWhatsApp(
					text,  null , null , 
						function() {console.log('share ok')}, 
						function(errormsg){alert(errormsg)}
				)
			}

			$scope.email = function() {
				var img = item.imagem != "data:image/;base64," ? item.imagem : "";
				var text = 	item.nome + "<br>"+
				"<img src='"+ img +"'>"+ 
				item.quantidades.replace(/<br>/gi, "<br>") + 
				item.receita.replace(/<br>/gi, "<br>") + 
				"<br><br> Essa e muitas outras receitas você pode encontrar no App Chef Airfryer para iOS e Android<br> http://chefairfryer.com.br";

				console.log(text);
				$cordovaSocialSharing.shareViaEmail(text, item.nome,null,null, img, 
						function() {console.log('share ok')}, 
						function(errormsg){alert(errormsg)}
				);
			}

			$scope.facebook = function() {
				var img = item.imagem != "data:image/;base64," ? item.imagem : "";
				var text = item.nome + 
				item.quantidades.replace(/<br>/gi, "\r\n") + 
				item.receita.replace(/<br>/gi, "\r\n") + 
				"\r\n\r\n Essa e muitas outras receitas você pode encontrar no App Chef Airfryer para iOS e Android"+
				"\r\nhttp://chefairfryer.com.br";

				console.log(text);
				$cordovaSocialSharing.shareViaFacebookWithPasteMessageHint(
					text,  img , "http://chefairfryer.com.br" , 'Click aqui para copiar a receita e depois cole no campo de compartilhamento.', 
						function() { console.log('share ok') }, 
						function(errormsg) { alert(errormsg) }
				)
			}

			$scope.whatsapp = function() {
				var img = item.imagem != "data:image/;base64," ? item.imagem : "";
				var text = item.nome + 
				item.quantidades.replace(/<br>/gi, "\r\n") + 
				item.receita.replace(/<br>/gi, "\r\n") + 
				"\r\n\r\n Essa e muitas outras receitas você pode encontrar no App Chef Airfryer para iOS e Android"+
				"\r\nhttp://chefairfryer.com.br";

				$cordovaSocialSharing.shareViaWhatsApp(
					text,  null , null , 
						function() {console.log('share ok')}, 
						function(errormsg){alert(errormsg)}
				)
			}
			
		})
	})
	.controller('GeladeiraCtrl', function($ionicPlatform, $analytcs, $scope, $http, $cordovaSQLite, $ionicScrollDelegate) {
		$scope.pesquisa = {};
		$scope.pesquisa.termo = "";
		$scope.receitas = [];
		$ionicPlatform.ready(function() {
			$analytcs.start();
			$analytcs.view("Geladeira");
			var db = $cordovaSQLite.openDB("chefAirfyer");
			$scope.visao = {};
			$scope.visao.receitas = "hide";
			$scope.visao.geladeira = "";
			$scope.geladeira = [];
			var query = "SELECT * FROM ingredientes";
			$cordovaSQLite.execute(db, query, []).then(function(res) {
				console.log('res.rows', res.rows);
				if (res.rows.length > 0) {
					for (var i = 0; i < res.rows.length; i++) {
						console.log('rows(' + i + ')', res.rows.item(i));
						res.rows.item(i).checked = false;
						res.rows.item(i).filter = "";
						$scope.geladeira.push(res.rows.item(i));
					}
				} else {
					console.log("No results found");
				}
			}, function(err) {
				console.error(err);
			});
			$scope.filter = function() {
				console.log("pesquisa ", $scope.pesquisa.termo);
				for (i = 0;
					(i < $scope.geladeira.length); i++) {
					if ($scope.geladeira[i].nome.toLowerCase().indexOf($scope.pesquisa.termo.toLowerCase()) > -1 || $scope.pesquisa == "")
						$scope.geladeira[i].filter = "";
					else
						$scope.geladeira[i].filter = "hide";
				}
			}
			$scope.pesquisar = function() {
				$scope.receitas = [];
				$scope.visao.geladeira = "hide";
				$scope.visao.receitas = "";
				$ionicScrollDelegate.scrollTop();
				var query = "SELECT * FROM receita ";
				where = "";
				for (i = 0;
					(i < $scope.geladeira.length) && (item = $scope.geladeira[i]); i++) {
					if (item.checked) {
						$analytcs.event("Geladeira", "Marcou", item.nome, 1);
						if (where != "")
							where += " OR ";
						else
							where += "WHERE ";
						where += "ingredientes LIKE '%" + item.nome + "%'";
					}
				}
				query += where + ' COLLATE NOCASE';
				console.log(query);
				$cordovaSQLite.execute(db, query, []).then(function(res) {
					console.log('res.rows', res.rows);
					if (res.rows.length > 0) {
						for (var i = res.rows.length - 1; i >= 0; i--) {
							console.log('rows(' + i + ').c', res.rows.item(i));
							var vish = res.rows.item(i);
							vish.itens = vish.ingredientes.toLowerCase().split(",");
							vish.possui = 0;
							for (var o = $scope.geladeira.length - 1; o >= 0; o--) {
								if (vish.itens.indexOf($scope.geladeira[o].nome.toLowerCase()) > -1)
									vish.possui++;
							}
							vish.falta = vish.itens.length - vish.possui;
							$scope.receitas.push(vish);

							function compare(a, b) {
								if (a.falta < b.falta)
									return -1;
								if (a.falta > b.falta)
									return 1;
								return 0;
							}
							$scope.receitas.sort(compare);
						}
					} else {
						console.log("No results found");
					}
				}, function(err) {
					console.error(err);
				});
			};
			$scope.voltar = function() {
				$scope.visao.geladeira = "";
				$scope.visao.receitas = "hide";
			};
		})
	})
	.controller('FavoritosCtrl', function($ionicPlatform, $analytcs, $scope, $http, $cordovaSQLite, favoritos) {
		$scope.receitas = [];
		var ids = favoritos.getAll();
		$ionicPlatform.ready(function() {
			$analytcs.start();
			$analytcs.view("Favoritos");
			var db = $cordovaSQLite.openDB("chefAirfyer");
			var query = "SELECT * FROM receita ";
			where = "WHERE id = 0";
			for (i = 0;
				(i < ids.length) && (item = ids[i]); i++) {
				where += " OR ";
				where += "id = " + item + "";
			}
			query += where;
			$cordovaSQLite.execute(db, query, []).then(function(res) {
				if (res.rows.length > 0) {
					for (var i = res.rows.length - 1; i >= 0; i--) {
						console.log('rows(' + i + ').Fav', res.rows.item(i));
						$scope.receitas.push(res.rows.item(i));
					}
				} else {
					console.log("No results found");
				}
			}, function(err) {
				console.error(err);
			});
		})
		$scope.refresh = function() {
			var ids = favoritos.getAll();
			$ionicPlatform.ready(function() {
				$scope.receitas = [];
				var db = $cordovaSQLite.openDB("chefAirfyer");
				var query = "SELECT * FROM receita ";
				where = "WHERE id = 0";
				for (i = 0;
					(i < ids.length) && (item = ids[i]); i++) {
					where += " OR ";
					where += "id = " + item + "";
				}
				query += where;
				$cordovaSQLite.execute(db, query, []).then(function(res) {
					if (res.rows.length > 0) {
						for (var i = res.rows.length - 1; i >= 0; i--) {
							console.log('rows(' + i + ').Fav', res.rows.item(i));
							$scope.receitas.push(res.rows.item(i));
						}
						$scope.$broadcast('scroll.refreshComplete');
					} else {
						console.log("No results found");
					}
				}, function(err) {
					console.error(err);
				});
			})
		};
	})
	.controller('PesquisaCtrl', function($ionicPlatform, $analytcs, $scope, $http, $cordovaSQLite, $stateParams) {
		$ionicPlatform.ready(function() {
			$analytcs.start();
			$analytcs.view("Pesquisa");
			$scope.visao = {};
			$scope.pesquisa = {};
			$scope.visao.cega = "";
			$scope.visao.receitas = "hide";
			$scope.geladeira = [];
			var db = $cordovaSQLite.openDB("chefAirfyer");
			var query = "SELECT * FROM receita";
			$cordovaSQLite.execute(db, query, []).then(function(res) {
				console.log('res.rows', res.rows);
				if (res.rows.length > 0) {
					for (var i = 0; i < res.rows.length; i++) {
						console.log('rows(' + i + ')', res.rows.item(i));
						res.rows.item(i).filter = "";
						$scope.geladeira.push(res.rows.item(i));
					}
				} else {
					console.log("No results found");
				}
			}, function(err) {
				console.error(err);
			});
			$scope.filter = function() {
				if ($scope.pesquisa.termo.length > 2) {
					$scope.visao.cega = "hide";
					$scope.visao.receitas = "";
				} else {
					$scope.visao.cega = "";
					$scope.visao.receitas = "hide";
				}
				$analytcs.event("Pesquisa", "Procurou por", $scope.pesquisa.termo, 1);
				console.log("pesquisa ", $scope.pesquisa.termo);
				for (i = 0;
					(i < $scope.geladeira.length); i++) {
					if ($scope.geladeira[i].nome.toLowerCase().indexOf($scope.pesquisa.termo.toLowerCase()) > -1 || $scope.pesquisa.termo == "")
						$scope.geladeira[i].filter = "";
					else
						$scope.geladeira[i].filter = "hide";
				}
			}
		})
	})
	.controller('EnvieCtrl', function($scope) {});