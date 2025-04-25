# users/utils/firebase_sync.py
from firebase_admin import firestore
from django.core.exceptions import ObjectDoesNotExist
import logging

logger = logging.getLogger(__name__)

def sync_firestore_profile(user):
    db = firestore.client()
    try:
        user_ref = db.collection('users').document(user.uid)
        doc = user_ref.get()

        if doc.exists:
            data = doc.to_dict()
            updated = False

            if 'role' in data and data['role'] != user.role:
                user.role = data['role']
                updated = True

            if 'status' in data and data['status'] != user.status:
                user.status = data['status']
                updated = True

            if updated:
                user.save()
                logger.info(f"User {user.email} synced successfully from Firestore.")
        else:
            logger.warning(f"Firestore document for user {user.uid} does not exist.")
    except Exception as e:
        logger.error(f"Error syncing user {user.uid}: {str(e)}")
