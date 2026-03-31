package packit.unit.controllers

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import org.springframework.http.HttpStatus
import packit.controllers.RunnerController
import packit.model.dto.RunnerPackageDto
import packit.service.RunnerService
import kotlin.test.assertEquals

class RunnerControllerTest {
    private val runnerService = mock<RunnerService> {
        on { getPackages() } doReturn listOf(
            RunnerPackageDto("package1", "1.0.0", "/library"),
            RunnerPackageDto("package2", "2.0.0", "/usr/lib/R/library"),
        )
    }

    private val sut = RunnerController(runnerService)

    @Test
    fun `getPackages should return package metadata`() {
        val response = sut.getPackages()
        val responseBody = response.body

        assertEquals(HttpStatus.OK, response.statusCode)
        assertEquals(2, responseBody?.size)
        assertThat(
            listOf(responseBody?.get(0)?.name, responseBody?.get(1)?.name)
        ).containsExactly("package1", "package2")
        assertThat(
            listOf(responseBody?.get(0)?.version, responseBody?.get(1)?.version)
        ).containsExactly("1.0.0", "2.0.0")
        assertThat(
            listOf(responseBody?.get(0)?.location, responseBody?.get(1)?.location)
        ).containsExactly("/library", "/usr/lib/R/library")
    }
}
