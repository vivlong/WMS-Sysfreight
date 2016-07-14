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
				[Route("/wms/impm1", "Get")]																//impm1?UserDefine1=
				[Route("/wms/impm1/enquiry", "Get")]								//impm1?ProductCode= &TrxNo=
				[Route("/wms/impm1/transfer", "Get")]							//impm1?WarehouseCode= &StoreNo=
    public class Impm : IReturn<CommonResponse>
				{
								public string UserDefine1 { get; set; }
								public string ProductCode { get; set; }
								public string TrxNo { get; set; }
								public string WarehouseCode { get; set; }
								public string StoreNo { get; set; }
    }
				public class Impm_Logic
    {
								private class Impm1_Transfer_Tree
								{
												public string name { get; set; }
												public List<Impm1_Transfer> tree { get; set; }											
								}
        public IDbConnectionFactory DbConnectionFactory { get; set; }
								public List<Impm1_UserDefine> Get_Impm1_List(Impm request)
								{
												List<Impm1_UserDefine> Result = null;
												try
												{
																using (var db = DbConnectionFactory.OpenDbConnection("WMS"))
																{
																				string strSql = "Select Top 10 Impm1.TrxNo, Impm1.UserDefine1 " +
																								"From Impm1 " +
																								"Where Impm1.UserDefine1 LIKE '" + request.UserDefine1 + "%' " +
																								"Order By Impm1.TrxNo ASC";
																				Result = db.Select<Impm1_UserDefine>(strSql);
																}
												}
												catch { throw; }
												return Result;
								}
								public List<Impm1_Enquiry> Get_Impm1_Enquiry_List(Impm request)
								{
												List<Impm1_Enquiry> Result = null;
												try
												{
																using (var db = DbConnectionFactory.OpenDbConnection("WMS"))
																{
																				string strSql = "Select IsNull(Impm1.ProductCode,'') AS ProductCode, IsNull(Impm1.ProductName,'') AS ProductName," +
																								"IsNull(Impm1.GoodsReceiveorIssueNo,'') AS GoodsReceiveorIssueNo, IsNull(Impm1.RefNo,'') AS RefNo," +
																								"IsNull(Impm1.StoreNo,'') AS StoreNo, " +
																								"(CASE Impm1.DimensionFlag When '1' THEN Impm1.BalancePackingQty When '2' THEN Impm1.BalanceWholeQty ELSE Impm1.BalanceLooseQty END) AS BalanceQty " +
																								"From Impm1 ";
																				if (!string.IsNullOrEmpty(request.ProductCode))
																				{
																								strSql = strSql + "Where ProductCode='" + request.ProductCode + "'";
																				}
																				else if (!string.IsNullOrEmpty(request.TrxNo))
																				{
																								strSql = strSql + "Where TrxNo=" + int.Parse(request.TrxNo);
																				}
																				Result = db.Select<Impm1_Enquiry>(strSql);
																}
												}
												catch { throw; }
												return Result;
								}
								public object Get_Impm1_Transfer_List(Impm request)
								{
												List<Impm1_Transfer_Tree> ResultTrees = new List<Impm1_Transfer_Tree>();
												List<Impm1_Transfer> Results = null;
												try
												{
																using (var db = DbConnectionFactory.OpenDbConnection("WMS"))
																{
																				string strSql = "Select TrxNo, BatchLineItemNo, IsNull(BatchNo,'') AS name, IsNull(ProductCode,'') AS ProductCode," +
																								"IsNull(ProductName,'') AS ProductName, IsNull(GoodsReceiveorIssueNo,'') AS GoodsReceiveorIssueNo, IsNull(UserDefine1,'') AS UserDefine1," +
																								"(CASE Impm1.DimensionFlag When '1' THEN Impm1.PackingQty When '2' THEN Impm1.WholeQty ELSE Impm1.LooseQty END) AS Qty, " +
																								"'' AS FromToStoreNo, 0 AS QtyBal, 0 AS ScanQty " +
																								"From Impm1 " +
																								"Where WarehouseCode='" + request.WarehouseCode + "' And StoreNo='" + request.StoreNo + "'";
																				Results = db.Select<Impm1_Transfer>(strSql);
																				for (int i = 0; i < Results.Count; i++)
																				{
																								string BatchNo = Results[i].name;
																								Impm1_Transfer impm1 = Results[i];																								
																								bool blnExistBatchNo = false;
																								foreach (Impm1_Transfer_Tree ResultTree in ResultTrees)
																								{
																												if (ResultTree.name.Equals(BatchNo))
																												{
																																blnExistBatchNo = true;
																																ResultTree.tree.Add(impm1);
																												}																											
																								}
																								if (!blnExistBatchNo)
																								{
																												Impm1_Transfer_Tree impm1_tree = new Impm1_Transfer_Tree();
																												impm1_tree.name = BatchNo;
																												impm1_tree.tree = new List<Impm1_Transfer>();
																												impm1_tree.tree.Add(impm1);
																												ResultTrees.Add(impm1_tree);
																								}
																				}
																}
												}
												catch { throw; }
												return ResultTrees;
								}
    }
}
