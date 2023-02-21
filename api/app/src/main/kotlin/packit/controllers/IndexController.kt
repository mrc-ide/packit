package packit.controllers

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import packit.model.Packet
import packit.service.IndexService

@RestController
@RequestMapping("/index")
class IndexController(private val indexService: IndexService)
{
    @GetMapping("/packet")
    fun getPackets(): ResponseEntity<List<Packet>>
    {
        return ResponseEntity.ok(indexService.getPacket())
    }
}
