# Recipe: write a song, then extend it, split stems or convert to WAV (Suno v6)

For 音乐, 歌曲, 写歌, "make me a song", lyrics or stems. Search `suno` or `音乐` to get the reference, which is `model:suno-v6` (also `model:suno-v6-mini` and `model:suno-v6-wild`, same input and prices). Inspect it before a paid run: the input schema and the price per action are live. Full reference: <https://docs.beatapi.io/audio-api/suno-v6>.

One reference does everything. `input.action` picks the operation and defaults to `generate`; each action takes only its own fields, and an extra field is a 400 that names it. A call returns one or two songs for one fixed price, whatever the song length: `generate`, `extend`, `cover`, `add_vocals`, `add_instrumental`, `mashup` and `speech` cost $0.10; `lyrics`, `boost_style` and `convert_wav` $0.0033; `separate` $0.084 (two tracks), $0.42 (twelve stems) or $0.17 (one stem); `persona`, `midi` and `cover_image` are free.

Poll any task with the status call from the Run page (<https://beatapi.io/skill-refs/run.md>):

```json
{"reference":"model:suno-v6","operation":"status","task_id":"<id>"}
```

Repeat it every 8 seconds until `succeeded` or `failed`. The first song is `data.output.url`; every song is in `data.output.tracks[]` with its `id`, `title`, `lyrics`, `duration`, `audio_url` and `image_url`. What an action returns that is not a file (lyrics, aligned lyrics, a persona id) is in `data.output.data`.

## 1. Write the song

Simple mode: describe it and let the model write the lyrics, style and title. In simple mode send `prompt` (at most 3000 characters) and, if you want, `instrumental` only.

```json
{"reference":"model:suno-v6","input":{"model":"suno-v6","prompt":"A warm acoustic folk song about driving home at dusk"}}
```

Custom mode when the user supplied lyrics or a style: `custom_mode: true`, then `style` and `title` are required and `prompt` is the lyrics (leave it out only with `instrumental: true`). `negative_tags`, `vocal_gender` (`m` or `f`), `style_weight`, `weirdness_constraint`, `audio_weight`, `variety`, `persona_id` and `duration` are accepted only in custom mode.

```json
{"reference":"model:suno-v6","input":{"model":"suno-v6","custom_mode":true,"title":"Driving Home","style":"warm acoustic folk, male vocal","prompt":"[Verse]\nThe road is gold and the dashboard hums\n[Chorus]\nI am driving home"}}
```

Deliver the song as a link, plus its title and lyrics. Do not hand back a task id.

## 2. Work on that song

Name the task that made the song in `source_task_id`, and the song in `audio_id` (a `tracks[].id`; the first song when left out). Take both from the finished task. `source_task_id` must be a task of the same account.

Extend it from the 60-second mark:

```json
{"reference":"model:suno-v6","input":{"model":"suno-v6","action":"extend","source_task_id":"<task id>","audio_id":"<tracks[0].id>","continue_at":60,"prompt":"A quiet bridge, then a final chorus"}}
```

Convert it to WAV (the WAV file is in `data.output.media`):

```json
{"reference":"model:suno-v6","input":{"model":"suno-v6","action":"convert_wav","source_task_id":"<task id>","audio_id":"<tracks[0].id>"}}
```

Split it into vocals and an instrumental (`separation_type` is `separate_vocal` by default; `split_stem` gives twelve stems; `split_stem_advanced` gives one stem and needs `stem_name`, for example `Lead Vocal`):

```json
{"reference":"model:suno-v6","input":{"model":"suno-v6","action":"separate","source_task_id":"<task id>","audio_id":"<tracks[0].id>","separation_type":"separate_vocal"}}
```

Each follow-up is a new task with its own id and price. `extend`, `cover` and `separate` can take a public `audio_url` instead of `source_task_id`; send one of the two, never both. `add_vocals`, `add_instrumental` and `mashup` (exactly two `audio_urls`) take links only. `replace_section`, `timestamped_lyrics`, `convert_wav`, `midi`, `music_video` and `persona` need your own `source_task_id`.

## Files and errors

Songs, stems and WAV files stay available for at least 72 hours after the task finishes: download what the user wants to keep. A cover image is a signed link valid for 14 days. MIDI is a beta.

A 400 names the field: simple mode with `style` (`style is read only in custom mode; send custom_mode true with it`), custom mode without `title`, an extra field for the action, `source_task_id` that is not the account's own, `stem_name` without `split_stem_advanced`. Fix the request; never resend it unchanged.
