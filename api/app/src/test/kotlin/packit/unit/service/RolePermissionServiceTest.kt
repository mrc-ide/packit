package packit.unit.service

import org.junit.jupiter.api.assertThrows
import org.mockito.kotlin.any
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.http.HttpStatus
import packit.exceptions.PackitException
import packit.model.*
import packit.model.dto.UpdateRolePermission
import packit.repository.*
import packit.service.BaseRolePermissionService
import java.util.*
import kotlin.test.Test
import kotlin.test.assertEquals

class RolePermissionServiceTest
{

    private val permissionRepository: PermissionRepository = mock()
    private val packetRepository: PacketRepository = mock()
    private val packetGroupRepository: PacketGroupRepository = mock()
    private val tagRepository: TagRepository = mock()
    private val rolePermissionRepository: RolePermissionRepository = mock()

    private val service = BaseRolePermissionService(
        permissionRepository,
        packetRepository,
        packetGroupRepository,
        tagRepository,
        rolePermissionRepository
    )

    @Test
    fun `getRolePermissionsToUpdate returns RolePermission list when all entities are found`()
    {
        val role = Role("role1")
        val mockPacket = mock<Packet>()
        val updateRolePermission = UpdateRolePermission("permission1", "id-1")
        whenever(permissionRepository.findByName(any())).thenReturn(mock())
        whenever(packetRepository.findById(any())).thenReturn(Optional.of(mockPacket))

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
        whenever(permissionRepository.findByName(any())).thenReturn(mock())
        whenever(packetGroupRepository.findById(any())).thenReturn(Optional.of(mockPacketGroup))

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
        whenever(permissionRepository.findByName(any())).thenReturn(mock())
        whenever(tagRepository.findById(any())).thenReturn(Optional.of(mockTag))

        val result = service.getRolePermissionsToUpdate(role, listOf(updateRolePermission))

        assertEquals(1, result.size)
        assertEquals(role, result[0].role)
        assertEquals(mockTag, result[0].tag)
    }

    @Test
    fun `getRolePermissionsToUpdate throws PackitException when permission is not found`()
    {
        val role = Role("role1")
        val updateRolePermission = UpdateRolePermission("permission1")
        whenever(permissionRepository.findByName(any())).thenReturn(null)

        assertThrows<PackitException> {
            service.getRolePermissionsToUpdate(role, listOf(updateRolePermission))
        }.apply {
            assertEquals("permissionNotFound", key)
            assertEquals(HttpStatus.BAD_REQUEST, httpStatus)
        }
    }

    @Test
    fun `getRolePermissionsToUpdate throws PackitException when packet is not found`()
    {
        val role = Role("role1")
        val updateRolePermission = UpdateRolePermission("permission1", "packet1")
        whenever(permissionRepository.findByName(any())).thenReturn(mock())
        whenever(packetRepository.findById(any())).thenReturn(Optional.empty())

        assertThrows<PackitException> {
            service.getRolePermissionsToUpdate(role, listOf(updateRolePermission))
        }.apply {
            assertEquals("packetNotFound", key)
            assertEquals(HttpStatus.BAD_REQUEST, httpStatus)
        }
    }

    @Test
    fun `getRolePermissionsToUpdate throws PackitException when packetGroup is not found`()
    {
        val role = Role("role1")
        val updateRolePermission = UpdateRolePermission("permission1", packetGroupId = 1)
        whenever(permissionRepository.findByName(any())).thenReturn(mock())
        whenever(packetGroupRepository.findById(any())).thenReturn(Optional.empty())

        assertThrows<PackitException> {
            service.getRolePermissionsToUpdate(role, listOf(updateRolePermission))
        }.apply {
            assertEquals("packetGroupNotFound", key)
            assertEquals(HttpStatus.BAD_REQUEST, httpStatus)
        }
    }

    @Test
    fun `getRolePermissionsToUpdate throws PackitException when tag is not found`()
    {
        val role = Role("role1")
        val updateRolePermission = UpdateRolePermission("permission1", tagId = 1)
        whenever(permissionRepository.findByName(any())).thenReturn(mock())
        whenever(tagRepository.findById(any())).thenReturn(Optional.empty())

        assertThrows<PackitException> {
            service.getRolePermissionsToUpdate(role, listOf(updateRolePermission))
        }.apply {
            assertEquals("tagNotFound", key)
            assertEquals(HttpStatus.BAD_REQUEST, httpStatus)
        }
    }

    @Test
    fun `removeRolePermissionsFromRole removes role permissions when they exist`()
    {
        val role = Role("role1")
        val permission1 = Permission("permission1", "d1")
        val updateRolePermissions = listOf(UpdateRolePermission(permission1.name))
        role.rolePermissions = mutableListOf(
            RolePermission(role, permission1, id = 1),
            RolePermission(role, Permission("permission2", "d2"), id = 2)
        )
        whenever(permissionRepository.findByName(any())).thenReturn(permission1)

        service.removeRolePermissionsFromRole(role, updateRolePermissions)

        verify(rolePermissionRepository).deleteAllByIdIn(listOf(role.rolePermissions.first().id!!))
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
        whenever(permissionRepository.findByName(any())).thenReturn(permission1)

        assertThrows<PackitException> {
            service.removeRolePermissionsFromRole(role, updateRolePermissions)
        }.apply {
            assertEquals("rolePermissionDoesNotExist", key)
            assertEquals(HttpStatus.BAD_REQUEST, httpStatus)
        }
    }

}