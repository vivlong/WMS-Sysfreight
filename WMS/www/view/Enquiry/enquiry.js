appControllers.controller('EnquiryListCtrl', ['$scope', '$stateParams', '$state', 'ApiService',
    function($scope, $stateParams, $state, ApiService) {
        $scope.rcbp1 = {};
        $scope.GinNo = {};
        $scope.Imgi1s = {};
        $scope.refreshRcbp1 = function( BusinessPartyName ) {
            if(is.not.undefined(BusinessPartyName) && is.not.empty(BusinessPartyName)){
                var strUri = '/api/wms/rcbp1?BusinessPartyName=' + BusinessPartyName;
                ApiService.Get( strUri, false ).then( function success( result ) {
                    $scope.Rcbp1s = result.data.results;
                } );
            }
        };
        $scope.refreshGinNos = function(Grn) {
            if(is.not.undefined(Grn) && is.not.empty(Grn)){
                var strUri = '/api/wms/imgi1?GoodsIssueNoteNo=' + Grn;
                ApiService.Get(strUri, true).then(function success(result) {
                    $scope.GinNos = result.data.results;
                });
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
