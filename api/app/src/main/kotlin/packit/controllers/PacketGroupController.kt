package packit.controllers

import org.springframework.data.domain.Page
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import packit.model.PageablePayload
import packit.model.dto.PacketGroupDisplay
import packit.model.dto.PacketGroupDto
import packit.model.toDto
import packit.service.PacketGroupService

@Controller
@RequestMapping("/packetGroups")
class PacketGroupController(
    private val packetGroupService: PacketGroupService
)
{
    @GetMapping
    fun getPacketGroups(
        @RequestParam(required = false, defaultValue = "0") pageNumber: Int,
        @RequestParam(required = false, defaultValue = "50") pageSize: Int,
        @RequestParam(required = false, defaultValue = "") filterName: String,
    ): ResponseEntity<Page<PacketGroupDto>>
    {
        val payload = PageablePayload(pageNumber, pageSize)
        return ResponseEntity.ok(packetGroupService.getPacketGroups(payload, filterName).map { it.toDto() })
    }

    @GetMapping("/{name}/display")
    fun getDisplay(
        @PathVariable name: String
    ): ResponseEntity<PacketGroupDisplay> {
        val result = packetGroupService.getPacketGroupDisplay(name)

        return ResponseEntity.ok(result)
    }
}
