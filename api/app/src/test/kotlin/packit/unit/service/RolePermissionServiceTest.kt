package packit.unit.service

import org.junit.jupiter.api.assertThrows
import org.mockito.kotlin.*
import org.springframework.http.HttpStatus
import packit.exceptions.PackitException
import packit.model.*
import packit.model.dto.UpdateRolePermission
import packit.repository.RoleRepository
import packit.service.*
import java.time.Instant
import kotlin.test.Test
import kotlin.test.assertEquals

class RolePermissionServiceTest
{
    private val now = Instant.now().epochSecond.toDouble()
    private val packetGroup = PacketGroup(name = "name1", id = 1)
    private val packet = Packet(
        "20240101-090000-4321gaga",
        packetGroup.name,
        "",
        mapOf("alpha" to 1),
        now,
        now,
        now
    )
    private val permissionService: PermissionService = mock()
    private val packetService: PacketService = mock {
        on { getPacket(any()) } doReturn packet
    }
    private val packetGroupService: PacketGroupService = mock() {
        on { getPacketGroupByName(any()) } doReturn packetGroup
    }
    private val tagService: TagService = mock()
    private val roleRepository: RoleRepository = mock()

    private val service = BaseRolePermissionService(
        permissionService,
        packetService,
        packetGroupService,
        tagService,
    )

    @Test
    fun `getRolePermissionsToUpdate returns RolePermission list when all entities are found`()
    {
        val role = Role("role1")
        val mockPacket = mock<Packet>()
        val updateRolePermission = UpdateRolePermission("permission1", "id-1")
        whenever(permissionService.getByName(any())).thenReturn(mock())
        whenever(packetService.getPacket(any())).thenReturn(mockPacket)

        val result = service.getRolePermissionsToUpdate(role, listOf(updateRolePermission))

        assertEquals(1, result.size)
        assertEquals(role, result[0].role)
        assertEquals(mockPacket, result[0].packet)
    }

    @Test
    fun `getRolePermissionsToUpdate returns RolePermission list when packetGroup is found`()
    {
        val role = Role("role1")
        val mockPacketGroup = mock<PacketGroup>()
        val updateRolePermission = UpdateRolePermission("permission1", packetGroupId = 1)
        whenever(permissionService.getByName(any())).thenReturn(mock())
        whenever(packetGroupService.getPacketGroup(any())).thenReturn(mockPacketGroup)

        val result = service.getRolePermissionsToUpdate(role, listOf(updateRolePermission))

        assertEquals(1, result.size)
        assertEquals(role, result[0].role)
        assertEquals(mockPacketGroup, result[0].packetGroup)
    }

    @Test
    fun `getRolePermissionsToUpdate returns RolePermission list when tag is found`()
    {
        val role = Role("role1")
        val mockTag = mock<Tag>()
        val updateRolePermission = UpdateRolePermission("permission1", tagId = 1)
        whenever(permissionService.getByName(any())).thenReturn(mock())
        whenever(tagService.getTag(any())).thenReturn(mockTag)

        val result = service.getRolePermissionsToUpdate(role, listOf(updateRolePermission))

        assertEquals(1, result.size)
        assertEquals(role, result[0].role)
        assertEquals(mockTag, result[0].tag)
    }

    @Test
    fun `updatePermissionsOnRole calls correct methods with arguments returning role`()
    {
        val role = Role("role1")
        val addRolePermissions = listOf(UpdateRolePermission("permission1"))
        val removeRolePermissions = listOf(UpdateRolePermission("permission2"))
        val serviceSpy = spy(service)
        doNothing().`when`(serviceSpy).addPermissionsToRole(any(), any())
        doNothing().`when`(serviceSpy).removeRolePermissionsFromRole(any(), any())
        whenever(roleRepository.save(role)).thenReturn(role)

        val result = serviceSpy.updatePermissionsOnRole(
            role,
            addRolePermissions,
            removeRolePermissions
        )

        assertEquals(result, role)
        verify(serviceSpy).addPermissionsToRole(role, addRolePermissions)
        verify(serviceSpy).removeRolePermissionsFromRole(role, removeRolePermissions)
    }

    @Test
    fun `removeRolePermissionsFromRole removes role permissions when they exist`()
    {
        val role = Role("role1")
        val permission1 = Permission("permission1", "d1")
        val removeRolePermissions = listOf(UpdateRolePermission(permission1.name))
        role.rolePermissions = mutableListOf(
            RolePermission(role, permission1, id = 1),
            RolePermission(role, Permission("permission2", "d2"), id = 2)
        )
        whenever(permissionService.getByName(any())).thenReturn(permission1)

        service.removeRolePermissionsFromRole(role, removeRolePermissions)

        assertEquals(1, role.rolePermissions.size)
        assertEquals("permission2", role.rolePermissions[0].permission.name)
    }

    @Test
    fun `removeRolePermissionsFromRole throws PackitException when role permission does not exist`()
    {
        val role = Role("role1")
        val permission1 = Permission("permission1", "d1")
        val updateRolePermissions =
            listOf(UpdateRolePermission(permission1.name))
        role.rolePermissions = mutableListOf(
            RolePermission(role, Permission("permission2", "d2"), id = 2)
        )
        whenever(permissionService.getByName(any())).thenReturn(permission1)

        assertThrows<PackitException> {
            service.removeRolePermissionsFromRole(role, updateRolePermissions)
        }.apply {
            assertEquals("rolePermissionDoesNotExist", key)
            assertEquals(HttpStatus.BAD_REQUEST, httpStatus)
        }
    }

    @Test
    fun `addPermissionsToRole adds role permissions to role when they do not exist in role`()
    {
        val role = Role("role1")
        val permission1 = Permission("permission1", "d1")
        val addRolePermissions = listOf(UpdateRolePermission(permission1.name))
        whenever(permissionService.getByName(any())).thenReturn(permission1)

        service.addPermissionsToRole(role, addRolePermissions)

        assertEquals(1, role.rolePermissions.size)
        assertEquals(permission1, role.rolePermissions.first().permission)
    }

    @Test
    fun `addPermissionsToRole throws exception when role permission already exists in role`()
    {
        val role = Role("role1")
        val permission1 = Permission("permission1", "d1")
        val addRolePermissions = listOf(UpdateRolePermission(permission1.name))
        role.rolePermissions = mutableListOf(RolePermission(role, permission1, id = 1))
        whenever(permissionService.getByName(any())).thenReturn(permission1)

        assertThrows<PackitException> {
            service.addPermissionsToRole(role, addRolePermissions)
        }.apply {
            assertEquals("rolePermissionAlreadyExists", key)
            assertEquals(HttpStatus.BAD_REQUEST, httpStatus)
        }
    }

    @Test
    fun `applyPermissionToMultipleRoles calls correct methods with arguments when packetId passed & returns roles`()
    {
        val serviceSpy = spy(service)
        val rolesToAdd = listOf(Role("role1"), Role("role2"))
        val rolesToRemove = listOf(Role("role3"), Role("role4"))
        val permission = Permission("permission1", "d1")
        whenever(permissionService.getByName(any())).thenReturn(permission)
        doNothing().`when`(serviceSpy).removePermissionFromRoles(rolesToRemove, permission, packet)
        doNothing().`when`(serviceSpy).addPermissionToRoles(rolesToAdd, permission, packet)

        val result =
            serviceSpy.applyPermissionToMultipleRoles(rolesToAdd, rolesToRemove, "packet.read", packet.name, packet.id)

        assertEquals(result, rolesToAdd + rolesToRemove)
        verify(packetService).getPacket(packet.id)
        verify(serviceSpy).removePermissionFromRoles(rolesToRemove, permission, packet)
        verify(serviceSpy).addPermissionToRoles(rolesToAdd, permission, packet)
    }

    @Test
    fun `applyPermissionToMultipleRoles calls correct methods with arguments when packetId not passed`()
    {
        val serviceSpy = spy(service)
        val rolesToAdd = listOf(Role("role1"), Role("role2"))
        val rolesToRemove = listOf(Role("role3"), Role("role4"))
        val permission = Permission("permission1", "d1")
        whenever(permissionService.getByName(any())).thenReturn(permission)
        doNothing().`when`(serviceSpy).removePermissionFromRoles(rolesToRemove, permission, packetGroup = packetGroup)
        doNothing().`when`(serviceSpy).addPermissionToRoles(rolesToAdd, permission, packetGroup = packetGroup)

        serviceSpy.applyPermissionToMultipleRoles(rolesToAdd, rolesToRemove, "packet.read", packetGroup.name, null)

        verify(packetGroupService).getPacketGroupByName(packetGroup.name)
        verify(serviceSpy).removePermissionFromRoles(rolesToRemove, permission, packetGroup = packetGroup)
        verify(serviceSpy).addPermissionToRoles(rolesToAdd, permission, packetGroup = packetGroup)
    }

    @Test
    fun `applyPermissionToMultipleRoles throws exception when packet name does not match packetGroupName`()
    {
        whenever(permissionService.getByName(any())).thenReturn(any<Permission>())

        assertThrows<IllegalArgumentException> {
            service.applyPermissionToMultipleRoles(
                listOf(),
                listOf(),
                "packet.read",
                "mismatchedName",
                packet.id
            )
        }.apply {
            assertEquals(
                "Packet group name must be the same as packet name when packetId is provided",
                message
            )
        }
    }

    @Test
    fun `removePermissionFromRoles throw error when 2 of packet, packetGroup, tag are not null`()
    {

        assertThrows<IllegalArgumentException> {
            service.removePermissionFromRoles(
                listOf(Role("role1")),
                Permission("permission1", "d1"),
                packet,
                packetGroup,
                null
            )
        }.apply {
            assertEquals(
                "Either all of packet, tag, packetGroup should be null or only one of them should be not null",
                message
            )
        }
    }

    @Test
    fun `removePermissionFromRoles throw error when rolePermission doesnt exist on a role`()
    {
        val roles = listOf(Role("role1"), Role("role2"))
        val permission = Permission("permission1", "d1")
        roles[0].apply {
            rolePermissions = mutableListOf(
                RolePermission(this, permission, packet = packet, id = 1)
            )
        }
        // this role permission does not match as not packet but packet group
        roles[1].apply {
            rolePermissions = mutableListOf(
                RolePermission(this, permission, packetGroup = packetGroup, id = 2)
            )
        }

        assertThrows<PackitException> {
            service.removePermissionFromRoles(
                roles, permission, packet, null, null
            )
        }.apply {
            assertEquals("rolePermissionDoesNotExist", key)
            assertEquals(HttpStatus.BAD_REQUEST, httpStatus)
        }
    }

    @Test
    fun `removePermissionFromRoles removes permissions from roles`()
    {
        val roles = listOf(Role("role1"), Role("role2"))
        val permission = Permission("permission1", "d1")
        roles.forEachIndexed { index, role ->
            role.rolePermissions = mutableListOf(
                RolePermission(role, permission, packet = packet, id = index)
            )
        }
        service.removePermissionFromRoles(
            roles, permission, packet, null, null
        )

        assertEquals(0, roles[0].rolePermissions.size)
        assertEquals(0, roles[1].rolePermissions.size)
    }

    @Test
    fun `addPermissionToRoles throw error when 2 of packet, packetGroup, tag are not null`()
    {

        assertThrows<IllegalArgumentException> {
            service.addPermissionToRoles(
                listOf(Role("role1")),
                Permission("permission1", "d1"),
                packet,
                packetGroup,
                null
            )
        }.apply {
            assertEquals(
                "Either all of packet, tag, packetGroup should be null or only one of them should be not null",
                message
            )
        }
    }

    @Test
    fun `addPermissionToRoles throw error when rolePermission already exists on a role`()
    {
        val roles = listOf(Role("role1"), Role("role2"))
        val permission = Permission("permission1", "d1")
        // already exists on role 1, thus will throw error
        roles[0].apply {
            rolePermissions = mutableListOf(
                RolePermission(this, permission, packet = packet, id = 1)
            )
        }
        roles[1].apply {
            rolePermissions = mutableListOf(
                RolePermission(this, permission, packetGroup = packetGroup, id = 2)
            )
        }

        assertThrows<PackitException> {
            service.addPermissionToRoles(
                roles, permission, packet, null, null
            )
        }.apply {
            assertEquals("rolePermissionAlreadyExists", key)
            assertEquals(HttpStatus.BAD_REQUEST, httpStatus)
        }
    }

    @Test
    fun `addPermissionToRoles adds permissions from roles`()
    {
        val roles = listOf(Role("role1"), Role("role2"))
        val permission = Permission("permission1", "d1")
        service.addPermissionToRoles(
            roles, permission, packet, null, null
        )

        roles.forEach {
            it.rolePermissions = mutableListOf(
                RolePermission(it, permission, packet = packet)
            )
        }
    }
}
