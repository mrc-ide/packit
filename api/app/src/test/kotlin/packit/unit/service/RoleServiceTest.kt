package packit.unit.service

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.kotlin.*
import org.springframework.http.HttpStatus
import org.springframework.security.core.authority.SimpleGrantedAuthority
import packit.exceptions.PackitException
import packit.model.*
import packit.model.dto.CreateRole
import packit.model.dto.UpdateRolePermissions
import packit.repository.RoleRepository
import packit.service.BaseRoleService
import packit.service.PermissionService
import packit.service.RolePermissionService
import kotlin.test.assertNull
import kotlin.test.assertTrue

class RoleServiceTest
{
    private lateinit var roleRepository: RoleRepository
    private lateinit var roleService: BaseRoleService
    private lateinit var permissionService: PermissionService
    private lateinit var rolePermissionService: RolePermissionService

    @BeforeEach
    fun setup()
    {
        roleRepository = mock()
        permissionService = mock()
        rolePermissionService = mock()
        roleService = BaseRoleService(roleRepository, permissionService, rolePermissionService)
    }

    @Test
    fun `getUsernameRole returns existing role`()
    {
        val role = Role(name = "username")
        whenever(roleRepository.findByName("username")).thenReturn(role)

        val result = roleService.getUsernameRole("username")

        assertEquals(role, result)
    }

    @Test
    fun `getUsernameRole creates new role with is_username flag if not exists`()
    {
        whenever(roleRepository.findByName("username")).thenReturn(null)
        whenever(roleRepository.save(any<Role>())).thenAnswer { it.getArgument(0) }

        val result = roleService.getUsernameRole("username")

        assertEquals("username", result.name)
        assertEquals(true, result.isUsername)
        verify(roleRepository).save(any<Role>())
    }

    @Test
    fun `getAdminRole() returns existing role`()
    {
        val role = Role(name = "ADMIN")
        whenever(roleRepository.findByName("ADMIN")).thenReturn(role)

        val result = roleService.getAdminRole()

        assertEquals(role, result)
    }

    @Test
    fun `getAdminRole() throws exception if not exists`()
    {
        whenever(roleRepository.findByName("ADMIN")).thenReturn(null)

        assertThrows<PackitException> {
            roleService.getAdminRole()
        }.apply {
            assertEquals("adminRoleNotFound", key)
            assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, httpStatus)
        }
    }

    @Test
    fun `createRole creates role with matching permissions`()
    {
        val createRole = CreateRole(name = "newRole", permissionNames = listOf("p1", "p2"))
        val permissions =
            listOf(Permission(name = "p1", description = "d1"), Permission(name = "p2", description = "d2"))
        whenever(permissionService.checkMatchingPermissions(createRole.permissionNames)).thenReturn(permissions)
        whenever(roleRepository.existsByName(createRole.name)).thenReturn(false)
        whenever(roleRepository.save(any<Role>())).thenAnswer { it.getArgument(0) }

        val result = roleService.createRole(createRole)

        verify(roleRepository).save(
            argThat {
                this.name == createRole.name
                this.rolePermissions.size == 2
            }
        )

        assertEquals(createRole.name, result.name)
        assertEquals(2, result.rolePermissions.size)
    }

    @Test
    fun `saveRole throws exception if role already exists`()
    {
        whenever(roleRepository.existsByName("roleName")).thenReturn(true)

        assertThrows(PackitException::class.java) {
            roleService.saveRole("roleName", listOf())
        }
    }

    @Test
    fun `saveRole saves role with permissions when does not exist`()
    {
        val roleName = "roleName"
        val permissions =
            listOf(Permission(name = "p1", description = "d1"), Permission(name = "p2", description = "d2"))
        whenever(roleRepository.existsByName("roleName")).thenReturn(false)
        whenever(roleRepository.save(any<Role>())).thenAnswer { it.getArgument(0) }

        val savedRole = roleService.saveRole(roleName, permissions)

        verify(roleRepository).save(
            argThat {
                this.name == roleName
                this.rolePermissions.size == permissions.size
            }
        )
        assertEquals(roleName, savedRole.name)
        assertEquals(permissions.size, savedRole.rolePermissions.size)
    }

    @Test
    fun `getGrantedAuthorities returns authorities for roles and permissions`()
    {
        val role1 =
            createRoleWithPermission("role1", "permission1")
        val role2 =
            createRoleWithPermission("role2", "permission2")

        val result = roleService.getGrantedAuthorities(listOf(role1, role2))

        assertEquals(4, result.size)
        assertTrue(
            result.containsAll(
                listOf(
                    SimpleGrantedAuthority("role1"),
                    SimpleGrantedAuthority("permission1"),
                    SimpleGrantedAuthority("role2"),
                    SimpleGrantedAuthority("permission2")
                )
            )
        )
    }

    @Test
    fun `getPermissionScoped returns permission name with packet id`()
    {
        val rolePermission = createRoleWithPermission("role", "permission", "1").rolePermissions[0]

        val result = roleService.getPermissionScoped(rolePermission)

        assertEquals("permission:packet:1", result)
    }

    @Test
    fun `getPermissionScoped returns permission name with packetGroup id`()
    {
        val rolePermission = createRoleWithPermission("role", "permission", packetGroupId = 2).rolePermissions[0]

        val result = roleService.getPermissionScoped(rolePermission)

        assertEquals("permission:packetGroup:2", result)
    }

    @Test
    fun `getPermissionScoped returns permission name with tag id`()
    {
        val rolePermission = createRoleWithPermission("role", "permission", tagId = 3).rolePermissions[0]

        val result = roleService.getPermissionScoped(rolePermission)

        assertEquals("permission:tag:3", result)
    }

    @Test
    fun `getPermissionScoped returns permission name when no scope`()
    {
        val rolePermission = createRoleWithPermission("role", "permission").rolePermissions[0]

        val result = roleService.getPermissionScoped(rolePermission)

        assertEquals("permission", result)
    }

    @Test
    fun `deleteRole deletes existing role`()
    {
        val role = Role("existingRole")
        whenever(roleRepository.findByName(role.name)).thenReturn(role)

        roleService.deleteRole(role.name)

        verify(roleRepository).deleteByName(role.name)
    }

    @Test
    fun `deleteRole throws exception if role does not exist`()
    {
        val role = Role("nonExistingRole")
        whenever(roleRepository.findByName(role.name)).thenReturn(null)

        assertThrows<PackitException> {
            roleService.deleteRole(role.name)
        }
    }

    @Test
    fun `deleteRole throws exception if ADMIN role is being deleted`()
    {
        val role = Role("ADMIN")
        whenever(roleRepository.findByName(role.name)).thenReturn(role)

        assertThrows<PackitException> {
            roleService.deleteRole(role.name)
        }
    }

    @Test
    fun `deleteRole throws exception if role is username role`()
    {
        val role = Role("username", isUsername = true)
        whenever(roleRepository.findByName(role.name)).thenReturn(role)

        assertThrows<PackitException> {
            roleService.deleteRole(role.name)
        }
    }

    @Test
    fun `deleteUsernameRole deletes role when role is username role`()
    {
        val username = "username"
        val role = Role(name = username, isUsername = true)
        whenever(roleRepository.findByName(username)).thenReturn(role)

        roleService.deleteUsernameRole(username)

        verify(roleRepository).deleteByName(username)
    }

    @Test
    fun `deleteUsernameRole throws exception when role does not exist`()
    {
        val username = "nonExistingUser"
        whenever(roleRepository.findByName(username)).thenReturn(null)

        assertThrows<PackitException> { roleService.deleteUsernameRole(username) }.apply {
            assertEquals("roleNotFound", key)
            assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, httpStatus)
        }
    }

    @Test
    fun `deleteUsernameRole throws exception when role is not username role`()
    {
        val username = "username"
        val role = Role(name = username, isUsername = false)
        whenever(roleRepository.findByName(username)).thenReturn(role)

        assertThrows<PackitException> { roleService.deleteUsernameRole(username) }.apply {
            assertEquals("roleIsNotUsername", key)
            assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, httpStatus)
        }
    }

    @Test
    fun `updatePermissionsToRole calls correct methods and saves role & returns new role`()
    {
        val roleName = "roleName"
        val permissionName = "permission1"
        val role = createRoleWithPermission(roleName, permissionName)
        whenever(roleRepository.findByName(roleName)).thenReturn(role)
        whenever(roleRepository.save(any<Role>())).thenAnswer { it.getArgument(0) }
        whenever(rolePermissionService.getRolePermissionsToAdd(role, listOf())).thenReturn(
            listOf(
                createRoleWithPermission(roleName, "differentPermission").rolePermissions.first()
            )
        )
        whenever(roleRepository.save(any<Role>())).thenAnswer { it.getArgument(0) }
        whenever(rolePermissionService.removeRolePermissionsFromRole(role, listOf())).thenReturn(role)

        val updatedRole = roleService.updatePermissionsToRole(roleName, UpdateRolePermissions())

        verify(roleRepository).save(
            argThat {
                this == role
                this.rolePermissions.size == 2
            }
        )
        verify(rolePermissionService).removeRolePermissionsFromRole(role, listOf())
        verify(rolePermissionService).getRolePermissionsToAdd(role, listOf())
        assertEquals(role, updatedRole)
        assertEquals(2, updatedRole.rolePermissions.size)
    }

    @Test
    fun `updatePermissionsToRole throws exception when role does not exist`()
    {
        val roleName = "nonExistingRole"
        whenever(roleRepository.findByName(roleName)).thenReturn(null)

        assertThrows<PackitException> {
            roleService.updatePermissionsToRole(roleName, UpdateRolePermissions())
        }.apply {
            assertEquals("roleNotFound", key)
            assertEquals(HttpStatus.BAD_REQUEST, httpStatus)
        }
    }

    @Test
    fun `getRoleNames returns role names`()
    {
        val roles = listOf(Role(name = "role1"), Role(name = "role2"))
        whenever(roleRepository.findAll()).thenReturn(roles)

        val result = roleService.getRoleNames()

        assertEquals(2, result.size)
        assertTrue(result.containsAll(listOf("role1", "role2")))
    }

    @Test
    fun `getRolesWithRelationships returns all roles when no isUsernamesflag set`()
    {
        val roles = listOf(Role(name = "role1"), Role(name = "role2"))
        whenever(roleRepository.findAll()).thenReturn(roles)

        val result = roleService.getAllRoles(null)

        assertEquals(2, result.size)
        assertTrue(result.containsAll(roles))
    }

    @Test
    fun `getRolesWithRelationships returns matching roles when all role names exist`()
    {
        val roleNames = listOf("role1", "role2")
        val roles = listOf(Role(name = "role1"), Role(name = "role2"))
        whenever(roleRepository.findByNameIn(roleNames)).thenReturn(roles)

        val result = roleService.getRolesByRoleNames(roleNames)

        assertEquals(roles, result)
    }

    @Test
    fun `getRolesWithRelationships throws exception when some role names do not exist`()
    {
        val roleNames = listOf("role1", "role2")
        val roles = listOf(Role(name = "role1"))
        whenever(roleRepository.findByNameIn(roleNames)).thenReturn(roles)

        assertThrows<PackitException> {
            roleService.getRolesByRoleNames(roleNames)
        }.apply {
            assertEquals("invalidRolesProvided", key)
            assertEquals(HttpStatus.BAD_REQUEST, httpStatus)
        }
    }

    @Test
    fun `getRolesWithRelationships throws exception when no role names exist`()
    {
        val roleNames = listOf("role1", "role2")
        whenever(roleRepository.findByNameIn(roleNames)).thenReturn(emptyList())

        assertThrows<PackitException> {
            roleService.getRolesByRoleNames(roleNames)
        }.apply {
            assertEquals("invalidRolesProvided", key)
            assertEquals(HttpStatus.BAD_REQUEST, httpStatus)
        }
    }

    @Test
    fun `getRolesWithRelationships returns roles with isUsername flag`()
    {
        val roles = listOf(Role(name = "username1", isUsername = true), Role(name = "username2", isUsername = true))
        whenever(roleRepository.findAllByIsUsername(true)).thenReturn(roles)

        val result = roleService.getAllRoles(true)

        assertEquals(roles, result)
        verify(roleRepository).findAllByIsUsername(true)
    }

    @Test
    fun `getRole returns role by name`()
    {
        val roleName = "roleName"
        val role = Role(name = roleName)
        whenever(roleRepository.findByName(roleName)).thenReturn(role)

        val result = roleService.getRole(roleName)

        assertEquals(role, result)
    }

    @Test
    fun `getByRoleName returns role when role exists in repository`()
    {
        val roleName = "existingRole"
        val role = Role(name = roleName)
        whenever(roleRepository.findByName(roleName)).thenReturn(role)

        val result = roleService.getByRoleName(roleName)

        assertEquals(role, result)
    }

    @Test
    fun `getByRoleName returns null when role does not exist in repository`()
    {
        val roleName = "nonExistingRole"
        whenever(roleRepository.findByName(roleName)).thenReturn(null)

        val result = roleService.getByRoleName(roleName)

        assertNull(result)
    }

    @Test
    fun `getSortedByBasePermissionsRoleDtos returns roles sorted by base permissions`()
    {
        val role1 = Role(name = "role1", id = 1).apply {
            rolePermissions = mutableListOf(
                RolePermission(permission = Permission("permission1", "d1"), role = this, id = 10),
                RolePermission(
                    permission = Permission("permission2", "d2"),
                    role = this,
                    packetGroup = PacketGroup("pg1", id = 20),
                    id = 11
                ),
                RolePermission(permission = Permission("permission3", "d3"), role = this, id = 12),
            )
        }
        val role2 = Role(name = "role2", id = 2).apply {
            rolePermissions = mutableListOf(
                RolePermission(
                    permission = Permission("permission5", "d5"),
                    role = this,
                    tag = Tag("tag1", id = 21),
                    id = 13
                ),
                RolePermission(permission = Permission("permission4", "d4"), role = this, id = 14),
            )
        }
        val roles = listOf(role1, role2)

        val result = roleService.getSortedByBasePermissionsRoleDtos(roles)

        assertEquals(2, result.size)
        assertEquals("permission1", result[0].rolePermissions[0].permission)
        assertEquals("permission3", result[0].rolePermissions[1].permission)
        assertEquals("permission4", result[1].rolePermissions[0].permission)
    }

    private fun createRoleWithPermission(
        roleName: String,
        permissionName: String,
        packetId: String? = null,
        packetGroupId: Int? = null,
        tagId: Int? = null
    ): Role
    {
        return Role(
            id = 1,
            name = roleName,
            rolePermissions = mutableListOf(
                RolePermission(
                    permission = Permission(
                        name = permissionName,
                        description = "description does not matter"
                    ),
                    role = Role(name = roleName),
                    packet = packetId?.let { mock<Packet> { on { id } doReturn packetId } },
                    packetGroup = packetGroupId?.let { mock { on { id } doReturn packetGroupId } },
                    tag = tagId?.let { mock { on { id } doReturn tagId } }
                )
            )
        )
    }
}
