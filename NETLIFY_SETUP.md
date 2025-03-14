# Setting Up Netlify Deployment with GitHub Actions

This guide will help you set up automatic deployments to Netlify using GitHub Actions.

## Prerequisites

1. A Netlify account
2. A GitHub repository with your code
3. Admin access to both Netlify and GitHub

## Step 1: Create a Netlify Site

1. Log in to your Netlify account
2. Click "New site from Git"
3. Choose GitHub as your Git provider
4. Select your repository
5. Configure the build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click "Deploy site"

## Step 2: Get Your Netlify API Token

1. Go to your Netlify user settings (click your avatar, then "User settings")
2. Click "Applications"
3. Under "Personal access tokens", click "New access token"
4. Give it a name like "GitHub Actions"
5. Copy the generated token - you'll need it in the next step

## Step 3: Get Your Netlify Site ID

1. Go to your site settings in Netlify
2. Your Site ID is shown under "Site information" (it looks like a random string)

## Step 4: Add Secrets to GitHub

1. Go to your GitHub repository
2. Click "Settings" > "Secrets and variables" > "Actions"
3. Click "New repository secret"
4. Add the following secrets:
   - Name: `NETLIFY_AUTH_TOKEN`
   - Value: [Your Netlify access token from Step 2]
5. Click "Add secret"
6. Add another secret:
   - Name: `NETLIFY_SITE_ID`
   - Value: [Your Netlify Site ID from Step 3]

## Step 5: Configure Subdomain for Staging

1. In your Netlify site settings, go to "Domain management"
2. Under "Custom domains", click "Add custom domain"
3. Enter "demo.equitywiz.io" and click "Verify"
4. Follow the instructions to configure your DNS settings

## Troubleshooting

If your deployments aren't working:

1. Check the GitHub Actions logs for errors
2. Verify that your secrets are correctly set up
3. Make sure your build script is working locally
4. Check that your Netlify site is correctly configured 