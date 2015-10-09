var app = angular.module('charlaApp');
console.log("Header File Running");

app.factory('httpRequestInterceptor', function () {
  console.log("Headers Initialized");
  return {
    request: function (config) {
      config.headers = {'X-Parse-Application-Id': 'XcXNt4VbL1lYb7oqOXjEmJi2nsraygAdFPneSiOl', 'X-Parse-REST-API-Key': 'nfpZ5Ywfu1TEgSFWJL14lmrVoLFFrK1j6spZLBci'}
      return config;
    }
  };
});
