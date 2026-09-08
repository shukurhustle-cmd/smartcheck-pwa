# Vehicle Media + ANPR

Vehicle photos are uploaded server-side to the configured Google Drive folder and the Drive file ID is recorded in the VEHICLES CRM tab. Capture time is recorded in ISO format at the server.

ANPR is provider-ready. The current implementation deliberately returns a manual-confirmation result until an approved ANPR/OCR provider is configured. This prevents false plate numbers from being silently written into the security log.

Production rule: store the original image, extracted plate text, confidence, operator confirmation, timestamp and ticket ID together.