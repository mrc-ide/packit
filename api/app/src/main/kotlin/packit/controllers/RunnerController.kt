package packit.controllers

import org.springframework.data.domain.Page
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.*
import org.springframework.web.client.HttpClientErrorException
import packit.model.PageablePayload
import packit.model.dto.*
import packit.model.toBasicDto
import packit.model.toDto
import packit.security.profile.UserPrincipal
import packit.service.RunnerService

@RestController
@RequestMapping("/runner")
@PreAuthorize("hasAuthority('packet.run')")
class RunnerController(private val runnerService: RunnerService) {
    @GetMapping("/version")
    fun getVersion(): ResponseEntity<OrderlyRunnerVersion> {
        return ResponseEntity.ok(runnerService.getVersion())
    }

    @PostMapping("/git/fetch")
    fun gitFetch(): ResponseEntity<Unit> {
        runnerService.gitFetch()
        return ResponseEntity.noContent().build()
    }

    @GetMapping("/git/branches")
    fun getBranches(): ResponseEntity<GitBranches> {
        try {
            return ResponseEntity.ok(runnerService.getBranches())
        } catch (e: HttpClientErrorException.NotFound) {
            // The runner API returns a 404 if we've never fetched that repository.
            // It is simpler for the frontend if this case is simply reported as an empty list of branch.
            // The user can then sync the repo which will cause the initial clone.
            return ResponseEntity.ok(
                GitBranches(
                    defaultBranch = null,
                    branches = emptyList(),
                )
            )
        }
    }

    @GetMapping("/{packetGroupName}/parameters")
    fun getParameters(
        @PathVariable packetGroupName: String,
        @RequestParam(defaultValue = "HEAD") ref: String
    ): ResponseEntity<List<Parameter>> {
        return ResponseEntity.ok(runnerService.getParameters(ref, packetGroupName))
    }

    @GetMapping("/packetGroups")
    fun getPacketGroups(
        @RequestParam(defaultValue = "HEAD") ref: String
    ): ResponseEntity<List<RunnerPacketGroup>> {
        return ResponseEntity.ok(runnerService.getPacketGroups(ref))
    }

    @PostMapping("/run")
    fun submitRun(
        @RequestBody @Validated submitRunInfo: SubmitRunInfo,
        @AuthenticationPrincipal userPrincipal: UserPrincipal
    ): ResponseEntity<SubmitRunResponse> {
        return ResponseEntity.ok(
            runnerService.submitRun(
                submitRunInfo, userPrincipal.name
            )
        )
    }

    @GetMapping("/status/{taskId}")
    fun getTaskStatus(@PathVariable taskId: String): ResponseEntity<RunInfoDto> {
        return ResponseEntity.ok(runnerService.getTaskStatus(taskId).toDto())
    }

    @GetMapping("/list/status")
    fun getTasksStatuses(
        @RequestParam(required = false, defaultValue = "0") pageNumber: Int,
        @RequestParam(required = false, defaultValue = "50") pageSize: Int,
        @RequestParam(required = false, defaultValue = "") filterPacketGroupName: String,
    ): ResponseEntity<Page<BasicRunInfoDto>> {
        val payload = PageablePayload(pageNumber, pageSize)
        return ResponseEntity.ok(runnerService.getTasksStatuses(payload, filterPacketGroupName).map { it.toBasicDto() })
    }
}
