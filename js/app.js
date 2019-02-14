(function(){
    
    //Create a module
    let app = angular.module('app', ['ui.router', 'istAuth']);


    //Config Block
    app.config(function($stateProvider, $urlRouterProvider) {
        //Configure the routes for the application
		$stateProvider
			.state('index', {
				url: '',
				templateUrl: './templates/index.html',
            })
            .state('feed', {
                url: '/feed',
                templateUrl: '/templates/feed.html',
                controller: 'feedCtrl'
            })
            .state('feedItem', {
                url: '/feed/:id',
                templateUrl: '/templates/feed-item.html',
                controller: 'feedItemCtrl'
            })
            .state('upload', {
                url: '/upload',
                templateUrl: '/templates/upload.html',
                controller: 'uploadCtrl'
            })
            .state('profile', {
                url: '/profile/:id',
                templateUrl: '/templates/profile.html',
                controller: 'profileCtrl'
            })
        
        //If the user requests a URL that isn't mapped to a route, redirect them to the homepage
        $urlRouterProvider.otherwise('index');
	});


    //Run Block
    app.run(function($rootScope, $auth, $state){
        //Globally available functions to toggle Bootstrap modals
        $rootScope.openModal = function(selector) {
            $(selector).modal('show');
        };

        $rootScope.closeModal = function(selector) {
            $(selector).modal('hide');
        };


        //Check to see if the user is already logged in. If not, redirect to the homepage
        var isLoggedIn = $auth.checkAuth();
        if(!isLoggedIn) {
            $state.go('index');
        }
        //If user is already logged in, set the $rootScope.user and $rootScope.token objects
        $auth.loginFromSaved();
    });


    //Controllers

    app.controller('feedCtrl', function($scope, $rootScope, $http){
        $scope.page_number = 1;
        $scope.posts = [];
        $scope.end_posts = false

        $http({
            url: 'http://35.211.151.55/api/media',
            method: 'GET',
            params: {
                token: $rootScope.token,
                count: 12,
                
            },
        }).then(function(response){
            console.log(response.data.data);
            
            $scope.data = response.data;
            $scope.posts = $scope.data.data;
            console.log($scope.posts);
        }, function(error){
            console.log(error)
        });

        $scope.loadPosts = function() {
            $http({
                url: 'http://35.211.151.55/api/media',
                method: 'GET',
                params: {
                    token: $rootScope.token,
                    count: 12,
                    page: $scope.page_number += 1
                    
                },
            }).then(function(response){
                console.log(response.data.data);
        
                $scope.data = response.data;
                $scope.more_posts = $scope.data.data;

                $scope.more_posts.push.apply($scope.posts, $scope.more_posts)
            }, function(error){
                console.log(error)
            });
        }
    });

       
    app.controller('feedItemCtrl', function($rootScope, $http, $scope, $stateParams){
        $scope.id = $stateParams.id;
        $scope.data = {};
        
        $http({
            url: 'http://35.211.151.55/api/media',
            method: 'GET',
            params: {
                token: $rootScope.token,
                count: 1,
                id: $stateParams.id,
            }  
        }).then(function(response){
            console.log(response);
    
            $scope.data = response.data.data[0];
        }, function(error){
                console.log(error)
            });
        
        });

    app.controller('uploadCtrl', function($window, $state) {
        let url = $window.location.href;

        if(url.includes('success=') && url.includes('id=')){
            let url_success = url.split('success=')[1].split('&')[0]
            let url_id = url.split('id=')[1].split('&')[0];

            $state.go('feedItem', {id: url_id});
        };
    });

    app.controller('profileCtrl', function($scope, $rootScope, $http, $stateParams){
        $scope.posts = [];

        $scope.id = $stateParams.id;

        $http({
            url: 'http://35.211.151.55/api/user',
            method: 'GET',
            params: {
                token: $rootScope.token,
                id: $stateParams.id, 
                
            },
        }).then(function(response){
            //console.log(response.data.data);
           
            $scope.profilePosts = response.data.data.media;
            $scope.username = response.data.data.media[0].user.username;
            $scope.avatar = response.data.data.media[0].user.avatar;
            console.log($scope.profilePosts);
            console.log($scope.username)
            console.log($scope.avatar)
            //console.log($scope.posts);
        }, function(error){
            //console.log(error)
        });
    });

    app.controller('mainCtrl', function ($scope, $auth, $rootScope) {
        $scope.username = null;
        $scope.password = null;
        $scope.login = function() {
            $auth.login($scope.username, $scope.password, function() {
                $rootScope.closeModal('#login_modal')
            })
        }
        $scope.logout = function() {
            $auth.logout()
        }
    });


    //Components
    app.component('mainHeader', {
        templateUrl: '/templates/main-header.html',
        controller: 'mainCtrl'
    })

    app.component('postPreview', {
        bindings: {
            post: '<'
        },
        templateUrl: '/templates/post-preview.html',
    })

    app.component('mainFooter', {
        templateUrl: '/templates/main-footer.html',
        controller: 'mainCtrl'
    })

    
})();