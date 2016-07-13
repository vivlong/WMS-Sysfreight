var objClone = function ( obj ) {
    var newObj = {};
    for ( var prop in obj ) {
        if ( obj.hasOwnProperty( prop ) ) {
            if ( is.object( obj[ prop ] ) ) {
                newObj[ prop ] = objClone( obj[ prop ] );
            } else {
                if ( is.null( obj[ prop ] ) || is.undefined( obj[ prop ] ) || is.equal( obj[ prop ], 'undefined' ) ) {
                    newObj[ prop ] = '';
                } else {
                    if(is.string(obj[ prop ])){
                        newObj[ prop ] = obj[ prop ].replace( /[\']/g, '\'\'' );
                    }else{
                        newObj[ prop ] = obj[ prop ];
                    }
                }
            }
        }
    }
    return newObj;
};

var db_add_Imsn1_Receipt = function ( imsn1 ) {
    if ( dbWms ) {
        dbWms.transaction( function ( tx ) {
            dbSql = 'INSERT INTO Imsn1_Receipt (ReceiptNoteNo, ReceiptLineItemNo, SerialNo) values(?, ?, ?)';
            tx.executeSql( dbSql, [ imsn1.ReceiptNoteNo, imsn1.ReceiptLineItemNo, imsn1.SerialNo ], null, dbError );
        } );
    }
};
var db_add_Imgr2_Putaway = function ( imgr2 ) {
    if ( dbWms ) {
        dbWms.transaction( function ( tx ) {
            dbSql = 'INSERT INTO Imgr2_Putaway (TrxNo, LineItemNo, StoreNo, StagingAreaFlag, ProductTrxNo, ProductCode, BarCode, DimensionFlag, PackingQty, WholeQty, LooseQty, ScanQty) values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
            tx.executeSql( dbSql, [ imgr2.TrxNo, imgr2.LineItemNo, imgr2.StoreNo, imgr2.StagingAreaFlag, imgr2.ProductTrxNo, imgr2.ProductCode, imgr2.BarCode, imgr2.DimensionFlag, imgr2.PackingQty, imgr2.WholeQty, imgr2.LooseQty, 0 ], null, dbError );
        } );
    }
};
var db_update_Imgr2_Putaway = function ( imgr2 ) {
    if ( dbWms ) {
        dbWms.transaction( function ( tx ) {
            dbSql = 'Update Imgr2_Putaway set ScanQty=?,StoreNo=? Where TrxNo=? and LineItemNo=?';
            tx.executeSql( dbSql, [ imgr2.ScanQty, imgr2.StoreNo, imgr2.TrxNo, imgr2.LineItemNo ], null, dbError );
        } );
    }
};

var db_add_Imgr2_Transfer = function ( imgr2 ) {
    if ( dbWms ) {
        dbWms.transaction( function ( tx ) {
            dbSql = 'INSERT INTO Imgr2_Transfer (TrxNo, LineItemNo, StoreNo, StoreNoFrom, StoreNoTo, ProductTrxNo, ProductCode, ProductDescription, SerialNoFlag, BarCode, ScanQtyFrom, ScanQtyTo) values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
            tx.executeSql( dbSql, [ imgr2.TrxNo, imgr2.LineItemNo, imgr2.StoreNo, imgr2.StoreNoFrom, imgr2.StoreNoTo, imgr2.ProductTrxNo, imgr2.ProductCode, imgr2.ProductDescription, imgr2.SerialNoFlag, imgr2.BarCode, 0, 0 ], null, dbError );
        } );
    }
};
var db_update_Imgr2_Transfer = function ( imgr2, type ) {
    if ( dbWms ) {
        if ( is.equal( type, 'from' ) ) {
            dbWms.transaction( function ( tx ) {
                dbSql = 'Update Imgr2_Transfer set ScanQtyFrom=?,StoreNoFrom=? Where TrxNo=? and LineItemNo=?';
                tx.executeSql( dbSql, [ imgr2.ScanQtyFrom, imgr2.StoreNoFrom, imgr2.TrxNo, imgr2.LineItemNo ], null, dbError );
            } );
        } else if ( is.equal( type, 'to' ) ) {
            dbWms.transaction( function ( tx ) {
                dbSql = 'Update Imgr2_Transfer set ScanQtyTo=?,StoreNoTo=? Where TrxNo=? and LineItemNo=?';
                tx.executeSql( dbSql, [ imgr2.ScanQtyTo, imgr2.StoreNoTo, imgr2.TrxNo, imgr2.LineItemNo ], null, dbError );
            } );
        }
    }
};
var db_query_Imgr2_Transfer = function ( callback ) {
    if ( dbWms ) {
        dbWms.transaction( function ( tx ) {
            dbSql = 'Select * from Imgr2_Transfer';
            tx.executeSql( dbSql, [], function ( tx, results ) {
                var len = results.rows.length;
                var arr = new Array();
                for ( var i = 0; i < len; i++ ) {
                    var imgr2 = {
                        TrxNo: results.rows.item( i ).TrxNo,
                        LineItemNo: results.rows.item( i ).LineItemNo,
                        StoreNo: results.rows.item( i ).StoreNo,
                        StoreNoFrom: results.rows.item( i ).StoreNoFrom,
                        StoreNoTo: results.rows.item( i ).StoreNoTo,
                        ProductTrxNo: results.rows.item( i ).ProductTrxNo,
                        ProductCode: results.rows.item( i ).ProductCode,
                        ProductDescription: results.rows.item( i ).ProductDescription,
                        SerialNoFlag: results.rows.item( i ).SerialNoFlag,
                        ScanQtyFrom: results.rows.item( i ).ScanQtyFrom > 0 ? results.rows.item( i ).ScanQtyFrom : 0,
                        ScanQtyTo: results.rows.item( i ).ScanQtyTo > 0 ? results.rows.item( i ).ScanQtyTo : 0,
                        BarCode: results.rows.item( i ).BarCode
                    };
                    arr.push( imgr2 );
                }
                if ( typeof ( callback ) == 'function' ) callback( arr );
            }, dbError )
        } );
    }
}

var db_add_Imgi2_Picking = function ( imgi2 ) {
    if ( dbWms ) {
        dbWms.transaction( function ( tx ) {
            dbSql = 'INSERT INTO Imgi2_Picking (RowNum, TrxNo, LineItemNo, StoreNo, ProductTrxNo, ProductCode, ProductDescription, SerialNoFlag, SerialNo, BarCode, Qty, ScanQty, QtyBal) values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? ,?)';
            tx.executeSql( dbSql, [ imgi2.RowNum, imgi2.TrxNo, imgi2.LineItemNo, imgi2.StoreNo, imgi2.ProductTrxNo, imgi2.ProductCode, imgi2.ProductDescription, imgi2.SerialNoFlag, imgi2.SerialNo, imgi2.BarCode, imgi2.Qty, 0, imgi2.Qty ], null, dbError );
        } );
    }
};
var db_update_Imgi2_Picking = function ( imgi2 ) {
    if ( dbWms ) {
        dbWms.transaction( function ( tx ) {
            dbSql = 'Update Imgi2_Picking set ScanQty=? Where TrxNo=? and LineItemNo=?';
            tx.executeSql( dbSql, [ imgi2.ScanQty, imgi2.TrxNo, imgi2.LineItemNo ], null, dbError );
        } );
    }
};
var db_query_Imgi2_Picking = function ( callback ) {
    if ( dbWms ) {
        dbWms.transaction( function ( tx ) {
            dbSql = 'Select * from Imgi2_Picking';
            tx.executeSql( dbSql, [], function ( tx, results ) {
                var len = results.rows.length;
                var arr = new Array();
                for ( var i = 0; i < len; i++ ) {
                    var imgi2 = results.rows.item( i );
                    imgi2.Qty = results.rows.item( i ).Qty > 0 ? results.rows.item( i ).Qty : 0;
                    imgi2.ScanQty = results.rows.item( i ).ScanQty > 0 ? results.rows.item( i ).ScanQty : 0;
                    imgi2.QtyBal = results.rows.item( i ).QtyBal > 0 ? results.rows.item( i ).QtyBal : 0;
                    arr.push( imgi2 );
                }
                if ( typeof ( callback ) == 'function' ) callback( arr );
            }, dbError )
        } );
    }
}

var db_add_Imsn1_Picking = function ( imsn1 ) {
    if ( dbWms ) {
        dbWms.transaction( function ( tx ) {
            dbSql = 'INSERT INTO Imsn1_Picking (IssueNoteNo, IssueLineItemNo, SerialNo) values(?, ?, ?)';
            tx.executeSql( dbSql, [ imsn1.IssueNoteNo, imsn1.IssueLineItemNo, imsn1.SerialNo ], null, dbError );
        } );
    }
};

var db_add_Imgi2_Verify = function ( imgi2 ) {
    if ( dbWms ) {
        dbWms.transaction( function ( tx ) {
            dbSql = 'INSERT INTO Imgi2_Verify (RowNum, TrxNo, LineItemNo, ProductTrxNo, ProductCode, ProductDescription, SerialNoFlag, SerialNo, BarCode, Qty, ScanQty, QtyBal) values(?, ?, ?, ?, ?, ?, ?, ?, ?, ? ,?, ?)';
            tx.executeSql( dbSql, [ imgi2.RowNum, imgi2.TrxNo, imgi2.LineItemNo, imgi2.ProductTrxNo, imgi2.ProductCode, imgi2.ProductDescription, imgi2.SerialNoFlag, imgi2.SerialNo, imgi2.BarCode, imgi2.Qty, 0, imgi2.Qty ], null, dbError );
        } );
    }
};
var db_update_Imgi2_Verify = function ( imgi2 ) {
    if ( dbWms ) {
        dbWms.transaction( function ( tx ) {
            dbSql = 'Update Imgi2_Verify set ScanQty=? Where TrxNo=? and LineItemNo=?';
            tx.executeSql( dbSql, [ imgi2.ScanQty, imgi2.TrxNo, imgi2.LineItemNo ], null, dbError );
        } );
    }
};
var db_query_Imgi2_Verify = function ( callback ) {
    if ( dbWms ) {
        dbWms.transaction( function ( tx ) {
            dbSql = 'Select * from Imgi2_Verify';
            tx.executeSql( dbSql, [], function ( tx, results ) {
                var len = results.rows.length;
                var arr = new Array();
                for ( var i = 0; i < len; i++ ) {
                    var imgi2 = results.rows.item( i );
                    imgi2.Qty = results.rows.item( i ).Qty > 0 ? results.rows.item( i ).Qty : 0;
                    imgi2.ScanQty = results.rows.item( i ).ScanQty > 0 ? results.rows.item( i ).ScanQty : 0;
                    imgi2.QtyBal = results.rows.item( i ).QtyBal > 0 ? results.rows.item( i ).QtyBal : 0;
                    arr.push( imgi2 );
                }
                if ( typeof ( callback ) == 'function' ) callback( arr );
            }, dbError )
        } );
    }
}

var db_add_Imsn1_Verify = function ( imsn1 ) {
    if ( dbWms ) {
        dbWms.transaction( function ( tx ) {
            dbSql = 'INSERT INTO Imsn1_Verify (IssueNoteNo, IssueLineItemNo, SerialNo) values(?, ?, ?)';
            tx.executeSql( dbSql, [ imsn1.IssueNoteNo, imsn1.IssueLineItemNo, imsn1.SerialNo ], null, dbError );
        } );
    }
};
