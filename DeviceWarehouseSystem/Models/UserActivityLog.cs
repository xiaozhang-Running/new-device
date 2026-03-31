﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿using System;
using System.Collections.Generic;

namespace DeviceWarehouseSystem.Models;

public partial class UserActivityLog
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public string ActivityType { get; set; } = null!;

    public string ActivityDescription { get; set; } = null!;

    public string? IpAddress { get; set; }

    public string? UserAgent { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual User User { get; set; } = null!;
}
