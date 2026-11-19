# Pointing gluterepair.com to the site

Checked 11/19/2026. The domain uses Squarespace DNS. Its main address still points to Squarespace's four default addresses (198.49.23.144, 198.49.23.145, 198.185.159.144, 198.185.159.145), and there is no www record yet.

## 1. Vercel dashboard (about a minute)

1. Open the gluterepair project, then Settings, then Domains.
2. Add `gluterepair.com`. Choose to connect it to Production.
3. Add `www.gluterepair.com` and set it to redirect to `gluterepair.com` (permanent, 308).
4. Vercel then shows the DNS values for each one. Use the values it shows if they differ from step 2 below.

## 2. Squarespace DNS (Domains, gluterepair.com, DNS settings)

1. Delete the four Squarespace A records for `@` (the addresses listed above). If the Squarespace Defaults preset is turned on, remove the preset.
2. Add one record: type A, host `@`, value `216.150.1.1` (Vercel's current recommendation; `76.76.21.21` also works).
3. Add one record: type CNAME, host `www`, value `ba8ff5a8822df822.vercel-dns-016.com` (or `cname.vercel-dns.com`).
4. Leave any MX (email) records as they are.

## 3. After the change

DNS changes usually take effect within an hour, sometimes up to 48 hours. Vercel issues the security certificate on its own once the records are found. When the Domains page shows both domains as valid, tell Claude, and it will check that the site, the redirect from www, and the QR codes all open the live site.
