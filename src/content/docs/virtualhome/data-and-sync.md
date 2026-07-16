The local database is the durable record of the simulated home.

## State changes

Every accepted command produces an explicit state transition. Transitions should carry enough context to identify their source, affected entity, simulated time, and result.

## Synchronization

The standalone version favors a single local writer. If remote synchronization is introduced later, its conflict model should be documented before it becomes an implementation detail.
