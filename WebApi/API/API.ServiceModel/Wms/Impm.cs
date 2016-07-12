using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Data;
using ServiceStack;
using ServiceStack.ServiceHost;
using ServiceStack.OrmLite;
using WebApi.ServiceModel.Tables;

namespace WebApi.ServiceModel.Wms
{
				[Route("/wms/impm1", "Get")]								//impm1?UserDefine1= &WarehouseCode= &StoreNo=
    public class Impm : IReturn<CommonResponse>
				{
								public string UserDefine1 { get; set; }
								public string WarehouseCode { get; set; }
								public string StoreNo { get; set; }
    }
				public class Impm_Logic
    {        
        public IDbConnectionFactory DbConnectionFactory { get; set; }
								public object Get_Impm1(Impm request)
								{
												object Result = null;
												if (!string.IsNullOrEmpty(request.UserDefine1))
												{
																Result = Get_Impm1_Enquiry_List(request);
												}
												else
												{
																Result = Get_Impm1_List(request);
												}
												return Result;
								}
								public List<Impm1_Enquiry> Get_Impm1_Enquiry_List(Impm request)
								{
												List<Impm1_Enquiry> Result = null;
												try
												{
																using (var db = DbConnectionFactory.OpenDbConnection("WMS"))
																{
																				string strSql = "Select Top 10 Impm1.TrxNo, Impm1.UserDefine1 " +
																								"From Impm1 " +
																								"Where Impm1.UserDefine1 LIKE '" + request.UserDefine1 + "%' " +
																								"Order By Impm1.TrxNo ASC";
																				Result = db.Select<Impm1_Enquiry>(strSql);
																}
												}
												catch { throw; }
												return Result;
								}
								public List<Impm1> Get_Impm1_List(Impm request)
        {
												List<Impm1> Result = null;
            try
            {
																using (var db = DbConnectionFactory.OpenDbConnection("WMS"))
																{
																				string strSql = "Select Impm1.TrxNo,Impm1.BatchNo,Impm1.BatchLineItemNo,Impm1.CustomerCode," +
																								"Impm1.CustomerName,Impm1.GoodsDescription,Impm1.ProductCode,Impm1.ProductNameImpm1.ProductTrxNo," +
																								"Impm1.StoreNo,Impm1.UserDefine1,Impm1.WarehouseCode," +
																							 "(CASE Impm1.DimensionFlag When '1' THEN Impm1.PackingQty When '2' THEN Impm1.WholeQty ELSE Impm1.LooseQty END) AS Qty, " +
																							 "0 AS QtyBal, 0 AS ScanQty " +
																							 "From Impm1 " +
																								"Where Impm1.WarehouseCode='" + request.WarehouseCode + "' Impm1.StoreNo='" + request.StoreNo + "'";
																				Result = db.Select<Impm1>(strSql);
                }
            }
            catch { throw; }
            return Result;
        }
    }
}
