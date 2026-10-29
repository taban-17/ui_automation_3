import { Page, APIRequestContext, expect } from "@playwright/test";
import { RouterState } from "../../../router_ui_server/src/shared/types/router-state";
import { resetRouter, getState } from "./router-api";

export interface UIScenario {
  router: string;
  instruction: string;
  drive: (page: Page) => Promise<void>;
  expected: (state: RouterState) => void;
}

export async function runUIScenario(
  page: Page,
  request: APIRequestContext,
  scenario: UIScenario
): Promise<void> {
  const log = (msg: string) => console.log(`[${scenario.router}] ${msg}`);

  log(`reset`);
  await resetRouter(request, scenario.router);

  log(`drive: ${scenario.instruction}`);
  await scenario.drive(page);

  log(`verify persisted state`);
  const state = await getState(request, scenario.router);
  try {
    scenario.expected(state);
  } catch (e) {
    console.error(
      `State after scenario (${scenario.router}):`,
      JSON.stringify(state, null, 2)
    );
    throw e;
  }
}