# Anonymous User Management System

This system allows anonymous users to create and join rooms without requiring authentication by using a pool of pre-created system users.

## Setup Instructions

### 1. Create Anonymous Users in Database

Run the SQL script `create_anonymous_users.sql` in your Supabase SQL Editor:

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `create_anonymous_users.sql`
4. Run the script

This will create 5 anonymous users with IDs:
- `11111111-1111-1111-1111-111111111111`
- `22222222-2222-2222-2222-222222222222`
- `33333333-3333-3333-3333-333333333333`
- `44444444-4444-4444-4444-444444444444`
- `55555555-5555-5555-5555-555555555555`

### 2. How It Works

**Room Creation:**
- When an anonymous user creates a room, the system checks room counts for each anonymous user
- It selects the anonymous user with the fewest rooms (under 1000 limit)
- Creates the room using that anonymous user's ID as `host_id`

**Load Balancing:**
- Each anonymous user can host up to 1000 rooms
- When one user reaches the limit, the system automatically uses the next available user
- If all users reach capacity, it falls back to the first user

**Joining Rooms:**
- Anonymous users can join rooms using randomly generated UUIDs
- No authentication required for joining

## Monitoring and Maintenance

### Check Anonymous User Usage

Run the queries in `monitor_anonymous_users.sql` to:
- See room counts for each anonymous user
- View recent rooms created by anonymous users
- Monitor system health

### Adding More Anonymous Users

When your anonymous users approach capacity:

1. Generate a new UUID (you can use online UUID generators)
2. Add the new UUID to the `ANONYMOUS_USER_IDS` array in `useRoomManagement.ts`
3. Create the user in the database using the template in `monitor_anonymous_users.sql`

Example:
```typescript
const ANONYMOUS_USER_IDS = [
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555',
  '66666666-6666-6666-6666-666666666666', // New user
];
```

## Benefits

- ✅ **No Database Schema Changes**: Works with existing foreign key constraints
- ✅ **No Authentication Required**: Users can create/join rooms immediately
- ✅ **Scalable**: Automatic load balancing across multiple anonymous users
- ✅ **Maintainable**: Easy to add more anonymous users as needed
- ✅ **Data Integrity**: All foreign key relationships maintained

## Configuration

You can adjust the room limit per anonymous user by changing:

```typescript
const ROOM_LIMIT_PER_ANONYMOUS_USER = 1000; // Adjust as needed
```

## Troubleshooting

**"Failed to create room" Error:**
- Ensure anonymous users exist in the database
- Check if all anonymous users have reached capacity
- Verify the UUIDs in code match the database entries

**Performance Issues:**
- Monitor room counts using the monitoring queries
- Add more anonymous users if needed
- Consider cleaning up old/inactive rooms periodically
