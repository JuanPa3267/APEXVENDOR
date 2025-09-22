def get_profile(CHAT_HISTORY, uid: str):
    return CHAT_HISTORY.get(uid, [])


def set_profile(CHAT_HISTORY, uid: str, profile: dict):
    CHAT_HISTORY[uid] = profile


def delete_profile(CHAT_HISTORY, uid: str):
    CHAT_HISTORY.pop(uid, None)


def get_all_profiles(CHAT_HISTORY):
    return CHAT_HISTORY
