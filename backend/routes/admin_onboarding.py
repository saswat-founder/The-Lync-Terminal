"""
Admin Onboarding Routes - Simplified
Workspace creation, team invitations, bulk company import
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List
from datetime import datetime, timezone
import secrets
from uuid import uuid4

from models.workspace_models import (
    WorkspaceCreate, WorkspaceResponse,
    BulkTeamInvite, TeamInviteResponse,
    BulkFounderInvite, FounderInviteResponse,
    BulkCompanyImport, CompanyImportResponse
)
from models.user_models import TokenData
from middleware.auth import get_current_user
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/admin", tags=["Admin Onboarding"])


def get_db(request: Request) -> AsyncIOMotorDatabase:
    """Dependency to get database from app state"""
    return request.app.state.db


@router.post("/workspace", response_model=WorkspaceResponse, status_code=status.HTTP_201_CREATED)
async def create_workspace(
    workspace_data: WorkspaceCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Create workspace (Admin Onboarding Steps 1-2 & 6)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins can create workspaces")
    
    workspace = {
        "id": str(uuid4()),
        "org_name": workspace_data.org_name,
        "fund_name": workspace_data.fund_name,
        "logo_url": workspace_data.logo_url,
        "currency": workspace_data.currency,
        "reporting_frequency": workspace_data.reporting_frequency,
        "timezone": workspace_data.timezone,
        "portfolio_unit": workspace_data.portfolio_unit,
        "investment_stages": workspace_data.investment_stages,
        "sectors": workspace_data.sectors,
        "health_score_template": workspace_data.health_score_template,
        "runway_threshold": workspace_data.runway_threshold,
        "required_sections": workspace_data.required_sections,
        "founder_can_edit": workspace_data.founder_can_edit,
        "created_by": current_user.email,
        "created_at": datetime.now(timezone.utc)
    }
    
    await db.workspaces.insert_one(workspace)
    await db.users.update_one(
        {"email": current_user.email},
        {"$set": {"organization_id": workspace["id"]}}
    )
    
    logger.info(f"Workspace created: {workspace['id']}")
    return WorkspaceResponse(**workspace)


@router.post("/companies/bulk", response_model=CompanyImportResponse)
async def bulk_import_companies(
    import_data: BulkCompanyImport,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Bulk import companies (Admin Onboarding Step 4)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins can import companies")
    
    imported_ids = []
    failed_companies = []
    
    for company in import_data.companies:
        try:
            startup = {
                "id": str(uuid4()),
                "workspace_id": import_data.workspace_id,
                "name": company.name,
                "stage": company.stage,
                "sector": company.sector,
                "website": company.website,
                "founder_name": company.founder_name,
                "founder_email": company.founder_email,
                "funding_amount": company.funding_amount or 0,
                "valuation": company.valuation or 0,
                "health_status": "unknown",
                "metrics": {"mrr": 0, "arr": 0, "revenue": 0, "growth_rate": 0, "runway_months": 0, "burn_rate": 0, "cash_balance": 0, "headcount": 0},
                "integrations": [],
                "created_at": datetime.now(timezone.utc)
            }
            
            await db.startups.insert_one(startup)
            imported_ids.append(startup["id"])
            
        except Exception as e:
            failed_companies.append({"name": company.name, "reason": str(e)})
    
    logger.info(f"Bulk import: {len(imported_ids)} companies imported")
    
    return CompanyImportResponse(
        workspace_id=import_data.workspace_id,
        imported_count=len(imported_ids),
        failed_count=len(failed_companies),
        company_ids=imported_ids,
        failed_companies=failed_companies,
        invitations_sent=0,
        message=f"Successfully imported {len(imported_ids)} companies"
    )


@router.post("/team/invite", response_model=TeamInviteResponse)
async def invite_team_members(
    invite_data: BulkTeamInvite,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Invite team members (Admin Onboarding Step 3)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins can invite team members")
    
    invitation_ids = []
    invited_emails = []
    
    for member in invite_data.members:
        invitation_token = secrets.token_urlsafe(32)
        invitation = {
            "id": str(uuid4()),
            "token": invitation_token,
            "type": "team",
            "workspace_id": invite_data.workspace_id,
            "email": member.email,
            "name": member.name,
            "role": member.role,
            "created_at": datetime.now(timezone.utc),
            "used": False
        }
        
        await db.invitations.insert_one(invitation)
        invitation_ids.append(invitation["id"])
        invited_emails.append(member.email)
    
    logger.info(f"Team invitations sent: {len(invited_emails)} members")
    
    return TeamInviteResponse(
        workspace_id=invite_data.workspace_id,
        invited_count=len(invited_emails),
        invited_emails=invited_emails,
        invitation_ids=invitation_ids,
        message=f"Successfully invited {len(invited_emails)} team members"
    )


@router.post("/founders/invite", response_model=FounderInviteResponse)
async def invite_founders(
    invite_data: BulkFounderInvite,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Send invitations to founders (Admin Onboarding Step 5)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins can invite founders")
    
    invitation_ids = []
    invited_startups = []
    
    for founder_invite in invite_data.invitations:
        startup = await db.startups.find_one({"id": founder_invite.startup_id}, {"_id": 0})
        if not startup:
            continue
        
        invitation_token = secrets.token_urlsafe(32)
        invitation = {
            "id": str(uuid4()),
            "token": invitation_token,
            "type": "founder",
            "workspace_id": invite_data.workspace_id,
            "startup_id": founder_invite.startup_id,
            "email": founder_invite.founder_email,
            "name": founder_invite.founder_name,
            "role": "founder",
            "created_at": datetime.now(timezone.utc),
            "used": False
        }
        
        await db.invitations.insert_one(invitation)
        invitation_ids.append(invitation["id"])
        invited_startups.append(startup["name"])
    
    logger.info(f"Founder invitations sent: {len(invitation_ids)}")
    
    return FounderInviteResponse(
        workspace_id=invite_data.workspace_id,
        invited_count=len(invitation_ids),
        invited_startups=invited_startups,
        invitation_ids=invitation_ids,
        message=f"Successfully invited {len(invitation_ids)} founders"
    )
