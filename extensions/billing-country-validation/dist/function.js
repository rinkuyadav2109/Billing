// node_modules/@shopify/shopify_function/run.ts
function run_default(userfunction) {
  try {
    ShopifyFunction;
  } catch (e) {
    throw new Error(
      "ShopifyFunction is not defined. Please rebuild your function using the latest version of Shopify CLI."
    );
  }
  const input_obj = ShopifyFunction.readInput();
  const output_obj = userfunction(input_obj);
  ShopifyFunction.writeOutput(output_obj);
}

// extensions/billing-country-validation/src/cart_validations_generate_run.js
function cartValidationsGenerateRun(input) {
  const errors = [];
  const config = readConfig(input.validation?.metafield?.jsonValue);
  const billingCountry = input.cart.billingAddress?.countryCode ?? null;
  if (config?.enabled === true && config.countryCode && billingCountry && String(billingCountry).toUpperCase() !== config.countryCode.toUpperCase()) {
    errors.push({
      message: formatMessage(config),
      target: "$.cart.billingAddress.countryCode"
    });
  }
  return {
    operations: [
      {
        validationAdd: {
          errors
        }
      }
    ]
  };
}
function readConfig(value) {
  const parsed = typeof value === "string" ? safeParse(value) : value;
  if (!parsed || typeof parsed !== "object") return null;
  const config = (
    /** @type {Record<string, unknown>} */
    parsed
  );
  return {
    enabled: config.enabled === true,
    countryCode: typeof config.countryCode === "string" ? config.countryCode : "",
    countryName: typeof config.countryName === "string" ? config.countryName : "",
    errorMessage: typeof config.errorMessage === "string" ? config.errorMessage : ""
  };
}
function safeParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}
function formatMessage(config) {
  const label = config.countryName || config.countryCode;
  const template = config.errorMessage.trim();
  if (template.includes("{country}")) {
    return template.split("{country}").join(label);
  }
  if (template) return template;
  return `Billing country must be ${label}. Choose ${label} to continue.`;
}

// <stdin>
function cartValidationsGenerateRun2() {
  return run_default(cartValidationsGenerateRun);
}
export {
  cartValidationsGenerateRun2 as cartValidationsGenerateRun
};
