# Custom Domain Setup for GitHub Pages

This guide explains how to configure a custom domain for your GitHub Pages site according to [GitHub's documentation](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site).

## Quick Setup Steps

### 1. Add Your Domain to GitHub

1. Go to your repository: https://github.com/foxy155/captcha_game
2. Click **Settings** → **Pages** (in the left sidebar)
3. Under **Custom domain**, enter your domain (e.g., `captcha.example.com` or `www.example.com`)
4. Click **Save**

### 2. Update the CNAME File

1. Edit the `CNAME` file in the root of this repository
2. Replace the content with your custom domain (one domain per line)
3. Example: `captcha.example.com`
4. Commit and push the changes

### 3. Configure DNS Records

#### For Subdomain (e.g., captcha.example.com):
- **Type**: CNAME
- **Name**: `captcha` (or `www` for www.example.com)
- **Value**: `foxy155.github.io`
- **TTL**: 3600 (or default)

#### For Apex Domain (e.g., example.com):
- **Type**: A
- **Name**: `@` (or root)
- **Value**: GitHub Pages IP addresses:
  - `185.199.108.153`
  - `185.199.109.153`
  - `185.199.110.153`
  - `185.199.111.153`
- **TTL**: 3600 (or default)

### 4. Enable HTTPS (Automatic)

GitHub will automatically provision an SSL certificate for your custom domain once DNS is configured correctly. This may take a few minutes to a few hours.

### 5. Enforce HTTPS (Optional)

1. In repository **Settings** → **Pages**
2. Check **Enforce HTTPS** (available after SSL certificate is issued)

## Verification

After setting up DNS, GitHub will verify your domain. You can check the status in:
- Repository **Settings** → **Pages** → **Custom domain** section

## Troubleshooting

- **DNS not propagating**: Wait 24-48 hours for DNS changes to propagate globally
- **HTTPS not working**: Wait for GitHub to provision the SSL certificate (can take up to 24 hours)
- **Domain not verified**: Ensure DNS records are correct and propagated

## Current Default URL

Your site is currently available at: `https://foxy155.github.io/captcha_game`

After setting up a custom domain, both URLs will work, but the custom domain will be the primary one.
