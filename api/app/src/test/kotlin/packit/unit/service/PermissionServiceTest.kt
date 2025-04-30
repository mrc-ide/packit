package packit.unit.service

import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.assertThrows
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever
import org.springframework.http.HttpStatus
import packit.exceptions.PackitException
import packit.model.Packet
import packit.model.Permission
import packit.model.Role
import packit.model.RolePermission
import packit.repository.PermissionRepository
import packit.service.BasePermissionService
import kotlin.test.Test
import kotlin.test.assertEquals

class PermissionServiceTest
{
    private lateinit var permissionRepository: PermissionRepository
    private lateinit var basePermissionService: BasePermissionService

    @BeforeEach
    fun setup()
    {
        permissionRepository = mock()
        basePermissionService = BasePermissionService(permissionRepository)
    }

    private fun createRolePermission(
        packetId: String? = null,
        packetGroupName: String? = null,
        tagName: String? = null
    ): RolePermission = RolePermission(
        permission = Permission(
            name = "permission",
            description = "description does not matter"
        ),
        role = Role(name = "role"),
        packet = packetId?.let {
            mock<Packet> {
                on { id } doReturn packetId
                on { name } doReturn "packetName"
            }
        },
        packetGroup = packetGroupName?.let { mock { on { name } doReturn packetGroupName } },
        tag = tagName?.let { mock { on { name } doReturn tagName } }
    )

    @Test
    fun `checkMatchingPermissions returns matched permissions when all permissions exist`()
    {
        val permissionsToCheck = listOf("p1", "p2")
        val matchedPermissions = listOf(Permission("p1", "d1"), Permission("p2", "d2"))
        whenever(permissionRepository.findByNameIn(permissionsToCheck)).thenReturn(matchedPermissions)

        val result = basePermissionService.checkMatchingPermissions(permissionsToCheck)

        assertEquals(matchedPermissions, result)
    }

    @Test
    fun `checkMatchingPermissions throws PackitException when not all permissions exist`()
    {
        val permissionsToCheck = listOf("p1", "p2")
        val matchedPermissions = listOf(Permission("p1", "d2"))
        whenever(permissionRepository.findByNameIn(permissionsToCheck)).thenReturn(matchedPermissions)

        assertThrows<PackitException> {
            basePermissionService.checkMatchingPermissions(permissionsToCheck)
        }
    }

    @Test
    fun `buildScopedPermission returns permission name with packet name and id`()
    {
        val rolePermission = createRolePermission(packetId = "123")

        val result = basePermissionService.buildScopedPermission(rolePermission)

        Assertions.assertEquals("permission:packet:packetName:123", result)
    }

    @Test
    fun `buildScopedPermission returns permission name with packetGroup id`()
    {
        val rolePermission =
            createRolePermission(packetGroupName = "packetGroupName")

        val result = basePermissionService.buildScopedPermission(rolePermission)

        Assertions.assertEquals("permission:packetGroup:packetGroupName", result)
    }

    @Test
    fun `buildScopedPermission returns permission name with tag id`()
    {
        val rolePermission = createRolePermission(tagName = "tagName")

        val result = basePermissionService.buildScopedPermission(rolePermission)

        Assertions.assertEquals("permission:tag:tagName", result)
    }

    @Test
    fun `buildScopedPermission returns permission name when no scope`()
    {
        val rolePermission = createRolePermission()

        val result = basePermissionService.buildScopedPermission(rolePermission)

        Assertions.assertEquals("permission", result)
    }

    @Test
    fun `getByName returns permission when found in repository`()
    {
        val permissionName = "permission.read"
        val expectedPermission = Permission(permissionName, "Read permission")
        whenever(permissionRepository.findByName(permissionName)).thenReturn(expectedPermission)

        val result = basePermissionService.getByName(permissionName)

        assertEquals(expectedPermission, result)
    }

    @Test
    fun `getByName throws PackitException when permission not found`()
    {
        val permissionName = "permission.nonexistent"
        whenever(permissionRepository.findByName(permissionName)).thenReturn(null)

        assertThrows<PackitException> {
            basePermissionService.getByName(permissionName)
        }.apply {

            assertEquals("permissionNotFound", key)
            assertEquals(HttpStatus.BAD_REQUEST, httpStatus)
        }
    }

    fun `buildScopedPermission throws error when both packetGroup and tag are provided`()
    {

        val packetGroupName = "packetGroupName"
        val tagName = "tagName"

        assertThrows<IllegalArgumentException> {
            basePermissionService.buildScopedPermission(
                permission = "packet.read",
                packetGroupName = packetGroupName,
                tag = tagName
            )
        }.apply {
            assertEquals("Only one of packetGroupName or tag can be provided", message)
        }
    }

    @Test
    fun `buildScopedPermission throws error when packetId is provided without packetGroupName`()
    {
        val packetId = "packetId"
        val packetGroupName = null

        assertThrows<IllegalArgumentException> {
            basePermissionService.buildScopedPermission(
                permission = "packet.read",
                packetGroupName = packetGroupName,
                packetId = packetId
            )
        }.apply {
            assertEquals("packetGroupName must be provided if packetId is given", message)
        }
    }
}
