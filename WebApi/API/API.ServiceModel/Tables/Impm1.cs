using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace WebApi.ServiceModel.Tables
{
				public class Impm1
				{
								public int TrxNo { get; set; }
								public string BatchNo { get; set; }
								public int BatchLineItemNo { get; set; }
								public string CustomerCode { get; set; }
								public string CustomerName { get; set; }
								public string GoodsDescription { get; set; }
								public string ProductCode { get; set; }
								public string ProductName { get; set; }
								public int ProductTrxNo { get; set; }
								public string StoreNo { get; set; }
								public string UserDefine1 { get; set; }
								public string WarehouseCode { get; set; }
								public int Qty { get; set; }
								public int QtyBal { get; set; }
								public int ScanQty { get; set; }
				}
}
