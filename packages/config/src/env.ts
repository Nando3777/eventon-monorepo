import { z } from 'zod';

type Booleanish = boolean | string;

const booleanish = z
  .union([z.boolean(), z.string()])
  .transform((value: Booleanish, ctx): boolean => {
    if (typeof value === 'boolean') {
      return value;
    }

    const normalised = value.trim().toLowerCase();
    if (["1", "true", "yes", "y", "on"].includes(normalised)) {
      return true;
    }
    if (["0", "false", "no", "n", "off", ""].includes(normalised)) {
      return false;
    }

    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Value \"${value}\" is not a recognised boolean flag`,
    });
    return z.NEVER;
  });

const port = z.coerce.number().int().min(0).max(65535);

const baseSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_REGION: z.string().min(2).default("eu-west-2"),
  CONFIG_DIAG: booleanish.optional().transform((value) => value ?? false),
});

const webSchema = z.object({
  WEB_PORT: port.default(3000),
  NEXT_PUBLIC_CORE_API_URL: z.string().url().default("http://localhost:4000"),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1).default("pk_test_change_me"),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  NEXTAUTH_URL: z.string().url().default("http://localhost:3000"),
  NEXTAUTH_SECRET: z.string().min(10).default("dev-nextauth-secret"),
});

const coreApiSchema = z.object({
  CORE_API_PORT: port.default(4000),
  DATABASE_URL: z.string().url().default("postgres://postgres:postgres@localhost:5432/eventon"),
  REDIS_URL: z.string().url().default("redis://localhost:6379"),
  JWT_SECRET: z.string().min(10).default("dev-jwt-secret"),
  STRIPE_SECRET_KEY: z.string().min(1).default("sk_test_change_me"),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).default("whsec_dev_change_me"),
  AWS_ACCESS_KEY_ID: z.string().min(1).default("FAKEAWSACCESSKEY"),
  AWS_SECRET_ACCESS_KEY: z.string().min(1).default("fake-aws-secret-key"),
  AWS_S3_BUCKET: z.string().min(1).default("eventon-dev-files"),
  EMAIL_FROM_ADDRESS: z.string().email().default("no-reply@example.com"),
  SQS_QUEUE_URL: z
    .string()
    .url()
    .default("https://sqs.eu-west-2.amazonaws.com/123456789012/eventon-dev-queue"),
});

const schedulerSchema = z.object({
  SCHEDULER_CRON: z.string().min(1).default("*/5 * * * *"),
  SCHEDULER_TIMEZONE: z.string().min(1).default("Europe/London"),
  CORE_API_INTERNAL_URL: z.string().url().default("http://localhost:4000/internal"),
  SCHEDULER_SQS_QUEUE_URL: z
    .string()
    .url()
    .default("https://sqs.eu-west-2.amazonaws.com/123456789012/eventon-scheduler-queue"),
  SCHEDULER_MAX_CONCURRENCY: z.coerce.number().int().min(1).default(5),
});

const appSchemas = {
  web: baseSchema.merge(webSchema),
  'core-api': baseSchema.merge(coreApiSchema),
  scheduler: baseSchema.merge(schedulerSchema),
} as const;

type BaseEnv = z.infer<typeof baseSchema>;
export type App = keyof typeof appSchemas;
type AppConfigMap = {
  [Key in App]: z.infer<(typeof appSchemas)[Key]>;
};

const baseEnv = baseSchema.parse(process.env);

if (baseEnv.CONFIG_DIAG) {
  logEnvSummary(baseEnv);
}

const envCache = new Map<App, AppConfigMap[App]>();

export const isDev = baseEnv.NODE_ENV === 'development';
export const isProd = baseEnv.NODE_ENV === 'production';
export const region = baseEnv.APP_REGION;

export function getEnv<AppName extends App>(app: AppName): AppConfigMap[AppName] {
  const cached = envCache.get(app);
  if (cached) {
    return cached as AppConfigMap[AppName];
  }

  const parsed = appSchemas[app].parse(process.env);
  envCache.set(app, parsed);
  return parsed as AppConfigMap[AppName];
}

const baseKeys = new Set(Object.keys(baseSchema.shape));
const appSpecificKeys: Record<App, string[]> = {
  web: Object.keys(webSchema.shape),
  'core-api': Object.keys(coreApiSchema.shape),
  scheduler: Object.keys(schedulerSchema.shape),
};

const PUBLIC_PREFIXES = ['NEXT_PUBLIC_'];
const ALWAYS_PUBLIC_KEYS = new Set([
  'NODE_ENV',
  'APP_REGION',
  'CONFIG_DIAG',
  'WEB_PORT',
  'CORE_API_PORT',
  'SCHEDULER_CRON',
  'SCHEDULER_TIMEZONE',
  'SCHEDULER_MAX_CONCURRENCY',
  'CORE_API_INTERNAL_URL',
  'SQS_QUEUE_URL',
  'SCHEDULER_SQS_QUEUE_URL',
  'EMAIL_FROM_ADDRESS',
  'AWS_S3_BUCKET',
]);
const ALWAYS_REDACT_KEYS = new Set([
  'DATABASE_URL',
  'REDIS_URL',
  'JWT_SECRET',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'NEXTAUTH_SECRET',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
]);
const SENSITIVE_PATTERN = /(SECRET|PASSWORD|TOKEN|PRIVATE|ACCESS_KEY|DATABASE|REDIS|JWT)/i;

function isPublicKey(key: string): boolean {
  return PUBLIC_PREFIXES.some((prefix) => key.startsWith(prefix)) || ALWAYS_PUBLIC_KEYS.has(key);
}

function shouldRedact(key: string): boolean {
  if (isPublicKey(key)) {
    return false;
  }
  if (ALWAYS_REDACT_KEYS.has(key)) {
    return true;
  }
  return SENSITIVE_PATTERN.test(key);
}

function renderValue(key: string, raw: unknown): string {
  if (raw === undefined || raw === null) {
    return '<unset>';
  }

  if (shouldRedact(key)) {
    return '<redacted>';
  }

  const value = String(raw);
  return value === '' ? '""' : value;
}

function logEnvSummary(currentBase: BaseEnv): void {
  console.info('[config] Environment summary (redacted)');
  for (const key of baseKeys) {
    const value = (currentBase as Record<string, unknown>)[key];
    console.info(`[config]   ${key}=${renderValue(key, value)}`);
  }

  for (const appName of Object.keys(appSchemas) as App[]) {
    const parsed = appSchemas[appName].safeParse(process.env);
    if (!parsed.success) {
      const reason = parsed.error.issues
        .map((issue) => issue.message)
        .join('; ');
      console.warn(`[config]   [${appName}] configuration invalid: ${reason}`);
      continue;
    }

    console.info(`[config]   [${appName}] configuration`);
    for (const key of appSpecificKeys[appName]) {
      if (baseKeys.has(key)) {
        continue;
      }
      const value = (parsed.data as Record<string, unknown>)[key];
      console.info(`[config]     ${key}=${renderValue(key, value)}`);
    }
  }
}
