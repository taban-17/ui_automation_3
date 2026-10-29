# Router UI Automation & Abstraction Platform
## Web Server Development Plan

## 1. Project Overview

### 1.1 Background

Router administration interfaces vary considerably between manufacturers in terms of terminology, navigation structures, configuration workflows, and presentation.

For example, the configuration commonly referred to as an SSID or Wi-Fi Name may be presented differently across router manufacturers:

- SSID
- Wireless Network Name
- Wi-Fi Name
- WLAN Name
- Network Identifier

Although these terms describe essentially the same configuration, their differences create usability challenges for users who are unfamiliar with networking terminology.

Furthermore, configuring the same network functionality across different manufacturers often requires navigating entirely different interfaces and workflows.

### 1.2 Project Objective

Develop a web-based router simulation environment that hosts multiple router administration interfaces with different naming conventions, layouts, and configuration workflows.

The platform will serve as a testing environment for an LLM-powered router administration and abstraction system.

The LLM-based system should eventually be capable of interpreting high-level user instructions, identifying the corresponding router configuration, and executing the necessary operations through the manufacturer's web interface.

Examples of high-level instructions include:

- Change my Wi-Fi name to Home Network.
- Change the wireless password.
- Disable the guest network.
- Enable DHCP.
- Change the router's LAN IP address.

The simulation platform will provide controlled and reproducible router interfaces against which these capabilities can be evaluated.

### 1.3 Primary Requirements

1. Host multiple independently accessible router administration interfaces.
2. Provide variations in terminology, navigation, layouts, and configuration workflows.
3. Maintain a shared, stateful backend for all simulated routers.
4. Store router configurations in simple JSON files.
5. Ensure all interfaces operate on the same underlying router state model.
6. Provide realistic form interactions, validation, navigation, and configuration feedback.
7. Support automated browser interaction through tools such as Puppeteer or Playwright.
8. Provide deterministic scenarios for evaluating LLM-based UI automation.

---

## 2. System Architecture

### 2.1 Architectural Overview

The platform will consist of three primary components:

1. **Simulation Server:** Hosts the router interfaces and exposes backend endpoints.
2. **Router Interface Layer:** Contains manufacturer-inspired interfaces with different terminology and workflows.
3. **Shared State Layer:** Maintains the actual configuration of each simulated router.

The interfaces will not maintain independent configuration databases. Instead, they will communicate with a shared backend that manages the router state.

### 2.2 High-Level Architecture

```text
                    LLM AUTOMATION SYSTEM
                            |
                            |
                   Browser Automation
                   (Puppeteer/Playwright)
                            |
                            v
                 SIMULATION WEB SERVER
                            |
             +--------------+--------------+
             |              |              |
             v              v              v
         Router A       Router B       Router C
         Interface      Interface      Interface
             |              |              |
         SSID          WiFi Name       WLAN Name
         Security      Wireless        WLAN Security
         Settings      Settings        Configuration
             |              |              |
             +--------------+--------------+
                            |
                            v
                    ROUTER API LAYER
                            |
                            v
                  SHARED STATE MANAGER
                            |
                            v
                   JSON CONFIGURATION
                            |
                            v
                     router-state.json
```

### 2.3 Architectural Principles

- **Interface independence:** Each router interface should be developed independently.
- **State consistency:** All interfaces should operate on the same canonical configuration model.
- **Terminology independence:** Manufacturer-specific naming conventions should not affect backend property names.
- **Workflow diversity:** Interfaces should differ in navigation and configuration procedures, not merely their appearance.
- **Deterministic behavior:** Identical operations should produce predictable state changes.
- **Automation compatibility:** All interfaces should support conventional browser interactions.

---

## 3. Router State Management

### 3.1 Canonical Router Configuration

A standardized internal representation will be used to describe the configuration of every simulated router.

This representation acts as the abstraction boundary between the interfaces and the backend.

Example:

```json
{
  "device": {
    "id": "router-001",
    "manufacturer": "Generic",
    "model": "Simulation Router A",
    "hostname": "router-a",
    "firmware": "1.0.0"
  },
  "wireless": {
    "enabled": true,
    "ssid": "Home Network",
    "password": "example-password",
    "security": "WPA2-PSK",
    "broadcast": true,
    "bands": {
      "2.4GHz": {
        "enabled": true,
        "channel": "auto"
      },
      "5GHz": {
        "enabled": true,
        "channel": "auto"
      }
    }
  },
  "lan": {
    "ipAddress": "192.168.1.1",
    "subnetMask": "255.255.255.0",
    "dhcp": {
      "enabled": true,
      "startAddress": "192.168.1.100",
      "endAddress": "192.168.1.200",
      "leaseTime": 86400
    }
  },
  "guestNetwork": {
    "enabled": false,
    "ssid": "Guest Network",
    "security": "WPA2-PSK"
  },
  "system": {
    "adminUsername": "admin",
    "timezone": "Africa/Nairobi",
    "rebootRequired": false
  }
}
```

The example represents the initial configuration, not a fixed schema. The model can be extended as additional router capabilities are introduced.

### 3.2 JSON Persistence

Each simulated router should have its own JSON state file.

Suggested structure:

```text
data/
├── router-a.json
├── router-b.json
├── router-c.json
└── router-d.json
```

Although the interfaces share the same configuration schema, each router should maintain independent state.

This enables multiple router simulations to operate concurrently without interfering with one another.

### 3.3 State Manager Responsibilities

The state manager should provide the following functionality:

- Load router configurations during server initialization.
- Retrieve the current configuration.
- Update individual configuration properties.
- Validate configuration changes.
- Persist changes to JSON files.
- Maintain configuration consistency across interfaces.
- Support resetting a router to its initial state.
- Record configuration changes for debugging and evaluation.

**Important implementation consideration:** JSON files should not be modified directly by individual interface handlers. All writes should pass through a centralized state manager.

The state manager should also handle concurrent writes using a serialized write queue or equivalent locking mechanism to prevent conflicting updates.

---

## 4. Router Interface Variations

The simulation should initially implement at least four distinct router interfaces.

Each interface should represent a different approach to presenting and organizing router configuration.

### 4.1 Router A — Conventional Administration Interface

**Design characteristics:**
- Traditional router administration dashboard.
- Sidebar navigation.
- Separate configuration pages.
- Conventional networking terminology.

Example terminology:

| Canonical Property | Interface Label |
|---|---|
| wireless.ssid | SSID |
| wireless.password | Pre-Shared Key |
| wireless.enabled | Wireless Radio |
| lan.ipAddress | LAN IP Address |
| wireless.broadcast | SSID Broadcast |
| guestNetwork.enabled | Guest WLAN |

**Workflow example:**

1. Navigate to Wireless Settings.
2. Open the Basic Configuration page.
3. Locate the SSID field.
4. Change the SSID.
5. Navigate to Security.
6. Save the configuration.

### 4.2 Router B — Consumer-Friendly Interface

**Design characteristics:**
- Modern dashboard.
- Simplified terminology.
- Card-based configuration.
- Settings grouped by user-facing functionality.

Example terminology:

| Canonical Property | Interface Label |
|---|---|
| wireless.ssid | Wi-Fi Name |
| wireless.password | Wi-Fi Password |
| wireless.enabled | Wi-Fi On/Off |
| lan.ipAddress | Router IP |
| wireless.broadcast | Show Network Name |
| guestNetwork.enabled | Guest Wi-Fi |

**Workflow example:**

1. Open the Wi-Fi section.
2. Select the Main Network card.
3. Edit the network name.
4. Apply changes.

### 4.3 Router C — Technical/Enterprise Interface

**Design characteristics:**
- Dense configuration interface.
- Advanced networking terminology.
- Tab-based navigation.
- Multiple configuration parameters on individual pages.

Example terminology:

| Canonical Property | Interface Label |
|---|---|
| wireless.ssid | WLAN SSID |
| wireless.password | WPA Pre-Shared Key |
| wireless.enabled | Radio Enable |
| lan.ipAddress | Management Interface Address |
| wireless.broadcast | Beacon SSID |
| guestNetwork.enabled | Virtual AP Enable |

**Workflow example:**

1. Navigate to WLAN Configuration.
2. Open the SSID Profile.
3. Select the relevant radio interface.
4. Modify the WLAN profile.
5. Apply the configuration.

### 4.4 Router D — Workflow-Heavy Interface

**Design characteristics:**
- Multi-step configuration wizard.
- Settings distributed across multiple pages.
- Different terminology from the other interfaces.
- Changes may require a final confirmation step.

Example terminology:

| Canonical Property | Interface Label |
|---|---|
| wireless.ssid | Network Identifier |
| wireless.password | Network Access Key |
| wireless.enabled | Wireless Service |
| lan.ipAddress | Local Gateway |
| wireless.broadcast | Network Visibility |
| guestNetwork.enabled | Visitor Network |

**Workflow example:**

1. Open Network Management.
2. Select Home Network.
3. Enter the network identification settings.
4. Proceed to Security Configuration.
5. Confirm the changes.
6. Submit the configuration wizard.

### 4.5 Interface Diversity Requirements

The interfaces should differ in more than terminology.

The following dimensions should be varied:

| Dimension | Possible Variations |
|---|---|
| Navigation | Sidebar, tabs, dashboard cards, wizard |
| Terminology | SSID, Wi-Fi Name, WLAN Name |
| Form organization | Single page, separate pages, grouped forms |
| Save behavior | Immediate, Apply button, Save and Restart |
| Validation | Inline, modal, confirmation page |
| Configuration scope | Individual fields, grouped settings |
| Feedback | Toast, modal, status banner |
| Workflow | Direct edit, multi-step configuration |

This diversity is essential for evaluating whether the LLM understands the underlying functionality rather than simply memorizing interface labels or navigation paths.

---

## 5. Backend API Design

The backend should expose a common set of endpoints used by all router interfaces.

The API should operate on canonical configuration properties rather than manufacturer-specific terminology.

### 5.1 Proposed Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /api/routers | List simulated routers |
| GET | /api/routers/:id | Retrieve router information |
| GET | /api/routers/:id/state | Retrieve current configuration |
| PATCH | /api/routers/:id/state | Update configuration |
| POST | /api/routers/:id/reset | Reset configuration |
| GET | /api/routers/:id/history | Retrieve configuration history |

### 5.2 Example State Update

Request:

```http
PATCH /api/routers/router-a/state
Content-Type: application/json
```

```json
{
  "wireless": {
    "ssid": "New Home Network"
  }
}
```

Expected behavior:

1. Identify the target router.
2. Load its current state.
3. Validate the requested changes.
4. Merge the changes with the existing configuration.
5. Persist the updated configuration.
6. Return the updated state.

Response:

```json
{
  "success": true,
  "message": "Configuration updated successfully",
  "updated": {
    "wireless": {
      "ssid": "New Home Network"
    }
  }
}
```

### 5.3 API Design Considerations

- Support partial configuration updates.
- Reject invalid configuration values.
- Preserve properties that were not modified.
- Return meaningful error responses.
- Ensure updates are atomic.
- Avoid exposing internal filesystem paths.
- Keep manufacturer-specific labels out of API contracts.

---

## 6. Frontend Development

### 6.1 Suggested Technology Stack

| Component | Technology |
|---|---|
| Runtime | Node.js |
| Backend | Express.js |
| Frontend | React / Next.js |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Persistence | JSON files |
| API communication | REST |
| Browser automation compatibility | Puppeteer / Playwright |

The frontend applications should communicate with the simulation server through HTTP APIs.

A shared component library may be used for reusable elements, but the router interfaces should retain independent page structures and workflows.

### 6.2 Suggested Project Structure

```text
router-simulator/
│
├── src/
│   ├── server/
│   │   ├── index.ts
│   │   ├── routes/
│   │   │   ├── routers.ts
│   │   │   ├── state.ts
│   │   │   └── history.ts
│   │   │
│   │   ├── services/
│   │   │   ├── state-manager.ts
│   │   │   ├── validator.ts
│   │   │   └── history-manager.ts
│   │   │
│   │   └── middleware/
│   │
│   ├── interfaces/
│   │   ├── router-a/
│   │   │   ├── pages/
│   │   │   └── components/
│   │   │
│   │   ├── router-b/
│   │   │   ├── pages/
│   │   │   └── components/
│   │   │
│   │   ├── router-c/
│   │   │   ├── pages/
│   │   │   └── components/
│   │   │
│   │   └── router-d/
│   │       ├── pages/
│   │       └── components/
│   │
│   ├── shared/
│   │   ├── types/
│   │   ├── api/
│   │   └── components/
│   │
│   └── config/
│       └── router-schema.ts
│
├── data/
│   ├── router-a.json
│   ├── router-b.json
│   ├── router-c.json
│   └── router-d.json
│
├── tests/
│   ├── api/
│   ├── interfaces/
│   └── scenarios/
│
├── package.json
└── README.md
```

---

## 7. Testing and Evaluation

The primary purpose of the platform is to evaluate the effectiveness of LLMs in abstracting router administration interfaces.

Consequently, testing should focus on whether the same user intention can be executed successfully across different interfaces.

### 7.1 Functional Test Scenarios

Initial test cases should include:

| Test ID | User Instruction | Expected Canonical Property |
|---|---|---|
| T001 | Change my Wi-Fi name | wireless.ssid |
| T002 | Change my wireless password | wireless.password |
| T003 | Turn off Wi-Fi | wireless.enabled |
| T004 | Hide my network name | wireless.broadcast |
| T005 | Enable guest Wi-Fi | guestNetwork.enabled |
| T006 | Change my router IP | lan.ipAddress |
| T007 | Enable DHCP | lan.dhcp.enabled |
| T008 | Change the Wi-Fi channel | wireless.bands |

Each scenario should be executed against every simulated router.

### 7.2 Evaluation Metrics

The following metrics will help determine the effectiveness of the LLM-based abstraction system:

**1. Task Completion Rate**

Percentage of instructions successfully executed.

**2. Configuration Accuracy**

Whether the resulting router state matches the expected configuration.

**3. Navigation Efficiency**

Number of browser interactions required to complete a task.

**4. Terminology Generalization**

Ability to identify equivalent configuration options despite differences in naming conventions.

**5. Workflow Generalization**

Ability to adapt to different navigation and configuration procedures.

**6. Error Recovery**

Ability to recover from invalid input, unexpected dialogs, and unsuccessful configuration attempts.

**7. Execution Time**

Time required to complete an administration task.

### 7.3 Automated Evaluation

The test environment should support automatic comparison between expected and actual router configurations.

Example:

```json
{
  "scenario": "change-wireless-name",
  "router": "router-c",
  "instruction": "Change my Wi-Fi name to Office Network",
  "expected": {
    "wireless.ssid": "Office Network"
  }
}
```

After browser automation completes, the evaluation system retrieves the router state and compares it against the expected result.

The test should distinguish between:

- Correctly identifying the intended configuration.
- Successfully navigating to the correct interface.
- Correctly modifying the configuration.
- Successfully saving and persisting the change.

This makes it possible to identify precisely where the LLM fails.

---

## 8. Development Phases

### Phase 1 — Backend Foundation

- Establish the Node.js server.
- Define the canonical router configuration schema.
- Implement JSON-based state persistence.
- Implement the state manager.
- Develop common REST endpoints.
- Implement configuration validation.
- Test state consistency.

**Deliverable:** A functional stateful router simulation backend.

### Phase 2 — Initial Router Interfaces

- Develop Router A with a conventional interface.
- Develop Router B with consumer-friendly terminology.
- Develop Router C with technical terminology.
- Develop Router D with a multi-step workflow.
- Connect all interfaces to the shared backend.
- Verify that changes made through one interface are reflected in the underlying state.

**Deliverable:** Four independently accessible and stateful router interfaces.

### Phase 3 — Workflow Diversity

- Introduce different configuration workflows.
- Implement varying save and apply behaviors.
- Add confirmation dialogs and validation.
- Introduce multi-band wireless configuration.
- Implement additional router administration features.

**Deliverable:** A diverse collection of realistic router administration simulations.

### Phase 4 — Automation Testing

- Configure Puppeteer or Playwright.
- Develop automated interaction scenarios.
- Implement expected-state definitions.
- Implement automatic state comparison.
- Record execution logs and failures.

**Deliverable:** A repeatable automated testing environment.

### Phase 5 — Evaluation and Expansion

- Execute identical instructions against all interfaces.
- Measure task completion and configuration accuracy.
- Identify terminology and workflow-related failure patterns.
- Introduce more interface variations.
- Expand the canonical configuration schema.

**Deliverable:** An evaluation dataset and benchmark environment for LLM-based router UI abstraction.

---

## 9. Additional Considerations

### 9.1 State Isolation

Each router must maintain independent configuration state. Changes to one router must never modify another router's configuration.

### 9.2 Reproducibility

Every router should support resetting to a predefined initial state. This ensures that test scenarios can be repeated under consistent conditions.

### 9.3 Interface Realism

Interfaces should reproduce realistic administration behavior, including:

- Loading indicators.
- Form validation.
- Save confirmation.
- Configuration application delays.
- Session timeouts.
- Reboot-required notifications.
- Error messages.

These behaviors provide more realistic conditions for evaluating browser-based automation.

### 9.4 Browser Automation Compatibility

The interfaces should use conventional HTML elements and browser-accessible interactions.

Avoid making critical controls dependent exclusively on canvas rendering or custom graphical interactions.

However, the interfaces should not expose canonical backend property names through labels, DOM attributes, or other artificial shortcuts that would make the abstraction task trivial.

### 9.5 Security and Safety

Although the platform is a simulation, it should follow basic security practices:

- Restrict the server to simulated router operations.
- Never execute shell commands from configuration requests.
- Validate and sanitize incoming data.
- Avoid exposing sensitive state through public endpoints.
- Keep the simulation isolated from real router administration.
- Use synthetic credentials and network configurations.

---

## 10. Expected Outcome

The completed platform will provide a controlled environment for testing LLM-powered router administration systems.

Multiple simulated router interfaces will expose different terminology, navigation structures, and configuration workflows while operating on standardized backend configurations.

This will make it possible to evaluate whether an LLM can:

1. Understand high-level network administration instructions.
2. Identify equivalent functionality across different router manufacturers.
3. Navigate unfamiliar router administration interfaces.
4. Execute the correct configuration workflow.
5. Verify that the requested changes were successfully applied.

Ultimately, the platform will serve as the testing foundation for developing a manufacturer-independent router administration abstraction system.