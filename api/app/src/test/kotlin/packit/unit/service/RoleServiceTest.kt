package packit.unit.service

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.kotlin.*
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.security.core.authority.SimpleGrantedAuthority
import packit.AppConfig
import packit.exceptions.PackitException
import packit.model.*
import packit.model.dto.CreateRole
import packit.model.dto.UpdatePacketReadRoles
import packit.model.dto.UpdateRolePermissions
import packit.repository.RoleRepository
import packit.service.BaseRoleService
import packit.service.PermissionService
import packit.service.RolePermissionService
import java.util.*
import kotlin.test.assertNull
import kotlin.test.assertTrue

class RoleServiceTest
{
    private val appConfig = mock<AppConfig>()
    private val roleRepository = mock<RoleRepository>()
    private val permissionService = mock<PermissionService>()
    private val rolePermissionService = mock<RolePermissionService>()
    private val roleService = BaseRoleService(appConfig, roleRepository, permissionService, rolePermissionService)

    @Test
    fun `createUsernameRole throws exception if role exists`()
    {
        val role = Role(name = "username", isUsername = true)
        whenever(roleRepository.findByName("username")).thenReturn(role)

        assertThrows(PackitException::class.java) {
            roleService.createUsernameRole("username")
        }
    }

    @Test
    fun `createUsernameRole creates new role with is_username flag`()
    {
        whenever(roleRepository.findByName("username")).thenReturn(null)
        whenever(roleRepository.save(any<Role>())).thenAnswer { it.getArgument(0) }

        val result = roleService.createUsernameRole("username")

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
                assertEquals(this.name, createRole.name)
                assertEquals(this.rolePermissions.size, 2)
                true
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
                assertEquals(this.name, roleName)
                assertEquals(this.rolePermissions.size, permissions.size)
                true
            }
        )
        assertEquals(roleName, savedRole.name)
        assertEquals(permissions.size, savedRole.rolePermissions.size)
    }

    @Test
    fun `getGrantedAuthorities returns authorities of permissions`()
    {
        val role1 =
            createRoleWithPermission("role1", "permission1")
        val role2 =
            createRoleWithPermission("role2", "permission2")
        whenever(permissionService.buildScopedPermission(any<RolePermission>())).thenAnswer {
            val rolePermission = it.getArgument(0) as RolePermission
            rolePermission.permission.name
        }

        val result = roleService.getGrantedAuthorities(listOf(role1, role2))

        assertEquals(2, result.size)
        assertTrue(
            result.containsAll(
                listOf(
                    SimpleGrantedAuthority("permission1"),
                    SimpleGrantedAuthority("permission2")
                )
            )
        )
        val argCapture = argumentCaptor<RolePermission>()
        verify(permissionService, times(2)).buildScopedPermission(argCapture.capture())
        assertEquals(argCapture.allValues, listOf(role1.rolePermissions[0], role2.rolePermissions[0]))
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
                assertEquals(this, role)
                assertEquals(this.rolePermissions.size, 2)
                true
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
    fun `getRolesWithRelationships returns all roles when no isUsernamesflag set`()
    {
        val roles = listOf(Role(name = "role1"), Role(name = "role2"))
        whenever(roleRepository.findAll(Sort.by("name").ascending())).thenReturn(roles)

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
        whenever(roleRepository.findAllByIsUsernameOrderByName(true)).thenReturn(roles)

        val result = roleService.getAllRoles(true)

        assertEquals(roles, result)
        verify(roleRepository).findAllByIsUsernameOrderByName(true)
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
    fun `getSortedRoleDtos returns roles sorted by base permissions`()
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

        val result = roleService.getSortedRoleDtos(roles)

        assertEquals(2, result.size)
        assertEquals("permission1", result[0].rolePermissions[0].permission)
        assertEquals("permission3", result[0].rolePermissions[1].permission)
        assertEquals("permission4", result[1].rolePermissions[0].permission)
    }

    @Test
    fun `getSortedRoleDtos returns sorted user dtos`()
    {
        val role1 = Role(name = "role1", id = 1).apply {
            users = mutableListOf(
                User(
                    username = "c user",
                    id = UUID.randomUUID(),
                    disabled = false,
                    displayName = "user1",
                    userSource = "github"
                ),
                User(
                    username = "a user",
                    id = UUID.randomUUID(),
                    disabled = false,
                    displayName = "user1",
                    userSource = "github"
                ),
                User(
                    username = "b user",
                    id = UUID.randomUUID(),
                    disabled = false,
                    displayName = "user1",
                    userSource = "github"
                ),
            )
        }

        val roles = listOf(role1)

        val result = roleService.getSortedRoleDtos(roles)

        assertEquals(1, result.size)
        assertEquals("a user", result[0].users[0].username)
        assertEquals("b user", result[0].users[1].username)
        assertEquals("c user", result[0].users[2].username)
    }

    @Test
    fun `getSortedRoleDtos filters out service users`()
    {
        val role1 = Role(name = "role1", id = 1).apply {
            users = mutableListOf(
                User(
                    username = "c user",
                    id = UUID.randomUUID(),
                    disabled = false,
                    displayName = "user1",
                    userSource = "github"
                ),
                User(
                    username = "service user",
                    id = UUID.randomUUID(),
                    disabled = false,
                    displayName = "service user",
                    userSource = "service"
                ),
            )
        }

        val roles = listOf(role1)

        val result = roleService.getSortedRoleDtos(roles)

        assertEquals(1, result[0].users.size)
        assert(result[0].users.none { it.username == "service user" })
    }

    private fun createRoleWithPermission(
        roleName: String,
        permissionName: String,
        packetId: String? = null,
        packetGroupName: String? = null,
        tagName: String? = null
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
                    packet = packetId?.let {
                        mock<Packet> {
                            on { id } doReturn packetId
                            on { name } doReturn "packetName"
                        }
                    },
                    packetGroup = packetGroupName?.let { mock { on { name } doReturn packetGroupName } },
                    tag = tagName?.let { mock { on { name } doReturn tagName } }
                )
            )
        )
    }

    @Test
    fun `getDefaultRoles returns role`()
    {
        val adminRole = Role(name = "ADMIN")
        whenever(appConfig.defaultRoles).thenReturn(listOf("ADMIN"))
        whenever(roleRepository.findByIsUsernameAndNameIn(false, listOf("ADMIN")))
            .thenReturn(listOf(adminRole))

        val result = roleService.getDefaultRoles()
        assertEquals(listOf(adminRole), result)
    }

    @Test
    fun `getDefaultRoles can return multiple roles`()
    {
        val adminRole = Role(name = "ADMIN")
        val userRole = Role(name = "USER")

        whenever(appConfig.defaultRoles).thenReturn(listOf("ADMIN", "USER"))
        whenever(roleRepository.findByIsUsernameAndNameIn(false, listOf("ADMIN", "USER")))
            .thenReturn(listOf(adminRole, userRole))

        val result = roleService.getDefaultRoles()
        assertEquals(listOf(adminRole, userRole), result)
    }

    @Test
    fun `getDefaultRoles ignores unknown roles`()
    {
        val adminRole = Role(name = "ADMIN")
        whenever(appConfig.defaultRoles).thenReturn(listOf("ADMIN", "MISSING"))
        whenever(roleRepository.findByIsUsernameAndNameIn(false, listOf("ADMIN", "MISSING")))
            .thenReturn(listOf(adminRole))

        val result = roleService.getDefaultRoles()
        assertEquals(listOf(adminRole), result)
    }

    @Test
    fun `getUniqueRoleNamesForUpdate returns symmetric difference of both sets`()
    {
        val roleService = BaseRoleService(mock(), mock(), mock(), mock())
        val roleNamesToAdd = setOf("role1", "role2", "shared")
        val roleNamesToRemove = setOf("role3", "role4", "shared")

        val result = roleService.getUniqueRoleNamesForUpdate(roleNamesToAdd, roleNamesToRemove)

        val expected = setOf("role1", "role2", "role3", "role4")
        assertEquals(expected, result)
    }

    @Test
    fun `getUniqueRoleNamesForUpdate throws exception when both sets have same elements`()
    {
        val roleService = BaseRoleService(mock(), mock(), mock(), mock())
        val roleNamesToAdd = setOf("role1", "role2")
        val roleNamesToRemove = setOf("role1", "role2")

        assertThrows<PackitException> {
            roleService.getUniqueRoleNamesForUpdate(roleNamesToAdd, roleNamesToRemove)
        }.apply {
            assertEquals("noRolesToUpdateWithPermission", key)
            assertEquals(HttpStatus.BAD_REQUEST, httpStatus)
        }
    }

    @Test
    fun `getUniqueRoleNamesForUpdate throws exception when both sets are empty`()
    {
        val roleService = BaseRoleService(mock(), mock(), mock(), mock())
        val roleNamesToAdd = emptySet<String>()
        val roleNamesToRemove = emptySet<String>()

        assertThrows<PackitException> {
            roleService.getUniqueRoleNamesForUpdate(roleNamesToAdd, roleNamesToRemove)
        }.apply {
            assertEquals("noRolesToUpdateWithPermission", key)
            assertEquals(HttpStatus.BAD_REQUEST, httpStatus)
        }
    }

    @Test
    fun `updatePacketReadPermissionOnRoles calls correct methods with arguments`()
    {
        val spyRoleService = spy(roleService)
        val rolesToAdd = setOf("role1", "role2")
        val rolesToRemove = setOf("role3", "role4")
        val updateRoleNames = rolesToAdd + rolesToRemove
        val packetId = "packet123"
        val packetGroupName = "packetGroup1"

        val updatePacketReadRoles =
            UpdatePacketReadRoles(packetGroupName, packetId, rolesToAdd.toSet(), rolesToRemove.toSet())
        val allRoles = updateRoleNames.map { Role(name = it) }

        doReturn(updateRoleNames).`when`(spyRoleService)
            .getUniqueRoleNamesForUpdate(rolesToAdd, rolesToRemove)
        doReturn(allRoles).`when`(spyRoleService).getRolesByRoleNames(any())

        spyRoleService.updatePacketReadPermissionOnRoles(updatePacketReadRoles)

        verify(rolePermissionService).updatePermissionOnRoles(
            allRoles.subList(0, 2),
            allRoles.subList(2, 4),
            packetGroupName,
            packetId
        )
        verify(spyRoleService).getUniqueRoleNamesForUpdate(rolesToAdd, rolesToRemove)
        verify(spyRoleService).getRolesByRoleNames(updateRoleNames.toList())
    }
}
