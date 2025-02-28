# Supabase Edge Functions Guide

## Prerequisites

- Supabase CLI installed (`npm install -g supabase`)
- Deno installed (required for Edge Functions)

## Local Development

### Start Supabase Local Instance

```bash
supabase start
```

### Create a New Edge Function

```bash
supabase functions new my-function-name
```

### Start Edge Functions

```bash
supabase start
```

### Stop Edge Functions

```bash
supabase stop
```

## Deployment

### Deploy All Functions

```bash
supabase functions deploy
```

### Deploy Specific Function

```bash
supabase functions deploy my-function-name
```

## Testing

### Test Locally

```bash
# POST request
curl -i --location --request POST 'localhost:54321/functions/v1/my-function-name' \
    --header 'Authorization: Bearer YOUR_ANON_KEY' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'
```

### Test Deployed Function

```bash
# Replace YOUR_PROJECT_REF with your Supabase project reference
curl -i --location --request POST 'https://YOUR_PROJECT_REF.functions.supabase.co/my-function-name' \
    --header 'Authorization: Bearer YOUR_ANON_KEY' \
    --header 'Content-Type: application/json' \
    --data '{"name": "test"}'
```

## Important Notes

- Edge Functions run on Deno runtime
- Local development requires Supabase CLI version 1.0.0 or higher
- Functions must be deployed to be accessible in production
