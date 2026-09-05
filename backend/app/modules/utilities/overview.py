from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.db.session import get_db
from app.modules.community.model import CommunityPost
from app.modules.documents.model import Document
from app.modules.templates.model import InstitutionalTemplate
from app.modules.users.model import User
from app.modules.utilities.community import CommunityReaction
from app.modules.utilities.model import Idea, IdeaVote, Tutorial, TutorialProgress
from app.modules.utilities.referrals import Referral, ReferralMovement
from app.modules.utilities.router import require_admin

router = APIRouter(tags=["utilities-admin"])


@router.get("/utilities/summary")
async def personal_summary(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Return only aggregate counts for the authenticated teacher's utility landing areas."""
    published_tutorials = await db.scalar(
        select(func.count()).select_from(Tutorial).where(Tutorial.published.is_(True))
    )
    completed_tutorials = await db.scalar(
        select(func.count())
        .select_from(TutorialProgress)
        .where(TutorialProgress.user_id == user.id, TutorialProgress.completed.is_(True))
    )
    document_count = await db.scalar(
        select(func.count()).select_from(Document).where(Document.owner_id == user.id)
    )
    template_count = await db.scalar(
        select(func.count())
        .select_from(InstitutionalTemplate)
        .where(InstitutionalTemplate.owner_id == user.id, InstitutionalTemplate.trashed.is_(False))
    )
    own_ideas = await db.scalar(
        select(func.count()).select_from(Idea).where(Idea.author_id == user.id)
    )
    votes_emitted = await db.scalar(
        select(func.count()).select_from(IdeaVote).where(IdeaVote.user_id == user.id)
    )
    referral_total = await db.scalar(
        select(func.count()).select_from(Referral).where(Referral.referrer_id == user.id)
    )
    referral_credited = await db.scalar(
        select(func.count())
        .select_from(Referral)
        .where(Referral.referrer_id == user.id, Referral.status == "credited")
    )
    community_posts = await db.scalar(
        select(func.count()).select_from(CommunityPost).where(
            CommunityPost.author_id == user.id, CommunityPost.status == "published"
        )
    )
    community_saved = await db.scalar(
        select(func.count())
        .select_from(CommunityReaction)
        .where(CommunityReaction.user_id == user.id, CommunityReaction.kind == "saved")
    )
    return {
        "tutorials": {"published": published_tutorials or 0, "completed": completed_tutorials or 0},
        "history": {"documents": document_count or 0},
        "templates": {"total": template_count or 0},
        "ideas": {"mine": own_ideas or 0, "votes": votes_emitted or 0},
        "referrals": {"total": referral_total or 0, "credited": referral_credited or 0},
        "community": {"posts": community_posts or 0, "saved": community_saved or 0},
    }


@router.get("/admin/utilities/overview")
async def overview(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    require_admin(user)
    metrics = {}
    for name, model in {
        "documents": Document,
        "templates": InstitutionalTemplate,
        "tutorials": Tutorial,
        "ideas": Idea,
        "referrals": Referral,
        "community": CommunityPost,
    }.items():
        metrics[name] = await db.scalar(select(func.count()).select_from(model))
    metrics["ideas_waiting"] = await db.scalar(
        select(func.count()).select_from(Idea).where(Idea.status == "received")
    )
    metrics["referrals_waiting"] = await db.scalar(
        select(func.count()).select_from(Referral).where(Referral.status == "pending")
    )
    metrics["tutorials_completed"] = await db.scalar(
        select(func.count())
        .select_from(TutorialProgress)
        .where(TutorialProgress.completed.is_(True))
    )
    metrics["template_bytes"] = await db.scalar(
        select(func.coalesce(func.sum(InstitutionalTemplate.size_bytes), 0))
    )
    metrics["referral_credits"] = await db.scalar(
        select(func.coalesce(func.sum(ReferralMovement.amount), 0))
    )
    return metrics
