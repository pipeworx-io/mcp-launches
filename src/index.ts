/**
 * Launches MCP — wraps Launch Library 2 API (ll.thespacedevs.com, free, no auth)
 *
 * Rate limit: 15 requests/hour for anonymous use. User-Agent header required.
 *
 * Tools:
 * - get_upcoming_launches: Upcoming rocket launches
 * - get_past_launches: Past rocket launches
 * - get_launch: Full launch details by ID
 * - search_launches: Search launches by keyword
 */

interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
}

const BASE_URL = 'https://ll.thespacedevs.com/2.2.0';
const HEADERS = {
  'User-Agent': 'pipeworx-mcp/1.0 (https://pipeworx.io)',
};

// ── API types ─────────────────────────────────────────────────────────

type LaunchStatus = {
  name: string;
  abbrev: string;
  description: string;
} | null;

type LaunchPad = {
  name: string | null;
  location: {
    name: string | null;
    country_code: string | null;
  } | null;
} | null;

type RocketConfig = {
  name: string | null;
  family: string | null;
  full_name: string | null;
} | null;

type Rocket = {
  configuration: RocketConfig;
} | null;

type Mission = {
  name: string | null;
  description: string | null;
  orbit: {
    name: string | null;
    abbrev: string | null;
  } | null;
  type: string | null;
} | null;

type LaunchListItem = {
  id: string;
  name: string;
  net: string | null;
  status: LaunchStatus;
  pad: LaunchPad;
  rocket: Rocket;
  mission: Mission;
};

type LaunchDetail = LaunchListItem & {
  webcast_live: boolean | null;
  image: string | null;
  infographic: string | null;
  program: {
    name: string | null;
    description: string | null;
    image_url: string | null;
  }[];
  vidURLs: {
    url: string;
    title: string | null;
  }[];
};

type LaunchListResponse = {
  count: number;
  results: LaunchListItem[];
};

// ── Tool definitions ──────────────────────────────────────────────────

const tools: McpToolExport['tools'] = [
  {
    name: 'get_upcoming_launches',
    description:
      'Get upcoming rocket launches from Launch Library 2. Returns name, net launch time, status, launch pad name and location, rocket name, and mission description.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Number of launches to return (default 10)',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_past_launches',
    description:
      'Get past rocket launches from Launch Library 2. Returns name, net launch time, status, launch pad name and location, rocket name, and mission description.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Number of launches to return (default 10)',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_launch',
    description:
      'Get full details for a specific launch by its Launch Library 2 ID. Returns name, net time, status, pad, rocket, mission, orbit info, video URLs, and mission patches.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Launch Library 2 launch UUID (e.g. "a6ce038e-4d89-4265-b47f-1c6ee5863f84")',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'search_launches',
    description:
      'Search launches by keyword (rocket name, mission name, agency, etc). Returns matching launches with name, net launch time, status, pad, rocket, and mission description.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search keyword (e.g. "Falcon 9", "Artemis", "ISS")',
        },
        limit: {
          type: 'number',
          description: 'Number of results to return (default 10)',
        },
      },
      required: ['query'],
    },
  },
];

// ── callTool dispatcher ───────────────────────────────────────────────

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'get_upcoming_launches':
      return getUpcomingLaunches((args.limit as number) ?? 10);
    case 'get_past_launches':
      return getPastLaunches((args.limit as number) ?? 10);
    case 'get_launch':
      return getLaunch(args.id as string);
    case 'search_launches':
      return searchLaunches(args.query as string, (args.limit as number) ?? 10);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// ── Helpers ───────────────────────────────────────────────────────────

function formatLaunchListItem(launch: LaunchListItem) {
  return {
    id: launch.id,
    name: launch.name,
    net: launch.net ?? null,
    status: launch.status?.name ?? null,
    status_description: launch.status?.description ?? null,
    pad_name: launch.pad?.name ?? null,
    location: launch.pad?.location?.name ?? null,
    location_country: launch.pad?.location?.country_code ?? null,
    rocket_name: launch.rocket?.configuration?.full_name ?? launch.rocket?.configuration?.name ?? null,
    mission_name: launch.mission?.name ?? null,
    mission_description: launch.mission?.description ?? null,
    mission_type: launch.mission?.type ?? null,
  };
}

// ── Tool implementations ──────────────────────────────────────────────

async function getUpcomingLaunches(limit: number) {
  const params = new URLSearchParams({ limit: String(limit), mode: 'list' });
  const res = await fetch(`${BASE_URL}/launch/upcoming/?${params}`, { headers: HEADERS });
  if (!res.ok) throw new Error(`Launch Library API error: ${res.status}`);

  const data = (await res.json()) as LaunchListResponse;

  return {
    total: data.count,
    launches: data.results.map(formatLaunchListItem),
  };
}

async function getPastLaunches(limit: number) {
  const params = new URLSearchParams({ limit: String(limit), mode: 'list' });
  const res = await fetch(`${BASE_URL}/launch/previous/?${params}`, { headers: HEADERS });
  if (!res.ok) throw new Error(`Launch Library API error: ${res.status}`);

  const data = (await res.json()) as LaunchListResponse;

  return {
    total: data.count,
    launches: data.results.map(formatLaunchListItem),
  };
}

async function getLaunch(id: string) {
  const res = await fetch(`${BASE_URL}/launch/${encodeURIComponent(id)}/`, { headers: HEADERS });
  if (res.status === 404) throw new Error(`Launch not found for ID: ${id}`);
  if (!res.ok) throw new Error(`Launch Library API error: ${res.status}`);

  const data = (await res.json()) as LaunchDetail;

  return {
    id: data.id,
    name: data.name,
    net: data.net ?? null,
    status: data.status?.name ?? null,
    status_description: data.status?.description ?? null,
    pad_name: data.pad?.name ?? null,
    location: data.pad?.location?.name ?? null,
    location_country: data.pad?.location?.country_code ?? null,
    rocket_name: data.rocket?.configuration?.full_name ?? data.rocket?.configuration?.name ?? null,
    rocket_family: data.rocket?.configuration?.family ?? null,
    mission_name: data.mission?.name ?? null,
    mission_description: data.mission?.description ?? null,
    mission_type: data.mission?.type ?? null,
    orbit: data.mission?.orbit?.name ?? null,
    orbit_abbrev: data.mission?.orbit?.abbrev ?? null,
    webcast_live: data.webcast_live ?? null,
    image: data.image ?? null,
    infographic: data.infographic ?? null,
    video_urls: (data.vidURLs ?? []).map((v) => ({
      url: v.url,
      title: v.title ?? null,
    })),
    programs: (data.program ?? []).map((p) => ({
      name: p.name ?? null,
      description: p.description ?? null,
      image_url: p.image_url ?? null,
    })),
  };
}

async function searchLaunches(query: string, limit: number) {
  const params = new URLSearchParams({
    search: query,
    limit: String(limit),
    mode: 'list',
  });
  const res = await fetch(`${BASE_URL}/launch/?${params}`, { headers: HEADERS });
  if (!res.ok) throw new Error(`Launch Library API error: ${res.status}`);

  const data = (await res.json()) as LaunchListResponse;

  return {
    total: data.count,
    query,
    launches: data.results.map(formatLaunchListItem),
  };
}

export default { tools, callTool } satisfies McpToolExport;
