﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿using System;
using System.Collections.Generic;

namespace DeviceWarehouseSystem.Models;

public partial class ProjectOutbound
{
    public int Id { get; set; }

    public string OutboundNumber { get; set; } = null!;

    public DateTime OutboundDate { get; set; }

    public string ProjectName { get; set; } = null!;

    public string? ProjectCode { get; set; }

    public string? ProjectManager { get; set; }

    public string? Recipient { get; set; }

    public string? OutboundType { get; set; }

    public string? ProjectTime { get; set; }

    public string? ContactPhone { get; set; }

    public string? UsageLocation { get; set; }

    public DateTime? ReturnDate { get; set; }

    public string? Handler { get; set; }

    public string? WarehouseKeeper { get; set; }

    public int? LogisticsMethod { get; set; }

    public string? OutboundImages { get; set; }

    public string? Remark { get; set; }

    public int TotalQuantity { get; set; }

    public bool IsCompleted { get; set; }

    public DateTime? CompletedAt { get; set; }

    public string? InboundStatus { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public string? CreatedBy { get; set; }

    public string? UpdatedBy { get; set; }

    public virtual ICollection<ProjectInboundOutbound> ProjectInboundOutbounds { get; set; } = new List<ProjectInboundOutbound>();

    public virtual ICollection<ProjectOutboundItem> ProjectOutboundItems { get; set; } = new List<ProjectOutboundItem>();
}
