Billing country restriction
Technical approach
Shopify checkout always lists every country in the Billing country menu. Apps cannot remove those options. The restriction is a cart and checkout validation (a Shopify Function) that runs on Shopify’s servers during checkout.

The allowed country is the country on the store address. It is not written into the code. When a merchant saves the app, that country and the checkout message are stored as configuration on the checkout rule. If the store address later changes, the app updates that configuration automatically.

At checkout, the function compares the billing country with the saved store country. If they differ, checkout stops and the message is shown on the Billing country field. If the rule is turned off, the function allows any billing country. No code change is required to switch it off.

What was delivered
Item	What it does
App: Billing Country Restrictor
Merchant screen to turn the restriction on or off and edit the checkout message
Checkout rule: Billing country restriction
Server-side check during checkout, including express checkouts
Store address sync
Allowed country follows the store address and updates when that address changes
Shipping country is unchanged. Only the billing country is checked.

Steps after the app is installed
In Shopify admin, install Billing Country Restrictor and approve access to checkout validations.
Go to Settings → Store details and confirm the store address country is the country the store operates in. That country is the only billing country checkout will accept.
Open Billing Country Restrictor from the Apps list.
Check the banner. It should show the store country, for example United Kingdom (GB).
Turn Restrict billing country on.
Review Checkout message. {country} is replaced with the store country name. The default message is: Billing country must be {country}. Choose {country} to continue.
Click Save. The checkout rule is created and turned on.
Place a test order:
Choose a billing country that is not the store country. Checkout must stop, and the message must appear on Billing country.
Change the billing country to the store country. Checkout must continue.
Turn the restriction off
Either option stops the check immediately. No development work is required.

In the app, turn Restrict billing country off and click Save.
Or go to Settings → Checkout → Checkout rules, open Billing country restriction, and deactivate it.
Turn it back on from the app with the switch and Save, or by activating the same checkout rule.

If the store country changes
Update the country under Settings → Store details.
The app picks up the new country from that address.
Open the app once and confirm the banner shows the new country.
Repeat the checkout test with the new country.
The restriction cannot be turned on until a country is set on the store address.

What the customer sees
The Billing country list still shows every country. Checkout does not continue until the customer selects the store’s country. The configured message is shown on that field.
