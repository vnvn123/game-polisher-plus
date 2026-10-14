<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Hollowfall architecture
- Preserve the imported deterministic simulation and data-driven content modules; presentation changes must not change combat or economy values.
- Keep cloud rewards server-replayed and committed through service-only optimistic-concurrency database functions; clients have owner-scoped read access only.
- Rehost uploaded artwork through project asset pointers; keep generated supplementary artwork as bundled imports so originals remain unchanged.
- Apply run rewards through one shared pure settlement helper so guest and cloud progression cannot diverge.
