# Zero-Downtime Migration Checklist

Before applying any migration to staging or production:

- [ ] **No Exclusive Table Locks**: Are you adding a column with a non-constant default on older Postgres versions?
- [ ] **Concurrent Indexes**: Are all new indexes declared with `CONCURRENTLY` (or equivalent in your database engine)?
- [ ] **Reversible / Down Migrations**: Is there a verified `down` migration script in case a rollback is required?
- [ ] **Idempotent Execution**: Can the migration be safely re-run if interrupted?
- [ ] **Query Performance Impact**: Has `EXPLAIN (ANALYZE, BUFFERS)` been verified for queries hitting the modified tables?
