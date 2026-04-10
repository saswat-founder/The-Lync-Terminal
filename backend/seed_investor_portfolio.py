"""
Seed investor profile with 25 startups and reports
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from datetime import datetime, timezone, timedelta
from uuid import uuid4
import random
from passlib.context import CryptContext

load_dotenv()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Startup data templates
STARTUP_NAMES = [
    "TechFlow AI", "CloudScale SaaS", "DataPulse Analytics", "FinTech Pro",
    "HealthBridge Medical", "EduLearn Platform", "GreenEnergy Solutions", "RetailSync",
    "LogiChain Systems", "CyberGuard Security", "AgriTech Innovations", "PropTech Hub",
    "MediaStream Plus", "FoodTech Labs", "TravelEase App", "AutoDrive AI",
    "BioMed Research", "Gaming Arena", "Fashion Forward", "SportsMetrics",
    "LegalTech Pro", "HR Automation", "MarketingBoost", "SupplyChain Ops", "InsureTech Plus"
]

STAGES = ["Pre-seed", "Seed", "Series A", "Series B", "Series C"]
INDUSTRIES = [
    "AI/ML", "SaaS", "Analytics", "FinTech", "HealthTech",
    "EdTech", "CleanTech", "E-commerce", "Logistics", "Cybersecurity",
    "AgriTech", "PropTech", "Media", "FoodTech", "Travel",
    "Automotive", "BioTech", "Gaming", "Fashion", "Sports",
    "LegalTech", "HR Tech", "MarTech", "Supply Chain", "InsurTech"
]

HEALTH_STATUSES = ["healthy", "warning", "critical", "excellent"]

def generate_startup_metrics(stage, health_status):
    """Generate realistic metrics based on stage and health"""
    base_revenue = {
        "Pre-seed": (10000, 100000),
        "Seed": (50000, 300000),
        "Series A": (200000, 1000000),
        "Series B": (500000, 3000000),
        "Series C": (1000000, 10000000)
    }
    
    min_rev, max_rev = base_revenue.get(stage, (50000, 500000))
    revenue = random.randint(min_rev, max_rev)
    
    # Health impacts growth
    growth_multiplier = {
        "excellent": (25, 50),
        "healthy": (10, 25),
        "warning": (-5, 10),
        "critical": (-20, 0)
    }
    
    min_growth, max_growth = growth_multiplier.get(health_status, (5, 15))
    growth_rate = round(random.uniform(min_growth, max_growth), 1)
    
    burn_rate = int(revenue * random.uniform(0.6, 0.9))
    cash_balance = burn_rate * random.randint(12, 36)
    runway_months = round(cash_balance / burn_rate if burn_rate > 0 else 24, 1)
    
    return {
        "revenue": revenue,
        "growth_rate": growth_rate,
        "burn_rate": burn_rate,
        "cash_balance": cash_balance,
        "runway_months": runway_months,
        "arr": revenue * 12,
        "customer_count": random.randint(50, 5000),
        "team_size": random.randint(5, 150)
    }

async def seed_investor_portfolio():
    client = AsyncIOMotorClient(os.getenv('MONGO_URL'))
    db = client[os.getenv('DB_NAME', 'startup_intel')]
    
    # Create investor user
    investor_id = str(uuid4())
    investor_email = "james.wilson@venture.capital"
    
    investor_user = {
        "id": investor_id,
        "email": investor_email,
        "name": "James Wilson",
        "hashed_password": pwd_context.hash("investor123"),
        "role": "investor",
        "organization_id": "org_venture_capital",
        "is_active": True,
        "created_at": datetime.now(timezone.utc) - timedelta(days=730),
        "last_login": datetime.now(timezone.utc) - timedelta(hours=2)
    }
    
    # Check if investor exists
    existing = await db.users.find_one({"email": investor_email}, {"_id": 0})
    if existing:
        print(f"⚠ Investor {investor_email} already exists, using existing ID")
        investor_id = existing["id"]
    else:
        await db.users.insert_one(investor_user)
        print(f"✓ Created investor: {investor_email}")
    
    # Create 25 startups
    startups = []
    for i, name in enumerate(STARTUP_NAMES):
        stage = random.choice(STAGES)
        health_status = random.choice(HEALTH_STATUSES)
        metrics = generate_startup_metrics(stage, health_status)
        
        founder_id = str(uuid4())
        founder_email = f"{name.lower().replace(' ', '.')}@startup.com"
        
        startup = {
            "id": str(uuid4()),
            "name": name,
            "industry": INDUSTRIES[i],
            "stage": stage,
            "founded_date": (datetime.now(timezone.utc) - timedelta(days=random.randint(365, 2190))).isoformat(),
            "description": f"{name} is revolutionizing {INDUSTRIES[i]} with innovative solutions.",
            "website": f"https://{name.lower().replace(' ', '')}.com",
            "location": random.choice(["San Francisco, CA", "New York, NY", "Austin, TX", "Boston, MA", "Seattle, WA"]),
            "total_funding": random.randint(500000, 50000000),
            "valuation": random.randint(5000000, 500000000),
            "health_status": health_status,
            "founder_id": founder_id,
            "founder_email": founder_email,
            "investor_ids": [investor_id],
            "metrics": metrics,
            "integrations": {
                "zoho_books": {"connected": random.choice([True, False])},
                "hubspot": {"connected": random.choice([True, False])},
                "github": {"connected": random.choice([True, False])}
            },
            "created_at": datetime.now(timezone.utc) - timedelta(days=random.randint(180, 1095)),
            "updated_at": datetime.now(timezone.utc) - timedelta(days=random.randint(1, 30))
        }
        
        startups.append(startup)
        
        # Create founder user
        founder_user = {
            "id": founder_id,
            "email": founder_email,
            "name": f"{name} Founder",
            "hashed_password": pwd_context.hash("founder123"),
            "role": "founder",
            "organization_id": startup["id"],
            "is_active": True,
            "created_at": startup["created_at"],
            "last_login": datetime.now(timezone.utc) - timedelta(days=random.randint(1, 14))
        }
        
        # Check if founder exists
        existing_founder = await db.users.find_one({"email": founder_email}, {"_id": 0})
        if not existing_founder:
            await db.users.insert_one(founder_user)
    
    # Insert all startups
    await db.startups.delete_many({"investor_ids": investor_id})
    await db.startups.insert_many(startups)
    print(f"✓ Created 25 startups for investor")
    
    # Create reports for startups
    reports = []
    for startup in startups:
        # Create 3-5 reports per startup
        num_reports = random.randint(3, 5)
        for j in range(num_reports):
            days_ago = 30 * (num_reports - j)
            report_date = datetime.now(timezone.utc) - timedelta(days=days_ago)
            
            # Determine report type and period
            if j % 3 == 0:
                report_type = "quarterly"
                period = f"2024-Q{(j % 4) + 1}"
            else:
                report_type = "monthly"
                month = ((datetime.now().month - j) % 12) + 1
                period = f"2024-{month:02d}"
            
            status = random.choice(["submitted", "approved", "draft"])
            
            report = {
                "id": str(uuid4()),
                "startup_id": startup["id"],
                "startup_name": startup["name"],
                "report_type": report_type,
                "period": period,
                "status": status,
                "summary_metrics": {
                    "revenue": startup["metrics"]["revenue"],
                    "revenue_growth": startup["metrics"]["growth_rate"],
                    "runway_months": startup["metrics"]["runway_months"],
                    "burn_rate": startup["metrics"]["burn_rate"],
                    "cash_balance": startup["metrics"]["cash_balance"],
                    "customer_count": startup["metrics"]["customer_count"],
                    "team_size": startup["metrics"]["team_size"]
                },
                "sections": [
                    {
                        "title": "Executive Summary",
                        "content": f"{startup['name']} continues to show {startup['health_status']} performance in {period}. Revenue growth at {startup['metrics']['growth_rate']}% with {startup['metrics']['runway_months']} months runway.",
                        "metrics": {}
                    },
                    {
                        "title": "Financial Update",
                        "content": f"Revenue: ${startup['metrics']['revenue']:,} | Growth: {startup['metrics']['growth_rate']}% MoM | Burn: ${startup['metrics']['burn_rate']:,}/month | Runway: {startup['metrics']['runway_months']} months",
                        "metrics": {
                            "revenue": startup["metrics"]["revenue"],
                            "growth_rate": startup["metrics"]["growth_rate"],
                            "burn_rate": startup["metrics"]["burn_rate"]
                        }
                    },
                    {
                        "title": "Product & Engineering",
                        "content": f"Shipped {random.randint(3, 12)} new features. Active development on {random.randint(2, 5)} major initiatives. Team size: {startup['metrics']['team_size']}.",
                        "metrics": {"features_shipped": random.randint(3, 12)}
                    },
                    {
                        "title": "Customer Metrics",
                        "content": f"Total customers: {startup['metrics']['customer_count']:,}. Added {random.randint(10, 200)} new customers this period. Churn rate: {random.uniform(1, 5):.1f}%.",
                        "metrics": {
                            "total_customers": startup["metrics"]["customer_count"],
                            "new_customers": random.randint(10, 200)
                        }
                    },
                    {
                        "title": "Key Challenges",
                        "content": random.choice([
                            "Scaling infrastructure to meet demand. Hiring senior engineers.",
                            "Market competition increasing. Focus on product differentiation.",
                            "Customer acquisition costs rising. Optimizing marketing spend.",
                            "Operational efficiency improvements needed. Streamlining processes."
                        ]),
                        "metrics": {}
                    },
                    {
                        "title": "Next Quarter Goals",
                        "content": random.choice([
                            "Launch new product line. Expand to 2 new markets. Hire 10 team members.",
                            "Achieve profitability. Reduce burn by 20%. Improve NPS score.",
                            "Close Series A funding. Build strategic partnerships. Scale to 500 customers.",
                            "Release mobile app. Expand enterprise sales. Double marketing ROI."
                        ]),
                        "metrics": {}
                    }
                ],
                "created_at": report_date,
                "submitted_at": report_date + timedelta(days=2) if status != "draft" else None,
                "approved_at": report_date + timedelta(days=5) if status == "approved" else None,
                "created_by": startup["founder_email"],
                "submitted_by": startup["founder_email"] if status != "draft" else None
            }
            
            reports.append(report)
    
    # Insert all reports
    await db.reports.delete_many({"startup_id": {"$in": [s["id"] for s in startups]}})
    await db.reports.insert_many(reports)
    print(f"✓ Created {len(reports)} reports across 25 startups")
    
    # Create alerts for startups
    alerts = []
    for startup in startups:
        if startup["health_status"] in ["warning", "critical"]:
            alert = {
                "id": str(uuid4()),
                "type": "runway_warning" if startup["metrics"]["runway_months"] < 12 else "growth_slowdown",
                "title": f"{'Low Runway' if startup['metrics']['runway_months'] < 12 else 'Growth Slowdown'} - {startup['name']}",
                "description": f"Runway at {startup['metrics']['runway_months']} months. Immediate attention required." if startup["metrics"]["runway_months"] < 12 else f"Growth rate dropped to {startup['metrics']['growth_rate']}%. Review strategy.",
                "severity": "critical" if startup["health_status"] == "critical" else "warning",
                "startup_id": startup["id"],
                "startup_name": startup["name"],
                "is_read": random.choice([True, False]),
                "dismissed": False,
                "created_at": datetime.now(timezone.utc) - timedelta(days=random.randint(1, 7)),
                "metadata": {
                    "runway_months": startup["metrics"]["runway_months"],
                    "growth_rate": startup["metrics"]["growth_rate"]
                }
            }
            alerts.append(alert)
    
    if alerts:
        await db.alerts.insert_many(alerts)
        print(f"✓ Created {len(alerts)} alerts")
    
    client.close()
    print("\n" + "="*60)
    print("✅ Investor portfolio seeded successfully!")
    print("="*60)
    print(f"\nInvestor Credentials:")
    print(f"  Email: {investor_email}")
    print(f"  Password: investor123")
    print(f"  Startups: 25")
    print(f"  Reports: {len(reports)}")
    print(f"  Alerts: {len(alerts)}")
    print("\n" + "="*60)

if __name__ == "__main__":
    asyncio.run(seed_investor_portfolio())
