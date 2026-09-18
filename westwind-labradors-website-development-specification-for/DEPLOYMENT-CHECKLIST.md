# Westwind Labradors — Before Deployment

## Content still needed
- Oakley and Kobee photographs; photo alt text should be reviewed with the final images.
- Oakley and Kobee pedigree information, Kobee health testing, and any verified registration details.
- Sire information, expected litter timing, and post-birth puppy details.
- About-us story, how dogs live, puppy-raising and socialization details.
- Puppy pricing, final contract/policies, and social links if applicable.
- Replace the privacy-policy placeholder with a policy reflecting actual practices.

## Technical configuration
- Choose hosting (this project includes Netlify configuration), connect the domain, and configure DNS.
- Set `RESEND_API_KEY`, `APPLICATION_RECIPIENT`, and `APPLICATION_FROM` as encrypted production environment variables. Never commit them.
- Verify the email sender domain with the chosen email service.
- Configure HTTPS and ensure `www` redirects to `https://westwindlabradors.com`.
- Add production spam protection/rate limiting suitable for the selected host.

## Testing before launch
- Test desktop, tablet, mobile, zoom, and increased text size.
- Test all keyboard navigation, focus states, mobile navigation, form validation, and successful email delivery.
- Run automated accessibility checks; manually review heading hierarchy, image alt text, color contrast, and a screen-reader flow where possible.
- Review SEO titles/descriptions, canonical URL, sitemap, structured data, robots file, broken links, and page performance.
- Do not claim legal ADA compliance without appropriate professional review.
