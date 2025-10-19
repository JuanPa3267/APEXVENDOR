"""Simple helpers to access and mutate in-memory user history dicts."""


def get_profile(CHAT_HISTORY, uid: str):
    """Get a user's entry from the provided CHAT_HISTORY mapping."""
    return CHAT_HISTORY.get(uid, [])


def set_profile(CHAT_HISTORY, uid: str, profile: dict):
    """Set or replace a user's profile/history entry."""
    CHAT_HISTORY[uid] = profile


def delete_profile(CHAT_HISTORY, uid: str):
    """Remove a user's entry if it exists; ignore if missing."""
    CHAT_HISTORY.pop(uid, None)


def get_all_profiles(CHAT_HISTORY):
    """Return the entire mapping."""
    return CHAT_HISTORY
