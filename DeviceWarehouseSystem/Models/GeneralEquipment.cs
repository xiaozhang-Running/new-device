﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿using System;
using System.Collections.Generic;

namespace DeviceWarehouseSystem.Models;

public partial class GeneralEquipment
{
    public int Id { get; set; }

    public int SortOrder { get; set; }

    public int DeviceType { get; set; }

    public string DeviceName { get; set; } = null!;

    public string DeviceCode { get; set; } = null!;

    public string? Brand { get; set; }

    public string? Model { get; set; }

    public string? SerialNumber { get; set; }

    public string? Specification { get; set; }

    public int Quantity { get; set; }

    public string? Unit { get; set; }

    public string? ImageUrl { get; set; }

    public int DeviceStatus { get; set; }

    public int UseStatus { get; set; }

    public string? Status { get; set; }

    public string? Company { get; set; }

    public string? Warehouse { get; set; }

    public string? Accessories { get; set; }

    public string? Remark { get; set; }

    public int? RepairStatus { get; set; }

    public string? RepairPerson { get; set; }

    public DateTime? RepairDate { get; set; }

    public string? FaultReason { get; set; }

    public string? Location { get; set; }

    public string? ProjectName { get; set; }

    public string? ProjectTime { get; set; }

    public DateTime? PurchaseDate { get; set; }

    public decimal? PurchasePrice { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public string? CreatedBy { get; set; }

    public string? UpdatedBy { get; set; }

    public int NameSequence { get; set; }

    public byte[]? ImageData { get; set; }

    public string? ImageContentType { get; set; }

    public virtual ICollection<Image> Images { get; set; } = new List<Image>();

    public virtual ICollection<InboundOrderItem> InboundOrderItems { get; set; } = new List<InboundOrderItem>();

    public virtual Inventory? Inventory { get; set; }

    public virtual ICollection<OutboundOrderItem> OutboundOrderItems { get; set; } = new List<OutboundOrderItem>();

    public virtual ICollection<ScrapEquipment> ScrapEquipments { get; set; } = new List<ScrapEquipment>();
}
