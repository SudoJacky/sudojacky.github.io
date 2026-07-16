VirtualHome separates the simulation model from transport and presentation concerns.

## Runtime layers

1. The simulation engine owns time, events, and state transitions.
2. The application layer coordinates scenarios and persistence.
3. The HTTP boundary exposes explicit commands and read models.
4. The interface renders state without becoming the source of truth.

This separation keeps the simulation deterministic and makes failures traceable across boundaries.
