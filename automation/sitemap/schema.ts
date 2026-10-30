export type ElementKind =
  | "button"
  | "input"
  | "link"
  | "select"
  | "checkbox"
  | "radio";

export interface InteractiveElement {
  kind: ElementKind;
  text: string;           // label text for inputs, visible text for buttons/links
  value?: string;         // current value for inputs (also used for selects)
  xpath: string;
  selector: string;
  inputType?: "text" | "password" | "number" | "email";
  placeholder?: string;
  href?: string;
  ariaLabel?: string;
}

export interface NavigationLink {
  elementText: string;
  targetUrl: string;
}

export interface FieldMapping {
  elementText: string;
  canonicalPath: string;
}

export interface PageMap {
  pageId: string;
  router: string;
  url: string;
  title: string;
  headings: string[];
  elements: InteractiveElement[];
  navigation: NavigationLink[];
  fields: FieldMapping[];
}

export interface RouterSitemap {
  router: string;
  entryPageId: string;
  entryUrl: string;
  pages: PageMap[];
}

export interface Sitemap {
  version: string;
  generatedAt: string;
  baseUrl: string;
  routers: Record<string, RouterSitemap>;
}