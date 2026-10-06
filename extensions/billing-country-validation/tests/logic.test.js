import assert from "node:assert/strict";
import test from "node:test";
import { cartValidationsGenerateRun } from "../src/cart_validations_generate_run.js";

const config = {
  enabled: true,
  countryCode: "GB",
  countryName: "United Kingdom",
  errorMessage:
    "Billing country must be {country}. Choose {country} to continue.",
};

test("allows the store billing country", () => {
  const result = cartValidationsGenerateRun({
    cart: { billingAddress: { countryCode: "GB" } },
    validation: { metafield: { jsonValue: config } },
  });

  assert.deepEqual(result.operations[0].validationAdd.errors, []);
});

test("blocks a different billing country on the country field", () => {
  const result = cartValidationsGenerateRun({
    cart: { billingAddress: { countryCode: "US" } },
    validation: { metafield: { jsonValue: config } },
  });

  assert.deepEqual(result.operations[0].validationAdd.errors, [
    {
      message:
        "Billing country must be United Kingdom. Choose United Kingdom to continue.",
      target: "$.cart.billingAddress.countryCode",
    },
  ]);
});

test("does nothing when the restriction is turned off", () => {
  const result = cartValidationsGenerateRun({
    cart: { billingAddress: { countryCode: "US" } },
    validation: {
      metafield: { jsonValue: { ...config, enabled: false } },
    },
  });

  assert.deepEqual(result.operations[0].validationAdd.errors, []);
});

test("does nothing before a billing country is chosen", () => {
  const result = cartValidationsGenerateRun({
    cart: { billingAddress: null },
    validation: { metafield: { jsonValue: config } },
  });

  assert.deepEqual(result.operations[0].validationAdd.errors, []);
});

test("does nothing when the rule has not been configured", () => {
  const result = cartValidationsGenerateRun({
    cart: { billingAddress: { countryCode: "US" } },
    validation: { metafield: null },
  });

  assert.deepEqual(result.operations[0].validationAdd.errors, []);
});
