# Create Room Edge Function

This Supabase Edge Function handles room creation for both authenticated and anonymous users.

## Features

- **Anonymous User Support**: Uses a pool of pre-created system users for anonymous room creation
- **Load Balancing**: Automatically distributes anonymous rooms across multiple system users
- **Error Handling**: Comprehensive error handling with specific error codes
- **Validation**: UUID validation and input sanitization

## How It Works

### For Authenticated Users
1. Uses the authenticated user's ID as the `host_id`
2. Creates room with proper participant entry

### For Anonymous Users
1. Checks room counts for each anonymous system user
2. Selects the user with the fewest rooms (under 1000 limit)
3. Creates room using that system user's ID as `host_id`
4. Falls back to first user if all are at capacity

## Anonymous User System

The function uses these pre-defined anonymous user IDs:
- `11111111-1111-1111-1111-111111111111`
- `22222222-2222-2222-2222-222222222222`
- `33333333-3333-3333-3333-333333333333`
- `44444444-4444-4444-4444-444444444444`
- `55555555-5555-5555-5555-555555555555`

**Important**: These users must exist in your `auth.users` table. Run the SQL script in `create_anonymous_users.sql` to create them.

## Configuration

- `ROOM_LIMIT_PER_ANONYMOUS_USER`: Maximum rooms per anonymous user (default: 1000)
- Anonymous user IDs can be modified in the `ANONYMOUS_USER_IDS` array

## Error Codes

- `23503`: Foreign key constraint violation (anonymous users not set up)
- `400`: Invalid host user or missing data
- `500`: General server errors

## Development Notes

The TypeScript errors you see in VSCode are expected for Deno Edge Functions. The `@ts-ignore` comments suppress these editor warnings. The function will work correctly when deployed to Supabase.

## Deployment

This function is automatically deployed when you push changes to your Supabase project. Make sure to:

1. Create the anonymous users in your database first
2. Test the function with both authenticated and anonymous requests
3. Monitor the Edge Function logs for any issues
