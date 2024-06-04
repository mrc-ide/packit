package packit.repository

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import packit.model.Tag

@Repository
interface TagRepository : JpaRepository<Tag, Int>
{
    fun findAllByNameContaining(name: String, pageable: Pageable): Page<Tag>
}
