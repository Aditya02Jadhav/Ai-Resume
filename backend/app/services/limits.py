from fastapi import Request
from sqlalchemy.orm import Session
from ..models import models
from .auth import get_client_ip
from datetime import datetime

def check_usage_limits(request: Request, db: Session, user: models.User = None):
    if user:
        # check user's plan
        plan = db.query(models.Plan).filter(models.Plan.id == user.plan_id).first()
        limit = plan.limit_count if plan else 1 # default if not found
        
        usage = db.query(models.UsageLimit).filter(models.UsageLimit.user_id == user.id).first()
        if not usage:
            usage = models.UsageLimit(user_id=user.id, used_count=1)
            db.add(usage)
            db.commit()
            return True, None
        
        if usage.used_count >= limit:
            return False, "You have reached the usage limit for your plan. Please upgrade to continue."
        
        usage.used_count += 1
        usage.last_used = datetime.utcnow()
        db.commit()
        return True, None
    else:
        # non-authenticated user -> check IP
        ip = get_client_ip(request)
        usage = db.query(models.UsageLimit).filter(models.UsageLimit.ip_address == ip).first()
        if not usage:
            usage = models.UsageLimit(ip_address=ip, used_count=1)
            db.add(usage)
            db.commit()
            return True, None
            
        if usage.used_count >= 1:
            return False, "Guest limits reached (1 use). Please sign up or login to continue."
            
        usage.used_count += 1
        usage.last_used = datetime.utcnow()
        db.commit()
        return True, None
