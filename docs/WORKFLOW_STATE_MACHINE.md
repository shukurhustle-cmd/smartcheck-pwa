# SmartCheck Workflow State Machine

EARLY_PICKUP:
PENDING_APPROVAL → RECEPTION_PENDING → SECURITY_PENDING → CLOSED

VISITOR:
PENDING_APPROVAL → RECEPTION_PENDING → SECURITY_PENDING → CLOSED

REJECTED can be reached from an approval checkpoint.

Every transition records an immutable action in TICKET_ACTIONS. Checkpoints must not skip forward; production persistence will enforce current state before allowing the next transition.
