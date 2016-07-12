appControllers.controller('EnquiryListCtrl', [
    '$scope',
    '$stateParams',
    '$state',
    'ApiService',
    function(
        $scope,
        $stateParams,
        $state,
        ApiService) {
        $scope.Impr1 = {};
        $scope.Impm1 = {};
        $scope.refreshImpr1 = function( ProductCode ) {
            if(is.not.undefined(ProductCode) && is.not.empty(ProductCode)){
                var objUri = ApiService.Uri('/api/wms/impr1');
                objUri.addSearch('ProductCode',ProductCode);
                ApiService.Get( objUri, false ).then( function success( result ) {
                    $scope.Impr1s = result.data.results;
                } );
            }
        };
        $scope.refreshImpm1s = function ( UserDefine1 ) {
            if ( is.not.undefined( UserDefine1 ) && is.not.empty( UserDefine1 ) ) {
                var objUri = ApiService.Uri( '/api/wms/impm1' );
                objUri.addSearch( 'UserDefine1', UserDefine1 );
                ApiService.Get( objUri, false ).then( function success( result ) {
                    $scope.Impm1s = result.data.results;
                } );
            }
        };
        $scope.showDate = function(utc) {
            return moment(utc).format('DD-MMM-YYYY');
        };
        $scope.returnMain = function() {
            $state.go('index.main', {}, {
                reload: true
            });
        };
    }
]);
