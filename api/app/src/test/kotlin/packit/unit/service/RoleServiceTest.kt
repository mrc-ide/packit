package packit.unit.service

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.kotlin.*
import org.springframework.security.core.authority.SimpleGrantedAuthority
import packit.exceptions.PackitException
import packit.model.Packet
import packit.model.Permission
import packit.model.Role
import packit.model.RolePermission
import packit.repository.RoleRepository
import packit.service.BaseRoleService
import kotlin.test.assertTrue

class RoleServiceTest
{
    private lateinit var roleRepository: RoleRepository
    private lateinit var roleService: BaseRoleService

    @BeforeEach
    fun setup()
    {
        roleRepository = mock()
        roleService = BaseRoleService(roleRepository)
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
    fun `getUsernameRole creates new role if not exists`()
    {
        whenever(roleRepository.findByName("username")).thenReturn(null)
        whenever(roleRepository.save(any<Role>())).thenAnswer { it.getArgument(0) }

        val result = roleService.getUsernameRole("username")

        assertEquals("username", result.name)
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
    fun `getAdminRole() creates new role if not exists`()
    {
        whenever(roleRepository.findByName("ADMIN")).thenReturn(null)
        whenever(roleRepository.save(any<Role>())).thenAnswer { it.getArgument(0) }

        val result = roleService.getAdminRole()

        assertEquals("ADMIN", result.name)
        verify(roleRepository).save(any<Role>())
    }

    @Test
    fun `saveRole throws exception if role already exists`()
    {
        whenever(roleRepository.existsByName("roleName")).thenReturn(true)

        assertThrows(PackitException::class.java) {
            roleService.saveRole("roleName")
        }
    }

    @Test
    fun `saveRole saves role when does not exist`()
    {
        whenever(roleRepository.existsByName("roleName")).thenReturn(false)

        roleService.saveRole("roleName")

        verify(roleRepository).save(argThat {
            this.name == "roleName"
        })
    }

    @Test
    fun `checkMatchingRoles throws exception if roles do not match`()
    {
        val rolesToCheck = listOf("role1", "role2")
        val allRoles = listOf(Role(name = "role1"))
        whenever(roleRepository.findAll()).thenReturn(allRoles)

        assertThrows(PackitException::class.java) {
            roleService.checkMatchingRoles(rolesToCheck)
        }
    }

    @Test
    fun `checkMatchingRoles returns matching roles`()
    {
        val rolesToCheck = listOf("role1", "role2")
        val allRoles = listOf(Role(name = "role1"), Role(name = "role2"))
        whenever(roleRepository.findAll()).thenReturn(allRoles)

        val result = roleService.checkMatchingRoles(rolesToCheck)

        assertEquals(2, result.size)
        assertEquals(allRoles, result)
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

    private fun createRoleWithPermission(
        roleName: String,
        permissionName: String,
        packetId: String? = null,
        packetGroupId: Int? = null,
        tagId: Int? = null
    ): Role
    {
        return Role(
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