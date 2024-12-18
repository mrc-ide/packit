package packit.repository

import org.springframework.data.repository.NoRepositoryBean
import org.springframework.data.repository.Repository
import java.util.Optional


@NoRepositoryBean
interface ViewRepository<T, K> : Repository<T, K> {
    fun count(): Long

    fun existsById(id: K): Boolean

    fun findAll(): List<T>?

    fun findAllById(ids: Iterable<K>?): List<T>?

    fun findById(id: K): Optional<T>?
}