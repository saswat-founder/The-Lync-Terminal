"""
Founder Onboarding Routes - Simplified
Handles founder workspace setup and onboarding completion
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Dict, Any
from datetime import datetime, timezone
from uuid import uuid4

from models.workspace_models import FounderOnboardingData, FounderOnboardingComplete
from models.user_models import TokenData
from middleware.auth import get_current_user
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/founder", tags=["Founder Onboarding"])


def get_db(request: Request) -> AsyncIOMotorDatabase:
    """Dependency to get database from app state"""
    return request.app.state.db


@router.get("/invitation/{token}")
async def verify_invitation(
    token: str,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Verify founder invitation token (Step 1)"""
    invitation = await db.invitations.find_one(
        {"token": token, "type": "founder", "used": False},
        {"_id": 0}
    )
    
    if not invitation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid or expired invitation")
    
    startup = await db.startups.find_one({"id": invitation["startup_id"]}, {"_id": 0})
    workspace = await db.workspaces.find_one({"id": invitation["workspace_id"]}, {"_id": 0})
    
    return {
        "invitation": invitation,
        "startup": startup,
        "workspace": workspace,
        "valid": True
    }


@router.post("/onboarding/complete", response_model=FounderOnboardingComplete)
async def complete_founder_onboarding(
    onboarding_data: FounderOnboardingData,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Complete founder onboarding (All 10 steps)"""
    invitation = await db.invitations.find_one(
        {"token": onboarding_data.invitation_token, "type": "founder", "used": False},
        {"_id": 0}
    )
    
    if not invitation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid invitation")
    
    if not onboarding_data.understood_data_sharing or not onboarding_data.reviewed_visibility:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Data sharing consent required")
    
    startup_id = invitation["startup_id"]
    workspace_id = invitation["workspace_id"]
    
    # Create founder user if doesn't exist
    existing_user = await db.users.find_one({"email": invitation["email"]}, {"_id": 0})
    
    if existing_user:
        founder_id = existing_user["id"]
    else:
        founder_id = str(uuid4())
        # Import bcrypt here
        import bcrypt
        temp_password = bcrypt.hashpw("ChangeMe123!".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        founder_user = {
            "id": founder_id,
            "email": invitation["email"],
            "name": invitation["name"],
            "hashed_password": temp_password,
            "role": "founder",
            "organization_id": workspace_id,
            "is_active": True,
            "created_at": datetime.now(timezone.utc)
        }
        
        await db.users.insert_one(founder_user)
    
    # Update startup with onboarding data
    startup_update = {
        "founder_id": founder_id,
        "website": onboarding_data.website,
        "sector": onboarding_data.sector,
        "stage": onboarding_data.stage,
        "business_model": onboarding_data.business_model,
        "onboarding_completed": True,
        "onboarding_completed_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    
    await db.startups.update_one({"id": startup_id}, {"$set": startup_update})
    
    # Save preferences
    preferences = {
        "id": str(uuid4()),
        "startup_id": startup_id,
        "founder_id": founder_id,
        "workspace_id": workspace_id,
        "sharing_preferences": onboarding_data.sharing_preferences,
        "report_due_date": onboarding_data.report_due_date,
        "created_at": datetime.now(timezone.utc)
    }
    
    await db.founder_preferences.insert_one(preferences)
    
    # Mark invitation as used
    await db.invitations.update_one(
        {"token": onboarding_data.invitation_token},
        {"$set": {"used": True, "used_at": datetime.now(timezone.utc)}}
    )
    
    logger.info(f"Founder onboarding completed for startup {startup_id}")
    
    return FounderOnboardingComplete(
        startup_id=startup_id,
        workspace_id=workspace_id,
        founder_id=founder_id,
        onboarding_completed=True,
        workspace_ready=True,
        integrations_count=len(onboarding_data.connected_sources),
        team_invited_count=len(onboarding_data.team_members),
        message="Onboarding completed successfully!"
    )


@router.get("/onboarding/status/{startup_id}")
async def get_onboarding_status(
    startup_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Check founder onboarding completion status"""
    startup = await db.startups.find_one({"id": startup_id}, {"_id": 0})
    
    if not startup:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Startup not found")
    
    return {
        "startup_id": startup_id,
        "onboarding_completed": startup.get("onboarding_completed", False),
        "onboarding_completed_at": startup.get("onboarding_completed_at"),
        "founder_id": startup.get("founder_id")
    }
