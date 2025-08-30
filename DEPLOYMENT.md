# KSEF Judging Platform - Netlify Deployment Guide

## Prerequisites

1. A GitHub repository with this code
2. A Netlify account
3. Environment variables configured in Netlify

## Deployment Steps

### 1. Environment Variables Setup

In your Netlify dashboard, go to Site Settings > Environment Variables and add:

```
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 2. Build Settings

Netlify should automatically detect the build settings, but you can manually configure:

- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: 18.x or higher

### 3. Automatic Deployment

1. Connect your GitHub repository to Netlify
2. Netlify will automatically build and deploy on every push to main branch
3. The `_redirects` file in the `public` folder will handle SPA routing

## Build Configuration

The following files have been optimized for production deployment:

### `package.json`
- Added proper React TypeScript types
- Added Vite React plugin
- Organized dependencies correctly

### `vite.config.ts`
- Configured React plugin
- Set up environment variable injection
- Optimized build settings with code splitting
- Configured chunk splitting for better caching

### `index.html`
- Removed problematic CDN imports
- Kept essential external dependencies (Tailwind, jsPDF)
- Optimized for production builds

### `public/_redirects`
- Configured for SPA routing on Netlify
- All routes redirect to index.html

## Important Notes

1. **Environment Variables**: Make sure to set `GEMINI_API_KEY` in Netlify's environment variables
2. **Build Time**: The app is configured to use npm dependencies instead of CDN imports for better reliability
3. **Routing**: The `_redirects` file ensures that all routes work correctly in production
4. **Performance**: Code splitting is configured to optimize loading times

## Troubleshooting

### Build Fails
- Ensure all environment variables are set in Netlify
- Check that Node.js version is 18.x or higher
- Verify that all dependencies are installed

### Runtime Errors
- Check browser console for specific errors
- Verify Supabase connection and API keys
- Ensure all external dependencies are loading correctly

### CDN Issues
- External dependencies (Tailwind, jsPDF) are loaded from reliable CDNs
- React and other core dependencies are bundled during build

## Production Optimizations

- **Code Splitting**: Vendor, Supabase, and charts are split into separate chunks
- **Tree Shaking**: Unused code is removed during build
- **Asset Optimization**: Images and other assets are optimized
- **Caching**: Proper cache headers for static assets

## Security

- API keys are properly configured as environment variables
- Supabase keys are handled securely
- No sensitive information is exposed in the client bundle