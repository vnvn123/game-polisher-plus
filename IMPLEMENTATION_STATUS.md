# Hollowfall — preserved-game milestone

The uploaded game is the foundation, not a replacement. Original heroes and weapon images remain intact, and existing combat/economy values have not been rebalanced.

## Implemented and checked
- Original title screen, sanctuary, all eleven menu destinations, combat simulation and original art imported.
- Missing Rift Mines and Void Lance illustrations; supplementary Library and City creature atlases.
- Recovered original battlefield floor texture, functioning damage-number and combat-effects preferences, screen shake and interface scaling.
- Weapon/passive inspection pauses the simulation and shows level, base damage, cooldown, range and unlocked milestones.
- Guest checkpoint save/return/reload/continue, explicit discard confirmation, corrupt-snapshot rejection without overwriting it.
- Shared run reward calculation and guarded return after rewards save; damage-number effects cannot evict combat effects.
- Equipment picker requires confirmation and previews stat changes.
- Cloud schema applied with explicit grants, owner-only reads and service-only replay commits. Email and Google methods configured; existing users/data are not imported.

## Verification
11 tests pass with `bun run test`: route matching, three worlds and roster counts, final-boss timing, probability totals, directional arcs, travelled projectile collision, pickup attraction, blocking upgrade pause, deterministic replay, reward settlement, damage-number outcome independence and valid/corrupt snapshots.

Browser checks exercised real guest input, all menus, persisted settings, paused skill inspection, checkpoint recovery, abandon/settlement, corrupt-save discard and fresh combat. Original displayed images loaded with no broken images or client runtime errors. Desktop and 390px layouts inspected.

Cloud authentication/writes/isolation remain unverified: the backend has no auth user to mint a test session. Sign in through the preview, then these checks can run. Guest tests do not prove Cloud behavior.

## Remaining limitations
- This is not full specification completion. Full 30-minute victory, every late-game weapon/effect, all bosses and Endless acceptance have not been exercised end-to-end.
- World collision/pathfinding and distinct boss patterns remain unchanged pending approval to alter existing movement/attack rules.
- Armor/ring/pet icons still use source fallback symbols; supplementary creature atlases share some enemy cells rather than nineteen independent cells per world.
- Some advanced equipment, pet and rarity rules need further auditing against the full specification.
- The pause menu now includes per-run visual settings; complete advanced passive values remain incomplete. Password recovery has not been added.
- Guest progress remains separate from accounts; the source's guest-import function still safely rejects unverifiable history.
- Existing application records and user identity exports are missing. Do not grant access to imported ownership records before verified identity mapping.

## Next actions
Sign in to verify Cloud play. If existing data should be carried over, attach CSV/JSON exports for profiles, saves and runs plus original user IDs and email addresses from the original provider. Do not include passwords or credentials. Otherwise explicitly skip historical import.

Approve changes to collision and boss behavior before those systems are modified.

The external-project migration skill governed safe archive import and preservation; migration is not declared complete.