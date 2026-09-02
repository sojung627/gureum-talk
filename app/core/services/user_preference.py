from sqlalchemy.orm import Session

from app.models.user_preference import UserPreference


def get_or_create_user_preference(
    db: Session,
    user_id: int,
) -> UserPreference:
    preference = db.get(UserPreference, user_id)
    if preference is not None:
        return preference

    preference = UserPreference(user_id=user_id)
    db.add(preference)
    db.commit()
    db.refresh(preference)
    return preference


def update_voice_chat_panel_preference(
    db: Session,
    user_id: int,
    voice_chat_panel_open: bool,
) -> UserPreference:
    preference = get_or_create_user_preference(db, user_id)
    preference.voice_chat_panel_open = voice_chat_panel_open
    db.commit()
    db.refresh(preference)
    return preference
