'use strict';
var appService = angular.module( 'WMSAPP.services', [
    'ionic',
    'ngCordova',
    'WMSAPP.config',
    'WMSAPP.factories'
] );

appService.service( 'ApiService', [ '$q', 'ENV', '$http', '$ionicLoading', '$ionicPopup', '$timeout',
    function ( $q, ENV, $http, $ionicLoading, $ionicPopup, $timeout ) {
        var parts = {},
            folder = '';
        this.Init = function () {
            var url = ENV.api;
            var urls = url.split( '/' );
            parts = {
                protocol: null,
                username: null,
                password: null,
                hostname: urls[ 0 ],
                port: ENV.port,
                path: url.replace( urls[ 0 ], '' ),
                query: null,
                fragment: null
            };
            if ( ENV.ssl ) {
                parts.protocol = 'https';
            } else {
                parts.protocol = 'http';
            }
            folder = parts.path;
        };
        this.Uri = function ( path ) {
            parts.path = folder + path;
            return new URI( URI.build( parts ) );
        };
        this.Post = function ( uri, requestData, blnShowLoad, popup ) {
            if ( blnShowLoad ) {
                $ionicLoading.show();
            }
            var deferred = $q.defer();
            //var strSignature = hex_md5( uri + ENV.appId.replace( /-/ig, "" ) );
            if(is.object(uri)){
                var url = uri.addSearch( 'format', 'json' ).normalizeProtocol().normalizeHostname().normalizePort().normalizeSearch().toString();
                console.log( url );
                var config = {
                    'Content-Type': 'application/x-www-form-urlencoded'
                };
                $http.post( url, requestData, config ).success( function ( result, status, headers, config, statusText ) {
                    if ( blnShowLoad ) {
                        $ionicLoading.hide();
                    }
                    if ( is.equal( result.meta.errors.code, 0 ) || is.equal( result.meta.errors.code, 200 ) ) {
                        deferred.resolve( result );
                    } else {
                        deferred.reject( result );
                        if(popup){
                            popup = $ionicPopup.alert( {
                                title: result.meta.message,
                                subTitle: result.meta.errors.message,
                                okType: 'button-assertive'
                            } );
                        }
                    }
                } ).error( function ( result, status, headers, config, statusText ) {
                    if ( blnShowLoad ) {
                        $ionicLoading.hide();
                    }
                    deferred.reject( result );
                    console.error( result );
                } );
            } else {
                deferred.reject( null );
                console.error( 'uri is not an object' );
            }
            return deferred.promise;
        };
        this.Get = function ( uri, blnShowLoad, popup ) {
            if ( blnShowLoad ) {
                $ionicLoading.show();
            }
            var deferred = $q.defer();
            if(is.object(uri)){
                var url = uri.addSearch( 'format', 'json' ).normalizeProtocol().normalizeHostname().normalizePort().normalizeSearch().toString();
                console.log( url );
                $http( {
                    method: 'GET',
                    url: url
                } ).then( function ( response ) {
                    if ( blnShowLoad ) {
                        $ionicLoading.hide();
                    }
                    var result = response.data;
                    if ( is.equal( result.meta.errors.code, 0 ) || is.equal( result.meta.errors.code, 200 ) ) {
                        deferred.resolve( result );
                    } else {
                        deferred.reject( result );
                        if(popup){
                            popup = $ionicPopup.alert( {
                                title: result.meta.message,
                                subTitle: result.meta.errors.message,
                                okType: 'button-assertive'
                            } );
                        }
                    }
                }, function ( response ) {
                    if ( blnShowLoad ) {
                        $ionicLoading.hide();
                    }
                    deferred.reject( response.data );
                    console.log( response.status );
                    if(popup){
                        popup = $ionicPopup.alert( {
                            title: response.data || 'Request failed',
                            okType: 'button-assertive'
                        } );
                    }
                } )
            } else {
                deferred.reject( null );
                console.error( 'uri is not an object' );
            }
            return deferred.promise;
        };
    }
] );

appService.service( 'SqlService', [ '$q', 'ENV', '$timeout', '$ionicLoading', '$cordovaSQLite', '$cordovaToast', 'TABLE_DB',
    function ( $q, ENV, $timeout, $ionicLoading, $cordovaSQLite, $cordovaToast, TABLE_DB ) {
        var db_websql,db_sqlite;
        this.Init = function ( ) {
            var deferred = $q.defer();
            if ( ENV.fromWeb ) {
                var db_websql_info = {
                    Name: 'WmsDB',
                    Version: '1.0',
                    DisplayName: 'WMS Database',
                    EstimatedSize: 10 * 11024 * 1024
                };
                db_websql = window.openDatabase(
                    db_websql_info.Name,
                    db_websql_info.Version,
                    db_websql_info.DisplayName,
                    db_websql_info.EstimatedSize
                );
                if( db_websql ) {
                    deferred.resolve( db_websql );
                    this.Reset();
                }else {
                    deferred.reject( null );
                    console.error( 'Unable initialize WebSql' );
                }
            } else {
                try {
                    db_sqlite = $cordovaSQLite.openDB( {
                        name: 'AppWms.db',
                        location: 'default'
                    } );
                    deferred.resolve( db_sqlite );
                    this.Reset();
                } catch ( error ) {
                    deferred.reject( error );
                    console.error( error );
                }
            }
        }
        this.Reset = function () {
            var cur = this;
            cur.Drop('Imgr2_Receipt').then(function(res){
                cur.Create('Imgr2_Receipt', TABLE_DB.Imgr2_Receipt).then(function(res){

                });
            });
            cur.Drop('Imgr2_Putaway').then(function(res){
                cur.Create('Imgr2_Putaway', TABLE_DB.Imgr2_Putaway).then(function(res){

                });
            });
            cur.Drop('Imgr2_Transfer').then(function(res){
                cur.Create('Imgr2_Transfer', TABLE_DB.Imgr2_Transfer).then(function(res){

                });
            });
            cur.Drop('Imgi2_Picking').then(function(res){
                cur.Create('Imgi2_Picking', TABLE_DB.Imgi2_Picking).then(function(res){

                });
            });
            cur.Drop('Imgi2_Verify').then(function(res){
                cur.Create('Imgi2_Verify', TABLE_DB.Imgi2_Verify).then(function(res){

                });
            });
        }
        this.Drop = function ( table ) {
            var deferred = $q.defer();
            var strSql = 'Drop Table If Exists ' + table;
            if ( ENV.fromWeb ) {
                if ( db_websql ) {
                    db_websql.transaction( function ( tx ) {
                        tx.executeSql( strSql, [], function ( tx, results ) {
                            deferred.resolve( results );
                        }, function ( tx, error ) {
                            deferred.reject( error );
                            console.error( error );
                            $cordovaToast.showShortBottom( error.message );
                        } );
                    } );
                } else {
                    deferred.reject( null );
                    console.error( 'No WebSql Instance' );
                    $cordovaToast.showShortBottom( 'No WebSql Instance' );
                }
            } else {
                $cordovaSQLite.execute( db_sqlite, strSql )
                    .then( function ( results ) {
                            deferred.resolve( results );
                        },
                        function ( error ) {
                            deferred.reject( error );
                            console.error( error );
                            $cordovaToast.showShortBottom( error );
                        }
                    );
            }
            return deferred.promise;
        };
        this.Create = function ( table, obj ) {
            var deferred = $q.defer();
            var strSql = 'Create Table ' + table;
            if(is.not.empty(obj)){
                var fileds = '';
                for ( var key in obj ) {
                    if ( obj.hasOwnProperty( key )) {
                        if(is.empty(fileds)){
                            fileds = key + ' ' + obj[ key ];
                        }else{
                            fileds = fileds + ',' + key + ' ' + obj[ key ];
                        }
                    }
                }
                strSql = strSql + '(' + fileds + ')';
                if ( ENV.fromWeb ) {
                    if ( db_websql ) {
                        db_websql.transaction( function ( tx ) {
                            tx.executeSql( strSql, [], function ( tx, results ) {
                                deferred.resolve( results );
                            }, function ( tx, error ) {
                                deferred.reject( error );
                                console.error( error );
                                $cordovaToast.showShortBottom( error.message );
                            } );
                        } );
                    } else {
                        deferred.reject( null );
                        console.error( 'No WebSql Instance' );
                        $cordovaToast.showShortBottom( 'No WebSql Instance' );
                    }
                } else {
                    $cordovaSQLite.execute( db_sqlite, strSql )
                        .then( function ( results ) {
                                deferred.resolve( results );
                            },
                            function ( error ) {
                                deferred.reject( error );
                                console.error( error );
                                $cordovaToast.showShortBottom( error );
                            }
                        );
                }
            }else{
                deferred.reject( null );
                console.error( 'Insert Script Error' );
                $cordovaToast.showShortBottom( 'Insert Script Error' );
            }
            return deferred.promise;
        };
        this.Del = function ( table, key, value ) {
            var deferred = $q.defer();
            var strSql = 'Delete From ' + table;
            if(is.not.empty(key) && is.not.empty(value)){
                strSql = strSql + ' Where ' + key + '=' + value;
            }
            if ( ENV.fromWeb ) {
                if ( db_websql ) {
                    db_websql.transaction( function ( tx ) {
                        tx.executeSql( strSql, [], function ( tx, results ) {
                            deferred.resolve( results );
                        }, function ( tx, error ) {
                            deferred.reject( error );
                            console.error( error );
                            $cordovaToast.showShortBottom( error.message );
                        } );
                    } );
                } else {
                    deferred.reject( null );
                    console.error( 'No WebSql Instance' );
                    $cordovaToast.showShortBottom( 'No WebSql Instance' );
                }
            } else {
                $cordovaSQLite.execute( db_sqlite, strSql )
                    .then( function ( results ) {
                            deferred.resolve( results );
                        },
                        function ( error ) {
                            deferred.reject( error );
                            console.error( error );
                            $cordovaToast.showShortBottom( error );
                        }
                    );
            }
            return deferred.promise;
        };
        this.Insert = function ( table, obj ) {
            var deferred = $q.defer();
            var strSql = 'Insert Into ' + table;
            if(is.not.empty(obj)){
                var fileds = '', values ='';
                for ( var key in obj ) {
                    if ( obj.hasOwnProperty( key ) && is.not.equal(key,'__type')) {
                        if ( is.null( obj[ key ] ) || is.undefined( obj[ key ] ) || is.equal( obj[ key ], 'undefined' )) {
                            obj[ key ] = '';
                        }
                        if ( is.string(obj[ key ]) ) {
                            obj[ key ] = '\'' + obj[ key ] + '\'';
                        }
                        if(is.empty(fileds)){
                            fileds = key;
                        }else{
                            fileds = fileds + ',' + key;
                        }
                        if(is.empty(values)){
                            values = obj[ key ];
                        }else{
                            values = values + ','+ obj[ key ];
                        }
                    }
                }
                strSql = strSql + '(' + fileds + ') values(' + values + ')';
                if ( ENV.fromWeb ) {
                    if ( db_websql ) {
                        db_websql.transaction( function ( tx ) {
                            tx.executeSql( strSql, [], function ( tx, results ) {
                                deferred.resolve( results );
                            }, function ( tx, error ) {
                                deferred.reject( error );
                                console.error( error );
                                $cordovaToast.showShortBottom( error.message );
                            } );
                        } );
                    } else {
                        deferred.reject( null );
                        console.error( 'No WebSql Instance' );
                        $cordovaToast.showShortBottom( 'No WebSql Instance' );
                    }
                } else {
                    $cordovaSQLite.execute( db_sqlite, strSql )
                        .then( function ( results ) {
                                deferred.resolve( results );
                            },
                            function ( error ) {
                                deferred.reject( error );
                                console.error( error );
                                $cordovaToast.showShortBottom( error );
                            }
                        );
                }
            }else{
                deferred.reject( null );
                console.error( 'Insert Script Error' );
                $cordovaToast.showShortBottom( 'Insert Script Error' );
            }
            return deferred.promise;
        };
        this.Update = function ( table, obj, strFilter) {
            var deferred = $q.defer();
            var strSql = 'Update ' + table + ' Set ';
            if(is.not.empty(obj)){
                var fileds = '';
                for ( var key in obj ) {
                    if ( obj.hasOwnProperty( key ) ) {
                        if ( is.null( obj[ key ] ) || is.undefined( obj[ key ] ) || is.equal( obj[ key ], 'undefined' )) {
                            obj[ key ] = '';
                        }
                        if ( is.string(obj[ key ]) ) {
                            obj[ key ] = '\'' + obj[ key ] + '\'';
                        }
                        if(is.empty(fileds)){
                            fileds = key + '=' + obj[ key ];
                        }else{
                            fileds = fileds + ',' + key + '=' + obj[ key ];
                        }
                    }
                }
                strSql = strSql + fileds;
                if(is.not.empty(strFilter) && is.not.empty(strFilter)){
                    strSql = strSql + ' Where ' + strFilter;
                }
                if ( ENV.fromWeb ) {
                    if ( db_websql ) {
                        db_websql.transaction( function ( tx ) {
                            tx.executeSql( strSql, [], function ( tx, results ) {
                                deferred.resolve( results );
                            }, function ( tx, error ) {
                                deferred.reject( error );
                                console.error( error );
                                $cordovaToast.showShortBottom( error.message );
                            } );
                        } );
                    } else {
                        deferred.reject( null );
                        console.error( 'No WebSql Instance' );
                        $cordovaToast.showShortBottom( 'No WebSql Instance' );
                    }
                } else {
                    $cordovaSQLite.execute( db_sqlite, strSql )
                        .then( function ( results ) {
                                deferred.resolve( results );
                            },
                            function ( error ) {
                                deferred.reject( error );
                                console.error( error );
                                $cordovaToast.showShortBottom( error );
                            }
                        );
                }
            }else{
                deferred.reject( null );
                console.error( 'Update Script Error' );
                $cordovaToast.showShortBottom( 'Update Script Error' );
            }
            return deferred.promise;
        };
        this.Exec = function ( strSql ) {
            var deferred = $q.defer();
            if ( ENV.fromWeb ) {
                if ( db_websql ) {
                    db_websql.transaction( function ( tx ) {
                        tx.executeSql( strSql, [], function ( tx, results ) {
                              deferred.resolve( results );
                        }, function ( tx, error ) {
                            deferred.reject( error );
                            console.error( error );
                            $cordovaToast.showShortBottom( error.message );
                        } );
                    } );
                } else {
                    $cordovaSQLite.execute( db_sqlite, strSql )
                    .then( function ( results ) {
                                if ( results.rows.length > 0 ) {
                                    deferred.resolve( results );
                                } else {
                                    deferred.reject( results );
                                    $cordovaToast.showShortBottom( result.meta.message + '\r\n' + result.meta.errors.message );
                                }
                            },
                            function ( error ) {
                                deferred.reject( error );
                                console.error( error );
                                $cordovaToast.showShortBottom( error );
                            }
                        );
                }
                return deferred.promise;
            };
        };
    }
] );

appService.service( 'DownloadFileService', [ 'ENV', '$http', '$timeout', '$ionicLoading', '$cordovaToast', '$cordovaFile', '$cordovaFileTransfer', '$cordovaFileOpener2',
    function( ENV, $http, $timeout, $ionicLoading, $cordovaToast, $cordovaFile, $cordovaFileTransfer, $cordovaFileOpener2 ) {
        this.Download = function( url, fileName, fileType, onPlatformError, onCheckError, onDownloadError ) {
            $ionicLoading.show( {
                template: "Download  0%"
            } );
            var blnError = false;
            if ( !ENV.fromWeb ) {
                $cordovaFile.checkFile( cordova.file.externalRootDirectory + '/' + ENV.rootPath, fileName )
                    .then( function( success ) {
                        //
                    }, function( error ) {
                        blnError = true;
                    } ).catch( function( ex ) {
                        console.log( ex );
                    } );
                var targetPath = cordova.file.externalRootDirectory + '/' + ENV.rootPath + '/' + fileName;
                var trustHosts = true;
                var options = {};
                if ( !blnError ) {
                    $cordovaFileTransfer.download( url, targetPath, trustHosts, options ).then( function( result ) {
                        $ionicLoading.hide();
                        $cordovaFileOpener2.open( targetPath, fileType ).then( function() {
                            // success
                        }, function( err ) {
                            // error
                        } ).catch( function( ex ) {
                            console.log( ex );
                        } );
                    }, function( err ) {
                        $cordovaToast.showShortCenter( 'Download faild.' );
                        $ionicLoading.hide();
                        if ( onDownloadError ) onDownloadError();
                    }, function( progress ) {
                        $timeout( function() {
                            var downloadProgress = ( progress.loaded / progress.total ) * 100;
                            $ionicLoading.show( {
                                template: "Download  " + Math.floor( downloadProgress ) + "%"
                            } );
                            if ( downloadProgress > 99 ) {
                                $ionicLoading.hide();
                            }
                        } )
                    } ).catch( function( ex ) {
                        console.log( ex );
                    } );
                } else {
                    $ionicLoading.hide();
                    $cordovaToast.showShortCenter( 'Check file faild.' );
                    if ( onCheckError ) onCheckError();
                }
            } else {
                $ionicLoading.hide();
                if ( onPlatformError ) onPlatformError( url );
            }
        };
    } ] );
