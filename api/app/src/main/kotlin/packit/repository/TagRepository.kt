package packit.repository

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import packit.model.Tag

@Repository
interface TagRepository : JpaRepository<Tag, Int>
