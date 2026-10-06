import "@shopify/ui-extensions/preact";
import { render } from "preact";
import { useState } from "preact/hooks";

const METAFIELD_NAMESPACE = "$app:billing-country";
const METAFIELD_KEY = "configuration";

const DEFAULT_ERROR_MESSAGE =
  "Billing country must be {country}. Choose {country} to continue.";

export default async () => {
  const existingDefinition = await getMetafieldDefinition();
  if (!existingDefinition) {
    const metafieldDefinition = await createMetafieldDefinition();
    if (!metafieldDefinition) {
      throw new Error("Failed to create metafield definition");
    }
  }

  const shopCountry = await getShopCountry();
  const saved = readSavedConfiguration();
  const configuration = {
    enabled: saved?.enabled ?? true,
    countryCode: shopCountry.countryCode || saved?.countryCode || "",
    countryName: shopCountry.countryName || saved?.countryName || "",
    errorMessage: saved?.errorMessage || DEFAULT_ERROR_MESSAGE,
  };

  render(<Extension configuration={configuration} />, document.body);
};

function Extension({ configuration }) {
  const [enabled, setEnabled] = useState(configuration.enabled);
  const [errorMessage, setErrorMessage] = useState(configuration.errorMessage);
  const [errors, setErrors] = useState([]);

  const settings = () => ({
    enabled,
    countryCode: configuration.countryCode,
    countryName: configuration.countryName,
    errorMessage: errorMessage.trim() || DEFAULT_ERROR_MESSAGE,
  });

  const applyMetafieldUpdate = async (nextSettings) => {
    if (nextSettings.enabled && !nextSettings.countryCode) {
      const message =
        "Add a country to this store's address before turning the restriction on. Shopify uses that address as the allowed billing country.";
      setErrors([message]);
      throw new Error(message);
    }

    setErrors([]);
    const result = await shopify.applyMetafieldChange({
      type: "updateMetafield",
      namespace: METAFIELD_NAMESPACE,
      key: METAFIELD_KEY,
      value: JSON.stringify(nextSettings),
      valueType: "json",
    });

    if (result.type === "error") {
      setErrors([result.message]);
    }
  };

  const countryLabel = configuration.countryName
    ? `${configuration.countryName} (${configuration.countryCode})`
    : "Not set";

  return (
    <s-function-settings
      onSubmit={(event) => event.waitUntil(applyMetafieldUpdate(settings()))}
    >
      <s-stack gap="base">
        <ErrorBanner errors={errors} />
        {configuration.countryCode ? (
          <s-banner tone="info" heading={`Store country: ${countryLabel}`}>
            Checkout accepts a billing country only when it matches this store
            address. The country is read from Shopify when you save, so it is
            not fixed in the function.
          </s-banner>
        ) : (
          <s-banner tone="warning" heading="Store country is missing">
            Open Settings, then Store details, and add the country this store
            operates in. Save this rule again after that country is set.
          </s-banner>
        )}
        <s-switch
          label="Restrict billing country"
          name="enabled"
          checked={enabled}
          details="Turn this off and save to allow any billing country. You can also deactivate this checkout rule."
          onChange={(event) => setEnabled(event.currentTarget.checked)}
        />
        <s-text-field
          label="Checkout message"
          name="errorMessage"
          value={errorMessage}
          details="Shown on the Billing country field. Use {country} for the store country name."
          onChange={(event) => setErrorMessage(event.currentTarget.value)}
        />
        <s-text tone="neutral">
          Shopify still lists every country in the Billing country menu. This
          rule cannot remove those options. It stops checkout until the
          customer selects the store country.
        </s-text>
      </s-stack>
    </s-function-settings>
  );
}

function ErrorBanner({ errors }) {
  if (errors.length === 0) return null;
  return (
    <s-stack gap="base">
      {errors.map((error, index) => (
        <s-banner key={index} heading="Error" tone="critical">
          {error}
        </s-banner>
      ))}
    </s-stack>
  );
}

function readSavedConfiguration() {
  const metafield = shopify.data.validation?.metafields?.find(
    (field) => field.key === METAFIELD_KEY,
  );
  if (!metafield?.value) return null;

  try {
    return JSON.parse(metafield.value);
  } catch {
    return null;
  }
}

async function getShopCountry() {
  const query = `#graphql
    query ShopOperatingCountry {
      shop {
        billingAddress {
          country
          countryCodeV2
        }
      }
    }
  `;

  const result = await shopify.query(query);
  const address = queryData(result)?.shop?.billingAddress;

  return {
    countryCode: address?.countryCodeV2 || "",
    countryName: address?.country || "",
  };
}

async function getMetafieldDefinition() {
  const query = `#graphql
    query GetMetafieldDefinition {
      metafieldDefinitions(first: 1, ownerType: VALIDATION, namespace: "${METAFIELD_NAMESPACE}", key: "${METAFIELD_KEY}") {
        nodes {
          id
        }
      }
    }
  `;

  const result = await shopify.query(query);
  return queryData(result)?.metafieldDefinitions?.nodes[0];
}

async function createMetafieldDefinition() {
  const definition = {
    access: {
      admin: "MERCHANT_READ_WRITE",
    },
    key: METAFIELD_KEY,
    name: "Billing country configuration",
    namespace: METAFIELD_NAMESPACE,
    ownerType: "VALIDATION",
    type: "json",
  };

  const query = `#graphql
    mutation CreateMetafieldDefinition($definition: MetafieldDefinitionInput!) {
      metafieldDefinitionCreate(definition: $definition) {
        createdDefinition {
          id
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const result = await shopify.query(query, { variables: { definition } });
  const payload = queryData(result)?.metafieldDefinitionCreate;
  if (payload?.createdDefinition) return payload.createdDefinition;

  const messages = (payload?.userErrors ?? [])
    .map((error) => error.message)
    .join(" ");
  if (/already exists|in use|taken/i.test(messages)) {
    return { id: "existing" };
  }

  return null;
}

/**
 * @param {unknown} result
 */
function queryData(result) {
  if (!result || typeof result !== "object" || !("data" in result)) return null;
  return /** @type {any} */ (result).data;
}
