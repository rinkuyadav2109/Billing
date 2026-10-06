// @ts-check

/**
 * @typedef {import("../generated/api").CartValidationsGenerateRunInput} CartValidationsGenerateRunInput
 * @typedef {import("../generated/api").CartValidationsGenerateRunResult} CartValidationsGenerateRunResult
 */

/**
 * Cart and checkout validation for the billing country.
 * The allowed country comes from the validation metafield, which the app
 * fills from the store address. Nothing in this function is a fixed country.
 * Turning the checkout rule off, or saving enabled: false, skips the check.
 *
 * @param {CartValidationsGenerateRunInput} input
 * @returns {CartValidationsGenerateRunResult}
 */
export function cartValidationsGenerateRun(input) {
  const errors = [];
  const config = readConfig(input.validation?.metafield?.jsonValue);
  const billingCountry = input.cart.billingAddress?.countryCode ?? null;

  if (
    config?.enabled === true &&
    config.countryCode &&
    billingCountry &&
    String(billingCountry).toUpperCase() !== config.countryCode.toUpperCase()
  ) {
    errors.push({
      message: formatMessage(config),
      target: "$.cart.billingAddress.countryCode",
    });
  }

  return {
    operations: [
      {
        validationAdd: {
          errors,
        },
      },
    ],
  };
}

/**
 * @param {unknown} value
 * @returns {{ enabled: boolean, countryCode: string, countryName: string, errorMessage: string } | null}
 */
function readConfig(value) {
  const parsed = typeof value === "string" ? safeParse(value) : value;
  if (!parsed || typeof parsed !== "object") return null;

  const config = /** @type {Record<string, unknown>} */ (parsed);
  return {
    enabled: config.enabled === true,
    countryCode: typeof config.countryCode === "string" ? config.countryCode : "",
    countryName: typeof config.countryName === "string" ? config.countryName : "",
    errorMessage:
      typeof config.errorMessage === "string" ? config.errorMessage : "",
  };
}

/**
 * @param {string} value
 */
function safeParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

/**
 * @param {{ countryCode: string, countryName: string, errorMessage: string }} config
 */
function formatMessage(config) {
  const label = config.countryName || config.countryCode;
  const template = config.errorMessage.trim();
  if (template.includes("{country}")) {
    return template.split("{country}").join(label);
  }
  if (template) return template;
  return `Billing country must be ${label}. Choose ${label} to continue.`;
}
