from fastapi import APIRouter

from app.modules.admin.router import router as admin_router
from app.modules.ai.router import router as ai_router
from app.modules.auth.router import router as auth_router
from app.modules.calendar.router import router as calendar_router
from app.modules.community.router import router as community_router
from app.modules.documents.router import router as documents_router
from app.modules.evaluation_instruments.router import router as evaluation_instruments_router
from app.modules.rosters.router import router as rosters_router
from app.modules.templates.router import router as templates_router
from app.modules.users.router import router as users_router
from app.modules.utilities.community import router as community_utilities_router
from app.modules.utilities.history import router as history_router
from app.modules.utilities.overview import router as utility_overview_router
from app.modules.utilities.referrals import router as referrals_router
from app.modules.utilities.router import router as utilities_router
from app.modules.utilities.template_versions import router as template_versions_router
from app.modules.utilities.templates import router as template_utilities_router

api_router = APIRouter()
api_router.include_router(admin_router)
api_router.include_router(utilities_router)
api_router.include_router(template_versions_router)
api_router.include_router(utility_overview_router)
api_router.include_router(template_utilities_router)
api_router.include_router(history_router)
api_router.include_router(community_utilities_router)
api_router.include_router(referrals_router)
api_router.include_router(ai_router)
api_router.include_router(auth_router)
api_router.include_router(calendar_router)
api_router.include_router(community_router)
api_router.include_router(users_router)
api_router.include_router(documents_router)
api_router.include_router(templates_router)
api_router.include_router(rosters_router)
api_router.include_router(evaluation_instruments_router)
