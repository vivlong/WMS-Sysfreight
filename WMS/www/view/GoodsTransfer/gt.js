appControllers.controller( 'GtListCtrl', [
    '$scope',
    '$stateParams',
    '$state',
    '$timeout',
    '$ionicPopup',
    '$ionicLoading',
    '$cordovaBarcodeScanner',
    'ApiService',
    'PopupService',
    function (
        $scope,
        $stateParams,
        $state,
        $timeout,
        $ionicPopup,
        $ionicLoading,
        $cordovaBarcodeScanner,
        ApiService,
        PopupService ) {
        var popup = null;
        var popupTitle = '';
        $scope.Whwh1 = {};
        $scope.Whwh2 = {};
        $scope.Impm1s = {};
        $scope.refreshWhwh1 = function ( WarehouseName ) {
            if ( is.not.undefined( WarehouseName ) && is.not.empty( WarehouseName ) ) {
                var objUri = ApiService.Uri( '/api/wms/whwh1' );
                objUri.addSearch( 'WarehouseName', WarehouseName );
                ApiService.Get( objUri, false ).then( function success( result ) {
                    $scope.Whwh1s = result.data.results;
                } );
            }
        };
        $scope.refreshWhwh2 = function ( StoreNo ) {
            if ( is.not.empty( $scope.Whwh1 ) && is.not.undefined( StoreNo ) && is.not.empty( StoreNo ) ) {
                var objUri = ApiService.Uri( '/api/wms/whwh2' );
                objUri.addSearch( 'WarehouseCode', $scope.Whwh1.selected.WarehouseCode );
                objUri.addSearch( 'StoreNo', StoreNo );
                ApiService.Get( objUri, false ).then( function success( result ) {
                    $scope.Whwh2s = result.data.results;
                } );
            }
        };
        $scope.showImpm1 = function ( StoreNo ) {
            if ( is.not.undefined( StoreNo ) && is.not.empty( StoreNo ) ) {
                var objUri = ApiService.Uri( '/api/wms/impm1/transfer' );
                objUri.addSearch( 'WarehouseCode', $scope.Whwh1.selected.WarehouseCode );
                objUri.addSearch( 'StoreNo', StoreNo );
                ApiService.Get( objUri, true ).then( function success( result ) {
                    $scope.Impm1s = result.data.results;
                } );
            } else {
                $scope.clear();
            }
        };
        $scope.showDate = function ( utc ) {
            return moment( utc ).format( 'DD-MMM-YYYY' );
        };
        /*
        $scope.GoToDetail = function( Imgr1 ) {
            if ( Imgr1 != null ) {
                $state.go( 'putawayDetail', {
                    'CustomerCode': Imgr1.CustomerCode,
                    'TrxNo': Imgr1.TrxNo,
                    'GoodsReceiptNoteNo': Imgr1.GoodsReceiptNoteNo
                }, {
                    reload: true
                } );
            }
        };
        */
        $scope.returnMain = function () {
            $state.go( 'index.main', {}, {
                reload: true
            } );
        };
        $scope.clear = function () {
            $scope.Imgr1s = {};
            $scope.Imgr2s = {};
        };
        $scope.openCam = function ( imgr2 ) {
            $cordovaBarcodeScanner.scan().then( function ( imageData ) {
                $scope.Imgr2s[ imgr2.LineItemNo - 1 ].StoreNo = imageData.text;
                $( '#txt-storeno-' + imgr2.LineItemNo ).select();
            }, function ( error ) {
                $cordovaToast.showShortBottom( error );
            } );
        };
        $scope.clearInput = function ( type, imgr2 ) {
            if ( is.equal( type, 'qty' ) ) {
                $scope.Imgr2s[ imgr2.LineItemNo - 1 ].Qty = 0;
                $( '#txt-qty-' + imgr2.LineItemNo ).select();
            } else {
                $scope.Imgr2s[ imgr2.LineItemNo - 1 ].NewStoreNo = '';
                $( '#txt-storeno-' + imgr2.LineItemNo ).select();
            }
        };
        $scope.checkQty = function ( imgr2 ) {
            if ( imgr2.Qty < 0 ) {
                $scope.Imgr2s[ imgr2.LineItemNo - 1 ].Qty = 0;
            } else {
                if ( imgr2.Balance - imgr2.Qty < 0 ) {
                    $scope.Imgr2s[ imgr2.LineItemNo - 1 ].Qty = $scope.Imgr2s[ imgr2.LineItemNo - 1 ].Balance;
                }
            }
        };
        $scope.checkConfirm = function () {
            var blnConfirm = false;
            for ( var i = 0; i < $scope.Imgr2s.length; i++ ) {
                if ( $scope.Imgr2s[ i ].Qty > 0 && is.not.empty( $scope.Imgr2s[ i ].NewStoreNo ) ) {
                    blnConfirm = true;
                    break;
                }
            }
            if ( blnConfirm ) {
                var objUri = ApiService.Uri( '/api/wms/imit1/create' );
                objUri.addSearch( 'UserID', sessionStorage.getItem( 'UserId' ).toString() );
                ApiService.Get( objUri, false ).then( function success( result ) {
                    var imit1 = result.data.results[ 0 ];
                    var len = $scope.Imgr2s.length;
                    if ( imit1.TrxNo > 0 && len > 0 ) {
                        $ionicLoading.show();
                        var LineItemNo = 0;
                        for ( var i = 0; i < len; i++ ) {
                            var imgr2 = {
                                TrxNo: $scope.Imgr2s[ i ].TrxNo,
                                LineItemNo: $scope.Imgr2s[ i ].LineItemNo,
                                Qty: $scope.Imgr2s[ i ].Qty,
                                NewStoreNo: $scope.Imgr2s[ i ].NewStoreNo
                            };
                            if ( imgr2.Qty > 0 && is.not.empty( imgr2.NewStoreNo ) ) {
                                LineItemNo = LineItemNo + 1;
                                var objUri = ApiService.Uri( '/api/wms/imit2/create' );
                                objUri.addSearch( 'TrxNo', imit1.TrxNo );
                                objUri.addSearch( 'LineItemNo', LineItemNo );
                                objUri.addSearch( 'Imgr2TrxNo', imgr2.TrxNo );
                                objUri.addSearch( 'Imgr2LineItemNo', imgr2.LineItemNo );
                                objUri.addSearch( 'NewStoreNo', imgr2.NewStoreNo );
                                objUri.addSearch( 'Qty', imgr2.Qty );
                                objUri.addSearch( 'UpdateBy', sessionStorage.getItem( 'UserId' ).toString() );
                                ApiService.Get( objUri, false ).then( function success( result ) {} );
                            }
                        }
                        $ionicLoading.hide();
                        var objUri = '/api/wms/imit1/confirm?TrxNo=' + imit1.TrxNo + '&UpdateBy=' + sessionStorage.getItem( 'UserId' ).toString();
                        ApiService.Get( objUri, false ).then( function success( result ) {
                            PopupService.Info( popup, 'Comfirm Success' ).then( function () {
                                $scope.clear();
                                $scope.returnMain();
                            } );
                        }, function error() {
                            PopupService.Alert( popup, 'Comfirm Failed' ).then();
                        } );
                    }
                } );
            } else {
                PopupService.Alert( popup, 'No Product Transfered' ).then();
            }
        };
    } ] );

appControllers.controller( 'GtFromCtrl', [ '$scope', '$stateParams', '$state', '$http', '$timeout', '$ionicHistory', '$ionicLoading', '$ionicPopup', '$ionicModal', '$cordovaToast', '$cordovaBarcodeScanner', 'ApiService',
    function ( $scope, $stateParams, $state, $http, $timeout, $ionicHistory, $ionicLoading, $ionicPopup, $ionicModal, $cordovaToast, $cordovaBarcodeScanner, ApiService ) {
        var popup = null;
        var popupTitle = '';
        var hmImgr2 = new HashMap();
        var hmImsn1 = new HashMap();
        var arrStoreNo = null;
        var arrBarCode = null;
        $scope.Detail = {
            Scan: {
                Qty: 0,
                BarCode: '',
                SerialNo: '',
                StoreNo: ''
            },
            Imgr2: {},
            Imgr2s: {},
            Imgr2sDb: {},
            Whwh2s: {}
        };
        $ionicModal.fromTemplateUrl( 'scan.html', {
            scope: $scope,
            animation: 'slide-in-up'
        } ).then( function ( modal ) {
            $scope.modal = modal;
        } );
        $scope.$on( '$destroy', function () {
            $scope.modal.remove();
        } );
        var showPopup = function ( title, type ) {
            if ( popup === null ) {
                popup = $ionicPopup.alert( {
                    title: title,
                    okType: 'button-' + type
                } );
            } else {
                popup.close();
                popup = null;
            }
        };
        var setScanQty = function ( barcode, imgr2 ) {
            if ( imgr2.SerialNoFlag != null && imgr2.SerialNoFlag === 'Y' ) {
                $scope.Detail.Scan.Qty = imgr2.ScanQtyFrom;
                $( '#txt-sn-from' ).removeAttr( 'readonly' );
                $( '#txt-sn-from' ).select();
            } else {
                imgr2.ScanQtyFrom += 1;
                hmImgr2.remove( barcode );
                hmImgr2.set( barcode, imgr2 );
                $scope.Detail.Scan.Qty = imgr2.ScanQtyFrom;
                $scope.Detail.Scan.BarCode = '';
                db_update_Imgr2_Transfer( imgr2, 'from' );
            }
        };
        var getImpr = function ( barcode, imgr2 ) {
            if ( is.undefined( imgr2 ) ) {
                var keys = barcode.split( '-' );
                if ( keys.length > 1 && is.not.empty( keys[ 1 ] ) ) {
                    var strUri = '/api/wms/imgr2/transfer?TrxNo=' + keys[ 0 ] + '&LineItemNo=' + keys[ 1 ];
                    ApiService.Get( strUri, true ).then( function success( result ) {
                        $scope.Detail.Imgr2 = result.data.results[ 0 ];
                        if ( is.not.undefined( $scope.Detail.Imgr2 ) ) {
                            var imgr2 = {
                                BarCode: barcode,
                                ProductCode: $scope.Detail.Imgr2.ProductCode,
                                ProductDescription: $scope.Detail.Imgr2.ProductDescription,
                                ProductTrxNo: $scope.Detail.Imgr2.ProductTrxNo,
                                SerialNoFlag: $scope.Detail.Imgr2.SerialNoFlag,
                                StoreNo: $scope.Detail.Imgr2.StoreNo,
                                StoreNoFrom: $scope.Detail.Scan.StoreNo,
                                StoreNoTo: '',
                                TrxNo: keys[ 0 ],
                                LineItemNo: keys[ 1 ],
                                ScanQtyFrom: 0
                            };
                            hmImgr2.set( barcode, imgr2 );
                            db_add_Imgr2_Transfer( imgr2 );
                            setScanQty( barcode, imgr2 );
                        } else {
                            $scope.Detail.Imgr2 = {};
                            $scope.Detail.Scan.Qty = 0;
                            showPopup( 'Wrong Internal BarCode', 'assertive' );
                        }
                    }, function error() {
                        $scope.Detail.Imgr2 = {};
                        $scope.Detail.Scan.Qty = 0;
                        showPopup( 'Wrong Internal BarCode', 'assertive' );
                    } );
                } else {
                    showPopup( 'Wrong Internal BarCode', 'assertive' );
                }
            } else {
                $scope.Detail.Imgr2.ProductCode = imgr2.ProductCode;
                $scope.Detail.Imgr2.ProductDescription = imgr2.ProductDescription;
                setScanQty( barcode, imgr2 );
            }
        }
        var showImpr = function ( barcode ) {
            if ( hmImgr2.has( barcode ) ) {
                var imgr2 = hmImgr2.get( barcode );
                getImpr( barcode, imgr2 );
            } else {
                getImpr( barcode );
            }
            $scope.$apply();
        };
        var checkSn = function ( sn, SnArray ) {
            var blnExistSn = false;
            for ( var i = 0; i < SnArray.length; i++ ) {
                if ( SnArray[ i ].toString() === sn ) {
                    blnExistSn = true;
                    break;
                }
            }
            return blnExistSn;
        };
        var setSnQty = function ( sn, SnArray, mapValue ) {
            if ( SnArray.length > 1 ) {
                if ( checkSn( sn, SnArray ) ) {
                    return;
                }
            }
            SnArray.push( sn );
            hmImsn1.remove( $scope.Detail.Scan.BarCode );
            hmImsn1.set( $scope.Detail.Scan.BarCode, SnArray );
            mapValue.ScanQty += 1;
            hmImgr2.remove( $scope.Detail.Scan.BarCode );
            hmImgr2.set( $scope.Detail.Scan.BarCode, mapValue );
            $scope.Detail.Scan.Qty = mapValue.ScanQty;
            $scope.$apply();
            //if ( dbWms ) {
            //    dbWms.transaction( function( tx ) {
            //        dbSql = 'INSERT INTO Imsn1 (ReceiptNoteNo, ReceiptLineItemNo, SerialNo) values(?, ?, ?)';
            //        tx.executeSql( dbSql, [ $scope.Detail.GRN, mapValue.LineItemNo, sn ], null, null );
            //        dbSql = 'Update Imgr2_Transfer set ScanQty=? Where TrxNo=? and LineItemNo=?';
            //        tx.executeSql( dbSql, [ mapValue.ScanQty, mapValue.TrxNo, mapValue.LineItemNo ], null, dbError );
            //    } );
            //}
            $( '#txt-sn' ).select();
        };
        var ShowSn = function ( sn, blnScan ) {
            if ( sn != null && sn > 0 ) {
                if ( blnScan ) {
                    $scope.Detail.Scan.SerialNo = sn;
                }
                var mapBcValue = hmImgr2.get( $scope.Detail.Scan.BarCode );
                var SnArray = null;
                if ( hmImsn1.count() > 0 ) {
                    if ( hmImsn1.has( $scope.Detail.Scan.BarCode ) ) {
                        SnArray = hmImsn1.get( $scope.Detail.Scan.BarCode );
                    } else {
                        SnArray = new Array();
                        SnArray.push( sn );
                        hmImsn1.set( $scope.Detail.Scan.BarCode, SnArray );
                    }
                } else {
                    SnArray = new Array();
                    SnArray.push( sn );
                    hmImsn1.set( $scope.Detail.Scan.BarCode, SnArray );
                }
                setSnQty( sn, SnArray, mapBcValue );
            }
        };
        $scope.openCam = function ( type ) {
            if ( is.equal( type, 'StoreNo' ) ) {
                $cordovaBarcodeScanner.scan().then( function ( imageData ) {
                    $scope.Detail.Scan.StoreNo = imageData.text;
                    $( '#txt-barcode' ).focus();
                }, function ( error ) {
                    $cordovaToast.showShortBottom( error );
                } );
            } else if ( is.equal( type, 'BarCode' ) ) {
                $cordovaBarcodeScanner.scan().then( function ( imageData ) {
                    $scope.Detail.Scan.BarCode = imageData.text;
                    ShowProduct( $scope.Detail.Scan.BarCode, true );
                }, function ( error ) {
                    $cordovaToast.showShortBottom( error );
                } );
            } else if ( is.equal( type, 'SerialNo' ) ) {
                if ( $( '#txt-sn' ).attr( 'readonly' ) != 'readonly' ) {
                    $cordovaBarcodeScanner.scan().then( function ( imageData ) {
                        $scope.Detail.Scan.SerialNo = imageData.text;
                        ShowSn( $scope.Detail.Scan.SerialNo, false );
                    }, function ( error ) {
                        $cordovaToast.showShortBottom( error );
                    } );
                }
            }
        };
        $scope.openModal = function () {
            $scope.modal.show();
            $ionicLoading.show();
            db_query_Imgr2_Transfer( function ( results ) {
                $scope.Detail.Imgr2sDb = results;
                $ionicLoading.hide();
            } );
        };
        $scope.closeModal = function () {
            $scope.Detail.Imgr2sDb = {};
            $scope.modal.hide();
        };
        $scope.returnMain = function () {
            $state.go( 'index.main', {}, {
                reload: true
            } );
        };
        $scope.clearInput = function ( type ) {
            if ( is.equal( type, 'StoreNo' ) ) {
                $scope.Detail.Scan.StoreNo = '';
                $( '#txt-storeno-from' ).select();
            } else if ( is.equal( type, 'BarCode' ) ) {
                $scope.Detail.Scan.BarCode = '';
                $scope.Detail.Scan.SerialNo = '';
                $scope.Detail.Scan.Qty = 0;
                $scope.Detail.Imgr2 = {};
                $( '#txt-sn-from' ).attr( 'readonly', true );
                $( '#txt-barcode-from' ).select();
            } else if ( is.equal( type, 'SerialNo' ) ) {
                $scope.Detail.Scan.SerialNo = '';
                $( '#txt-sn-from' ).select();
            }
        };
        $scope.changeQty = function () {
            if ( is.not.empty( $scope.Detail.Scan.BarCode ) ) {
                if ( hmImgr2.count() > 0 && hmImgr2.has( $scope.Detail.Scan.BarCode ) ) {
                    var imgr2 = hmImgr2.get( $scope.Detail.Scan.BarCode );
                    var promptPopup = $ionicPopup.show( {
                        template: '<input type="number" ng-model="Detail.Scan.Qty">',
                        title: 'Enter Qty',
                        subTitle: 'Are you sure to change Qty manually?',
                        scope: $scope,
                        buttons: [ {
                            text: 'Cancel'
                        }, {
                            text: '<b>Save</b>',
                            type: 'button-positive',
                            onTap: function ( e ) {
                                imgr2.ScanQty = $scope.Detail.Scan.Qty;
                                db_update_Imgr2_Transfer( imgr2, 'from' );
                            }
                        } ]
                    } );
                }
            }
        };
        $scope.gotoTransferTo = function () {
            $state.go( 'gtTo', {}, {
                reload: true
            } );
        }
        db_del_Imgr2_Transfer();
        $( '#txt-storeno-from' ).on( 'keydown', function ( e ) {
            if ( e.which === 9 || e.which === 13 ) {
                if ( popup === null ) {
                    $( '#txt-barcode' ).focus();
                } else {
                    popup.close();
                    popup = null;
                }
            }
        } );
        $( '#txt-barcode-from' ).on( 'keydown', function ( e ) {
            if ( e.which === 9 || e.which === 13 ) {
                if ( popup === null ) {
                    showImpr( $scope.Detail.Scan.BarCode );
                } else {
                    popup.close();
                    popup = null;
                }
            }
        } );
        $( '#txt-sn-from' ).on( 'keydown', function ( e ) {
            if ( e.which === 9 || e.which === 13 ) {
                if ( popup === null ) {
                    ShowSn( $scope.Detail.Scan.SerialNo, false );
                } else {
                    popup.close();
                    popup = null;
                }
            }
        } );
    } ] );

appControllers.controller( 'GtToCtrl', [ '$scope', '$stateParams', '$state', '$http', '$timeout', '$ionicHistory', '$ionicLoading', '$ionicPopup', '$ionicModal', '$cordovaToast', '$cordovaBarcodeScanner', 'ApiService',
    function ( $scope, $stateParams, $state, $http, $timeout, $ionicHistory, $ionicLoading, $ionicPopup, $ionicModal, $cordovaToast, $cordovaBarcodeScanner, ApiService ) {
        var popup = null;
        var popupTitle = '';
        var hmImgr2 = new HashMap();
        var hmImsn1 = new HashMap();
        var arrStoreNo = null;
        var arrBarCode = null;
        $scope.Detail = {
            Scan: {
                Qty: 0,
                BarCode: '',
                SerialNo: '',
                StoreNo: ''
            },
            Imgr2: {},
            Imgr2s: {},
            Imgr2sDb: {},
            Whwh2s: {}
        };
        $ionicModal.fromTemplateUrl( 'scan.html', {
            scope: $scope,
            animation: 'slide-in-up'
        } ).then( function ( modal ) {
            $scope.modal = modal;
        } );
        $scope.$on( '$destroy', function () {
            $scope.modal.remove();
        } );
        var showPopup = function ( title, type, callback ) {
            if ( popup === null ) {
                popup = $ionicPopup.alert( {
                    title: title,
                    okType: 'button-' + type
                } );
                if ( typeof ( callback ) == 'function' ) callback( popup );
            } else {
                popup.close();
                popup = null;
            }
        };
        var setScanQty = function ( barcode, imgr2 ) {
            if ( imgr2.SerialNoFlag != null && imgr2.SerialNoFlag === 'Y' ) {
                $scope.Detail.Scan.Qty = imgr2.ScanQtyTo;
                $( '#txt-sn-to' ).removeAttr( 'readonly' );
                $( '#txt-sn-to' ).select();
            } else {
                imgr2.ScanQtyTo += 1;
                imgr2.StoreNoTo = $scope.Detail.Scan.StoreNo;
                hmImgr2.remove( barcode );
                hmImgr2.set( barcode, imgr2 );
                $scope.Detail.Scan.Qty = imgr2.ScanQtyTo;
                db_update_Imgr2_Transfer( imgr2, 'to' );
            }
        };
        var getImpr = function ( barcode, imgr2 ) {
            $scope.Detail.Imgr2.ProductCode = imgr2.ProductCode;
            $scope.Detail.Imgr2.ProductDescription = imgr2.ProductDescription;
            setScanQty( barcode, imgr2 );
        }
        var showImpr = function ( barcode ) {
            if ( hmImgr2.has( barcode ) ) {
                var imgr2 = hmImgr2.get( barcode );
                getImpr( barcode, imgr2 );
            } else {
                showPopup( 'Wrong Internal BarCode', 'assertive' );
            }
            $scope.$apply();
        };
        var checkSn = function ( sn, SnArray ) {
            var blnExistSn = false;
            for ( var i = 0; i < SnArray.length; i++ ) {
                if ( SnArray[ i ].toString() === sn ) {
                    blnExistSn = true;
                    break;
                }
            }
            return blnExistSn;
        };
        var setSnQty = function ( sn, SnArray, mapValue ) {
            if ( SnArray.length > 1 ) {
                if ( checkSn( sn, SnArray ) ) {
                    return;
                }
            }
            SnArray.push( sn );
            hmImsn1.remove( $scope.Detail.Scan.BarCode );
            hmImsn1.set( $scope.Detail.Scan.BarCode, SnArray );
            mapValue.ScanQty += 1;
            hmImgr2.remove( $scope.Detail.Scan.BarCode );
            hmImgr2.set( $scope.Detail.Scan.BarCode, mapValue );
            $scope.Detail.Scan.Qty = mapValue.ScanQty;
            $scope.$apply();
            //if ( dbWms ) {
            //    dbWms.transaction( function( tx ) {
            //        dbSql = 'INSERT INTO Imsn1 (ReceiptNoteNo, ReceiptLineItemNo, SerialNo) values(?, ?, ?)';
            //        tx.executeSql( dbSql, [ $scope.Detail.GRN, mapValue.LineItemNo, sn ], null, null );
            //        dbSql = 'Update Imgr2_Transfer set ScanQty=? Where TrxNo=? and LineItemNo=?';
            //        tx.executeSql( dbSql, [ mapValue.ScanQty, mapValue.TrxNo, mapValue.LineItemNo ], null, dbError );
            //    } );
            //}
            $( '#txt-sn' ).select();
        };
        var ShowSn = function ( sn, blnScan ) {
            if ( sn != null && sn > 0 ) {
                if ( blnScan ) {
                    $scope.Detail.Scan.SerialNo = sn;
                }
                var mapBcValue = hmImgr2.get( $scope.Detail.Scan.BarCode );
                var SnArray = null;
                if ( hmImsn1.count() > 0 ) {
                    if ( hmImsn1.has( $scope.Detail.Scan.BarCode ) ) {
                        SnArray = hmImsn1.get( $scope.Detail.Scan.BarCode );
                    } else {
                        SnArray = new Array();
                        SnArray.push( sn );
                        hmImsn1.set( $scope.Detail.Scan.BarCode, SnArray );
                    }
                } else {
                    SnArray = new Array();
                    SnArray.push( sn );
                    hmImsn1.set( $scope.Detail.Scan.BarCode, SnArray );
                }
                setSnQty( sn, SnArray, mapBcValue );
            }
        };
        var initImgr2 = function () {
            db_query_Imgr2_Transfer( function ( results ) {
                var imgr2s = results;
                if ( is.array( imgr2s ) && is.not.empty( imgr2s ) ) {
                    for ( var imgr2 in imgr2s ) {
                        hmImgr2.set( imgr2.BarCode, imgr2 );
                    }
                }
            } );
        };
        var confirm = function ( imgr2s ) {
            if ( is.array( imgr2s ) && is.not.empty( imgr2s ) ) {
                var strUri = '/api/wms/imit1/create?UserID=' + sessionStorage.getItem( 'UserId' ).toString();
                ApiService.Get( strUri, false ).then( function success( result ) {
                    var imit1 = result.data.results;
                    var len = imgr2s.count;
                    if ( len > 0 ) {
                        $ionicLoading.show();
                        for ( var i = 0; i < len; i++ ) {
                            var strUri = '/api/wms/imit2/create?TrxNo=' + imit1.TrxNo + '&LineItemNo=' + results.rows.item( i ).LineItemNo + ' &NewStoreNo=' + results.rows.item( i ).StoreNoTo + ' &Qty=' + results.rows.item( i ).ScanQtyTo + ' &UpdateBy=' + sessionStorage.getItem( 'UserId' ).toString();
                            ApiService.Get( strUri, false ).then( function success( result ) {

                            } );
                        }
                        $ionicLoading.hide();
                        var strUri = '/api/wms/imit1/confirm?TrxNo=' + imit1.TrxNo + '&UpdateBy=' + sessionStorage.getItem( 'UserId' ).toString();
                        ApiService.Get( strUri, false ).then( function success( result ) {
                            showPopup( 'Comfirm success', 'calm', function ( popup ) {
                                $timeout( function () {
                                    popup.close();
                                    $scope.returnMain();
                                }, 2500 );
                            } );
                        }, function error() {
                            showPopup( 'Comfirm failed', 'assertive' );
                        } );
                    }
                } );
            }
        };
        $scope.returnMain = function () {
            $state.go( 'index.main', {}, {
                reload: true
            } );
        };
        $scope.openCam = function ( type ) {
            if ( is.equal( type, 'StoreNo' ) ) {
                $cordovaBarcodeScanner.scan().then( function ( imageData ) {
                    $scope.Detail.Scan.StoreNo = imageData.text;
                    $( '#txt-barcode' ).focus();
                }, function ( error ) {
                    $cordovaToast.showShortBottom( error );
                } );
            } else if ( is.equal( type, 'BarCode' ) ) {
                $cordovaBarcodeScanner.scan().then( function ( imageData ) {
                    $scope.Detail.Scan.BarCode = imageData.text;
                    ShowProduct( $scope.Detail.Scan.BarCode, true );
                }, function ( error ) {
                    $cordovaToast.showShortBottom( error );
                } );
            } else if ( is.equal( type, 'SerialNo' ) ) {
                if ( $( '#txt-sn' ).attr( 'readonly' ) != 'readonly' ) {
                    $cordovaBarcodeScanner.scan().then( function ( imageData ) {
                        $scope.Detail.Scan.SerialNo = imageData.text;
                        ShowSn( $scope.Detail.Scan.SerialNo, false );
                    }, function ( error ) {
                        $cordovaToast.showShortBottom( error );
                    } );
                }
            }
        };
        $scope.openModal = function () {
            $scope.modal.show();
            $ionicLoading.show();
            db_query_Imgr2_Transfer( function ( results ) {
                $scope.Detail.Imgr2sDb = results;
                $ionicLoading.hide();
            } );
        };
        $scope.closeModal = function () {
            $scope.Detail.Imgr2sDb = {};
            $scope.modal.hide();
        };
        $scope.clearInput = function ( type ) {
            if ( is.equal( type, 'StoreNo' ) ) {
                $scope.Detail.Scan.StoreNo = '';
                $( '#txt-storeno-to' ).select();
            } else if ( is.equal( type, 'BarCode' ) ) {
                $scope.Detail.Scan.BarCode = '';
                $scope.Detail.Scan.SerialNo = '';
                $scope.Detail.Scan.Qty = 0;
                $scope.Detail.Imgr2 = {};
                $( '#txt-sn-to' ).attr( 'readonly', true );
                $( '#txt-barcode-to' ).select();
            } else if ( is.equal( type, 'SerialNo' ) ) {
                $scope.Detail.Scan.SerialNo = '';
                $( '#txt-sn-to' ).select();
            }
        };
        $scope.changeQty = function () {
            if ( $scope.Detail.Scan.BarCode.length > 0 ) {
                if ( hmImgr2.count() > 0 && hmImgr2.has( $scope.Detail.Scan.BarCode ) ) {
                    var imgr2 = hmImgr2.get( $scope.Detail.Scan.BarCode );
                    var promptPopup = $ionicPopup.show( {
                        template: '<input type="number" ng-model="Detail.Scan.Qty">',
                        title: 'Enter Qty',
                        subTitle: 'Are you sure to change Qty manually?',
                        scope: $scope,
                        buttons: [ {
                            text: 'Cancel'
                        }, {
                            text: '<b>Save</b>',
                            type: 'button-positive',
                            onTap: function ( e ) {
                                imgr2.ScanQty = $scope.Detail.Scan.Qty;
                                db_update_Imgr2_Transfer( imgr2, 'to' );
                            }
                        } ]
                    } );
                }
            }
        };
        $scope.checkConfirm = function () {
            $ionicLoading.show();
            db_query_Imgr2_Transfer( function ( results ) {
                var imgr2s = results;
                if ( is.array( imgr2s ) && is.not.empty( imgr2s ) ) {
                    var blnDiscrepancies = false;
                    var len = imgr2s.count;
                    for ( var i = 0; i < len; i++ ) {
                        if ( imgr2s[ i ].ScanQtyFrom != imgr2s[ i ].ScanQtyTo ) {
                            console.log( 'Product (' + imgr2s[ i ].ProductCode + ') Qty not equal.' );
                            blnDiscrepancies = true;
                            break;
                        }
                    }
                    $ionicLoading.hide();
                    if ( blnDiscrepancies ) {
                        var checkPopup = $ionicPopup.show( {
                            title: 'The following product has not yet transfer.',
                            buttons: [ {
                                text: 'Cancel',
                                onTap: function ( e ) {
                                    checkPopup.close();
                                }
                            }, {
                                text: '<b>Check</b>',
                                type: 'button-assertive',
                                onTap: function ( e ) {
                                    $timeout( function () {
                                        $scope.openModal();
                                    }, 250 );
                                    checkPopup.close();
                                }
                            } ]
                        } );
                    } else {
                        confirm( imgr2s );
                    }
                } else {
                    $ionicLoading.hide();
                    showPopup( 'No Product.', 'assertive' );
                }
            } );
        };
        $scope.gotoTransferFrom = function () {
            if ( $ionicHistory.backView() ) {
                $ionicHistory.goBack();
            } else {
                $state.go( 'gtFrom', {}, {
                    reload: true
                } );
            }
        }
        $( '#txt-storeno-to' ).on( 'keydown', function ( e ) {
            if ( e.which === 9 || e.which === 13 ) {
                if ( popup === null ) {
                    $( '#txt-barcode' ).focus();
                } else {
                    popup.close();
                    popup = null;
                }
            }
        } );
        $( '#txt-barcode-to' ).on( 'keydown', function ( e ) {
            if ( e.which === 9 || e.which === 13 ) {
                if ( popup === null ) {
                    showImpr( $scope.Detail.Scan.BarCode );
                } else {
                    popup.close();
                    popup = null;
                }
            }
        } );
        $( '#txt-sn-to' ).on( 'keydown', function ( e ) {
            if ( e.which === 9 || e.which === 13 ) {
                if ( popup === null ) {
                    ShowSn( $scope.Detail.Scan.SerialNo, false );
                } else {
                    popup.close();
                    popup = null;
                }
            }
        } );
        initImgr2();
    } ] );
