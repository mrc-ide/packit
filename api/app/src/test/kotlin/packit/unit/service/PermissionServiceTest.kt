package packit.unit.service

import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.assertThrows
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever
import packit.exceptions.PackitException
import packit.model.Permission
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

}