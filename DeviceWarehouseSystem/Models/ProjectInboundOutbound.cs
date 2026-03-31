using System;
using System.Collections.Generic;

namespace DeviceWarehouseSystem.Models;

public partial class ProjectInboundOutbound
{
    public int ProjectInboundId { get; set; }

    public int ProjectOutboundId { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual ProjectInbound ProjectInbound { get; set; } = null!;

    public virtual ProjectOutbound ProjectOutbound { get; set; } = null!;
}
