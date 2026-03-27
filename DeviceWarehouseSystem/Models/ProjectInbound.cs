﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿using System;
using System.Collections.Generic;

namespace DeviceWarehouseSystem.Models;

public partial class ProjectInbound
{
    public int Id { get; set; }

    public string InboundNumber { get; set; } = null!;

    public DateTime InboundDate { get; set; }

    public string ProjectName { get; set; } = null!;

    public string? ProjectCode { get; set; }

    public string? ProjectManager { get; set; }

    public string? Supplier { get; set; }

    public string? InboundType { get; set; }

    public string? ProjectTime { get; set; }

    public string? ContactPhone { get; set; }

    public string? StorageLocation { get; set; }

    public string? Handler { get; set; }

    public string? WarehouseKeeper { get; set; }

    public string? InboundImages { get; set; }

    public string? Remark { get; set; }

    public int TotalQuantity { get; set; }

    public string Status { get; set; } = null!;

    public bool IsCompleted { get; set; }

    public DateTime? CompletedAt { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public string? CreatedBy { get; set; }

    public string? UpdatedBy { get; set; }

    public virtual ICollection<ProjectInboundItem> ProjectInboundItems { get; set; } = new List<ProjectInboundItem>();

    public virtual ICollection<ProjectInboundOutbound> ProjectInboundOutbounds { get; set; } = new List<ProjectInboundOutbound>();
}
