# Recipe: edit or extend a video with Seedance 2.5

Seedance 2.5 makes a new video from references, edits one of them, or extends one. Inspect `model:seedance-2.5` before a paid run: its input schema and price are live. Full reference: <https://docs.beatapi.io/video-api/seedance-2-5>.

Poll any task with the status call from the Run page (<https://beatapi.io/skill-refs/run.md>):

```json
{"reference":"model:seedance-2.5","operation":"status","task_id":"<id>"}
```

Repeat it every 8 seconds until `succeeded` or `failed`. The video is `data.output.media[0].url`.

## Edit or extend a reference video

Set `task_type` to say what `reference_videos` are for:

- `reference`: makes a new video from them.
- `edit`: edits one of them and keeps its length and aspect ratio. Leave `duration` and `aspect_ratio` out. The source must be 4 to 30 s.
- `extend`: continues one. `duration` is the total length of the finished video, source included: a 5 s source extended by 5 s takes `duration: 10`.

Without `task_type` the model decides from the prompt, and a prompt it reads as an edit fails if `duration` or `aspect_ratio` was set. Name the type.

Refer to inputs by position: `@image1`, `@video1`, `@audio1`. For a new video from references, avoid "replace", "remove" or "extend" in the prompt, or set `task_type` to `reference`. For an edit, say exactly what changes and what stays.

Edit:

```json
{"reference":"model:seedance-2.5","input":{"model":"seedance-2.5","task_type":"edit","prompt":"Make the jacket in @video1 red. Keep the person, the background and the camera move unchanged.","reference_videos":["https://example.com/clip.mp4"]}}
```

Extend a 5 s source to 10 s:

```json
{"reference":"model:seedance-2.5","input":{"model":"seedance-2.5","task_type":"extend","prompt":"@video1 continues: the car turns onto the coast road at sunset.","reference_videos":["https://example.com/clip-5s.mp4"],"duration":10}}
```

## Output format

`output_format` is `mp4` (default) or `mov`, at the same price. Draft mode (`draft`) is not offered yet.

## Inputs are checked first

Before a task is created: images 300 to 6000 px per side, aspect 0.4 to 2.5, at most 30 MB; reference videos 2 to 30 s each, at most 30 s in total, 24 to 60 fps, at most 200 MB; audio 2 to 30 s each, at most 30 s in total, at most 15 MB. A file outside these limits gets a 400 that names the field, the index and the limit. Fix the file; never resend it unchanged.
