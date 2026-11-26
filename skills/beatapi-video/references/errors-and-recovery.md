# Errors and recovery

Keep the original `request_id` in diagnostics. Never include the API key,
webhook signing secret, or private media URL in logs or issue text.

| Condition | Action |
| --- | --- |
| `unauthorized` / HTTP 401 | Stop. Ask the user to run `beatapi auth login` or replace/revoke the key outside chat. |
| `insufficient_credits` / HTTP 402 | Stop. Report available balance and the relevant estimate; do not retry. |
| `bad_request` / HTTP 400 | Correct fields, enums, URLs, or media. Do not resubmit unchanged. |
| `not_found` / HTTP 404 | Verify task, shot, or webhook ID, and the URL itself: a path that does not exist is also 404. |
| `method_not_allowed` / HTTP 405 | The path does not accept this method. Use a method from the `Allow` header; never retry unchanged. |
| `bad_request` on a task whose prompt asks to edit an image that was not sent | Not retryable, and refunded. Send the picture in `images`, or describe the picture to create. |
| `user_concurrency_exceeded` | Stop creating tasks. Wait for active processing work to finish or ask the user to choose. |
| `rate_limit_exceeded` | Honor `retry_after_seconds` or `Retry-After`, then retry with a bound. |
| Network failure / HTTP 502, 503, 504 | Retry with bounded exponential backoff and jitter. |
| `processing_failed`, `processing_timeout`, `result_transfer_failed` | Read final task state, error fields, usage settlement/refund, and request ID before recommending a new paid task. |

A failed task carries `data.error` (`code`, `message`, `retryable`) beside the
flat `error_code`, `error_message` and `retryable`; read `retryable` before any
new attempt.

Do not automatically create a replacement paid task after a failed task. Explain
the final state and ask only when a new charge or changed creative decision is
required.
