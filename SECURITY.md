# Security Policy

**Built by [SkilledDragon LLC](https://skilleddragon.com)**

This is a **SkilledDragon educational minilab**, not a production product. It is published so people can try a small, keyed-off demo. We do **not** maintain these repos on a regular schedule and we do **not** operate a vulnerability response program for them.

## Contact

General questions: **hello@skilleddragon.com**  
Do not use a dedicated security mailbox for this repo — none exists.

## If you find an issue

- Prefer reporting **upstream** when the issue is in [paperclipai/paperclip](https://github.com/paperclipai/paperclip), npm `paperclipai`, or other dependencies.
- For something specific to this minilab’s wrapper scripts, you may email hello@skilleddragon.com. There is **no SLA**, and we may not patch or reply quickly.
- Do not expect private coordinated disclosure or paid bounty handling here.

## Scope / hygiene

This repository ships documentation, CI checks, and wrapper scripts. It does **not** host Paperclip server data or production credentials.

- Never commit `.env`, API keys, or onboarding tokens.
- Use `.env.example` as a template only; keep real keys in local `.env` (gitignored).
- CI is intended to stay keyless (gitleaks, audits, skill checks, unit tests).

Use at your own risk. Pin versions, review the code, and treat this as sample material.
