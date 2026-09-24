/** Terminal I/O for the CLI: @clack/prompts when interactive, flags/defaults otherwise. */
import * as clack from "@clack/prompts";

export interface IO {
  interactive: boolean;
  yes: boolean;
  intro(title: string): void;
  outro(text: string): void;
  info(text: string): void;
  success(text: string): void;
  warn(text: string): void;
  error(text: string): void;
  step(text: string): void;
  note(text: string, title?: string): void;
  confirm(message: string, initial?: boolean): Promise<boolean>;
  select<T extends string>(message: string, options: { value: T; label: string; hint?: string }[], initial?: T): Promise<T>;
  multiselect<T extends string>(message: string, options: { value: T; label: string; hint?: string }[], initial: T[]): Promise<T[]>;
  password(message: string, validate?: (value: string) => string | undefined): Promise<string>;
  text(message: string, options?: { placeholder?: string; initial?: string; validate?: (value: string) => string | undefined }): Promise<string>;
  spin<T>(label: string, work: () => Promise<T>): Promise<T>;
}

export class CancelledError extends Error {
  constructor() {
    super("Cancelled.");
  }
}

function unwrap<T>(value: unknown): T {
  if (clack.isCancel(value)) throw new CancelledError();
  return value as T;
}

/** Interactive terminal IO (stdin and stdout are TTYs). */
export function terminalIO(options: { yes?: boolean } = {}): IO {
  const interactive = Boolean(process.stdin.isTTY && process.stdout.isTTY) && !process.env.CI;
  const yes = Boolean(options.yes);
  const noPrompt = (message: string) => new Error(`${message} (not a terminal — pass the answer as a flag, or --yes to accept defaults)`);
  return {
    interactive,
    yes,
    intro: (title) => clack.intro(title),
    outro: (text) => clack.outro(text),
    info: (text) => clack.log.info(text),
    success: (text) => clack.log.success(text),
    warn: (text) => clack.log.warn(text),
    error: (text) => clack.log.error(text),
    step: (text) => clack.log.step(text),
    note: (text, title) => clack.note(text, title),
    async confirm(message, initial = true) {
      if (yes) return true;
      if (!interactive) return initial;
      return unwrap<boolean>(await clack.confirm({ message, initialValue: initial }));
    },
    async select(message, options, initial) {
      if (yes || !interactive) {
        const fallback = initial ?? options[0]?.value;
        if (fallback === undefined) throw noPrompt(message);
        return fallback;
      }
      return unwrap(await clack.select({ message, options: options as never, initialValue: initial as never })) as never;
    },
    async multiselect(message, options, initial) {
      if (yes || !interactive) return initial;
      return unwrap(await clack.multiselect({ message, options: options as never, initialValues: initial as never, required: false })) as never;
    },
    async password(message, validate) {
      if (!interactive) throw noPrompt(message);
      return unwrap<string>(await clack.password({ message, validate: validate as never }));
    },
    async text(message, opts = {}) {
      if (yes || !interactive) {
        if (opts.initial !== undefined) return opts.initial;
        throw noPrompt(message);
      }
      return unwrap<string>(await clack.text({ message, placeholder: opts.placeholder, initialValue: opts.initial, validate: opts.validate as never }));
    },
    async spin(label, work) {
      if (!interactive) return work();
      const s = clack.spinner();
      s.start(label);
      try {
        const result = await work();
        s.stop(label);
        return result;
      } catch (err) {
        s.error(`${label} — failed`);
        throw err;
      }
    },
  };
}

/** Scripted IO for tests: records output, answers from a queue. */
export function scriptedIO(answers: unknown[] = [], options: { yes?: boolean } = {}): IO & { lines: string[] } {
  const lines: string[] = [];
  const next = <T>(fallback: T): T => (answers.length ? (answers.shift() as T) : fallback);
  return {
    lines,
    interactive: true,
    yes: Boolean(options.yes),
    intro: (t) => lines.push(`intro: ${t}`),
    outro: (t) => lines.push(`outro: ${t}`),
    info: (t) => lines.push(`info: ${t}`),
    success: (t) => lines.push(`success: ${t}`),
    warn: (t) => lines.push(`warn: ${t}`),
    error: (t) => lines.push(`error: ${t}`),
    step: (t) => lines.push(`step: ${t}`),
    note: (t, title) => lines.push(`note${title ? ` (${title})` : ""}: ${t}`),
    confirm: async (_m, initial = true) => (options.yes ? true : next(initial)),
    select: async (_m, opts, initial) => next(initial ?? opts[0].value),
    multiselect: async (_m, _o, initial) => next(initial),
    password: async () => next(""),
    text: async (_m, opts = {}) => next(opts.initial ?? ""),
    spin: (_l, work) => work(),
  };
}
