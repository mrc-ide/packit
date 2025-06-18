# Access Management Guide

## Overview

Packit uses a role-based access control (RBAC) system that provides flexible, fine-grained control over user permissions. The system supports both role-based permissions and direct user permissions, with the ability to apply permissions globally or scope them to specific resources.

## Core Concepts

### Roles, Permissions, and Users

- **Permissions** define what actions users can perform within the application.
- **Roles** contain permissions that are automatically inherited by all users with that role
- **Users** can have direct permissions in addition to those inherited from their roles

### Permission Resolution

When determining a user's effective permissions, the system evaluates:

1. **Role permissions** - All permissions from assigned roles
1. **Direct user permissions** - Specific permissions assigned directly to the user
1. **Scope precedence** - Global permissions override scoped permissions for the same action
1. **Permission inheritance** - Combines all role permissions with direct user permissions, with the most permissive scope taking precedence

## Managing Access

### Creating Roles

1. Navigate to **Manage Roles**
1. Click **Add Role**
1. Enter role name and description
1. Select appropriate global permissions (if any are required)
1. Click **Save**
1. Assign users and scoped permissions as needed

### Updating Role Assignments

**To modify users assigned to a role:**

1. Navigate to **Manage Roles**
1. In the Roles table, click the **⋯** (three dots) menu for the desired role
1. Select **Update users**
1. Add or remove users as needed
1. Save changes

**To modify role permissions:**

1. Navigate to **Manage Roles**
1. In the Roles table, click the **⋯** menu for the desired role
1. Select **Update permissions**
1. Add or remove permissions as needed
1. Save changes

### Managing User Access

**To modify a user's roles:**

1. Navigate to **Manage Users**
1. In the Users table, click the **⋯** menu for the desired user
1. Select **Update roles**
1. Add or remove role assignments
1. Save changes

**To modify a user's permissions:**

1. Navigate to **Manage Users**
1. In the Users table, click the **⋯** menu for the desired user
1. Select **Update permissions**
1. Add or remove specific permissions
1. Save changes

## Permission Types

### Global Permissions

These permissions apply across the entire application:

#### `packet.run`

- **Purpose**: Run packet groups to create new packets
- **Capabilities**:
  - Access the packet runner interface
  - Run any packet groups
  - View logs of packet runs

#### `outpack.read` and `outpack.write`

- **Purpose**: Direct packet metadata access
- **Capabilities**:
  - `outpack.read`: Read all packet metadata
  - `outpack.write`: Push packets directly to server without using the packet runner

#### `user.manage`

- **Purpose**: Complete administrative access
- **Capabilities**:
  - Manage users and roles
  - Assign permissions to users and roles
  - Manage read permissions on packets and packet groups
  - Automatically includes read access to all packets

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
- `packet.read:packetGroup:group1` - Read access to all packets in the group with name "group1"
- `packet.read:packet:group1:123` - Read access to specific packet with ID "123" in group1
- `packet.read:tag:tag2` _(coming soon)_ - Read access to packets tagged with "tag2"

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
- `packet.manage:tag:tag2` _(coming soon)_ - Can manage read access for packets with the tag 'tag2'

### Permission Hierarchies

Some permissions necessarily entail others:

- `outpack.write` → includes `outpack.read`
- `user.manage` → includes global `packet.read`
- `packet.manage` → includes `packet.read` for the same scope

## Troubleshooting

### Permission Debugging

If a user cannot access expected resources:

1. **Check role permissions** - Verify all assigned roles have the necessary permissions
2. **Stale permissions** - If a user recently had permissions changed, ensure they refresh their page to load the latest permissions
3. **Verify scoping** - Ensure permission scopes match the target resources exactly
4. **Test incrementally** - Start with broader permissions and narrow down to identify the issue

## Security Best Practices

- **Principle of Least Privilege** - Grant only the minimum permissions required for each user's tasks
- **Use Scoped Permissions** - Prefer specific scopes over global permissions when possible
- **Regular Audits** - Periodically review user permissions and role assignments
- **Role-Based Design** - Create roles that match your organization's structure and responsibilities
- **Document Access Patterns** - Keep records of who needs access to what resources and why

## Getting Help

If you encounter issues with access management or need assistance:

- Contact the **RESIDE Software team**
- Include specific error messages and user details when reporting issues. Err on the side of preserving / providing more information.
- Provide screenshots of permission configurations when possible

---

_Last updated: 14/06/2025_
