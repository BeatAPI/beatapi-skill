# Recipe: a song with Google Lyria 3.5 or Lyria 3 Pro

For Lyria, Google's music model or Flow Music, or wants a set length and tempo, search `lyria`: `model:lyria-3.5` (recommended) or `model:lyria-3-pro`, same input and prices. Full reference: <https://docs.beatapi.io/audio-api/lyria>. Lyria is a beta served through a third-party route; a failed task is not billed.

Lyria has four actions and its own fields; Suno's (`custom_mode`, `style`, `persona_id`, `audio_url` and the rest) are refused. `generate`, `extend` and `replace_section` cost $0.07, `lyrics` $0.02. Each song action returns one track: an M4A in `data.output.url`, plus a WAV and cover art in `data.output.media`.

Write a song from a description, lyrics, or both; `duration` (1-240 seconds), `bpm` (1-300) and `seed` are optional:

```json
{"reference":"model:lyria-3.5","input":{"model":"lyria-3.5","prompt":"Mandopop ballad, warm female vocal, acoustic guitar","lyrics":"[Verse]\nThe night wind runs down the alley\n[Chorus]\nWe sing until the morning","duration":90,"bpm":80}}
```

`duration` guides the model rather than binds it: full lyrics land close to it, but a line or two of lyrics may be written out into a whole, longer song. When the user cares about length, send full lyrics.

Extend a Lyria song (`continue_at` in seconds, `duration` seconds to add, at most 164) or rewrite a section (`section_start`, `section_end`); `prompt` says what to do, and `source_task_id` must be a Lyria task of the same account (a Suno task is refused):

```json
{"reference":"model:lyria-3.5","input":{"model":"lyria-3.5","action":"extend","source_task_id":"<task id>","continue_at":60,"duration":30,"prompt":"A piano break, then the chorus once more"}}
```

Write lyrics only (no audio; the lyrics and a style description are in `data.output.data`):

```json
{"reference":"model:lyria-3.5","input":{"model":"lyria-3.5","action":"lyrics","prompt":"A Mandarin pop song about a summer day by the sea"}}
```

Poll and deliver as in the Suno recipe (<https://beatapi.io/skill-refs/recipes/music-song.md>): a link, the title and the lyrics, never a task id. Files stay available for at least 72 hours.
