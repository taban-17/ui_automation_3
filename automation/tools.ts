// automation/tools.ts — the type you actually need
export interface ToolDefinition {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: "object";
      properties: Record<string, unknown>;
      required?: string[];
    };
  };
}

export const TOOLS: ToolDefinition[] = [
  {
    type: "function",
    function: {
      name: "identify_page",
      description: "Return the pageId, title, and headings of the current page.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "list_elements",
      description:
        "Return the interactive elements on the current page from the cached sitemap.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "click",
      description: "Click a button or link by its visible text.",
      parameters: {
        type: "object",
        properties: { text: { type: "string", description: "Visible text of the element" } },
        required: ["text"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "fill",
      description: "Type a value into an input identified by its label.",
      parameters: {
        type: "object",
        properties: {
          label: { type: "string", description: "Label text of the input" },
          value: { type: "string", description: "Value to enter" },
        },
        required: ["label", "value"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "read_state",
      description: "Return the current canonical RouterState.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "navigate",
      description: "Navigate to a page by its pageId.",
      parameters: {
        type: "object",
        properties: { pageId: { type: "string" } },
        required: ["pageId"],
      },
    },
  },
];

export interface ToolCall {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
}

export interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
}