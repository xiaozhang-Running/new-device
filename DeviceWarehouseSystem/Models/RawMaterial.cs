﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿using System;
using System.Collections.Generic;

namespace DeviceWarehouseSystem.Models;

public partial class RawMaterial
{
    public int Id { get; set; }

    public int SortOrder { get; set; }

    public string ProductName { get; set; } = null!;

    public string? Specification { get; set; }

    public int TotalQuantity { get; set; }

    public int UsedQuantity { get; set; }

    public int RemainingQuantity { get; set; }

    public string? Unit { get; set; }

    public string? Remark { get; set; }

    public string? Supplier { get; set; }

    public string? Location { get; set; }

    public string? Company { get; set; }

    public string? Brand { get; set; }

    public string? Image { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public string? CreatedBy { get; set; }

    public string? UpdatedBy { get; set; }

    public virtual ICollection<RawMaterialInboundItem> RawMaterialInboundItems { get; set; } = new List<RawMaterialInboundItem>();

    public virtual ICollection<RawMaterialOutboundItem> RawMaterialOutboundItems { get; set; } = new List<RawMaterialOutboundItem>();
}
