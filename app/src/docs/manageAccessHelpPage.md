# Access Management Guide

## Overview

Packit uses a role-based access control (RBAC) system that provides flexible, fine-grained control over user permissions. The system supports both role-based permissions and direct user permissions, with the ability to apply permissions globally or scope them to specific resources.

## Core Concepts

### Users and Roles

- **Roles** contain permissions that are automatically inherited by all assigned users
- **Users** can have direct permissions in addition to those inherited from their roles
- **Permission Inheritance** combines all role permissions with direct user permissions, with the most permissive scope taking precedence

### Permission Resolution

When determining a user's effective permissions, the system evaluates:

1. **Role permissions** - All permissions from assigned roles
2. **Direct user permissions** - Specific permissions assigned directly to the user
3. **Scope precedence** - Global permissions override scoped permissions for the same action

## Permission Types

### Global Permissions

These permissions apply across the entire application:

#### `user.manage`

- **Purpose**: Complete administrative access
- **Capabilities**:
  - Manage users and roles
  - Assign permissions to users and roles
  - Manage read permissions on packets and packet groups
  - Automatically includes read access to all packets

#### `packet.run`

- **Purpose**: Run packet groups to create new packets
- **Capabilities**:
  - Access the packet runner interface
  - Run any packet groups
  - View logs of packet runs

#### `outpack.read` and `outpack.write`

- **Purpose**: Direct outpack server interaction
- **Capabilities**:
  - `outpack.read`: Make read calls to the outpack server
  - `outpack.write`: Make write calls to the outpack server (includes read access)

### Scoped Permissions

These permissions can be applied globally or restricted to specific resources using scope qualifiers.

#### `packet.read`

- **Purpose**: Grants read access to packets with flexible scoping options.
- **Capabilities**:
  - View packet details
  - Access packet metadata
  - View packet groups and their contents

**Scope Examples:**

- `packet.read` - Global read access to all packets
- `packet.read:packetGroup:group1` - Read access to all packets in group1
- `packet.read:packet:group1:id` - Read access to specific packet with ID "id" in group1
- `packet.read:tag:tag2` *(coming soon)* - Read access to packets tagged with "tag2"

#### `packet.manage`

- **Purpose**: Allows management of read access permissions for packets.
- **Capabilities:**

  - Grant read access to users or roles for packet groups or individual packets
  - Revoke read access from users or roles
  - Automatically includes `packet.read` for managed resources

**Scope Examples:**

- `packet.manage` - Can manage read access for any packet
- `packet.manage:packetGroup:group1` - Can manage read access for group1 packets only
- `packet.manage:packet:group1:id` - Can manage read access for one specific packet
- `packet.manage:tag:tag2` *(coming soon)* - Can manage read access for tagged packets

### Permission Dependencies

Some permissions automatically include others:

- `outpack.write` → includes `outpack.read`
- `user.manage` → includes global `packet.read`
- `packet.manage` → includes `packet.read` for the same scope

## Managing Access

### Creating Roles

1. Navigate to **Manage Roles**
2. Click **Add Role**
3. Enter role name and description
4. Select appropriate global permissions
5. Click **Save**
6. Assign users and scoped permissions as needed

### Updating Role Assignments

**To modify users assigned to a role:**

1. In the Roles table, click the **⋯** (three dots) menu for the desired role
2. Select **Update Users**
3. Add or remove users as needed
4. Save changes

**To modify role permissions:**

1. In the Roles table, click the **⋯** menu for the desired role
2. Select **Update Permissions**
3. Add or remove permissions as needed
4. Save changes

### Managing User Access

**To assign roles to a user:**

1. In the Users table, click the **⋯** menu for the desired user
2. Select **Update Roles**
3. Add or remove role assignments
4. Save changes

**To assign direct permissions to a user:**

1. In the Users table, click the **⋯** menu for the desired user
2. Select **Update Permissions**
3. Add or remove specific permissions
4. Save changes

## Troubleshooting

### Permission Debugging

If a user cannot access expected resources:

1. **Check role permissions** - Verify all assigned roles have the necessary permissions
2. **Review direct permissions** - Check if the user has conflicting or missing direct permissions
3. **Verify scoping** - Ensure permission scopes match the target resources exactly
4. **Test incrementally** - Start with broader permissions and narrow down to identify the issue

## Security Best Practices

- **Principle of Least Privilege** - Grant only the minimum permissions required for each user's role
- **Use Scoped Permissions** - Prefer specific scopes over global permissions when possible
- **Regular Audits** - Periodically review user permissions and role assignments
- **Role-Based Design** - Create roles that match your organization's structure and responsibilities
- **Document Access Patterns** - Keep records of who needs access to what resources and why

## Getting Help

If you encounter issues with access management or need assistance:

- Contact the **Reside Software Team**
- Include specific error messages and user details when reporting issues
- Provide screenshots of permission configurations when possible

---

*Last updated: 14/06/2025*
