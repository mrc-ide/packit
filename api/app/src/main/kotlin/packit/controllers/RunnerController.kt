package packit.controllers

import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.*
import packit.model.dto.GitBranches
import packit.model.dto.OrderlyRunnerVersion
import packit.model.dto.Parameter
import packit.model.dto.RunInfoDto
import packit.model.dto.RunnerPacketGroup
import packit.model.dto.SubmitRunInfo
import packit.service.RunnerService

@RestController
@RequestMapping("/runner")
@PreAuthorize("hasAuthority('packet.run')")
class RunnerController(private val runnerService: RunnerService)
{
    @GetMapping("/version")
    fun getVersion(): ResponseEntity<OrderlyRunnerVersion>
    {
        return ResponseEntity.ok(runnerService.getVersion())
    }

    @PostMapping("/git/fetch")
    fun gitFetch(): ResponseEntity<Unit>
    {
        runnerService.gitFetch()
        return ResponseEntity.noContent().build()
    }

    @GetMapping("git/branches")
    fun getBranches(): ResponseEntity<GitBranches>
    {
        return ResponseEntity.ok(runnerService.getBranches())
    }

    @GetMapping("/{packetGroupName}/parameters")
    fun getParameters(
        @PathVariable packetGroupName: String,
        @RequestParam(defaultValue = "HEAD") ref: String
    ): ResponseEntity<List<Parameter>>
    {
        return ResponseEntity.ok(runnerService.getParameters(packetGroupName, ref))
    }

    @GetMapping("/packetGroups")
    fun getPacketGroups(@RequestParam(defaultValue = "HEAD") ref: String): ResponseEntity<List<RunnerPacketGroup>>
    {
        return ResponseEntity.ok(runnerService.getPacketGroups(ref))
    }

    @PostMapping("/run")
    fun submitRun(
        @RequestBody @Validated submitRunInfo: SubmitRunInfo
    ): ResponseEntity<String>
    {
        return ResponseEntity.ok(runnerService.submitRun(submitRunInfo))
    }

    @GetMapping("/status/{taskId}")
    fun getTaskStatus(@PathVariable taskId: String): ResponseEntity<RunInfoDto>
    {
        return ResponseEntity.ok(runnerService.getTaskStatus(taskId))
    }
}
