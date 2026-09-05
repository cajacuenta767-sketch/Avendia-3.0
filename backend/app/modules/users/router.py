from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.db.session import get_db
from app.modules.users.education_catalog import validate_education_selection
from app.modules.users.model import User
from app.modules.users.schemas import (
    TeacherExperiencePreferences,
    UserRead,
    UserUpdate,
    WorkspacePreferences,
)

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserRead)
async def read_me(user: User = Depends(get_current_user)) -> User:
    return user


@router.patch("/me", response_model=UserRead)
async def update_me(
    payload: UserUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> User:
    updates = payload.model_dump(exclude_unset=True)
    try:
        validate_education_selection(
            str(updates.get("education_modality", user.education_modality)),
            str(updates.get("education_level", user.education_level)),
            str(updates.get("grade", user.grade)),
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc
    for field, value in updates.items():
        setattr(user, field, value)
    await db.commit()
    await db.refresh(user)
    return user


@router.get("/me/experience-preferences", response_model=TeacherExperiencePreferences)
async def read_experience_preferences(
    user: User = Depends(get_current_user),
) -> TeacherExperiencePreferences:
    stored = user.assistance_preferences or {}
    experience = stored.get("teacher_experience", {})
    if not isinstance(experience, dict):
        return TeacherExperiencePreferences()
    return TeacherExperiencePreferences.model_validate(experience)


@router.patch("/me/experience-preferences", response_model=TeacherExperiencePreferences)
async def update_experience_preferences(
    payload: TeacherExperiencePreferences,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> TeacherExperiencePreferences:
    stored = dict(user.assistance_preferences or {})
    stored["teacher_experience"] = payload.model_dump()
    user.assistance_preferences = stored
    await db.commit()
    return payload


@router.get("/me/workspace-preferences", response_model=WorkspacePreferences)
async def read_workspace_preferences(
    user: User = Depends(get_current_user),
) -> WorkspacePreferences:
    stored = user.assistance_preferences or {}
    workspace = stored.get("workspace", {})
    if not isinstance(workspace, dict):
        return WorkspacePreferences()
    return WorkspacePreferences.model_validate(workspace)


@router.patch("/me/workspace-preferences", response_model=WorkspacePreferences)
async def update_workspace_preferences(
    payload: WorkspacePreferences,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> WorkspacePreferences:
    stored = dict(user.assistance_preferences or {})
    stored["workspace"] = payload.model_dump(mode="json")
    user.assistance_preferences = stored
    await db.commit()
    return payload
